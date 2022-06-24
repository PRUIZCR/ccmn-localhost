import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ruc } from '../model/bean/ruc.model';
import { Observable } from 'rxjs';

import { CondicionRuc } from '../model/common/condicion-ruc.enum';
import { EstadoRuc } from '../model/common/estado-ruc.enum';
import { environment } from 'src/environments/environment';
import { ConstantesApp } from '../utils/constantes-app';
//import { AppEndpointConfig, APP_ENDPOINT_CONFIG } from '../utils/app-endpoint-config';

@Injectable()
export class RucService {

  private URL_RESOURCE_RUC : string = environment.urlBase + ConstantesApp.RESOURCE_RUC;

  constructor(private http: HttpClient
    //, @Inject(APP_ENDPOINT_CONFIG) appEndPointConfig : AppEndpointConfig
    ) {
    //this.URL_RESOURCE_RUC = appEndPointConfig.ruc;
  }

  buscarRuc(numRuc : string) : Observable <Ruc> {
    var url = this.URL_RESOURCE_RUC + "/" + numRuc;
    return this.http.get<Ruc>(url);
  }

  tieneCondicion(ruc : Ruc, condicion : CondicionRuc) : boolean {
    return ruc?.codCondicion ==  condicion;
  }

  tieneEstado(ruc : Ruc, estado : EstadoRuc ) : boolean {
    return ruc?.codEstado ==  estado;
  }

}
