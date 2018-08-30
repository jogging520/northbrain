import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { CommonService } from '@shared/services/general/common.service';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { User } from '@shared/models/general/user';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private httpClient: _HttpClient,
    private commonService: CommonService
  ) { }

  public queryUsers(): Observable<User[]> {
    return this.httpClient
      .get(`${environment.serverUrl}users`,
        this.commonService.setParams({}),
        {headers: CommonService.setHeaders()}
      )
      .pipe(
        catchError(error => this.commonService.handleError(error))
      );
  }
}
