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

  public queryStrategies(types: string[]): Observable<Strategy[]>{
    return this.httpClient
      .get(`${environment.serverUrl}strategies`,
        this.commonService.setParams({types: types}),
        {headers: CommonService.setHeaders()}
      )
      .pipe(
        catchError(error => this.commonService.handleError(error))
      );
  }
}
