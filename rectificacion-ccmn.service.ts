import { Inject, Injectable } from '@angular/core';

//import {Dpmn} from '../model/domain/dpmn.model';
//import {DamSerieDpmn} from '../model/domain/dam-serie-dpmn.model';
//import {ArchivoDpmn} from '../model/bean/archivo-dpmn.model';
import { BehaviorSubject, forkJoin, Observable, of, ReplaySubject, throwError } from 'rxjs';
import { ComprobantePago } from '../model/domain/comprobante-pago.model';
import { DataCatalogo } from '../model/common/data-catalogo.model';
import { ConstantesApp } from '../utils/constantes-app';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {IdentificadorDpmn} from '../model/domain/identificador-dpmn.model'
import { catchError, concatMap, delay, flatMap, map, mergeMap, retryWhen, take, timestamp } from 'rxjs/operators';
import { Respuesta } from '../model/common/Respuesta';
import { Estado } from '../model/common/Estado';
import { TokenAccesoService } from './token-acceso.service';
import { Auditoria } from '../model/domain/auditoria.model';
import { ParamBusqDcl } from '../model/bean/param-busq-dcl.model';
import { CheckCcmn} from '../model/bean/check-ccmn.model';
import { PciDetalle } from '../model/domain/pcidetalle.model';
import { environment } from 'src/environments/environment';
import { Ccmn } from '../model/domain/ccmn.model';
import { IdentificadorCcmn } from '../model/domain/identificador-ccmn.model';
import { DamSerieCcmn } from '../model/domain/dam-serie-ccmn.model';
import { ArchivoCcmn } from '../model/bean/archivo-ccmn.model';
import { TipoRegistro } from '../model/common/tipo-registro';
import { UbicacionFuncionario } from '../model/bean/ubicacion-funcionario';
import { FuncionarioAduanero } from '../model/domain/funcionario-aduanero.model';
import { Dpmn } from '../model/domain/dpmn.model';

import { MsgRectiCcmn } from '../model/bean/msg-recti-ccmn.model';
import { TipoEntidadNegocio } from '../model/bean/tipo-entidad-negocio.enum';
import { TipoEvento } from '../model/bean/tipo-evento.enum';
import { DocumentoAdjuntoCcmn } from '../model/domain/adjunto-ccmn.model';
//import { AppEndpointConfig, APP_ENDPOINT_CONFIG } from '../utils/app-endpoint-config';
import { ChkEstadoEvento } from '../model/bean/chk-estado-evento.model';
import { MsgConfirmarRectiCcmn } from '../model/bean/msg-confirmar-recti-ccmn.model';
import * as _ from 'lodash';

@Injectable()
export class RectificacionCcmnService {
  private readonly maxIntentos : number = 10;
  //private readonly urlCcmn : string = environment.urlBase + ConstantesApp.RESOURCE_ENDPOINT_CCMN;
  private readonly urlCcmn : string = 'http://localhost:7109' + '/v1/controladuanero/prevencion/cuentacorrienteimpo/e/ccmns/';
  private readonly urlDamSeriesCcmn : string = environment.urlBase + ConstantesApp.RESOURCE_ENDPOINT_DAM_SERIES_CCMN;
  private readonly urlAdjuntosCcmn : string = environment.urlBase + ConstantesApp.RESOURCE_ENDPOINT_ADJUNTOS_CCMN;
  private readonly urlVerificarGrabacionCcmn : string = environment.urlBase + ConstantesApp.RESOURCE_ENDPOINT_VERIFICAR_GRABACION;
  private readonly urlDpmn: string = environment.urlBase + ConstantesApp.RESOURCE_ENDPOINT_DPMN;

  public identificadorCcmn !: IdentificadorCcmn;

  private pasoActualSubject = new BehaviorSubject<number>(1);
  public pasoActual$ = this.pasoActualSubject.asObservable();

  private ccmn: Ccmn = new Ccmn();
  private ccmnSubject = new BehaviorSubject<Ccmn>(this.ccmn);
  public  ccmn$ = this.ccmnSubject.asObservable();

  private damSeriesCcmn : DamSerieCcmn[] = new Array();
  private damSeriesCcmnSubject = new BehaviorSubject<DamSerieCcmn[]>(new Array());
  public  damSeriesCcmn$ = this.damSeriesCcmnSubject.asObservable();

  private archivosCcmn: ArchivoCcmn[] = new Array();
  private archivosCcmnSubject = new BehaviorSubject<ArchivoCcmn[]>(this.archivosCcmn);
  public  archivosCcmn$ = this.archivosCcmnSubject.asObservable();

  private resultadoGrabadoCcmn : Respuesta<IdentificadorCcmn> = new Respuesta<IdentificadorCcmn>();
  private resultadoGrabadoCcmnSubject = new BehaviorSubject<Respuesta<IdentificadorCcmn>>(this.resultadoGrabadoCcmn);
  public  resultadoGrabadoCcmn$ = this.resultadoGrabadoCcmnSubject.asObservable();

  private msgConfirmNewDamSerieCcmnSubject = new BehaviorSubject<string | null>(null);
  public  msgConfirmNewDamSerieCcmn$ = this.msgConfirmNewDamSerieCcmnSubject.asObservable();

  private resultRectificacionCcmn :  Respuesta<IdentificadorCcmn> = new Respuesta<IdentificadorCcmn>();
  private resultRectificacionCcmnSubject = new BehaviorSubject<Respuesta<IdentificadorDpmn>>(this.resultRectificacionCcmn);
  public  resultRectificacionCcmn$ = this.resultRectificacionCcmnSubject.asObservable();

  
  private versionOriginal : number=0;
  private damSeriesCcmnOriginal : DamSerieCcmn[] = new Array();
  private archivosCcmnOriginal: ArchivoCcmn[]  = new Array();

  private ccmnOriginal: Ccmn = new Ccmn();

  pciDetalle!: PciDetalle;
  tipoRegistro!:TipoRegistro;
  datosFuncionario!:UbicacionFuncionario;
  datosDeclar: ParamBusqDcl = new ParamBusqDcl();
  documentoAdjuntoCcmn!: DocumentoAdjuntoCcmn;
  //private appEndPointConfig: AppEndpointConfig;
  constructor(private http: HttpClient, 
    private tokenAccesoService: TokenAccesoService
    //@Inject(APP_ENDPOINT_CONFIG) newAppEndPointConfig : AppEndpointConfig
    ) { 
      //this.appEndPointConfig = newAppEndPointConfig;
    }

    private readonly URL_RESOURCE_RECTIFICACION_CHEK_ESTADO_EVENTOS_CCMN: string = environment.urlBase + ConstantesApp.RESOURCE_RECTIFICACION_CHEK_ESTADO_EVENTOS_CCMN;
    private readonly URL_RESOURCE_RECTIFICACION_CONFIRM_RECTIFICACION_CCMN: string =environment.urlBase +ConstantesApp.RESOURCE_RECTIFICACION_CONFIRM_RECTIFICACION_CCMN;
    private readonly URL_RESOURCE_RECTIFICACION_PUBLICACION_RECTIFICACION_CCMN: string =environment.urlBase + ConstantesApp.RESOURCE_RECTIFICACION_PUBLICACION_RECTIFICACION_CCMN;
    private readonly URL_RESOURCE_RECTIFICACION_DOCUMENTOSECM_CCMN: string =environment.urlBase + ConstantesApp.RESOURCE_RECTIFICACION_DOCUMENTOSECM_CCMN
    private readonly URL_RESOURCE_RECTIFICACION_CANCELACION_CCMN: string =environment.urlBase +ConstantesApp.RESOURCE_RECTIFICACION_CANCELACION_CCMN

    limpiarData() : void {
      this.ccmn = new  Ccmn();
      this.damSeriesCcmn = new Array();
      this.archivosCcmn = new Array();
      this.resultadoGrabadoCcmn = new Respuesta<IdentificadorCcmn>();
      this.resultRectificacionCcmn =new Respuesta<IdentificadorCcmn>();


      this.ccmnSubject.next(this.ccmn);
      this.damSeriesCcmnSubject.next(this.damSeriesCcmn);
      this.archivosCcmnSubject.next(this.archivosCcmn);
      this.resultadoGrabadoCcmnSubject.next(this.resultadoGrabadoCcmn);
      this.resultRectificacionCcmnSubject.next(this.resultRectificacionCcmn);
    }
    putCcmn(newCcmn: Ccmn) : void {
      this.ccmn = newCcmn;
      this.ccmnSubject.next(this.ccmn);
    }
    private enviarMsgConfirmNewDamSeriesCcmn(seriesParaAgregar : DamSerieCcmn[]) : void {

      let numSeries : string[] = new Array();
      let cantidades : string[] = new Array();
  
      seriesParaAgregar.forEach( ( item : DamSerieCcmn ) => {
        numSeries.push(item.numSerie.toString());
        cantidades.push(item.cntRetirada.toString());
      });
  
      let descSeries : string = numSeries.toString();
      descSeries = descSeries.replace(",", ", ");
  
      let desCantidades : string = cantidades.toString();
      desCantidades = desCantidades.replace(",", ", ");
  
      let mensaje : string = "Se agrega(n) serie(s) " + descSeries + " con " + desCantidades + " unidades físicas a descargar";
  
      this.msgConfirmNewDamSerieCcmnSubject.next(mensaje);
    }
  
    limpiarMsgConfirmNewDamSeriesCcmn() : void {
      this.msgConfirmNewDamSerieCcmnSubject.next(null);
    }
    getSeries(): DamSerieCcmn[]{
      return this.damSeriesCcmn;
    }
    eliminarComprobante(correComprob : number) : void {
      this.ccmn.comprobantePago = this.ccmn?.comprobantePago.filter((item : ComprobantePago) => item.numCorrelativo != correComprob );
      this.damSeriesCcmn = this.damSeriesCcmn.filter( (item : DamSerieCcmn) => item.numCorreCompCcmn != correComprob  );
  
      this.ccmnSubject.next(this.ccmn);
      this.damSeriesCcmnSubject.next(this.damSeriesCcmn);
    }
  
    eliminarSerie(serie : DamSerieCcmn) : void {
      
      if(this.damSeriesCcmn.filter( (item : DamSerieCcmn) => item.numCorreCompCcmn == serie.numCorreCompCcmn).length == 1){
        this.ccmn.comprobantePago = this.ccmn?.comprobantePago.filter((item : ComprobantePago) => item.numCorrelativo != serie.numCorreCompCcmn );
      }
      this.damSeriesCcmn = this.damSeriesCcmn.filter( (item : DamSerieCcmn) => item.numCorrelativo != serie.numCorrelativo);
  
      this.ccmnSubject.next(this.ccmn);
      this.damSeriesCcmnSubject.next(this.damSeriesCcmn);
    }
    adjuntarArchivo(archivo: File, tipoDocumento: DataCatalogo) : void {

      let correArchivo = this.archivosCcmn.length + 1;
  
      let archivoCcmn = new ArchivoCcmn();
      archivoCcmn.id = correArchivo;
      archivoCcmn.codTipoDocumento = tipoDocumento.codDatacat;
      archivoCcmn.desTipoDocumento = tipoDocumento.desDataCat;
      archivoCcmn.nomArchivo = archivo.name;
      archivoCcmn.nomContentType = archivo.type;
      archivoCcmn.fecRegistro = new Date();
      archivoCcmn.usuarioRegistra = this.tokenAccesoService.login;
      archivoCcmn.origenInvocacion = this.tokenAccesoService.origen;
  
      this.convertFile(archivo).subscribe((base64 : string) => {
        archivoCcmn.valArchivoBase64 = base64;
        this.archivosCcmn.push(archivoCcmn);
        this.archivosCcmnSubject.next(this.archivosCcmn);
      });
    }
  
    eliminarArchivo(idArchivo : number) : void {
      this.archivosCcmn = this.archivosCcmn.filter( ( item : ArchivoCcmn ) => item.id != idArchivo );
      this.archivosCcmnSubject.next(this.archivosCcmn);
    }
  
    private completarCcmnEnSeriesDAM(identificador: IdentificadorCcmn) {
        this.damSeriesCcmn.forEach((item : DamSerieCcmn) => {
          item.numCorreCcmn = identificador.correlativo;
        });
    }
  
    private completarCcmnEnAdjuntos(identificador: IdentificadorCcmn) {
      this.archivosCcmn.forEach((item : ArchivoCcmn) => {
        item.codAduanaCcmn = identificador.codAduana;
        item.annioCcmn = identificador.anio.toString();
        //item.numeroDpmn = identificador.numero.toString();
        item.numCorrelativoCcmn = identificador.correlativo;
      });
  }
  private requestGrabarSeriesConAdjuntos() : Observable<any>[] {
    let peticiones : Observable<any>[] = new Array();

    let bloqueDamSeriesCcmn = this.getBloquesDamSeriesCcmn(ConstantesApp.TAMANIO_BATCH_DAMSERIESDPMN_POR_REQUEST);

    bloqueDamSeriesCcmn.forEach((bloque : DamSerieCcmn[])=> {
      peticiones.push(this.http.post(this.urlDamSeriesCcmn, bloque));
    });

    this.archivosCcmn.forEach((archivo : ArchivoCcmn) => {
      peticiones.push(this.requestGrabarAdjunto(archivo));
    });

    return peticiones;
  }
  
  private requestGrabarAdjunto(archivo : ArchivoCcmn) : Observable<any> {
    return this.http.post(this.urlAdjuntosCcmn, archivo).pipe(
      retryWhen(error =>
        error.pipe(
          concatMap((error, count) => {
            if (count < 3) {
              return of(error);
            }
            return throwError(error);
          }),
          delay(5000)
        )
      )
    );
  }

  private requestVerificarGrabacionCcmn() : Observable<any> {
    let checkCcmn : CheckCcmn = new CheckCcmn();

    checkCcmn.correlativoCcmn = this.identificadorCcmn.correlativo;
    checkCcmn.cntSeriesDcl = this.damSeriesCcmn.length;
    checkCcmn.cntArchivosAdjuntos = this.archivosCcmn.length;

    let request = this.http.post(this.urlVerificarGrabacionCcmn, checkCcmn).pipe(
      retryWhen(error =>
        error.pipe(
          concatMap((error, count) => {
            if (count < this.maxIntentos) {
              return of(error);
            }
            return throwError(error);
          }),
          delay(5000)
        )
      )
    );

    return request;
  }

  private getBloquesDamSeriesCcmn(tamanio: number) : DamSerieCcmn[][] {

    var result : DamSerieCcmn[][] = this.damSeriesCcmn.reduce((resultArray: any[], item, index) => {
      const chunkIndex :number = Math.floor(index/tamanio);

      if(!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = []
      }

      resultArray[chunkIndex].push(item)

      return resultArray
    }, []);

    return result;
  }
  validarGrabacionCcmn() : string[] {
    let respuesta : string[] = new Array();

    if ( this.faltaIngresarDeclaracionComprobante() ) {
      respuesta.push("Debe ingresar por lo menos una serie de declaración de importación y un comprobantes de pago");
    }

    if ( this.noTieneArchivosAdjuntos() ) {
      respuesta.push("Debe adjuntar por lo menos un archivo");
    }

    if ( this.faltaIngresarPlacaCarreta() ) {
      respuesta.push("Falta ingresar la placa de la carreta o no debe ingresar el país placa carreta");
    }

    if ( this.faltaIngresarPaisPlacaCarreta() ) {
      respuesta.push("Falta ingresar el país de la placa carreta o no debe ingresar la placa carreta");
    }

    /*agregar validacion de saldos*/

    return respuesta;
  }
  ciudadOrigenIgual(codCiudadOrigen : string) : boolean {
    if ( codCiudadOrigen == null ) {
      return false;
    }

    let codigoCiudadOrigen = this.ccmn?.datoComplementario?.ubigeoOrigen?.codUbigeo;

    return codigoCiudadOrigen == codCiudadOrigen;
  }

  private noTieneArchivosAdjuntos() : boolean {
    return this.archivosCcmn == null || this.archivosCcmn.length <= 0;
  }

  private tienePaisPlacaCarreta() : boolean {
    let paisPlacaCarreta = this.ccmn?.empresaTransporte?.paisPlacaCarreta?.codDatacat;
    return paisPlacaCarreta != null && paisPlacaCarreta.trim().length > 0;
  }

  private tienePlacaCarreta() : boolean {
    let nomPlaca = this.ccmn?.empresaTransporte?.nomPlacaCarreta;
    return nomPlaca != null && nomPlaca.trim().length > 0;
  }

  private faltaIngresarPlacaCarreta() : boolean {
    return this.tienePaisPlacaCarreta() && !this.tienePlacaCarreta();
  }

  private faltaIngresarPaisPlacaCarreta() : boolean {
    return !this.tienePaisPlacaCarreta() && this.tienePlacaCarreta();
  }

  private faltaIngresarDeclaracionComprobante() : boolean {
      let numComprobantes = this.ccmn?.comprobantePago?.length;
      let noHayComprobantes =  numComprobantes == null || numComprobantes <= 0;

      let numDclSeriesCcmn = this.damSeriesCcmn?.length;
      let noHayDclSeriesCcmn = numDclSeriesCcmn == null || numDclSeriesCcmn <= 0;

      return noHayComprobantes || noHayDclSeriesCcmn;
  }

  private completarDatosAuditoria() : void {
    let auditoria : Auditoria = new Auditoria();
    let fechaActual : Date = new Date();

    auditoria.codUsuRegis =  this.tokenAccesoService.login;
    auditoria.fecRegis = fechaActual;
    auditoria.codUsumodif =  this.tokenAccesoService.login;
    auditoria.fecModif = fechaActual;

    this.ccmn.auditoria = auditoria;
    this.ccmn.fecCcmn = fechaActual;

    let funcionarioAduanero: FuncionarioAduanero = new FuncionarioAduanero();
    funcionarioAduanero.nroRegistro = this.datosFuncionario.numeroRegistro;
    funcionarioAduanero.nombre = this.tokenAccesoService.nombreCompleto;
    this.ccmn.funcionarioAduanero = funcionarioAduanero;

    this.ccmn.comprobantePago.forEach((item: ComprobantePago)=>{
      item.auditoria = auditoria;
    });

    this.damSeriesCcmn.forEach( (item : DamSerieCcmn) => {
      item.auditoria = auditoria;
    });

    this.archivosCcmn.forEach((item: ArchivoCcmn)=>{
      item.auditoria = auditoria;
    });

  }

  private completarEstado() : void {
    let estadoCcmn : DataCatalogo = new  DataCatalogo();
    estadoCcmn.codDatacat = "01";
    estadoCcmn.desDataCat = "Numerada";

    this.ccmn.estado = estadoCcmn;
  }

  private completarActorRegistro() : void {
    let actorRegistro : DataCatalogo = new  DataCatalogo();
    actorRegistro.codDatacat = "PFA";
    actorRegistro.desDataCat = "Portal Funcionario Aduanero";
    this.ccmn.moduloRegistro = actorRegistro;
  }

  private completarVariableControl() : void {
    this.ccmn.codVariableControl = " ";
  }

  private completarCorrelativoPCI() : void{
    this.ccmn.numCorrelativoPCI = this.pciDetalle.numCorrelativo;
  }

  private completarCantidades() : void{
    this.ccmn.cntDamSeries = this.damSeriesCcmn.length;
    this.ccmn.cntAdjuntos = this.archivosCcmn.length;
  }

  private completarTipoAnulacion() : void {
    let tipoAnulacion : DataCatalogo = new  DataCatalogo();
    tipoAnulacion.codDatacat = "";
    tipoAnulacion.desDataCat = "No Anulado";
    this.ccmn.tipoAnulacion = tipoAnulacion;
  }

  private completarDatosFaltantes() : void {
    if(this.tipoRegistro != TipoRegistro.CAF && this.tipoRegistro != TipoRegistro.TTA){
      this.completarCorrelativoPCI();
    }

    this.completarCantidades();
    this.completarDatosAuditoria();
    this.completarEstado();
    this.completarActorRegistro();
    this.completarVariableControl();
    this.completarTipoAnulacion();
  }

  grabarCcmn() : void {
    this.resultadoGrabadoCcmn = Respuesta.create(new IdentificadorCcmn(), Estado.LOADING);
    this.resultadoGrabadoCcmnSubject.next(this.resultadoGrabadoCcmn);

    this.completarDatosFaltantes();

    this.http.post<IdentificadorCcmn>(this.urlCcmn, this.ccmn).pipe(
        map( (respuesta: IdentificadorCcmn) => {
          this.identificadorCcmn = respuesta;
          return respuesta
        }),
        mergeMap(respuesta => {
            this.completarCcmnEnSeriesDAM(respuesta);
            this.completarCcmnEnAdjuntos(respuesta);
            return forkJoin(this.requestGrabarSeriesConAdjuntos());
        }, 5),
        concatMap( respuesta => this.requestVerificarGrabacionCcmn() ),
        catchError((error: HttpErrorResponse) => {
          console.error(error);
          this.resultadoGrabadoCcmn = Respuesta.create(this.identificadorCcmn, Estado.ERROR);
          this.resultadoGrabadoCcmnSubject.next(this.resultadoGrabadoCcmn);
          return throwError(error);
        })
    ).subscribe(resultado => {
        this.resultadoGrabadoCcmn = Respuesta.create(this.identificadorCcmn, Estado.SUCCESS);
        this.resultadoGrabadoCcmnSubject.next(this.resultadoGrabadoCcmn);
    });
  }

  actualizarDpmn(dpmn: Dpmn) : void {
    this.http.put<any>(this.urlDpmn, dpmn)
        .subscribe(data => console.log(data));
  }

  colocarPasoActual(numeroPaso : number) : void {
    this.pasoActualSubject.next(numeroPaso);
  }

  private obtenerCorreDamSerieCcmn() : number {
    if ( this.damSeriesCcmn == null || this.damSeriesCcmn.length <= 0 ) {
      return 1;
    }

    return Math.max.apply(Math, this.damSeriesCcmn.map( (itDamSerieCcmn) => itDamSerieCcmn.numCorrelativo)) + 1;
  }

  private convertFile(file : File) : Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event: any) => result.next(btoa(event.target.result.toString()));
    return result;
  }
 
  declaracionEstaRegistrada(paramBusqDcl: ParamBusqDcl) : boolean {
    let damEncontrada : DamSerieCcmn = this.damSeriesCcmn.find( ( item : DamSerieCcmn) => {
      let mismaAduana : boolean = item.aduanaDam?.codDatacat ==  paramBusqDcl?.codAduana;
      let mismoRegimen : boolean = item.regimenDam?.codDatacat == paramBusqDcl?.codRegimen;
      let mismoNumero : boolean = item.numDam ==  Number.parseInt(paramBusqDcl?.numero);
      let mismoAnio : boolean = item.annDam ==  Number.parseInt(paramBusqDcl?.anio);

      return mismaAduana && mismoRegimen && mismoNumero && mismoAnio;
    }) as DamSerieCcmn;

    return damEncontrada != null;
  }

  descargarFicharResumen() : Observable<any> {
    let urlFichaQR = this.urlFichaResumenQr;
    return this.http.get(urlFichaQR, {responseType: 'blob' as 'json'});
  }

  get urlFichaResumenQr() : string {
    let correlativo = this.identificadorCcmn.correlativo;
    return environment.urlBase + ConstantesApp.getResourceFichaResumenQr(correlativo);
  }

  get numeroCcmnGenerado() : string {

    if ( this.identificadorCcmn == null ) {
      return "";
    }

    return this.identificadorCcmn?.codAduana + "-" +
            this.identificadorCcmn?.codPuestoControl + "-" +
            this.identificadorCcmn?.anio + "-" +
            this.identificadorCcmn?.numero;
  }
  rectificar() : void {

    this.resultRectificacionCcmn = Respuesta.create(this.identificadorCcmn, Estado.LOADING);
    this.resultRectificacionCcmnSubject.next(this.resultRectificacionCcmn);

    let eventosRectificacion = this.generarListaMsgRectiDpmn();

    of(eventosRectificacion).pipe(
      mergeMap( () =>  {
        return this.requestGrabarDocumentosECM();
      }, 3),
      map( ( respuesta : DocumentoAdjuntoCcmn[] ) => {
        this.completarCambiosAdjuntosCcmnNuevos(respuesta, eventosRectificacion);
        this.completarDatosFaltantesEventosRecti(eventosRectificacion);
        return eventosRectificacion;
      }),
      mergeMap ( ( eventos : MsgRectiCcmn[] ) => {
        return forkJoin(this.requestHttpGrabarEventos(eventos)).pipe( map( () => {
          let checkEstadoEvento : ChkEstadoEvento = new ChkEstadoEvento();
          checkEstadoEvento.anulado = false;
          checkEstadoEvento.procesado = false;
          checkEstadoEvento.cantidad = eventos.length;
          checkEstadoEvento.correlativo = eventos[0].uuid;
          return checkEstadoEvento;
        }));
      }, 5),
      concatMap( ( checkEstadoEvento : ChkEstadoEvento ) => this.requestCheckEstadoEventos(checkEstadoEvento).pipe(
        map( () => {
          let mensaje = new MsgConfirmarRectiCcmn();
          mensaje.correlativoDpmn = this.ccmn.numCorrelativo;
          mensaje.correlativoEvento = checkEstadoEvento.correlativo;

          return { "msgConfirmarRectiCcmn": mensaje, "checkEstadoEvento": checkEstadoEvento };
        })
       ) ),
       concatMap( ( data : any ) => this.requestConfirmarRectificacion( data.msgConfirmarRectiDpmn ).pipe(
         map( () => {
            let checkEstadoEvento : ChkEstadoEvento = data.checkEstadoEvento as ChkEstadoEvento;
            checkEstadoEvento.procesado = true;
            return checkEstadoEvento;
          } )
       ) ),
       concatMap( ( checkEstadoEvento : ChkEstadoEvento ) => this.requestCheckEstadoEventos(checkEstadoEvento) ),
       catchError((error: HttpErrorResponse) => {
        console.error(error);
        this.resultRectificacionCcmn = Respuesta.create(this.identificadorCcmn, Estado.ERROR);
        this.resultRectificacionCcmn.mensajes = Respuesta.obtenerMensajes(error);
        this.resultRectificacionCcmnSubject.next(this.resultRectificacionCcmn);
        // return this.requestCancelarRectificacion(eventosRectificacion[0].uuid);
        return this.requestCancelarRectificacion(JSON.stringify(eventosRectificacion[0].uuid));
      })
    ).subscribe( () => {

      if ( this.resultRectificacionCcmn.estado == Estado.ERROR ) {
        return;
      }

      this.resultRectificacionCcmn = Respuesta.create(this.identificadorCcmn, Estado.SUCCESS);
      this.resultRectificacionCcmnSubject.next(this.resultRectificacionCcmn);
    });

  }

  private completarDatosFaltantesEventosRecti( eventosRecti : MsgRectiCcmn[] ) : void {
    let contador : number = 0;
    let uuid : string = this.generateUUID();

    eventosRecti.forEach( ( item : MsgRectiCcmn ) => {
      item.uuid = uuid;
      item.correlativoCcmn = this.ccmn.numCorrelativo;
      item.secuencia = ++contador;
      item.version = this.versionOriginal;
    });
  }

  private generateUUID() : string  {
    var dt = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = (dt + Math.random()*16)%16 | 0;
          dt = Math.floor(dt/16);
          return (c=='x' ? r :(r&0x3|0x8)).toString(16);
      });
      return uuid;
  }

  private completarCambiosAdjuntosCcmnNuevos( adjuntosCcmnNuevos : DocumentoAdjuntoCcmn[], respuesta : MsgRectiCcmn[] ) : void {

    adjuntosCcmnNuevos.forEach( (item : DocumentoAdjuntoCcmn) => {

      let msgRectiDpmn : MsgRectiCcmn = new MsgRectiCcmn();
      let pkAdjunto : DocumentoAdjuntoCcmn = new DocumentoAdjuntoCcmn();
      pkAdjunto.codArchivoEcm = item.codArchivoEcm;

      item.numCorrelativoCcmn = this.identificadorCcmn.correlativo;
      item.indEliminado = false;

      msgRectiDpmn.jsonData = JSON.stringify(item);
      msgRectiDpmn.jsonPkNegocio = JSON.stringify(pkAdjunto);
      msgRectiDpmn.tipoEntidadNegocio = TipoEntidadNegocio.ADJUNTOS_DPMN;
      msgRectiDpmn.tipoEvento = TipoEvento.NUEVO;
      msgRectiDpmn.usuario = this.tokenAccesoService.login;

      respuesta.push(msgRectiDpmn);
    });

  }

  private requestCancelarRectificacion( correlativoEvento : string ) : Observable<any> {

    return this.http.post( this.URL_RESOURCE_RECTIFICACION_CANCELACION_CCMN, correlativoEvento ).pipe(
      retryWhen(error =>
        error.pipe(
          concatMap((error, count) => {
            if (count < 3) {
              return of(error);
            }
            return throwError(error);
          }),
          delay(5000)
        )
      )
    );

  }

  private requestCheckEstadoEventos(chkEstadoEvento : ChkEstadoEvento) : Observable<any> {

    return this.http.post(this.URL_RESOURCE_RECTIFICACION_CHEK_ESTADO_EVENTOS_CCMN, chkEstadoEvento).pipe(
      retryWhen(error =>
        error.pipe(
          concatMap((error, count) => {
            if (count < this.maxIntentos) {
              return of(error);
            }
            return throwError(error);
          }),
          delay(5000)
        )
      )
    );

  }

  private requestConfirmarRectificacion( mensaje : MsgConfirmarRectiCcmn) : Observable<any> {

    return this.http.post(this.URL_RESOURCE_RECTIFICACION_CONFIRM_RECTIFICACION_CCMN, mensaje ).pipe(
      retryWhen(error =>
        error.pipe(
          concatMap((error, count) => {
            if (count < 3) {
              return of(error);
            }
            return throwError(error);
          }),
          delay(5000)
        )
      )
    );

  }

  private requestHttpGrabarEventos(eventos : MsgRectiCcmn[]) : Observable<any>[] {
    let url = this.URL_RESOURCE_RECTIFICACION_PUBLICACION_RECTIFICACION_CCMN;
    let respuesta : Observable<any>[] = new Array();

    eventos.forEach( ( item : MsgRectiCcmn ) => {
      let peticion = this.http.post(url, item).pipe(
        retryWhen(error =>
          error.pipe(
            concatMap((error, count) => {
              if (count < 3) {
                return of(error);
              }
              return throwError(error);
            }),
            delay(5000)
          )
        )
      );
      respuesta.push(peticion);
    });
    return respuesta;
}

  private requestGrabarDocumentosECM() :  Observable<DocumentoAdjuntoCcmn[]> {

    let peticiones : Observable<DocumentoAdjuntoCcmn>[] = new Array();
  
    let nuevosArchivosCcmn : ArchivoCcmn[] = this.archivosCcmn.filter( ( item : ArchivoCcmn ) => item.codArchivoEcm == null );
  
    if ( nuevosArchivosCcmn.length <= 0 ) {
      return of(new Array());
    }
  
    let url = this.URL_RESOURCE_RECTIFICACION_DOCUMENTOSECM_CCMN;
  
    nuevosArchivosCcmn.forEach( ( item : ArchivoCcmn ) => {
      let obs : Observable<DocumentoAdjuntoCcmn> = this.http.post<string>(url, item).pipe(
        map ( ( codArchivoEcm : string ) => {
          let respuesta : DocumentoAdjuntoCcmn;
          respuesta!.codArchivoEcm = codArchivoEcm;
          respuesta!.codTipoDocumento = item.codTipoDocumento;
          respuesta!.desTipoDocumento = item.desTipoDocumento;
          respuesta!.indEliminado = false;
          respuesta!.nomArchivo = item.nomArchivo;
          respuesta!.nomContentType = item.nomContentType;
          respuesta!.numCorrelativoCcmn = item.numCorrelativoCcmn;
          return respuesta!;
        }),
        retryWhen(error =>
          error.pipe(
            concatMap((error, count) => {
              if (count < 3) {
                return of(error);
              }
              return throwError(error);
            }),
            delay(5000)
          )
        )
      );
  
      peticiones.push(obs);
    });
  
    return forkJoin(peticiones);
   }
  private generarListaMsgRectiDpmn() : MsgRectiCcmn[] {
    let data : MsgRectiCcmn[] =  new Array();

    this.completarDpmnEnSeriesDAM();

    data.push(this.createMsgRectiCcmn());
    this.createMsgRectiDamSeriesCcmn().forEach(( item : MsgRectiCcmn )  => data.push(item));
    this.encontrarAdjuntosCcmnEliminados(data);

    return data;
  }
  private completarDpmnEnSeriesDAM() {
    this.damSeriesCcmn.forEach((item : DamSerieCcmn) => {
      item.numCorreCcmn = this.identificadorCcmn.correlativo;
    });
  }
  private createMsgRectiCcmn() : MsgRectiCcmn {
    let data : MsgRectiCcmn = new MsgRectiCcmn();

    let pkNegocio : Dpmn = new Dpmn();
    pkNegocio.numCorrelativo = this.ccmnOriginal.numCorrelativo;

    let diffCcmn : Ccmn = this.buscarDiferencias( this.ccmnOriginal, this.ccmn );
    diffCcmn = this.removeEmptyProperties(diffCcmn);

    if ( diffCcmn.comprobantePago != null ) {
      diffCcmn.comprobantePago = this.ccmn.comprobantePago;
    }

    data.jsonPkNegocio = JSON.stringify(pkNegocio);
    data.jsonData = JSON.stringify(diffCcmn);
    data.tipoEntidadNegocio = TipoEntidadNegocio.DPMNS;
    data.tipoEvento = TipoEvento.RECTIFICACION;
    data.usuario = this.tokenAccesoService.login;

    return data;
  } 
  //  private buscarDiferencias(origObj : any, newObj : any) : any {
    private buscarDiferencias(origObj : any, newObj : any) : any {
      function changes(newObj:any, origObj:any) {
        let arrayIndexCounter = 0
        return _.transform(newObj, function (result:any, value:any, key:any) {
          if (!_.isEqual(value, origObj[key])) {
            let resultKey = _.isArray(origObj) ? arrayIndexCounter++ : key
            result[resultKey] = (_.isObject(value) && _.isObject(origObj[key])) ? changes(value, origObj[key]) : value
          }
        });
      }
      return changes(newObj, origObj);
    }


  private removeEmptyProperties(obj : any):any {
    if ( _.isArray(obj) ) {
      return obj
      .map(v => (_.isObject(v)) ? this.removeEmptyProperties(v) : v)
      .filter(v => !(_.isEmpty(v)));
    } else {
      return Object.entries(obj)
      .map(([k, v]) => [k, _.isObject(v) ? this.removeEmptyProperties(v) : v])
      .reduce((a, [k, v]) => ( ( _.isEmpty(v) && !(_.isFinite(v)) ) ? a : (a=v, a)), {}); // a[k]
    }
  }
  private createMsgRectiDamSeriesCcmn() : MsgRectiCcmn[] {
    let respuesta : MsgRectiCcmn[] = new Array();

    if ( this.noHayCambioDamSeriesCcmn() ) {
      return respuesta;
    }

    this.encontrarCambiosDamSeriesCcmnRectificadas(respuesta);
    this.encontrarCambiosDamSeriesCcmnEliminadas(respuesta);
    this.encontrarCambiosDamSeriesCcmnNuevas(respuesta);

    return respuesta;
  }
  private noHayCambioDamSeriesCcmn() : boolean  {
    let diffDamSeriesCcmn : DamSerieCcmn[] = this.buscarDiferencias( this.damSeriesCcmnOriginal, this.damSeriesCcmn );
    diffDamSeriesCcmn = this.removeEmptyProperties(diffDamSeriesCcmn);

    if ( _.isEmpty(diffDamSeriesCcmn) == null ) {
      return true;
    }

    return false;
  }

  private encontrarCambiosDamSeriesCcmnRectificadas(respuesta : MsgRectiCcmn[]) : void {

    let damSeriesCcmnModificadas : DamSerieCcmn[] = this.damSeriesCcmn.filter( ( item: DamSerieCcmn ) => {
      let damSerieDpmnOriginal = this.buscarDamSerieCcmnOriginal(item);
      return damSerieDpmnOriginal != null;
    });

    damSeriesCcmnModificadas.forEach( ( item : DamSerieCcmn ) => {
      let itemOriginal : DamSerieCcmn = this.buscarDamSerieCcmnOriginal(item);

      let diffDamSerieCcmn : DamSerieCcmn = this.buscarDiferencias(itemOriginal, item);

      diffDamSerieCcmn.fecRegistro = "";
      diffDamSerieCcmn.indEliminado = false;
      diffDamSerieCcmn.auditoria = new Auditoria();
      diffDamSerieCcmn = this.removeEmptyProperties(diffDamSerieCcmn);

      if ( _.isEmpty(diffDamSerieCcmn) ) {
        return;
      }

      let msgRectiDpmn : MsgRectiCcmn = new MsgRectiCcmn();

      let pkNegocio : DamSerieCcmn = new DamSerieCcmn();
      pkNegocio.numCorrelativo = item.numCorrelativo;
      pkNegocio.numCorreCompCcmn = item.numCorreCompCcmn;
      pkNegocio.numCorreCcmn = this.ccmnOriginal.numCorrelativo;

      msgRectiDpmn.jsonData = JSON.stringify(diffDamSerieCcmn);
      msgRectiDpmn.jsonPkNegocio = JSON.stringify(pkNegocio);
      msgRectiDpmn.tipoEntidadNegocio = TipoEntidadNegocio.DAM_SERIES_DPMN;
      msgRectiDpmn.tipoEvento = TipoEvento.RECTIFICACION;
      msgRectiDpmn.usuario = this.tokenAccesoService.login;

      respuesta.push(msgRectiDpmn);
    });

  }
  private encontrarCambiosDamSeriesCcmnEliminadas(respuesta : MsgRectiCcmn[]) : void {

    let damSeriesDpmnEliminadas = this.damSeriesCcmnOriginal.filter( ( itemOri : DamSerieCcmn ) => {
      let damSerieDpmnModif = this.damSeriesCcmn.find( ( itemModif : DamSerieCcmn ) => itemModif.numCorrelativo == itemOri.numCorrelativo && itemModif.numCorreCompCcmn == itemOri.numCorreCompCcmn );
      return damSerieDpmnModif == null;
    });

    damSeriesDpmnEliminadas.forEach( ( item : DamSerieCcmn ) => {

      let msgRectiDpmn : MsgRectiCcmn = new MsgRectiCcmn();

      let pkNegocio : DamSerieCcmn = new DamSerieCcmn();
      pkNegocio.numCorrelativo = item.numCorrelativo;
      pkNegocio.numCorreCompCcmn = item.numCorreCompCcmn;
      pkNegocio.numCorreCcmn = this.ccmnOriginal.numCorrelativo;

      let dataModif : DamSerieCcmn = new DamSerieCcmn();
      dataModif.indEliminado = true;

      msgRectiDpmn.jsonData = JSON.stringify(dataModif);
      msgRectiDpmn.jsonPkNegocio = JSON.stringify(pkNegocio);
      msgRectiDpmn.tipoEntidadNegocio = TipoEntidadNegocio.DAM_SERIES_DPMN;
      msgRectiDpmn.tipoEvento = TipoEvento.ANULACION;
      msgRectiDpmn.usuario = this.tokenAccesoService.login;

      respuesta.push(msgRectiDpmn);
    });

  }

  private encontrarCambiosDamSeriesCcmnNuevas(respuesta : MsgRectiCcmn[]) : void {
    let damSeriesDpmnNuevas = this.damSeriesCcmn.filter( ( item : DamSerieCcmn ) => {
      let damSerieDpmnOriginal = this.damSeriesCcmnOriginal.find( (itemOri : DamSerieCcmn) => itemOri.numCorreCompCcmn == item.numCorreCompCcmn && itemOri.numCorrelativo == item.numCorrelativo );
      return damSerieDpmnOriginal == null;
    });

    damSeriesDpmnNuevas.forEach( ( item : DamSerieCcmn ) => {

      let msgRectiDpmn : MsgRectiCcmn = new MsgRectiCcmn();

      let pkNegocio : DamSerieCcmn = new DamSerieCcmn();
      pkNegocio.numCorrelativo = item.numCorrelativo;
      pkNegocio.numCorreCompCcmn = item.numCorreCompCcmn;
      pkNegocio.numCorreCcmn = this.ccmnOriginal.numCorrelativo;

      msgRectiDpmn.jsonData = JSON.stringify(item);
      msgRectiDpmn.jsonPkNegocio = JSON.stringify(pkNegocio);
      msgRectiDpmn.tipoEntidadNegocio = TipoEntidadNegocio.DAM_SERIES_DPMN;
      msgRectiDpmn.tipoEvento = TipoEvento.NUEVO;
      msgRectiDpmn.usuario = this.tokenAccesoService.login;

      respuesta.push(msgRectiDpmn);
    });

  }
  private encontrarAdjuntosCcmnEliminados(respuesta : MsgRectiCcmn[]) : void {
    let archivosEliminados : ArchivoCcmn[] = this.archivosCcmnOriginal.filter( ( item : ArchivoCcmn ) => {
      let archivoRecti = this.archivosCcmn.find( (itemRecti : ArchivoCcmn) => itemRecti.codArchivoEcm == item.codArchivoEcm)
      return archivoRecti == null;
    });

    archivosEliminados.forEach( ( item : ArchivoCcmn ) => {

      let pkAdjunto : ArchivoCcmn = new ArchivoCcmn();
      let dataAdjunto : ArchivoCcmn = new ArchivoCcmn();

      let msgRectiDpmn : MsgRectiCcmn = new MsgRectiCcmn();

      pkAdjunto.codArchivoEcm = item.codArchivoEcm;
      dataAdjunto.indEliminado = true;

      msgRectiDpmn.jsonData = JSON.stringify(dataAdjunto);
      msgRectiDpmn.jsonPkNegocio = JSON.stringify(pkAdjunto);
      msgRectiDpmn.tipoEntidadNegocio = TipoEntidadNegocio.ADJUNTOS_DPMN;
      msgRectiDpmn.tipoEvento = TipoEvento.ANULACION;
      msgRectiDpmn.usuario = this.tokenAccesoService.login;

      respuesta.push(msgRectiDpmn);
    });

  }
  private buscarDamSerieCcmnOriginal( item : DamSerieCcmn ) : any {
    let damSerieOriginal =this.damSeriesCcmnOriginal.find( ( itemOriginal : DamSerieCcmn ) => 
      itemOriginal.numCorrelativo == item.numCorrelativo && itemOriginal.numCorreCompCcmn ==  item.numCorreCompCcmn );

  }

}
