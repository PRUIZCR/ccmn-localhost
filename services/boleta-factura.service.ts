import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Respuesta } from '../model/common/Respuesta';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Estado } from '../model/common/Estado';
import { environment } from 'src/environments/environment';
import { ConstantesApp } from '../utils/constantes-app';

@Injectable()
export class BoletaFacturaService {

  private URL_RESOURCE_FACTURA : string = environment.urlBase + ConstantesApp.RESOURCE_FACTURA;
  private URL_RESOURCE_BOLETA : string = environment.urlBase + ConstantesApp.RESOURCE_BOLETA;

  private rptaBoletaFactura!: Respuesta<any>;
  private rptaBoletaFacturaSource  = new BehaviorSubject<Respuesta<any>>(new Respuesta<any>());;
  public rptaBoletaFactura$ = this.rptaBoletaFacturaSource.asObservable();

  constructor(private http: HttpClient) {
  }

  public buscar (ruc: string, serie: string, numero: string, tipoBusqueda: string) : void {
    let faltaRuc : boolean = ruc == null || ruc.length <= 0;
    let faltaSerie : boolean = serie == null || serie.length <= 0;

    if ( faltaRuc || faltaSerie ) {
      return;
    }

    let urlNumBuscar : string = (tipoBusqueda==ConstantesApp.COD_TIPO_COMP_BOLETA?this.URL_RESOURCE_BOLETA:this.URL_RESOURCE_FACTURA) +  `${ruc}-${serie}-${numero}`;

    this.rptaBoletaFacturaSource.next(Respuesta.create(new Object, Estado.LOADING));

    this.buscarHttp(urlNumBuscar).subscribe(objBoletaFactura => {
        this.rptaBoletaFactura = Respuesta.create(objBoletaFactura, Estado.SUCCESS);
        this.rptaBoletaFacturaSource.next(this.rptaBoletaFactura);
    });
  }

  private buscarHttp(url: string) : Observable<any> {
    return this.http.get<any>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        this.rptaBoletaFacturaSource.next(Respuesta.createFromErrorHttp(error));
        return throwError(error);
        })
    ) ;
  }

}
