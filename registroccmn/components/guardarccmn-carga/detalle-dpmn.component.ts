import { Component,OnInit , Renderer2} from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, forkJoin, Observable, of, ReplaySubject, throwError } from 'rxjs';
import { catchError, concatMap, delay, flatMap, map, mergeMap, retryWhen, take, timestamp } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse} from '@angular/common/http';
import { Table } from 'primeng/table';
import { ConfirmationService, PrimeNGConfig, MessageService, Message } from 'primeng/api';
import { ActivatedRoute, Params } from '@angular/router';
import { DocumentodescargaService } from 'src/app/services/documentodescarga.service';
import { DocumentoDpmn } from 'src/app/model/domain/documentoDpmn';
import { RowTblCompago } from 'src/app/model/bean/row-tbl-compago.model';

import { ComprobantePago } from 'src/app/model/domain/comprobante-pago.model';
import { DocumentoAdjuntoDpmn } from 'src/app/model/domain/adjunto-dpmn.model';
import { DocumentoDescarga } from 'src/app/model/domain/documentoDescarga';
import { environment } from 'src/environments/environment';
import { ConstantesApp } from 'src/app/utils/constantes-app';
import { SerieDeclaracionDpmn } from 'src/app/model/domain/serie-declaracion';
import { saveAs } from 'file-saver';
import { DamSerieCcmn } from 'src/app/model/domain/dam-serie-ccmn.model';
import { RespuestaError } from 'src/app/model/common/response-error';
import { Ccmn } from 'src/app/model/domain/ccmn.model';
import { DataCatalogo } from 'src/app/model/common/data-catalogo.model';
import { Auditoria } from 'src/app/model/domain/auditoria.model';
import { TokenAccesoService } from 'src/app/services/token-acceso.service';
import { Respuesta } from 'src/app/model/common/Respuesta';
import { IdentificadorCcmn } from 'src/app/model/domain/identificador-ccmn.model';
import { Estado } from 'src/app/model/common/Estado';
import { RegistroCcmnService } from 'src/app/services/registro-ccmn.service';
import { UbicacionFuncionario } from 'src/app/model/bean/ubicacion-funcionario';
import { CatalogoItem } from 'src/app/model/bean/catalogo-item';
import { CheckCcmn} from 'src/app/model/bean/check-ccmn.model';
import { GuiaRemision } from 'src/app/model/domain/guia-remision.model';
import { TipoComprobante } from 'src/app/model/common/tipo-comprobante.enum';
import { CartaPorte } from 'src/app/model/domain/carta-porte.model';
import { FuncionarioAduanero } from 'src/app/model/domain/funcionario-aduanero.model';
import { Dpmn } from 'src/app/model/domain/dpmn.model';
import { PciDetalle } from 'src/app/model/domain/pcidetalle.model';
import { SaldoSeriesService } from 'src/app/services/saldos-series.service';
import { Pci } from 'src/app/model/domain/pci.model';
import { DocumentoAsociado } from 'src/app/model/domain/documento-asociado.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle-dpmn.component.html',
  styleUrls:['./detalle-dpmn.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class DetalleComponent implements OnInit {
  [x: string]: any;

  private readonly maxIntentos : number = 10;
  datosConfirmarDpmn!: FormGroup;

  private URL_RESOURCE_DATOS_DECLARACION : string = environment.urlBase + ConstantesApp.RESOURCE_DATOS_DECLARACION;
  private URL_RESOURCE_ARCHIVOS_ADJUNTOS : string = environment.urlBase + ConstantesApp.RESOURCE_ARCHIVOS_ADJUNTOS;
  private URL_RESOURCE_ENDPOINT_CCMN: string = environment.urlBase + ConstantesApp.RESOURCE_ENDPOINT_CCMN;
  private urlVerificarGrabacionCcmn : string = environment.urlBase + ConstantesApp.RESOURCE_ENDPOINT_VERIFICAR_GRABACION;
  private readonly urlPci: string = environment.urlBase + ConstantesApp.RESOURCE_PCI;

  dpmn!: Dpmn;
  numeroDpmn:string= "";
  fecDpmn!:string;
  private damSeriesCcmn: DamSerieCcmn[] = new Array();
  private serieCcmn: DamSerieCcmn = new DamSerieCcmn;
  private errorValidacion: RespuestaError[] = new Array();
  private datosCcmn: Ccmn = new Ccmn;
  resultadoGrabadoCcmn: Respuesta<IdentificadorCcmn> = new Respuesta<IdentificadorCcmn>();
  private identificadorCcmn : IdentificadorCcmn = new IdentificadorCcmn;
  mostrarDlgGuardarCcmn: boolean = false;
  estado = Estado;
  mostrarSaldoInsuficiente: boolean = false;
  msjSaldoInsuficiente: string = "";

  //aduanaDescarga!:string;
 // puestoControlDescarga!:string;
  nombredeEmpresa!: string;
  paisEmpresa!:string;
  tipoNacionalidad!: string;
  tipoIdentificacion!:string;
  desIdentificacion!:string;
  nomEmpresa!:string;
  flujoVehiculo!:string;
  paisPlaca!:string;
  nomPlaca!:string;
  paisplacaCarreta!:string;
  nomPlacaCarreta!:string;
  valEmail!:string;
  numTelefono!:string;

  nacionalidad!:string;
  tipoDocumentoConductor!:string;
  numDocIdentidad!:string;
  nomConductor!:string;
  apeConductor!:string;
  numLicencia!:string;

  desObservacion!:string;
  ubigeoOrigen!:string;

  documentosDpmn!: DocumentoDpmn;
  datosAdjuntosNum!:string|null;

  comprobantes: any = new Array();
  documentosAdjuntos: DocumentoAdjuntoDpmn[]= new Array();
  seriesDeclaracionDpmn: SerieDeclaracionDpmn[]= new Array();
  documentos: DocumentoDescarga[]= new Array();
  loading: boolean = true;
  respuestaData: any;
  rowsTblComprobante : RowTblCompago[] = new Array();

  pciDetalle!: PciDetalle;

  localEmpresaTransporte = [];
  constructor(private documentodescargaService:DocumentodescargaService,
    private router:Router,
    private http: HttpClient,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private tokenAccesoService: TokenAccesoService,
    private registroCcmnService: RegistroCcmnService,
    private renderer: Renderer2,
    private saldoSeriesService: SaldoSeriesService,
    private rutaActiva: ActivatedRoute,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe){  }

  ngOnInit() {
    //this.pciDetalle = this.registroCcmnService.pciDetalle;
    this.pciDetalle = this.registroCcmnService.getPciDetalle();  
    var numCorrelativoOk= this.pciDetalle?.numCorrelativoDocumento as number;

    this.getListadeDocumentos(numCorrelativoOk.toString());
    this.buildFormConfirmarDpmn();

      /*******************adjunto *******************/
    this.documentodescargaService.getDocumentoAdjuntoByNumcorredoc(numCorrelativoOk.toString())
    .toPromise()
    .then((resp:any)=><DocumentoAdjuntoDpmn[]>resp)
    .then(data=>{
    return data;})
    .then(documentosAdj=>{
      this.documentosAdjuntos=documentosAdj;
      this.loading = false;
      this.documentos.forEach(
        documentos=>(documentos.placaCarreta=documentos.placaCarreta)
        );
      })
     /*******************adjunto fin *******************/

    /*******************declaracion *******************/
    this.documentodescargaService.getSeriesDeclaracionByNumcorredoc(numCorrelativoOk.toString())
    .toPromise()
    .then((resp:any)=><SerieDeclaracionDpmn[]>resp)
    .then(data=>{
    return data;})
    .then(serieDeclaracionDpmns=>{
      this.seriesDeclaracionDpmn=serieDeclaracionDpmns;
      this.loading = false;
      this.seriesDeclaracionDpmn.forEach(
        documentos=>{
          documentos.dam = documentos.aduanaDam.codDatacat + "-" + documentos.annDam + "-" + documentos.regimenDam.codDatacat + "-" + ('000000' + documentos.numDam).slice(-6) ;
          documentos.indEliminado=documentos.indEliminado;
        }
        );
      })
     /*******************declaracion fin *******************/
  }

   getListadeDocumentos(numCorrelativoOk:string | null) { ///{correlativodpmn}/adjuntosdpmn{correlativodpmn}
    return this.http.get<DocumentoDpmn>(this.URL_RESOURCE_DATOS_DECLARACION+numCorrelativoOk)
    .subscribe(async data=>{ console.log('documento data detalle[0]'),this.documentosDpmn=data
      this.numeroDpmn = data.aduana.codDatacat + "-" + data.annDpmn + "-" + data.numDpmn;
      this.datosConfirmarDpmn.controls.numDpmn.setValue(this.numeroDpmn);
      this.datosConfirmarDpmn.controls.fecDpmn.setValue(data.fecDpmn);
      this.aduanaDescarga = (data.aduana.codDatacat + ' - '+data.aduana.desDataCat);
      this.puestoControlDescarga = (data.puestoControlDescarga.codDatacat + ' - '+data.puestoControlDescarga.desDataCat);

      this.cargandoEmpresaTransporte(data);
      this.cargandoconductor(data);
      this.cargandoDatosComplementario(data);
      this.cargandoDatosComprobante(data);
    });
  }
  cargandoEmpresaTransporte(data: DocumentoDpmn){
    this.tipoNacionalidad=data.empresaTransporte.tipoNacionalidad.desDataCat;
    this.paisEmpresa=data.empresaTransporte.paisEmpresa.desDataCat;
    this.tipoIdentificacion=data.empresaTransporte.tipoDocIdentidad?.codDatacat + ' - '+ data.empresaTransporte.tipoDocIdentidad?.desDataCat;
    this.desIdentificacion=data.empresaTransporte.numDocIdentidad;
    this.nomEmpresa=data.empresaTransporte.nomEmpresa;
    this.flujoVehiculo=data.empresaTransporte.flujoVehiculo.codDatacat.toString() + ' - '+data.empresaTransporte.flujoVehiculo.desDataCat;
    this.paisPlaca=data.empresaTransporte.paisPlaca.codDatacat + ' - '+ data.empresaTransporte.paisPlaca.desDataCat;
    this.nomPlaca=data.empresaTransporte.nomPlaca;
    //this.paisplacaCarreta=data.empresaTransporte.paisPlacaCarreta.codDatacat+ ' - '+ data.empresaTransporte.paisPlacaCarreta.desDataCat;
    //this.nomPlacaCarreta=data.empresaTransporte.nomPlacaCarreta;
    this.paisplacaCarreta=" ";//AENA
    this.nomPlacaCarreta=" ";//AENA
    if(data.empresaTransporte.paisPlacaCarreta!=null){ //AENA
      this.paisplacaCarreta=data.empresaTransporte.paisPlacaCarreta.codDatacat+ ' - '+ data.empresaTransporte.paisPlacaCarreta.desDataCat;
      this.nomPlacaCarreta=data.empresaTransporte.nomPlacaCarreta;
    }
    this.valEmail=data.empresaTransporte.valEmail;
    this.numTelefono=data.empresaTransporte.numTelefono;

  }

  cargandoconductor(data: DocumentoDpmn){
    this.nacionalidad=data.conductor.pais.codDatacat+' - '+ data.conductor.pais.desDataCat;
    this.tipoDocumentoConductor=data.conductor.tipoDocIdentidad.codDatacat+' - '+data.conductor.tipoDocIdentidad.desDataCat;
    this.numDocIdentidad=data.conductor.numDocIdentidad;
    this.nomConductor=data.conductor.nomConductor;
    this.apeConductor=data.conductor.apeConductor;
    this.numLicencia=data.conductor.numLicencia;
  }

  cargandoDatosComplementario(data: DocumentoDpmn){
      this.desObservacion=data.datoComplementario.desObservacion;
      this.ubigeoOrigen=data.datoComplementario.ubigeoOrigen.codUbigeo+' - '+data.datoComplementario.ubigeoOrigen.nomDepartamento+' - '+
                        data.datoComplementario.ubigeoOrigen.nomProvincia+' - '+data.datoComplementario.ubigeoOrigen.nomDistrito;
  }
  cargandoDatosComprobante(data: DocumentoDpmn){
    this.comprobantes=data.comprobantePago;
  }

  cargandodatosAdjuntos(numCorrelativoOk:string | null){
   this.datosAdjuntosNum=numCorrelativoOk;
   this.documentos = new Array();
   this.documentodescargaService.getDocumentoAdjuntoByNumcorredoc(numCorrelativoOk)
   .toPromise()
     .then((resp:any)=><DocumentoAdjuntoDpmn[]>resp)
     .then(data=>{console.log('documento data adjunta[0]',data);
     return data;})

  }

  clear(table: Table) {
    table.clear();
  }

  downloadPDFExcel(idECM: string,nomArch:string): void{
    this.http.get(this.URL_RESOURCE_ARCHIVOS_ADJUNTOS+idECM,{responseType: 'blob'})
    .subscribe(Blob=>{ console.log('adjunto data adjun:'+Blob), saveAs(Blob, nomArch);
    }) ;

  }


  private buildFormConfirmarDpmn() {
    this.datosConfirmarDpmn = this.formBuilder.group({
      paisPlaca: [{ value: sessionStorage.getItem("paisPlaca"), disabled: true}],
      numPlaca: [{ value: sessionStorage.getItem("placa"), disabled: true}],
      canalControl : [{ value: sessionStorage.getItem("canalControl"), disabled: true}],
      controlPaso: [{ value: sessionStorage.getItem("numeroDeControlPaso"), disabled: true}],
      numDpmn: [{ value: this.numeroDpmn, disabled: true}],
      fecDpmn: [{ value: '', disabled: true}]
     // aduanaDescarga: [{ value: '', disabled: true}],
    });
  }

  btnSalir(){
    this.router.navigateByUrl('/iaregistroccmn/registroccmn');
  }

  async validarCCMN(){
    this.msjSaldoInsuficiente = "";
    this.damSeriesCcmn = new Array();
    this.serieCcmn = new DamSerieCcmn;
    this.errorValidacion = new Array();
    
    this.seriesDeclaracionDpmn.forEach(series=>{
      this.serieCcmn = new DamSerieCcmn;
      this.serieCcmn.aduanaDam = series.aduanaDam;
      this.serieCcmn.regimenDam = series.regimenDam;
      this.serieCcmn.annDam = series.annDam;
      this.serieCcmn.numDam = series.numDam;
      this.serieCcmn.numSerie = series.numSerie;
      this.serieCcmn.cntUnidadFisica = series.cntUnidadFisica;
      this.serieCcmn.cntRetirada = series.cntRetirada;
      this.damSeriesCcmn.push(this.serieCcmn);
    });


    this.saldoSeriesService.validarSaldoSeries(this.damSeriesCcmn).subscribe((respuesta: any) => {
      this.msjSaldoInsuficiente = "";
      this.errorValidacion = new Array();
      if (respuesta == true) {
        this.mostrarSaldoInsuficiente = false;
        this.confirmationService.confirm({
          message: '&iquest;Desea confirmar la CCMN?',
          header: 'Confirmación de CCMN',
          icon: 'pi pi-question-circle',
          accept: () => {
            this.mostrarDlgGuardarCcmn = true;
            this.prepararDatos();
          }
        });
      } else {
        this.mostrarSaldoInsuficiente = true;
        let errorHttp: RespuestaError[] = respuesta;
        this.errorValidacion = errorHttp;
        this.actualizarEstadoDpmn(this.buildDatacatalogo("04", "Rechazada"));
 
        this.errorValidacion.forEach(error=>{
          this.msjSaldoInsuficiente =  this.msjSaldoInsuficiente + '<br/>' +error.msg
        });
      }

    }, (error: any) => {
      this.msjSaldoInsuficiente = "";
      this.mostrarSaldoInsuficiente = true;
      let errorHttp: RespuestaError[] = error.error;
      this.errorValidacion = errorHttp;
      this.actualizarEstadoDpmn(this.buildDatacatalogo("04", "Rechazada"));
      this.errorValidacion.forEach(log => {
        this.msjSaldoInsuficiente = this.msjSaldoInsuficiente + '<br/>' + log.msg
      })
    });
  }

  actualizarEstadoDpmn(estado: DataCatalogo){
    this.dpmn = new Dpmn;
    this.dpmn.numCorrelativo = this.documentosDpmn.numCorrelativo;
    this.dpmn.estado = estado;
    this.dpmn.auditoria = this.buildDatosAuditoria();
    this.registroCcmnService.actualizarDpmn(this.dpmn);
  }

  async prepararDatos(){
    this.resultadoGrabadoCcmn = Respuesta.create(new IdentificadorCcmn, Estado.LOADING);
    this.buildCcmn();
    await this.grabarCcmn();
  }

  grabarCcmn(): void{

    this.http
      .post<any>(this.URL_RESOURCE_ENDPOINT_CCMN, this.datosCcmn).pipe(
        map(resp => {
          this.identificadorCcmn = resp;
        }),
        concatMap( respuesta => this.requestVerificarGrabacionCcmn()),
        concatMap( ()=>this.actualizarDocAsocControl() ),
        catchError((error: HttpErrorResponse) => {
          let errorHttp: RespuestaError = new RespuestaError;
          errorHttp.msg = error.error;
          this.errorValidacion.push(errorHttp);

          this.resultadoGrabadoCcmn = Respuesta.create(this.identificadorCcmn, Estado.ERROR);

          if(error.status!=422)
            console.log(error);
          return throwError(error);
        })
      ).subscribe(resultado => {
        this.resultadoGrabadoCcmn = Respuesta.create(this.identificadorCcmn, Estado.SUCCESS);
      });

  }


  actualizarDocAsocControl(): Observable<any> {
    if(this.tokenAccesoService.origen != "IA")
      return of(this.docAsocControl);

    if(this.datosCcmn.numCorrelativoPCI==undefined || this.datosCcmn.numCorrelativoPCI==null)
      return of(this.docAsocControl);
    
    let pci: Pci = new Pci;
    let docAsoc: DocumentoAsociado = new DocumentoAsociado;
    let lstDoc: DocumentoAsociado[] = new Array;
    docAsoc.numCorrelativoDocumento = this.identificadorCcmn.correlativo;
    docAsoc.aduanaDocumento = this.datosCcmn.aduana;
    docAsoc.annDocumento = this.identificadorCcmn.anio;
    docAsoc.codTipoDocumento = "CCMN";
    docAsoc.fecDocumento =  this.datePipe.transform(this.datosCcmn.fecCcmn, 'dd/MM/yyyy hh:mm:ss');
    docAsoc.numDocumento = this.identificadorCcmn.numero;
    docAsoc.puestoControlDocumento = this.datosCcmn.puestoControlDescarga;
    lstDoc.push(docAsoc);

    let auditoria: Auditoria = new Auditoria;
    auditoria.codUsuRegis = this.tokenAccesoService.login;
    auditoria.codUsumodif = this.tokenAccesoService.login;

    pci.numCorrelativo = this.datosCcmn.numCorrelativoPCI;
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

  buildCcmn(){
    this.datosCcmn = new Ccmn;
    let datosFuncionario = this.registroCcmnService.datosFuncionario as UbicacionFuncionario;
    if(datosFuncionario==undefined || datosFuncionario==null)
      datosFuncionario = this.registroCcmnService.getFuncionario();
      
    this.datosCcmn.aduana = this.buildCatalogoFromCatalogoItem(datosFuncionario.puestoControl.aduana);
    this.datosCcmn.puestoControl = this.buildCatalogoFromCatalogoItem(datosFuncionario.puestoControl);
    this.datosCcmn.annCcmn = new Date().getFullYear();
    this.datosCcmn.fecCcmn = new Date();
    this.datosCcmn.estado = this.buildDatacatalogo("01", "Numerada");
    this.datosCcmn.aduanaDescarga = this.buildCatalogoFromCatalogoItem(datosFuncionario.puestoControl.aduana);
    this.datosCcmn.puestoControlDescarga = this.buildCatalogoFromCatalogoItem(datosFuncionario.puestoControl);
    this.datosCcmn.empresaTransporte = this.documentosDpmn.empresaTransporte;
    this.datosCcmn.conductor = this.documentosDpmn.conductor;
    this.datosCcmn.datoComplementario = this.documentosDpmn.datoComplementario;
    this.datosCcmn.codVariableControl = " ";
    this.datosCcmn.moduloRegistro = this.buildDatacatalogo("PFA", "Portal Funcionario Aduanero");
    this.datosCcmn.auditoria = this.buildDatosAuditoria();
    this.datosCcmn.comprobantePago = new Array;

    let funcionarioAduanero: FuncionarioAduanero = new FuncionarioAduanero();
    funcionarioAduanero.nroRegistro = this.tokenAccesoService.nroRegistro;
    funcionarioAduanero.nombre = this.tokenAccesoService.nombreCompleto;
    this.datosCcmn.funcionarioAduanero = funcionarioAduanero;

    this.documentosDpmn.comprobantePago.forEach(dato=>{
      let comprobanteNew: ComprobantePago = new ComprobantePago();
      if(dato.tipoComprobante.codDatacat == ConstantesApp.COD_TIPO_COMP_GUIA_REMISION){
        comprobanteNew = this.crearGuiaRemision(dato);
      }

      if(dato.tipoComprobante.codDatacat == ConstantesApp.COD_TIPO_COMP_CARTA_PORTE){
        comprobanteNew = this.crearCartaPorte(dato);
      }

      comprobanteNew.auditoria = this.buildDatosAuditoria();

      this.datosCcmn.comprobantePago.push(comprobanteNew);
    }
    );

    this.datosCcmn.cntDamSeries = this.seriesDeclaracionDpmn.length;
    this.datosCcmn.cntAdjuntos = this.documentosAdjuntos.length;

    this.datosCcmn.numCorrelativoDpmn = this.documentosDpmn.numCorrelativo;
    this.datosCcmn.numCorrelativoPCI = this.registroCcmnService.pciDetalle.numCorrelativo;
    
  }

  private crearGuiaRemision(dato: any) : GuiaRemision {

    var guiaRemision : GuiaRemision = new GuiaRemision();
    guiaRemision.type = TipoComprobante.GUIA_REMISION;
    guiaRemision.tipoComprobante = new DataCatalogo();
    guiaRemision.tipoComprobante.codDatacat = ConstantesApp.COD_TIPO_COMP_GUIA_REMISION;
    guiaRemision.tipoComprobante.desDataCat = "Guia de remisión del remitente";

    guiaRemision.numSerie = dato.numSerie;
    guiaRemision.numGuia = dato.numGuia;
    guiaRemision.numRucRemitente = dato.numRucRemitente;
    guiaRemision.desRazonSocialRemitente = dato.desRazonSocialRemitente;

    this.completarDatosComprobante(guiaRemision, dato);

    return guiaRemision;
  }

  private crearCartaPorte(dato: any) : CartaPorte {

    let cartaPorte : CartaPorte = new CartaPorte();
    cartaPorte.type = TipoComprobante.CARTA_PORTE;
    cartaPorte.tipoComprobante = new DataCatalogo();
    cartaPorte.tipoComprobante.codDatacat = ConstantesApp.COD_TIPO_COMP_CARTA_PORTE;
    cartaPorte.tipoComprobante.desDataCat = "Carta porte";

    cartaPorte.numCartaPorte = dato.numCartaPorte;
    cartaPorte.nomEmpresa = dato.nomEmpresa;

    this.completarDatosComprobante(cartaPorte, dato);

    return cartaPorte;
  }


  private completarDatosComprobante(comprobante : ComprobantePago, dato: any) : void {
    comprobante.motivoDeTraslado = dato.motivoDeTraslado;
    comprobante.numRucDestinatario = dato.numRucDestinatario;
    comprobante.desRazonSocialDestinatario = dato.desRazonSocialDestinatario;
    comprobante.ubigeoDestino = dato.ubigeoDestino;
    comprobante.numCorrelativo = dato.numCorrelativo;
  }

  buildDatacatalogo(valor:string, descripcion:string){
    let catalogo : DataCatalogo = new DataCatalogo();
    catalogo.codDatacat = valor;
    catalogo.desDataCat = descripcion;
    return catalogo;
  }

  buildCatalogoFromCatalogoItem(valor: CatalogoItem){
     let catalogo = new DataCatalogo();
     catalogo.codDatacat = valor.codigo;
     catalogo.desDataCat = valor.descripcion;
     return catalogo;
  }

  buildDatosAuditoria(){
    let auditoria : Auditoria = new Auditoria();
    auditoria.codUsuRegis =  this.tokenAccesoService.login;
    auditoria.fecRegis = new Date();
    auditoria.codUsumodif =  this.tokenAccesoService.login;
    auditoria.fecModif = new Date();
    return auditoria;
  }

  cerrarDialogGrabarCcmn() : void {
    if (this.resultadoGrabadoCcmn?.estado == Estado.SUCCESS) {
      this.confirmationService.confirm({
        message: '&iquest;Desea imprimir la CCMN?',
        header: 'Descargar CCMN',
        icon: 'pi pi-question-circle',
        accept: () => {
          this.registroCcmnService.identificadorCcmn = this.identificadorCcmn;
          this.descargarFichaResumenQRCarga();
          this.mostrarDlgGuardarCcmn = false;
          if(this.registroCcmnService.getVieneDesdePci() == ConstantesApp.VIENE_DESDE_PCI) window.location.href= `${environment.urlComponentPCI}?modulo=registro-pci&token=${this.tokenAccesoService.token}`;
          else this.btnSalir();
        },
        reject: () => {
          if(this.registroCcmnService.getVieneDesdePci() == ConstantesApp.VIENE_DESDE_PCI) window.location.href= `${environment.urlComponentPCI}?modulo=registro-pci&token=${this.tokenAccesoService.token}`;
          else this.btnSalir();
        }
      });
    }else {
      this.mostrarDlgGuardarCcmn = false;
    }

  }

  private requestVerificarGrabacionCcmn() : Observable<any> {
    let checkCcmn : CheckCcmn = new CheckCcmn();

    checkCcmn.correlativoCcmn = this.identificadorCcmn.correlativo;
    checkCcmn.cntSeriesDcl = this.seriesDeclaracionDpmn.length;
    checkCcmn.cntArchivosAdjuntos = this.documentosAdjuntos.length;


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

  private descargarFichaResumenQRCarga() : void {
    this.generandoQR = true;
    this.registroCcmnService.descargarFicharResumen().subscribe(response => {
      let nombreArchivo = this.registroCcmnService.numeroCcmnGenerado + ".pdf";      
      let dataType = response.type;
      let binaryData = [];
      binaryData.push(response);
      const link = this.renderer.createElement("a"); 
      link.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
      link.download = nombreArchivo;
      link.click();
      link.remove();
      this.btnSalir();
    }, () => {
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                detail: 'Ocurrió un error al generar el archivo PDF con el código QR de la CCMN'});
      this.btnSalir();
    });
  }


  getColorControl(pci : PciDetalle) : string {

    let tipoControl : string = pci?.tipoControl?.codDatacat;

    if ( tipoControl == null ) {
      return "";
    }

    return ConstantesApp.COLOR_CONTROL.get(tipoControl) as string;
  }



}








