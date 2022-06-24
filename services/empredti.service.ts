import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Empredti } from '../model/bean/empredti';

//import { AppEndpointConfig, APP_ENDPOINT_CONFIG } from '../utils/app-endpoint-config';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConstantesApp } from '../utils/constantes-app';

@Injectable()
export class EmpredtiService {

  private URL_RESOURCE_EMPREDTI : string = environment.urlBase + ConstantesApp.RESOURCE_ENDPOINT_EMPRESA_TRANS_INTER;

  constructor(private http: HttpClient
    //, @Inject(APP_ENDPOINT_CONFIG) appEndPointConfig : AppEndpointConfig
    ) {
    //this.URL_RESOURCE_EMPREDTI = appEndPointConfig.empresasdetranspinter;
  }

  buscar(codigo: string) : Observable<Empredti> {
    let url: string = this.URL_RESOURCE_EMPREDTI + "/" + codigo;
    return this.http.get<Empredti>(url);
  }

}
