import { Injectable, Injector, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {Menu, MenuService, SettingsService, TitleService} from '@delon/theme';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ACLService } from '@delon/acl';
import {catchError, map, scan, flatMap} from "rxjs/operators";
import {environment} from "@env/environment";
import {CacheService} from "@delon/cache";
import {Strategy} from "@shared/models/general/strategy";
import {Role} from "@shared/models/general/role";
import { v4 as uuid } from 'uuid';
import {throwError} from "rxjs/index";
import {Region} from "@shared/models/general/region";
import {Organization} from "@shared/models/general/organization";

/**
 * 用于应用启动时
 * 一般用来获取应用所需要的基础数据等
 */
@Injectable()
export class StartupService {
  constructor(
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private injector: Injector,
    private menuService: MenuService,
    private settingService: SettingsService,
    private aclService: ACLService,
    private titleService: TitleService,
    private cacheService: CacheService,
    private httpClient: HttpClient
  ) { }

  private initial(resolve: any, reject: any, id?: string) {
    //1、设置headers信息，设置初始流水号
    let headers = {
      'Content-Type': `${environment.contentType}`,
      'Accept': `${environment.accept}`,
      'apikey': `${environment.apiKey}`
    };

    let serialNo: string = '';

    if (!id) {
      serialNo = uuid();
      this.cacheService
        .set('serialNo', serialNo);
    } else {
      serialNo = id;
    }

    const tokenData = this.tokenService.get();
    const currentTime = new Date().getTime();

    //2、如果没有登录或者已经超过登录时间，那么重定向到登录页面。
    if (!tokenData.token || !tokenData.loginTime || currentTime - tokenData.loginTime > tokenData.lifeTime) {
      this.injector.get(Router).navigate(['/passport/login']).catch();
      resolve({});
      return;
    }

    //3、获取应用程序相关信息、错误码相关信息等基础策略信息并设置
    this.httpClient
      .get(`${environment.serverUrl}strategies`,
        {headers: headers,
          params: {
            serialNo: serialNo,
            appType: `${environment.appType}`,
            category: `${environment.category}`,
            session: tokenData.session,
            user: tokenData.user,
            types: ['application', 'errorcode'].join(',')
          }}
      )
      .pipe(
        flatMap((strategy: any) => strategy),
        map((strategy: Strategy) => {
          if (strategy.status !== 'ACTIVE') {
            return throwError(strategy.status);
          }

          return strategy;
        }),
        catchError(error => {
          this.injector.get(Router).navigate(['/passport/login']).catch();
          resolve(null);
          return throwError(error);
        })
      )
      .subscribe(
        (strategy: Strategy) => {
          if (strategy.type === 'application') {
            this.settingService.setApp({name: strategy.name, description: strategy.description});
            this.titleService.suffix = strategy.name;
          }

          if (strategy.type === 'errorcode') {
            this.cacheService.set('errorcode', strategy.parameters);
          }
        },
        (error) => {
          this.injector.get(Router).navigate(['/passport/login']).catch();
          resolve(null);
          throwError(error);
        }
      );

    //4、获取区域信息数据并设置
    this.httpClient
      .get(`${environment.serverUrl}organizations\\regions`,
        {headers: headers,
          params: {
            serialNo: serialNo,
            appType: `${environment.appType}`,
            category: `${environment.category}`,
            session: tokenData.session,
            user: tokenData.user
          }}
      )
      .pipe(
        flatMap((region: any) => region),
        map((region: Region) => {
          if (region.status !== 'ACTIVE') {
            return throwError(region.status);
          }

          return region;
        }),
        catchError(error => {
          this.injector.get(Router).navigate(['/passport/login']).catch();
          resolve(null);
          return throwError(error);
        })
      )
      .subscribe(
        (region: Region) => {
          this.cacheService.set('region', region);
        },
        (error) => {
          this.injector.get(Router).navigate(['/passport/login']).catch();
          resolve(null);
          throwError(error);
        }
      );

    //5、获取组织机构数据并设置
    this.httpClient
      .get(`${environment.serverUrl}organizations`,
        {headers: headers,
          params: {
            serialNo: serialNo,
            appType: `${environment.appType}`,
            category: `${environment.category}`,
            session: tokenData.session,
            user: tokenData.user
          }}
      )
      .pipe(
        flatMap((organization: any) => organization),
        map((organization: Organization) => {
          if (organization.status !== 'ACTIVE') {
            return throwError(organization.status);
          }

          return organization;
        }),
        catchError(error => {
          this.injector.get(Router).navigate(['/passport/login']).catch();
          resolve(null);
          return throwError(error);
        })
      )
      .subscribe(
        (organization: Organization) => {
          this.cacheService.set('organization', organization);
        },
        (error) => {
          this.injector.get(Router).navigate(['/passport/login']).catch();
          resolve(null);
          throwError(error);
        }
      );

    //6、获取角色权限信息，并设置；获取菜单相关信息并设置（必须在权限读取完之后设置菜单）
    this.aclService.removeAbility(this.aclService.data.abilities);
    this.aclService.removeRole(this.aclService.data.roles);
    this.menuService.clear();

    const roles = tokenData.roles;
    let abilities = tokenData.permissions;

    this.httpClient
      .get(
        `${environment.serverUrl}privileges\\roles`,
        {headers: headers,
          params: {
            serialNo: serialNo,
            appType: `${environment.appType}`,
            category: `${environment.category}`,
            session: tokenData.session,
            user: tokenData.user,
            ids: roles.join(',')
          }}
      )
      .pipe(
        flatMap((role: any) => role),
        map((role: Role) => {
          if (role.status !== 'ACTIVE') {
            return throwError(role.status);
          }

          return role.permissions;
        }),
        scan((ability, permissions) => {
          for(let permission of permissions) {
            if(ability.indexOf(permission) == -1)
              ability.push(permission);
          }
          return ability;
        }, abilities),
        catchError(error => {
          this.injector.get(Router).navigate(['/passport/login']).catch();
          resolve(null);
          return throwError(error);
        })
      )
      .subscribe(
        () => {},
        (error) => {
          this.injector.get(Router).navigate(['/passport/login']).catch();
          resolve(null);
          throwError(error);
        },
        () => {
          this.aclService.setAbility(abilities);

          this.httpClient
            .get(
              `${environment.serverUrl}menus\\${environment.appType}`,
              {headers: headers,
                params: {
                  serialNo: serialNo,
                  appType: `${environment.appType}`,
                  category: `${environment.category}`,
                  session: tokenData.session,
                  user: tokenData.user,
                }}
            )
            .pipe(
              catchError(error => {
                this.injector.get(Router).navigate(['/passport/login']).catch();
                resolve(null);
                return throwError(error);
              })
            )
            .subscribe(
              (menus: Menu[]) => {
                this.menuService.add(menus);
              },
              (error) => {
                this.injector.get(Router).navigate(['/passport/login']).catch();
                resolve(null);
                throwError(error);
              },
              () => {
                this.injector.get(Router).navigate(['/']).catch();
                resolve({});
              }
            );
        }
      );

    return;
  }


  load(id?: string): Promise<any> {
    // only works with promises
    // https://github.com/angular/angular/issues/15088
    return new Promise((resolve, reject) => {
      // http
      // this.viaHttp(resolve, reject);
      // mock：请勿在生产环境中这么使用，viaMock 单纯只是为了模拟一些数据使脚手架一开始能正常运行
      this.initial(resolve, reject, id);
    });
  }
}
