import {Inject, Injectable, Optional} from '@angular/core';
import {BehaviorSubject, ReplaySubject, throwError} from "rxjs/index";
import {User} from "@shared/models/general/user";
import {_HttpClient, SettingsService} from "@delon/theme";
import {CommonService} from "@shared/services/general/common.service";
import {Router} from "@angular/router";
import {ReuseTabService} from "@delon/abc";
import {StartupService} from "@core/startup/startup.service";
import {DA_SERVICE_TOKEN, TokenService} from "@delon/auth";
import {mergeMap, catchError, map} from "rxjs/operators";
import {environment} from "@env/environment";
import {Token} from "@shared/models/general/token";
import {OperationService} from "@shared/services/general/operation.service";
import {CacheService} from "@delon/cache";
import {Operation} from "@shared/models/general/operation";

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private currentUserSubject = new BehaviorSubject<User>(new User());
  public currentUser = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor(
    private httpClient: _HttpClient,
    private router: Router,
    @Optional()
    @Inject(ReuseTabService)
    private reuseTabService: ReuseTabService,
    private startupService: StartupService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: TokenService,
    private settingService: SettingsService,
    private cacheService: CacheService,
    private commonService: CommonService,
    private operationService: OperationService
  ) { }

  /**
   * 方法：登录
   * @param {string} userName 用户名
   * @param {string} password 密码
   * @param {string} mobile 手机号码
   */
  public login(userName?: string, password?: string, mobile?: string): void {

    if (!this.commonService.getSerialNo()) {
      this.commonService.setSerialNo();
    }

    let encryptedUserName = encodeURIComponent(
      this.commonService.encrypt(btoa(userName), true));
    let encryptedPassword = encodeURIComponent(
      this.commonService.encrypt(btoa(password), true));
    let encryptedMobile = encodeURIComponent(
      this.commonService.encrypt(btoa(mobile), true));

    this.httpClient
      .post(
        `${environment.serverUrl}login`,
        null,
        this.commonService.setParams({
          userName: encryptedUserName,
          password: encryptedPassword,
          mobile: encryptedMobile}),
        {headers: CommonService.setHeaders()})
      .pipe(
        map((token: Token) => {
          if (token.status !== 'SUCCESS') {
            return throwError(new Error(token.status));
          }

          this.tokenService.set({
            token: token.jwt
          });

          return token;
        }),
        mergeMap((token: Token) => {
          if (token.status !== 'SUCCESS') {
            return throwError(new Error(token.status));
          }

          return this.httpClient
            .get(
              `${environment.serverUrl}users\\${token.user}`,
              this.commonService.setParams({user: token.user}),
              {headers: CommonService.setHeaders()}
            )
            .pipe(
              map(user => {

                this.tokenService.clear();

                if (user.status !== 'ACTIVE') {
                  return throwError(user.status);
                }

                this.tokenService.set({
                  session: token.session,
                  user: token.user,
                  loginTime: new Date().getTime(),
                  lifeTime: token.lifeTime,
                  token: token.jwt,
                  downPublicKey: token.downPublicKey,
                  upPrivateKey: token.upPrivateKey,
                  roles: user.roles,
                  permissions: user.permissions,
                  affiliations: user.affiliations
                });

                this.settingService.setUser({
                  name: decodeURIComponent(escape(atob(this.commonService.decrypt(user.realName)))),
                  avatar: user.avatar,
                  email: user.emails[0]});

                this.setAuth(user);
              }),
              catchError(error => this.commonService.handleError(error))
            )
        }),
        catchError(error => this.commonService.handleError(error))
      )
      .subscribe(
        () => {
          this.reuseTabService.clear();
          this.startupService.load(this.commonService.getSerialNo()).catch();
        },
        () => {
          this.router.navigate(['/passport/login']).catch();
        },
        () => {
          this.operationService
            .createOperation('LOGIN', this.commonService.getSerialNo())
            .pipe(
              map((operation: Operation) => {
                if (operation.status !== 'SUCCESS') {
                  return throwError(new Error(operation.status));
                }

                return operation;
              }),
              catchError(error => this.commonService.handleError(error))
            )
            .subscribe();
        }
      )
  }

  /**
   * 方法：登出
   */
  public logout() {

    this.commonService.setSerialNo();

    this.operationService
      .createOperation('LOGOUT', this.commonService.setSerialNo())
      .pipe(
        map((operation: Operation) => {
          if (operation.status !== 'SUCCESS') {
            return throwError(new Error(operation.status));
          }

          return operation;
        }),
        catchError(error => this.commonService.handleError(error))
      )
      .subscribe(
        () => {},
        () => {
          this.router.navigate(['/passport/login']).catch();
        },
        () => {
          this.commonService.setSerialNo();

          this.httpClient
            .delete(`${environment.serverUrl}sessions`,
              this.commonService.setParams({}),
              {headers: CommonService.setHeaders()}
            )
            .pipe(
              catchError(error => this.commonService.handleError(error))
            )
            .subscribe(
              () => {
                this.purgeAuth();
              },
              () => {
                this.router.navigate(['/passport/login']).catch();
              }
            );
        });
  }

  /**
   * 方法：设置鉴权信息
   * @param {User} user
   */
  private setAuth(user: User) {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * 方法：清理鉴权信息
   */
  private purgeAuth() {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.reuseTabService.clear();
  }
}
