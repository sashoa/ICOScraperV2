import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import { map, catchError } from "rxjs/operators";

import { Ico } from '../../../../../shared/Ico.model'

@Injectable()
export class IcoDataService {

  constructor(private http: HttpClient) { }

  getIcos(): Observable<Ico[]> {
    return this.http.get('/api/ico').pipe(mapIcos)
  }

  getIcoDetails(detailsToken): Observable<any[]> {
    return this.http.get(`/api/ico/${detailsToken}`).pipe(mapIcos);
  }

  update(): Observable<any> {
    return this.http.get(`/api/ico/update`);
  }
}

const mapIcos = map((res: any) => {
  return res.payload
});
