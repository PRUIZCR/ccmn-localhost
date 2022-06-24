import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Entvehiculo } from '../model/bean/entvehiculo';

import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConstantesApp } from '../utils/constantes-app';

@Injectable()
export class EntvehiculoService {

  private URL_RESOURCE_ENTVEHICULO : string = environment.urlBase + ConstantesApp.RESOURCE_ENDPOINT_ENT_VEHICULO;

  constructor(private http: HttpClient) {}

  buscar(codPais: string, codPlaca: string) : Observable<Entvehiculo> {
    let url : string = this.URL_RESOURCE_ENTVEHICULO + "/" + codPais + "-" + codPlaca;
    return this.http.get<Entvehiculo>(url);
  }
}
