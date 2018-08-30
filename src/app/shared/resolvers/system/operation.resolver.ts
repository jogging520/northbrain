import {Inject, Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {StrategyService} from "@shared/services/general/strategy.service";
import {Observable} from "rxjs/index";
import {UserService} from "@shared/services/general/user.service";
import {DA_SERVICE_TOKEN, TokenService} from "@delon/auth";
import {forkJoin} from 'rxjs';
import {catchError, map} from "rxjs/operators";
import {Strategy} from "@shared/models/general/strategy";
import {User} from "@shared/models/general/user";
import {CommonService} from "@shared/services/general/common.service";

@Injectable({
  providedIn: 'root'
})
export class OperationResolver implements Resolve<any> {

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: TokenService,
              private commonService: CommonService,
              private strategyService: StrategyService,
              private userService: UserService) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {

    const tokenData = this.tokenService.get();

    return forkJoin(
      this.strategyService.queryStrategies('appTypes'),
      this.strategyService.queryStrategies('businessTypes'),
      this.userService.queryUsers()
    )
      .pipe(
        map((data) => {
          let originalAppTypes: Strategy = data[0];
          let originalBusinessTypes: Strategy = data[1];
          let originalUsers: User[] = data[2];
          let operationParams = {channelTypes: [], businessTypes: [], users: []};

          if (originalAppTypes.status === 'ACTIVE' && originalAppTypes.parameters) {
            Object.keys(originalAppTypes.parameters)
              .forEach((key) => {
                if (originalAppTypes.parameters[key])
                  operationParams.channelTypes.push({'text': originalAppTypes.parameters[key], 'value': key});
              });
          }

          if (originalBusinessTypes.status === 'ACTIVE' && originalBusinessTypes.parameters) {
            Object.keys(originalBusinessTypes.parameters)
              .forEach((key) => {
                if (originalBusinessTypes.parameters[key])
                  operationParams.businessTypes.push({'text': originalBusinessTypes.parameters[key], 'value': key});
              });
          }

          originalUsers.forEach((user: User) => {
            if (user.status === 'ACTIVE') {
              operationParams.users.push({'text': decodeURIComponent(escape(atob(this.commonService.decrypt(user.realName)))), 'value': user.id});
            }
          });

          if (tokenData.roles && tokenData.roles.indexOf('admin') > -1) {
            operationParams.users.push({'text': '全部', 'value': 'ffffffffffffffffffffffff'});
          }

          return operationParams;
        }),
        catchError(error => this.commonService.handleError(error))
      );
  }

}
