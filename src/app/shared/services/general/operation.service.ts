import {Inject, Injectable} from '@angular/core';
import {CommonService} from "@shared/services/general/common.service";
import {_HttpClient} from "@delon/theme";
import {environment} from "@env/environment";
import {Operation} from "@shared/models/general/operation";
import {catchError, map, flatMap} from "rxjs/operators";
import {Observable, throwError} from "rxjs/index";
import {NzMessageService} from "ng-zorro-antd";
import {Router} from "@angular/router";
import {DA_SERVICE_TOKEN, TokenService} from "@delon/auth";

@Injectable({
  providedIn: 'root'
})
export class OperationService {

  constructor(
    private httpClient: _HttpClient,
    public messageService: NzMessageService,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN) private tokenService: TokenService,
    private commonService: CommonService
  ) { }

  /**
   * 方法：创建一条业务操作记录
   * @param {string} businessType 业务类型
   * @param {string} serialNo 流水号
   * @return {Observable<Operation>} 创建的操作记录流
   */
  public createOperation(businessType: string, serialNo?: string): Observable<Operation> {

    const tokenData = this.tokenService.get();
    let id: string = '';

    if (serialNo)
      id = serialNo;
    else
      id = this.commonService.setSerialNo();

    let operation: Operation = {
      id: id,
      type: 'COMMON',
      appType: `${environment.appType}`,
      category: `${environment.category}`,
      user: tokenData.user,
      session: tokenData.session,
      businessType: businessType,
      status: 'ACTIVE',
      description: 'auto created from front.'
    };

    return this.httpClient
      .post(`${environment.serverUrl}operations`,
        operation,
        this.commonService.setParams({}),
        {headers: CommonService.setHeaders()}
      )
      .pipe(
        catchError(error => this.commonService.handleError(error))
      );
  }


  /**
   * 方法：查询操作记录
   * @param {Object} conditions 条件（用户、开始时间、结束时间）
   * @return {Observable<Operation>} 操作记录
   */
  public queryOperations(conditions?: Object): Observable<Operation> {
    return this.httpClient
      .get(`${environment.serverUrl}operations`,
        this.commonService.setParams(conditions),
        {headers: CommonService.setHeaders()}
      )
      .pipe(
        flatMap(operation => operation),
        catchError(error => this.commonService.handleError(error))
      )
  }
}
