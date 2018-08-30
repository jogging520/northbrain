import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { CommonService } from '@shared/services/general/common.service';
import { Observable } from 'rxjs/internal/Observable';
import { Strategy } from '@shared/models/general/strategy';
import { catchError, flatMap } from 'rxjs/operators';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class StrategyService {

  constructor(
    private httpClient: _HttpClient,
    private commonService: CommonService
  ) { }

  public queryStrategies(type: string): Observable<Strategy>{
    return this.httpClient
      .get(`${environment.serverUrl}strategies\\${type}`,
        this.commonService.setParams({}),
        {headers: CommonService.setHeaders()}
      )
      .pipe(
        flatMap((strategy: any) => strategy),
        catchError(error => this.commonService.handleError(error))
      );
  }
}
