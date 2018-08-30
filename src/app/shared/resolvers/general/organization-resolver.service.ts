import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Injectable} from "@angular/core";
import {CommonService} from "@shared/services/general/common.service";
import {OrganizationService} from "@shared/services/general/organization.service";
import {Observable} from "rxjs/index";
import {Organization} from "@shared/models/general/organization";
import {catchError, filter} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class OrganizationResolver implements Resolve<any> {

  constructor(
    private commonService: CommonService,
    private organizationService: OrganizationService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return this.organizationService
      .queryOrganizations()
      .pipe(
        filter((organization: Organization) => organization.status === 'ACTIVE'),
        catchError(error => this.commonService.handleError(error))
      );
  }
}
