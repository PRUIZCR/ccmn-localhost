import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ConstantesApp } from '../utils/constantes-app';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { PerfilUsuario } from '../model/bean/usuario-perfil-item';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map, mergeMap, shareReplay } from 'rxjs/operators';

@Injectable()
export class PerfilesUsuarioService {
  private URL_RESOURCE_UBICACION_FUNCIONARIO : string = environment.urlBase + ConstantesApp.RESOURCE_PERFILES_USUARIO;

  constructor(private http: HttpClient) { }

  buscar(param1: string,param2: string ) : Observable<PerfilUsuario[]> {
    //	/v1/controladuanero/scci/perfilesusuario?usuario=param1&perfil=param2;
    var url : string = this.URL_RESOURCE_UBICACION_FUNCIONARIO + `?usuario=${param1}&perfil=${param2}`;
    return this.http.get<PerfilUsuario[]>(url).pipe(
      map( (respuesta : PerfilUsuario[]) => {
            if(respuesta.length<0){
              return respuesta;
            }else{
              return respuesta;
            }

      }),
      catchError((error: HttpErrorResponse) => {
        // console.error(error.error);
        console.log(error.error);
        return throwError(error);
        })
    ) ;
}
}

