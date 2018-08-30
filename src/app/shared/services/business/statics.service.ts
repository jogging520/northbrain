import { Injectable } from '@angular/core';

import { Statistics } from '../../models/buiness/statics';
import {Observable} from "rxjs/index";
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StaticsService {

  webSocket: WebSocket;

  constructor() { }
  public stat(): Observable<Statistics>{
    this.webSocket = new WebSocket(`${environment.websocketUrl}statistics`);

    return new Observable(
      observer => {
        this.webSocket.onmessage = (event) => observer.next(JSON.parse(event.data));
        this.webSocket.onerror = (event) => observer.error(event);
        this.webSocket.onclose = (event) => observer.complete();
      }
    );
  }


}
