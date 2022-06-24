import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
//import { APP_ENDPOINT_CONFIG, AppEndpointConfig } from '../utils/app-endpoint-config';
import { PciDetalle } from '../model/bean/pci-detalle';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { Pci } from "../model/domain/pci.model";
import { ConstantesApp } from "../utils/constantes-app";

@Injectable()
export class BusquedaPciService {

  constructor(private http: HttpClient) { }

  buscarPorCorrelativo(numCorrelativo: number): Observable<Pci> {
    let url: string = environment.urlBase + ConstantesApp.RESOURCE_LISTAR_PCI + numCorrelativo;
    return this.http.get<Pci>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error);
      })
    );
  }

  buscarParaDpmn( codAduana: string, codPtoCtrl: string ): Observable<PciDetalle[]> {
   // let url : string = this.appEndPointConfig.getPuestosControlParaDpmn(codAduana, codPtoCtrl);
   let url : string =environment.urlBase + `/v1/controladuanero/scci/pcis/${codAduana}-${codPtoCtrl}/listaparadpmn`;
    return this.http.get<PciDetalle[]>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        return throwError(error);
        })
    ) ;
  }
}
