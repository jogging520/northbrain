import {Inject, Injectable} from '@angular/core';
import {CacheService} from "@delon/cache";
import {DA_SERVICE_TOKEN, TokenService} from "@delon/auth";
import {Router} from "@angular/router";
import {NzMessageService} from "ng-zorro-antd";
import {Observable, throwError} from "rxjs/index";
import {HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {environment} from "@env/environment";
import { v4 as uuid } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(
    public messageService: NzMessageService,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: TokenService,
    private cacheService: CacheService
  ) {}

  /**
   * 方法：设置http请求header部分
   * @returns {HttpHeaders} http请求头
   */
  public static setHeaders(): HttpHeaders {

    let headers = {};

    if (`${environment.contentType}`) {
      headers["Content-Type"] = `${environment.contentType}`;
    }

    if (`${environment.accept}`) {
      headers["Accept"] = `${environment.accept}`;
    }

    if (`${environment.apiKey}`) {
      headers["apiKey"] = `${environment.apiKey}`;
    }

    return new HttpHeaders(headers);

  }

  /**
   * 方法：根据token中保存的公共信息，形成params对象
   * @param {Object} parameters 原始对象
   * @returns {Object} 增加了公共信息后的对象
   */
  public setParams(parameters?: Object): Object {

    let params = {};

    if (this.getSerialNo()) {
      params["serialNo"] = this.getSerialNo();
    }

    if (`${environment.appType}`) {
      params["appType"] = `${environment.appType}`;
    }

    if (`${environment.category}`) {
      params["category"] = `${environment.category}`;
    }

    let tokenData = this.tokenService.get();

    if (tokenData && tokenData.session) {
      params["session"] = tokenData.session;
    }

    if (tokenData && tokenData.user) {
      params["user"] = tokenData.user;
    }

    if (parameters) {
      Object.keys(parameters)
        .forEach((key) => {
          if (parameters[key] != null)
            params[key] = parameters[key];
        });
    }

    return params;

  }

  /**
   * 方法：错误处理
   * @param {HttpErrorResponse} error http响应报文截获的错误信息
   * @return {Observable<any>} 错误信息流
   */
  public handleError(error: HttpErrorResponse): Observable<any> {

    switch (error.status) {
      case 200:
        break;
      case 401:
        this.router.navigate(['/passport/login']).catch();
        break;
      case 500:
        console.warn('系统调用服务发生未可知错误，可能是后端问题，请联系管理员检查。', error);
        this.messageService.error('系统调用服务发生未可知错误，可能是后端问题，请联系管理员检查。');
        this.router.navigate(['/500']).catch();
        break;
      default:
        console.warn('系统发生未可知错误，请联系管理员检查。', error);
        this.messageService.error('系统发生未可知错误，请联系管理员检查。');
        break;
    }

    return throwError(error);

  }

  /**
   * 方法：生成业务流水号
   * @returns {string} 新生成的流水号
   */
  public setSerialNo(): string {

    let serialNo = uuid();

    this.cacheService
      .set('serialNo', serialNo);

    return serialNo;

  }

  /**
   * 获取当前流水号
   * @returns {string} 当前流水号
   */
  public getSerialNo(): string {

    let serialNo = '';

    this.cacheService
      .get<string>('serialNo')
      .subscribe(data => serialNo = data);

    return serialNo;

  }

  /**
   * 方法：加密（RSA）
   * @param {string} content 明文
   * @param {boolean} isTemporary 是否为临时密钥
   * @returns {string} 密文
   */
  public encrypt(content: string, isTemporary: boolean): string|any {

    let jsEncrypt = new JSEncrypt();

    if (isTemporary) {
      jsEncrypt.setPublicKey(`${environment.temporaryPublicKey}`);
    } else {
      jsEncrypt.setPublicKey(this.tokenService.get().downPublicKey);
    }

    return jsEncrypt.encrypt(content);

  }

  /**
   * 方法：解密
   * @param {string} content 密文
   * @returns {string | any} 明文
   */
  public decrypt(content: string): string|any  {

    let jsEncrypt: JSEncrypt = new JSEncrypt();

    jsEncrypt.setPrivateKey(this.tokenService.get().upPrivateKey);

    return jsEncrypt.decrypt(content);

  }

  /**
   * 方法：获取当前时间的值
   * @return {number} 当前时间
   */
  public static currentDate(): number {
    return new Date().getTime();
  }

  /**
   * 方法：获取前一天时间的值
   * @return {number} 前一天时间
   */
  public static lastDate(): number {
    return new Date().getTime() - 86400000;
  }
}
