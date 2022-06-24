import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, of, throwError } from 'rxjs';

import { Respuesta } from '../model/common/Respuesta';
import { Estado } from '../model/common/Estado';
import { DataCatalogo } from '../model/common/data-catalogo.model';
import { ParamBusqDcl } from '../model/bean/param-busq-dcl.model';
import { DamSerieDpmn } from '../model/domain/dam-serie-dpmn.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { SaldoSerieDam } from '../model/bean/saldo-serie-dam';
import { environment } from 'src/environments/environment';
import { ConstantesApp } from '../utils/constantes-app';
import { DamSerieCcmn } from '../model/domain/dam-serie-ccmn.model';
import { RegistroCcmnService } from './registro-ccmn.service';
import { ComprobantePago } from '../model/domain/comprobante-pago.model';

@Injectable()
export class ValDclRegistroDpmnService {

  private URL_RESOURCE_VAL_REGISTRO_DPMN : string = environment.urlBase + ConstantesApp.RESOURCE_VALIDAR_DAM_REGISTRO_DPMN;

  private rptaBusqDclSource = new BehaviorSubject<Respuesta<DamSerieCcmn[]>>(new Respuesta<DamSerieCcmn[]>());

  public rptaBusqDcl$ = this.rptaBusqDclSource.asObservable();

  pasoValidarSaldos: boolean = true;
  lstErrorSaldo: any = new Array;
  datosDeclar: ParamBusqDcl = new ParamBusqDcl();

  public listaSaldoSerie: SaldoSerieDam[] = new Array();


  constructor(private http: HttpClient,  private registroCcmnService : RegistroCcmnService) {}

  buscarDeclaracion( paramBusqDcl : ParamBusqDcl ) : void {
    this.rptaBusqDclSource.next(Respuesta.create(new Array, Estado.LOADING));

    this.validarDeclaracionHttp(paramBusqDcl).subscribe((respuesta : Respuesta<DamSerieCcmn[]>) => {
      this.rptaBusqDclSource.next(respuesta);
    });

  };

  buscarDeclaracionConSaldos( paramBusqDcl : ParamBusqDcl ) : void {
    this.rptaBusqDclSource.next(Respuesta.create(new Array, Estado.LOADING));

    this.validarDeclaracionHttp(paramBusqDcl).subscribe((respuesta : Respuesta<DamSerieCcmn[]>) => {

      let noEsRptaExitosa : boolean = respuesta.estado != Estado.SUCCESS;

        if ( noEsRptaExitosa ) {
          this.rptaBusqDclSource.next(respuesta);
          return;
        }

        //this.completarDefaultSaldos(respuesta);
        this.cargarSaldosCtaCteRptaDamSerieDpmn(paramBusqDcl, respuesta);
    });
  };

  private completarDefaultSaldos( rptaDataSeriesCcmn : Respuesta<DamSerieCcmn[]> ) : void {
    rptaDataSeriesCcmn?.data.forEach( ( damSerieCcmn : DamSerieCcmn ) => {
      damSerieCcmn.cntSaldo = damSerieCcmn.cntUnidadFisica;
      damSerieCcmn.numSecDescarga = 0;
    });
  }

  private cargarSaldosCtaCteRptaDamSerieDpmn(paramBusqDcl: ParamBusqDcl,
                                              rptaDataSeriesDpmn : Respuesta<DamSerieCcmn[]>) : void {

    let codAduana: string = paramBusqDcl.codAduana;
    let anio: number = Number(paramBusqDcl.anio);
    let codRegimen : string = paramBusqDcl.codRegimen;
    let numero : number = Number(paramBusqDcl.numero);

    let url : string = this.getSaldoCtaCorrienteDam(codAduana, codRegimen, anio, numero);
    
    this.lstErrorSaldo = new Array();
    this.datosDeclar = paramBusqDcl;

    this.listaSaldoSerie = new Array();
    this.http.get<SaldoSerieDam[]>(url).subscribe( ( lstSaldoSerieDam : SaldoSerieDam[] ) => {
      let noHaySaldos : boolean = lstSaldoSerieDam == null || lstSaldoSerieDam.length <= 0;

      if ( noHaySaldos ) {
        this.completarDefaultSaldos(rptaDataSeriesDpmn);
        this.rptaBusqDclSource.next(rptaDataSeriesDpmn);
        return;
      }

      this.listaSaldoSerie = lstSaldoSerieDam;

      this.completarSaldoCtaCorriente(rptaDataSeriesDpmn, lstSaldoSerieDam);
      this.rptaBusqDclSource.next(rptaDataSeriesDpmn);
    }, (error) => {
      this.completarDefaultSaldos(rptaDataSeriesDpmn);
      this.rptaBusqDclSource.next(rptaDataSeriesDpmn);
    });

  }

  private completarSaldoCtaCorriente(rptaDataSeriesDpmn : Respuesta<DamSerieCcmn[]>,
                                      lstSaldoSerieDam : SaldoSerieDam[]) : void {

      rptaDataSeriesDpmn?.data.forEach( ( damSerieDpmn : DamSerieCcmn ) => {

        let saldoSerieDam : SaldoSerieDam = this.lookupSaldoCtaCorriente(damSerieDpmn, lstSaldoSerieDam);

        if ( saldoSerieDam == null ) {
          damSerieDpmn.numSecDescarga = 0;
          damSerieDpmn.cntSaldo = damSerieDpmn.cntUnidadFisica;
          return;
        }

        damSerieDpmn.cntSaldo = saldoSerieDam.cntSaldo;
        damSerieDpmn.numSecDescarga = saldoSerieDam.numSecDescarga;

      });
  }

  private lookupSaldoCtaCorriente( damSerieDpmn : DamSerieCcmn, lstSaldoSerieDam : SaldoSerieDam[] ) : SaldoSerieDam {

    if ( lstSaldoSerieDam == null || lstSaldoSerieDam.length <= 0 ) {
      return new SaldoSerieDam;
    }

    return lstSaldoSerieDam.find( ( saldo : SaldoSerieDam ) => saldo.numSerie === damSerieDpmn.numSerie ) as SaldoSerieDam;
  }

  private validarDeclaracionHttp( paramBusqDcl : ParamBusqDcl ): Observable<Respuesta<DamSerieCcmn[]>> {
    return this.http.post<any>(this.URL_RESOURCE_VAL_REGISTRO_DPMN, paramBusqDcl).pipe(
          map(dam => {

            if ( dam == null ) {
              return Respuesta.create(null, Estado.SUCCESS) as Respuesta<any>;
            }

            var lstDamSeriesDpmn : DamSerieDpmn[]  = new Array();

            dam?.series?.forEach((itemSerie: any) => {

              var damSerieDpmn = new DamSerieDpmn();
              damSerieDpmn.aduanaDam = new DataCatalogo();
              damSerieDpmn.aduanaDam.codDatacat = dam.codAduana;

              damSerieDpmn.regimenDam = new DataCatalogo();
              damSerieDpmn.regimenDam.codDatacat = dam.codRegimen;
              damSerieDpmn.annDam = dam?.anio;
              damSerieDpmn.numDam = dam?.numero;

              damSerieDpmn.numSerie = itemSerie?.numSerie;
              damSerieDpmn.codSubPartida = itemSerie?.subpartida;
              damSerieDpmn.desComercial = itemSerie?.descripcion;
              damSerieDpmn.mtoPesoBruto = itemSerie?.pesoBruto;
              damSerieDpmn.mtoPesoNeto = itemSerie?.pesoNeto;
              damSerieDpmn.unidadFisica = new DataCatalogo();
              damSerieDpmn.unidadFisica.codDatacat = itemSerie?.codUnidFisica;
              damSerieDpmn.cntUnidadFisica = itemSerie?.cntDeclarada;
              damSerieDpmn.cntRetirada = 0;
              damSerieDpmn.indEliminado = false;

              lstDamSeriesDpmn.push(damSerieDpmn);

            });

        return Respuesta.create(lstDamSeriesDpmn, Estado.SUCCESS);
      }),
      catchError((error: HttpErrorResponse) => {
        this.rptaBusqDclSource.next(Respuesta.createFromErrorHttp(error));
        return throwError(error);
        })
    );
  }

  haySerieSinRetirar(dataSeriesDpmn : DamSerieDpmn[]) : boolean {
    let serieDpmnSinRetirar = dataSeriesDpmn?.find(obj => obj.cntRetirada == null ||  obj.cntRetirada <= 0 );
    return serieDpmnSinRetirar != null;
  }

  haySerieConRetiro(dataSeriesDpmn : DamSerieCcmn[]) : boolean {
    let serieDpmnSinRetirar = dataSeriesDpmn?.find(obj => obj?.cntRetirada > 0 );
    return serieDpmnSinRetirar != null;
  }

  private getClaveCache(paramBusqDcl : ParamBusqDcl) : string {
    let clave = "";
    let separador = "-";
    clave.concat( paramBusqDcl.codAduana, separador,
                  paramBusqDcl.anio, separador,
                  paramBusqDcl.codRegimen, separador,
                  paramBusqDcl.numero );

    return clave;
  }

  getSaldoCtaCorrienteDam(codAduana:string, codRegimen:string, anio:number, numero:number): string {
    return environment.urlBase + `/v1/controladuanero/scci/declaraciones/${codAduana}-${codRegimen}-${anio}-${numero}/saldoctacorriente`;
  }

  existeSerieDeclaracion(dataSeriesDpmn : DamSerieCcmn[], tipoComprobante: string, numComprobante: string ) : string {

    let serieDpmnARetirar  = dataSeriesDpmn?.find(obj => obj?.cntRetirada > 0 );

    let paramBusqDcl = new ParamBusqDcl();

    if(serieDpmnARetirar === undefined)
      return '';

    paramBusqDcl.codAduana = serieDpmnARetirar.aduanaDam.codDatacat;
    paramBusqDcl.anio = serieDpmnARetirar.annDam.toString();
    paramBusqDcl.codRegimen = serieDpmnARetirar.regimenDam.codDatacat;
    paramBusqDcl.numero = serieDpmnARetirar.numDam.toString();
    paramBusqDcl.serie = serieDpmnARetirar.numSerie.toString();

    let serieRegistrada : DamSerieCcmn[] = this.registroCcmnService.obtenerSerieRegistrada(paramBusqDcl); //crear funcion y obtener Item
    
    if(!serieRegistrada){
      return '';
    }

    let serie = serieRegistrada.find((obj) => {
      let comprobantePago : ComprobantePago = this.registroCcmnService.compararSerieCorrelativo(obj.numCorreCompCcmn);
      let numGuia = comprobantePago.numGuia;

      return comprobantePago.tipoComprobante.codDatacat === tipoComprobante && numGuia === numComprobante;
  
    });

    if(!serie){
      return '';
    }

    return 'Serie ' + paramBusqDcl.serie + ' de declaración ' + 
                  paramBusqDcl.codAduana + '-' +
                  paramBusqDcl.codRegimen + '-' +
                  paramBusqDcl.anio + '-' +
                  paramBusqDcl.numero + ' ya cuenta con cantidades a descargar en guía/comprobante ' + 
                  tipoComprobante + '-' +
                  numComprobante;
  }


  limpiarDatosBusqDclSource():void{
    return this.rptaBusqDclSource.next(new Respuesta<DamSerieCcmn[]>());
  }

}
