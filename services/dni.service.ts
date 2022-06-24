import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
//import { APP_ENDPOINT_CONFIG, AppEndpointConfig } from '../utils/app-endpoint-config'

import { Respuesta } from '../model/common/Respuesta';
import { Estado } from '../model/common/Estado';
import { Dni } from '../model/bean/dni.model';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ConstantesApp } from '../utils/constantes-app';

@Injectable()
export class DniService {

  private URL_RESOURCE_DNI : string = environment.urlBase + ConstantesApp.RESOURCE_ENDPOINT_DNI;

  private rptaDni!: Respuesta<Dni>;
  private rptaDniSource  = new BehaviorSubject<Respuesta<Dni>>(new Respuesta<Dni>());;
  public rptaDni$ = this.rptaDniSource.asObservable();

  private rptaDniRes!: Respuesta<Dni>;
  private rptaDniSourceRes  = new BehaviorSubject<Respuesta<Dni>>(new Respuesta<Dni>());;
  public rptaDniRes$ = this.rptaDniSourceRes.asObservable();

  constructor(private http: HttpClient)
    //,@Inject(APP_ENDPOINT_CONFIG) appEndPointConfig : AppEndpointConfig) 
    {
    //this.URL_RESOURCE_DNI = appEndPointConfig.dni;
  }

  public buscar(numDni : string, frmBusqueda: string) {
    let regexDNI : RegExp = /[0-9]{8}/;

    var dniEsInvalido =  numDni == null || !numDni.match(regexDNI);

    if ( dniEsInvalido ) {
      this.rptaDni = Respuesta.create(new Dni, Estado.SUCCESS);
      this.rptaDniSource.next(this.rptaDni);
      return;
    }

    this.rptaDni = Respuesta.create(new Dni, Estado.LOADING);
    this.rptaDniSource.next(this.rptaDni);

    this.buscarDniHttp(numDni, frmBusqueda).subscribe(objDni => {
        objDni.frmBusqueda = frmBusqueda;
        this.rptaDni = Respuesta.create(objDni, Estado.SUCCESS);
        this.rptaDniSource.next(this.rptaDni);
    });
  }

  public buscarResponsable(numDni : string, frmBusqueda: string) {
    let regexDNI : RegExp = /[0-9]{8}/;

    var dniEsInvalido =  numDni == null || !numDni.match(regexDNI);

    if ( dniEsInvalido ) {
      this.rptaDniRes = Respuesta.create(new Dni, Estado.SUCCESS);
      this.rptaDniSourceRes.next(this.rptaDniRes);
      return;
    }

    this.rptaDniRes = Respuesta.create(new Dni, Estado.LOADING);
    this.rptaDniSourceRes.next(this.rptaDniRes);

    this.buscarDniHttp(numDni, frmBusqueda).subscribe(objDni => {
        objDni.frmBusqueda = frmBusqueda;
        this.rptaDniRes = Respuesta.create(objDni, Estado.SUCCESS);
        this.rptaDniSourceRes.next(this.rptaDniRes);
    });
  }

  private buscarDniHttp(numDni : string, frmBusqueda: string) : Observable <Dni> {
    var url = this.URL_RESOURCE_DNI + "/" + numDni;
    return this.http.get<Dni>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        if(frmBusqueda=="01"){
          this.rptaDniSource.next(Respuesta.createFromErrorHttp(error));
        }else{
          this.rptaDniSourceRes.next(Respuesta.createFromErrorHttp(error));
        }
        return throwError(error);
        })
    ) ;
  }
}
