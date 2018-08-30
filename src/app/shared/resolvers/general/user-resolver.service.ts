import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { CommonService } from '@shared/services/general/common.service';
import { UserService } from '@shared/services/general/user.service';
import { User } from '@shared/models/general/user';
import {Observable} from "rxjs/index";
import {catchError, map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UserResolverService implements Resolve<any> {

  constructor(
    private commonService: CommonService,
    private userService: UserService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    let users: User[] = [];
    return this.userService
      .queryUsers()
      .pipe(map(data => {
          let originalUsers: User[] = data;
          originalUsers.forEach((user: User) => {
            if (user.status === 'ACTIVE') {
              user.realName = decodeURIComponent(escape(atob(this.commonService.decrypt(user.realName))));
              users.push(user);
            }
          })
          return users;
        }),
        catchError(error => this.commonService.handleError(error))
      );
  }
}
