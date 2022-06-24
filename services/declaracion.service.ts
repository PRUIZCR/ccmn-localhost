import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

//import { AppEndpointConfig, APP_ENDPOINT_CONFIG } from '../utils/app-endpoint-config';
import { Observable } from 'rxjs';
import { Declaracion } from '../model/bean/declaracion';
import { environment } from 'src/environments/environment';
import { ConstantesApp } from '../utils/constantes-app';

@Injectable()
export class DeclaracionService {

  constructor(private http: HttpClient
    //, @Inject(APP_ENDPOINT_CONFIG) private appEndPointConfig : AppEndpointConfig
    ) { }

  buscar(codAduana : string, codRegimen: string, anio: number, numero: number) : Observable<Declaracion> {
    let urlDeclaracion = environment.urlBase + ConstantesApp.RESOURCE_DECLARACIONES + "/" + `${codAduana}-${codRegimen}-${anio}-${numero}`;
    return this.http.get<Declaracion>(urlDeclaracion);
  }

}
