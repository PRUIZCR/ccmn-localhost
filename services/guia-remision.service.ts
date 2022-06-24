import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Respuesta } from '../model/common/Respuesta';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Estado } from '../model/common/Estado';
import { GuiaRemisionTransp } from '../model/bean/guia-remision-transp.model';
import { environment } from 'src/environments/environment';
import { ConstantesApp } from '../utils/constantes-app';

@Injectable()
export class GuiaRemisionService {

  private URL_RESOURCE_GUIA_REMISION : string = environment.urlBase + ConstantesApp.RESOURCE_GUIA_REM_TRANSPORTISTA;

  private rptaGuiaRemision!: Respuesta<GuiaRemisionTransp>;
  private rptaGuiaRemisionSource  = new BehaviorSubject<Respuesta<GuiaRemisionTransp>>(new Respuesta<GuiaRemisionTransp>());;
  public rptaGuiaRemision$ = this.rptaGuiaRemisionSource.asObservable();

  constructor(private http: HttpClient) {
  }

  public buscar (ruc: string, serie: string, numero: string) : void {
    let faltaRuc : boolean = ruc == null || ruc.length <= 0;
    let faltaSerie : boolean = serie == null || serie.length <= 0;

    if ( faltaRuc || faltaSerie ) {
      return;
    }

    let urlNumGuiaBuscar : string = this.URL_RESOURCE_GUIA_REMISION + "/" +  `${ruc}-${serie}-${numero}`;

    this.rptaGuiaRemisionSource.next(Respuesta.create(new GuiaRemisionTransp, Estado.LOADING));

    let isNumberSerieGuia = Number(serie.charAt(0));
    if(isNumberSerieGuia >= 0) {
      let guiaRemision = new GuiaRemisionTransp();
      guiaRemision.respuesta = 'GUIA-MANUAL'; // Se está ingresando guía de remisión manual
      this.rptaGuiaRemision = Respuesta.create(guiaRemision, Estado.SUCCESS);
      this.rptaGuiaRemisionSource.next(this.rptaGuiaRemision);
      return;
    }

    this.buscarHttp(urlNumGuiaBuscar).subscribe(objGuiaRemision => {
        this.rptaGuiaRemision = Respuesta.create(objGuiaRemision, Estado.SUCCESS);
        this.rptaGuiaRemisionSource.next(this.rptaGuiaRemision);
    });
  }

  private buscarHttp(url: string) : Observable<GuiaRemisionTransp> {
    return this.http.get<GuiaRemisionTransp>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        this.rptaGuiaRemisionSource.next(Respuesta.createFromErrorHttp(error));
        return throwError(error);
        })
    ) ;
  }

}
