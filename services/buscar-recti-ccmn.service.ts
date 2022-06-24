import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Respuesta } from '../model/common/Respuesta';
import { Estado } from '../model/common/Estado';
import { DataCatalogo } from '../model/common/data-catalogo.model';
import { ParamBusqCcmnParaRectificar } from '../model/bean/param-busq-ccmn-para-rectificar.model';
import { ItemCcmnParaRectificar } from '../model/bean/item-ccmn-para-rectificar.model';

import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Auditoria } from '../model/domain/auditoria.model';
import { ConstantesApp } from '../utils/constantes-app';


@Injectable()
export class BuscarRectiCcmnService {
  private URL_RESOURCE_BUSQUEDA_CCMN : string =  environment.urlBase + ConstantesApp.RESOURCE_CONSULTA_RECTI_CCMN;

  private rptaBusqDclSource = new BehaviorSubject<Respuesta<ItemCcmnParaRectificar[]>>(new Respuesta<ItemCcmnParaRectificar[]>());


  public rptaBusqDcl$ = this.rptaBusqDclSource.asObservable();

  public rptaListaCtrlCcmns!: ItemCcmnParaRectificar[] ;

  public itemCcmn!: ItemCcmnParaRectificar;


  constructor(private http: HttpClient


  ) { }

  buscarParaRectificar( paramBusqDpmnRecti : ParamBusqCcmnParaRectificar ) : void {

    this.rptaBusqDclSource.next(Respuesta.create(new Array, Estado.LOADING));

    this.validarDpmnsHttp(paramBusqDpmnRecti).subscribe((respuesta : Respuesta<ItemCcmnParaRectificar[]>) => {
      this.rptaBusqDclSource.next(respuesta);
      this.rptaListaCtrlCcmns = respuesta.data;
    });

  };

  private validarDpmnsHttp( paramBusqCcmnRecti : ParamBusqCcmnParaRectificar ): Observable<Respuesta<ItemCcmnParaRectificar[]>> {
    return this.http.post<any>(this.URL_RESOURCE_BUSQUEDA_CCMN, paramBusqCcmnRecti).pipe(
          map( ( ccmns : ItemCcmnParaRectificar[]) => {

            if ( ccmns == null ) {
              return Respuesta.create(new Array, Estado.SUCCESS);
            }

        return Respuesta.create(ccmns, Estado.SUCCESS);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        this.rptaBusqDclSource.next(Respuesta.createFromErrorHttp(error));
        return throwError(error);
        })
    );
  }

  limpiarData() : void {
		this.itemCcmn = new  ItemCcmnParaRectificar();
    this.rptaBusqDclSource.next(Respuesta.create(new Array, Estado.LOADING));
	}


}
