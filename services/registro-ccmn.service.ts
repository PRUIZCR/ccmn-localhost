import { Injectable } from '@angular/core';

import { BehaviorSubject, forkJoin, Observable, of, ReplaySubject, throwError } from 'rxjs';
import { ComprobantePago } from '../model/domain/comprobante-pago.model';
import { DataCatalogo } from '../model/common/data-catalogo.model';
import { ConstantesApp } from '../utils/constantes-app';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, concatMap, delay, flatMap, map, mergeMap, retryWhen } from 'rxjs/operators';
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
import { Pci } from '../model/domain/pci.model';
import { DocumentoAsociado } from '../model/domain/documento-asociado.model';
import { DatePipe } from '@angular/common';
import { Ubigeo } from '../model/domain/ubigeo.model';


@Injectable()
export class RegistroCcmnService {

  private readonly maxIntentos : number = 10;
  private readonly urlCcmn : string = environment.urlBase + ConstantesApp.RESOURCE_ENDPOINT_CCMN;
  private readonly urlDamSeriesCcmn : string = environment.urlBase + ConstantesApp.RESOURCE_ENDPOINT_DAM_SERIES_CCMN;
  private readonly urlAdjuntosCcmn : string = environment.urlBase + ConstantesApp.RESOURCE_ENDPOINT_ADJUNTOS_CCMN;
  private readonly urlVerificarGrabacionCcmn : string = environment.urlBase + ConstantesApp.RESOURCE_ENDPOINT_VERIFICAR_GRABACION;
  private readonly urlDpmn: string = environment.urlBase + ConstantesApp.RESOURCE_ENDPOINT_DPMN;
  private readonly urlPci: string = environment.urlBase + ConstantesApp.RESOURCE_PCI;

  public identificadorCcmn !: IdentificadorCcmn;

  private pasoActualSubject = new BehaviorSubject<number>(1);
  public pasoActual$ = this.pasoActualSubject.asObservable();

  private ccmn: Ccmn = new Ccmn();
  private ccmnSubject = new BehaviorSubject<Ccmn>(this.ccmn);
  public ccmn$ = this.ccmnSubject.asObservable();

  private damSeriesCcmn : DamSerieCcmn[] = new Array();
  private damSeriesCcmnSubject = new BehaviorSubject<DamSerieCcmn[]>(new Array());
  public damSeriesCcmn$ = this.damSeriesCcmnSubject.asObservable();

  private archivosCcmn: ArchivoCcmn[] = new Array();
  private archivosCcmnSubject = new BehaviorSubject<ArchivoCcmn[]>(this.archivosCcmn);
  public archivosCcmn$ = this.archivosCcmnSubject.asObservable();

  private resultadoGrabadoCcmn : Respuesta<IdentificadorCcmn> = new Respuesta<IdentificadorCcmn>();
  private resultadoGrabadoCcmnSubject = new BehaviorSubject<Respuesta<IdentificadorCcmn>>(this.resultadoGrabadoCcmn);
  public  resultadoGrabadoCcmn$ = this.resultadoGrabadoCcmnSubject.asObservable();

  private msgConfirmNewDamSerieCcmnSubject = new BehaviorSubject<string | null>(null);
  public msgConfirmNewDamSerieCcmn$ = this.msgConfirmNewDamSerieCcmnSubject.asObservable();

  vieneDesdePCI!: string;
  pciDetalle!: PciDetalle;
  pci!: Pci;
  tipoRegistro!:TipoRegistro;
  datosFuncionario!:UbicacionFuncionario;
  datosDeclar: ParamBusqDcl = new ParamBusqDcl();
  ubigeoOrigenBus!: Ubigeo;
  
  private docAsocControl!: DataCatalogo;

  constructor(private http: HttpClient, 
              private tokenAccesoService: TokenAccesoService, 
              private datePipe: DatePipe) { }

  limpiarData() : void {
    this.ccmn = new  Ccmn();
    this.damSeriesCcmn = new Array();
    this.archivosCcmn = new Array();
    this.resultadoGrabadoCcmn = new Respuesta<IdentificadorCcmn>();

    this.ccmnSubject.next(this.ccmn);
    this.damSeriesCcmnSubject.next(this.damSeriesCcmn);
    this.archivosCcmnSubject.next(this.archivosCcmn);
    this.resultadoGrabadoCcmnSubject.next(this.resultadoGrabadoCcmn);
  }

  putCcmn(newCcmn: Ccmn) : void {
    this.ccmn = newCcmn;
    this.ccmnSubject.next(this.ccmn);
  }

  putDamSeriesCcmn(correComprob : number, newDamSeriesCcmn : DamSerieCcmn[]) : void {

    if ( newDamSeriesCcmn == null ) {
      return;
    }

    var seriesParaAgregar = newDamSeriesCcmn.filter(itemDamSerieCcmn => itemDamSerieCcmn?.cntRetirada > 0 );

    let correSerie = this. obtenerCorreDamSerieCcmn();

    seriesParaAgregar.forEach(serieAdd => {
      serieAdd.numCorreCompCcmn = correComprob;
      serieAdd.numCorrelativo = correSerie;
      serieAdd.cntSaldo = parseFloat((serieAdd.cntSaldo - serieAdd.cntRetirada).toFixed(3));
      serieAdd.numSecDescarga = serieAdd.numSecDescarga + 1;

      this.damSeriesCcmn.push(serieAdd);
      correSerie++;
    });

    this.damSeriesCcmnSubject.next(this.damSeriesCcmn);
    this.enviarMsgConfirmNewDamSeriesCcmn(seriesParaAgregar);
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

  obtenerTipoRegistro() : string {
    return this.tipoRegistro || '';
  }

  tieneFlujoCarga() : string {
    let codDatacat = this.ccmn?.empresaTransporte?.flujoVehiculo.codDatacat;
    return codDatacat;
  }

  obtenerCodigoAduanaDescarga() : string {
    let codDatacat = this.ccmn?.aduanaDescarga?.codDatacat;
    return codDatacat;
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
        concatMap( ()=>this.actualizarDocAsocControl() ),
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


  actualizarDocAsocControl(): Observable<any> {
    if(this.tokenAccesoService.origen != "IA")
      return of(this.docAsocControl);

    if(this.ccmn.numCorrelativoPCI==undefined || this.ccmn.numCorrelativoPCI==null)
      return of(this.docAsocControl);
    
    let pci: Pci = new Pci;
    let docAsoc: DocumentoAsociado = new DocumentoAsociado;
    let lstDoc: DocumentoAsociado[] = new Array;
    docAsoc.numCorrelativoDocumento = this.identificadorCcmn.correlativo;
    docAsoc.aduanaDocumento = this.ccmn.aduana;
    docAsoc.annDocumento = this.identificadorCcmn.anio;
    docAsoc.codTipoDocumento = "CCMN";
    docAsoc.fecDocumento =  this.datePipe.transform(this.ccmn.fecCcmn, 'dd/MM/yyyy hh:mm:ss');
    docAsoc.numDocumento = this.identificadorCcmn.numero;
    docAsoc.puestoControlDocumento = this.ccmn.puestoControlDescarga;
    lstDoc.push(docAsoc);

    let auditoria: Auditoria = new Auditoria;
    auditoria.codUsuRegis = this.tokenAccesoService.login;
    auditoria.codUsumodif = this.tokenAccesoService.login;

    pci.numCorrelativo = this.ccmn.numCorrelativoPCI;
    pci.documentoAsociadoControl = lstDoc
    pci.auditoria = auditoria;

    let request: Observable<Pci> = this.http.put<Pci>(this.urlPci, pci).pipe(
      map(() => {
        return pci;
      }),
      retryWhen(error =>
        error.pipe(
          concatMap((error, count) => {
            if (count < this.maxIntentos) {
              return of(error);
            }
            return throwError(() => error);
          }),
          delay(5000)
        )
      )
    );

    return request;
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


  obtenerSerieRegistrada(paramBusqDcl: ParamBusqDcl) : DamSerieCcmn[] {
    let damEncontrada : DamSerieCcmn[] = this.damSeriesCcmn.filter( ( item : DamSerieCcmn) => {
      let mismaAduana : boolean = item.aduanaDam?.codDatacat ==  paramBusqDcl?.codAduana;
      let mismoRegimen : boolean = item.regimenDam?.codDatacat == paramBusqDcl?.codRegimen;
      let mismoNumero : boolean = item.numDam ==  Number.parseInt(paramBusqDcl?.numero);
      let mismoAnio : boolean = item.annDam ==  Number.parseInt(paramBusqDcl?.anio);
      let mismoSerie: boolean = true;

      if(Number.parseInt(paramBusqDcl?.serie) > 0)
        mismoSerie = item.numSerie == Number.parseInt(paramBusqDcl?.serie);

      return mismaAduana && mismoRegimen && mismoNumero && mismoAnio && mismoSerie;
    });

    return damEncontrada;
  }

  compararSerieCorrelativo(numCorreCompDpmn : number) : ComprobantePago{
    let ccmn  = this.ccmn?.comprobantePago.find((item : ComprobantePago) => item.numCorrelativo == numCorreCompDpmn );

    return ccmn as ComprobantePago;
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

  getPciDetalle(): PciDetalle {
    if ( this.pciDetalle == null ) {      
      let cadenaPci = sessionStorage.getItem("pci") as string;
      this.vieneDesdePCI = sessionStorage.getItem("vieneDesdePCI") as string;
      this.pciDetalle = JSON.parse(cadenaPci);             
      delay(5000);
    }
    return this.pciDetalle;
  }

  getFuncionario(): UbicacionFuncionario {
    if ( this.datosFuncionario == null ) {      
      let strFuncionario = sessionStorage.getItem("funcionario") as string;
      this.datosFuncionario = JSON.parse(strFuncionario);             
      delay(5000);
    }
    return this.datosFuncionario;
  }

  getVieneDesdePci():string {
    return this.vieneDesdePCI;
  }

}
