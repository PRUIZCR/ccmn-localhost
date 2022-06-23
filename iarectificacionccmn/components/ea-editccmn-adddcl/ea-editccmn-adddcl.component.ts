import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CatalogoService } from 'src/app/services/catalogo.service';

import { Respuesta } from 'src/app/model/common/Respuesta';
import { Estado } from 'src/app/model/common/Estado';
import { DataCatalogo } from 'src/app/model/common/data-catalogo.model';
import { CondicionRuc } from 'src/app/model/common/condicion-ruc.enum';
import { EstadoRuc } from 'src/app/model/common/estado-ruc.enum';

import { DamSerieDpmn } from 'src/app/model/domain/dam-serie-dpmn.model';
import { ComprobantePago } from 'src/app/model/domain/comprobante-pago.model';
import { GuiaRemision } from 'src/app/model/domain/guia-remision.model';
import { CartaPorte } from 'src/app/model/domain/carta-porte.model';

import { ParamBusqDcl } from 'src/app/model/bean/param-busq-dcl.model';
import { Ruc } from 'src/app/model/bean/ruc.model';
import { GuiaRemisionTransp } from 'src/app/model/bean/guia-remision-transp.model';

import { ConstantesApp } from 'src/app/utils/constantes-app';

import {MessageService} from 'primeng/api';
import { TipoNacionalidad } from 'src/app/model/common/tipo-nacionalidad.enum';
import { SaldoSerieDam } from 'src/app/model/bean/saldo-serie-dam';
import { Declaracion } from 'src/app/model/bean/declaracion';
import { UbigeoService } from 'src/app/services/ubigeo.service';
import { RucService } from 'src/app/services/ruc.service';
import { ValDclRegistroDpmnService } from 'src/app/services/val-dcl-registro-dpmn.service';
import { GuiaRemisionService } from 'src/app/services/guia-remision.service';
import { Ubigeo } from 'src/app/model/domain/ubigeo.model';
import { Canal } from 'src/app/model/common/canal.enum';
import { DeclaracionService } from 'src/app/services/declaracion.service';
import { TipoComprobante } from 'src/app/model/common/tipo-comprobante.enum';
import { BuilderCcmnService } from 'src/app/services/builder-ccmn.service';
import { Ccmn } from 'src/app/model/domain/ccmn.model';
//import { RegistroCcmnService } from 'src/app/services/registro-ccmn.service';
import { DamSerieCcmn } from 'src/app/model/domain/dam-serie-ccmn.model';
import { FlujoVehiculo } from 'src/app/model/common/flujo-vehiculo.enum';
import { BoletaFactura } from 'src/app/model/domain/boleta-factura.model';
import { BoletaFacturaService } from 'src/app/services/boleta-factura.service';
import { DniService } from 'src/app/services/dni.service';
import { Dni } from 'src/app/model/bean/dni.model';
import { RectificacionCcmnService } from 'src/app/services/rectificacion-ccmn.service';
@Component({
  selector: 'app-ea-editccmn-adddcl',
  templateUrl: './ea-editccmn-adddcl.component.html',
  styleUrls: ['./ea-editccmn-adddcl.component.scss'],
  providers: [MessageService, ValDclRegistroDpmnService, DniService, RucService, BuilderCcmnService, GuiaRemisionService]
})
export class EaEditccmnAdddclComponent implements OnInit {
  estado =  Estado;
  estadoValDcl = Estado;
  ubigeoSeleccionado: any;
  ubigeosFiltrados!: any[];
  validarDeclaracionForm! : FormGroup;
  addComprobanteForm !: FormGroup;
  rptaDamSeriesDpmn !: Respuesta<DamSerieCcmn[]>;
  rptaGuiaRemision  !: Respuesta<GuiaRemisionTransp>;

  motivosTraslado: DataCatalogo[] = new Array();
  catalogoAduanas: DataCatalogo[] = new Array();
  catalogoTiposDocIdentidad: DataCatalogo[] = new Array();

  constantesApp : ConstantesApp = ConstantesApp; 
  esTranspExtranjero: boolean = false;
  mostrarFacturaBoleta: boolean = false;

  rptaDeclaracion: Respuesta<Declaracion> = Respuesta.create(new Declaracion, Estado.LOADING);

  canal = Canal;
  colorCanal!: string | null;
  mostrarDatosDAM:boolean = false;

  private anioActual!: number;

  private rucRemitente! : Ruc;
  private rucDestinatario! : Ruc | null;
  private rptDataCatUbigeos : Respuesta<DataCatalogo[]> = Respuesta.create(new Array, Estado.LOADING);
  private numRucGuiaRemSubs! : Subscription;
  private numRucBoletaFacturaSubs! : Subscription;
  private buscarGuiaRemisionSubs! : Subscription;
  private buscarBoletaFacturaSubs! : Subscription;
  private nomCtrlsPorTipoComp : string[] = ["numSerieGuia", "numGuia", "numRucGuia", "razSocialGuia", 
                                            "numCartaPorte", "empCartaPorte", "rucDestinatario", "razonSocialDestinatario",
                                            "numSerieBF", "numBF", "numRucBF", "tipDocAdq", "numDocAdq", "nombreAdq"];

  private patternBusqSeries : string = "^([0-9]+(-[0-9]+)?)(,([0-9]+(-[0-9]+)?))*$";
  maxlengthNumDocAdq: number = 11;
  esDniRUC: boolean = false;
  cantidadSeries: number = 0;
  private busqDniSubs : Subscription = new Subscription;

  private rptaSaldoSerieDam : Respuesta<SaldoSerieDam[]> = Respuesta.create(new Array, Estado.LOADING);
  constructor(private valDclRegDpmService : ValDclRegistroDpmnService,
    private ubigeoService : UbigeoService,
    private messageService: MessageService,
    private router: Router,
    //private registroCcmnService : RegistroCcmnService,
    private rectificacionCcmnService:RectificacionCcmnService,
    private rucService : RucService,
    private builderCcmn : BuilderCcmnService,
    private activatedRoute: ActivatedRoute,
    private catalogoService: CatalogoService,
    private guiaRemisionService: GuiaRemisionService,
    private boletaFacturaService: BoletaFacturaService,
    private declaracionService: DeclaracionService,
    private dniService : DniService,
    private formBuilder: FormBuilder) { }
  ngOnInit(): void {

    this.buildForm();
    this.anioActual = new Date().getFullYear();

    this.frmCtrlDclAnio.setValue(this.anioActual);

    this.catalogoService.cargarDesdeJson("assets/json/motivo-traslado.json").subscribe((resultado : DataCatalogo[])=> {
      this.motivosTraslado = resultado;
      this.frmCtrlMotivoTraslado.setValue("11");
    });

    this.catalogoService.cargarDesdeJson("assets/json/27.json").subscribe((resultado : DataCatalogo[]) => {
      this.catalogoTiposDocIdentidad = resultado;
      //this.tipoDocIdenConductor.setValue("3");
    });

    //assets/json/aduanas-busq-dam.json
    this.catalogoService.cargarDesdeJson("assets/json/aduanas-busq-dam.json").subscribe((resultado : DataCatalogo[])=> {
      this.catalogoAduanas = resultado;
    });

    this.ubigeoService.obtenerUbigeos();

    this.ubigeoService.rptUgigeos$.subscribe((respuesta : Respuesta<Ubigeo[]>) => {
      this.rptDataCatUbigeos.mensajes = respuesta.mensajes;
      this.rptDataCatUbigeos.data = this.ubigeoService.convertirToDataCatalogo(respuesta.data);
      this.rptDataCatUbigeos.estado = respuesta.estado;
    });

    this.valDclRegDpmService.rptaBusqDcl$.subscribe((resultado : Respuesta<DamSerieCcmn[]>) => {
        this.rptaDamSeriesDpmn = resultado;
        this.cantidadSeries = resultado?.data?.length;
        this.evalMostrarMsgError();
        this.filtrarSeriesBuscadas();
    });

    this.frmCtrlTipoComprobante.valueChanges.subscribe((value: string) => {
        if ( value == ConstantesApp.COD_TIPO_COMP_GUIA_REMISION ) {
          this.buildCtrlsGuiaRemision();
          this.iniSubsCtrlsGuiaRemision();
          this.iniSubcCtrlDestinatario();
        }

        if ( value == ConstantesApp.COD_TIPO_COMP_CARTA_PORTE ) {
          this.buildCtrlsCartaPorte();
          this.iniSubcCtrlDestinatario();
        }

        if ( value == ConstantesApp.COD_TIPO_COMP_FACTURA || value == ConstantesApp.COD_TIPO_COMP_BOLETA) {
          this.buildCtrlsBoletaFactura();
          this.iniSubsCtrlsBoletaFactura();
        }
    });


    this.rectificacionCcmnService.ccmn$.subscribe(dataCcmn => {
      this.frmCtrlDclAduana.setValue(dataCcmn?.aduanaDescarga?.codDatacat);
      this.frmCtrlDclRegimen.setValue("10");
      this.esTranspExtranjero = dataCcmn?.empresaTransporte?.tipoNacionalidad?.codDatacat == TipoNacionalidad.EXTRANJERO;
      this.mostrarFacturaBoleta = dataCcmn?.empresaTransporte?.flujoVehiculo?.codDatacat != FlujoVehiculo.CARGA;
      this.builderCcmn.iniciar(dataCcmn);
    });

    this.frmCtrlTipoComprobante.setValue(ConstantesApp.COD_TIPO_COMP_GUIA_REMISION);
    this.frmCtrlMotivoTraslado.setValue("11");
  }


  
  private configCtrlIdentidadConductor(tipoDocIdentidad: string) : void {
    if ( tipoDocIdentidad == "3" || tipoDocIdentidad == "4" ) {
      this.maxlengthNumDocAdq = (tipoDocIdentidad == "3")?8:11;
      this.frmCtrlNumDocAdquiriente.setValue("");
      this.frmCtrlNombreAdquiriente.setValue("");
      this.esDniRUC = true;
      return;
    }
    
    this.esDniRUC = false;
    this.maxlengthNumDocAdq = 11;
  }

  validarDeclaracion(): void {

    if (this.validarDeclaracionForm.invalid) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                detail: 'Debe completar correctamente los datos de la DAM'});
        return;
    }

    let anioDam : number = this.frmCtrlDclAnio.value;

    if ( anioDam < 1900 ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                detail: 'Ingrese correctamente el año de la DAM'});
        return;
    }

    if ( anioDam > this.anioActual ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                detail: 'Año de la DAM no puede ser mayor al año actual'});
        return;
    }

    if ( this.frmCtrlDclAduana.value == "181" ) {
      this.frmCtrlDclAduana.setValue("262");
    }

    let paramBusqDcl = new ParamBusqDcl();

    paramBusqDcl.codAduana = this.frmCtrlDclAduana.value;
    paramBusqDcl.anio = this.frmCtrlDclAnio.value;
    paramBusqDcl.codRegimen = this.frmCtrlDclRegimen.value;
    paramBusqDcl.numero = this.frmCtrlDclNumero.value;

    this.rectificacionCcmnService.datosDeclar = paramBusqDcl;

    if ( this.rectificacionCcmnService.declaracionEstaRegistrada(paramBusqDcl) ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                detail: 'Declaración ya cuenta con cantidades a descargar'});
        return;
    }

    this.valDclRegDpmService.buscarDeclaracionConSaldos(paramBusqDcl);
    this.mostrarDatosDam(paramBusqDcl);
  }

  descargarSaldoTotal() : void {
    let noHayData : boolean = ! (this.rptaDamSeriesDpmn?.data?.length > 0);

    if ( noHayData ) {
      return;
    }

    let saldoSeries = this.valDclRegDpmService.listaSaldoSerie;
    let damSeriesDpmn :  DamSerieCcmn[] = this.rptaDamSeriesDpmn.data;
    
    var i = 0;
    damSeriesDpmn.forEach( item => {
      item.numSecDescarga = ++i;
      let saldo: SaldoSerieDam = saldoSeries.find((ser:SaldoSerieDam)=>
        ser.numSerie == item.numSerie
      ) as SaldoSerieDam;

      if(saldo==undefined){
        saldo = new SaldoSerieDam();
        saldo.cntSaldo = item.cntUnidadFisica;
        saldo.numSecDescarga = 0;
      }
      //item.numSecDescarga = saldo.numSecDescarga + 1;
      item.numSecDescarga = saldo.numSecDescarga;
      item.cntRetirada = saldo.cntSaldo;
      //item.cntSaldo = 0;
    });
  }

  evalMostrarMsgError() : void {
    if ( this.rptaDamSeriesDpmn == null ) {
      return;
    }

    if ( this.rptaDamSeriesDpmn.mensajes == null ) {
      return;
    }

    if ( this.rptaDamSeriesDpmn.mensajes.length <= 0 ) {
      return;
    }

    var tipoSeverity = "info";

    if ( this.rptaDamSeriesDpmn.estado == Estado.ERROR ) {
      tipoSeverity = "error";
    }

    if ( this.rptaDamSeriesDpmn.estado == Estado.WARNING ) {
      tipoSeverity = "warn";
    }

    this.rptaDamSeriesDpmn.mensajes.forEach(mensajeBean => {
      this.messageService.clear();
      this.messageService.add({severity:tipoSeverity, summary: 'Mensaje', detail: mensajeBean.msg});
    });

  }

  get frmCtrlDclAduana(): AbstractControl {
    return this.validarDeclaracionForm.get('aduana') as FormControl;
  }

  get frmCtrlDclAnio(): AbstractControl {
    return this.validarDeclaracionForm.get('annio') as FormControl;
  }

  get frmCtrlDclRegimen(): AbstractControl {
    return this.validarDeclaracionForm.get('regimen') as FormControl;
  }

  get frmCtrlDclNumero(): AbstractControl {
    return this.validarDeclaracionForm.get('numero') as FormControl;
  }

  get frmCtrlDclSeries(): AbstractControl {
    return this.validarDeclaracionForm.get('series') as FormControl;
  }

  get frmCtrlTipoComprobante() : AbstractControl {
    return this.addComprobanteForm.get('tipoComprobante') as FormControl;
  }

  get frmCtrlNumSerieGuia() : AbstractControl {
    return this.addComprobanteForm.get('numSerieGuia') as FormControl;
  }

  get frmCtrlNumGuia() : AbstractControl {
    return this.addComprobanteForm.get('numGuia') as FormControl;
  }

  get frmCtrlNumRucGuia() : AbstractControl {
    return this.addComprobanteForm.get('numRucGuia') as FormControl;
  }

  get frmCtrlRazSocialGuia() : AbstractControl {
    return this.addComprobanteForm.get('razSocialGuia') as FormControl;
  }

  get frmCtrlMotivoTraslado() : AbstractControl {
    return this.addComprobanteForm.get('motivoTraslado') as FormControl;
  }

  get frmCtrlRucDestinatario() : AbstractControl {
    return this.addComprobanteForm.get('rucDestinatario') as FormControl;
  }

  get frmCtrlRazonSocialDestinatario() : AbstractControl {
    return this.addComprobanteForm.get('razonSocialDestinatario') as FormControl;
  }

  get frmCtrlNumCartaPorte() : AbstractControl {
    return this.addComprobanteForm.get('numCartaPorte') as FormControl;
  }

  get frmCtrlEmpCartaPorte() : AbstractControl {
    return this.addComprobanteForm.get('empCartaPorte') as FormControl;
  }

  get frmCtrlNumSerieBoletaFactura() : AbstractControl {
    return this.addComprobanteForm.get('numSerieBF') as FormControl;
  }

  get frmCtrlNumBoletaFactura() : AbstractControl {
    return this.addComprobanteForm.get('numBF') as FormControl;
  }

  get frmCtrlNumRucBoletaFactura() : AbstractControl {
    return this.addComprobanteForm.get('numRucBF') as FormControl;
  }

  get frmCtrlTipoDocAdquiriente() : AbstractControl {
    return this.addComprobanteForm.get('tipDocAdq') as FormControl;
  }

  get frmCtrlNumDocAdquiriente() : AbstractControl {
    return this.addComprobanteForm.get('numDocAdq') as FormControl;
  }

  get frmCtrlNombreAdquiriente() : AbstractControl {
    return this.addComprobanteForm.get('nombreAdq') as FormControl;
  }
  
  

  filtrarUbigeo(event: any)  {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.rptDataCatUbigeos?.data?.length; i++) {
      let itemUbigeo = this.rptDataCatUbigeos.data[i];
      if (itemUbigeo.desDataCat.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
        filtered.push(itemUbigeo);
      }
    }

    this.ubigeosFiltrados = filtered;
  }

  irPageComprobantes() {
    this.router.navigate(['../comprobantes'], { relativeTo: this.activatedRoute });
  }

  private noSePuedeAddComprob() : boolean {
    if ( !this.valDclRegDpmService.haySerieConRetiro(this.rptaDamSeriesDpmn.data) ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
            detail: 'Debe colocar la cantidad a retirar en por lo menos una serie'});
      return true;
    }

    let faltaCompletarFormComp = !this.addComprobanteForm.valid;

    if ( faltaCompletarFormComp ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
            detail: 'Falta completar información del comprobante'});
      return true;
    }

    if ( this.ubigeoSeleccionado == null ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
            detail: 'Falta ingresar el destino'});
      return true;
    }

    if ( this.esDestinoNoValido() )  {
      return true;
    }

    return false;
  }

  addDclComprobantes() : void {
    if(!this.valDclRegDpmService.pasoValidarSaldos){
      this.messageService.clear();

      this.valDclRegDpmService.lstErrorSaldo[0].forEach((error: any)=>{
        this.messageService.add({severity:"warn", summary: 'Mensaje',
        detail: error.msg});
      });
      return;
    }

    if ( this.addComprobanteForm.invalid ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'Falta completar los datos del Comprobante de pago / Carta porte'});
      return;
    }

    if ( this.noSePuedeAddComprob() ) {
      return;
    }

    if(this.frmCtrlTipoComprobante.value == ConstantesApp.COD_TIPO_COMP_GUIA_REMISION){
      this.validarExistenciaGuiaRemision();
    }

    if(this.frmCtrlTipoComprobante.value == ConstantesApp.COD_TIPO_COMP_BOLETA || this.frmCtrlTipoComprobante.value == ConstantesApp.COD_TIPO_COMP_FACTURA){
      this.validarExistenciaBoletaFactura();
    }

    if(this.frmCtrlTipoComprobante.value == ConstantesApp.COD_TIPO_COMP_CARTA_PORTE){
      this.agregarComprobanteDeclaracion();
    }
  }

  private agregarComprobanteDeclaracion() : void {
    let comprobanteNew : ComprobantePago = this.crearComprobante();
    this.builderCcmn.addComprobantePago(comprobanteNew);

    var ccmnActualizada : Ccmn = this.builderCcmn.resultado;
    this.rectificacionCcmnService.putCcmn(ccmnActualizada);
    this.rectificacionCcmnService.putDamSeriesCcmn(comprobanteNew.numCorrelativo, this.rptaDamSeriesDpmn.data);
    this.eliminarSubscripciones();
    this.router.navigate(['../comprobantes'], { relativeTo: this.activatedRoute });
  }

  eliminarSubscripciones(){
    this.busqDniSubs.unsubscribe();
    if(this.frmCtrlTipoComprobante.value == ConstantesApp.COD_TIPO_COMP_BOLETA || this.frmCtrlTipoComprobante.value == ConstantesApp.COD_TIPO_COMP_FACTURA)
      this.buscarBoletaFacturaSubs.unsubscribe();
  }


  private crearComprobante() : ComprobantePago {
      if ( this.frmCtrlTipoComprobante.value == ConstantesApp.COD_TIPO_COMP_GUIA_REMISION ) {
        return this.crearGuiaRemision();
      } else if ( this.frmCtrlTipoComprobante.value == ConstantesApp.COD_TIPO_COMP_CARTA_PORTE ) {
        return this.crearCartaPorte()
      }else if ( this.frmCtrlTipoComprobante.value == ConstantesApp.COD_TIPO_COMP_FACTURA || this.frmCtrlTipoComprobante.value == ConstantesApp.COD_TIPO_COMP_BOLETA) {
        return this.crearFacturaBoleta()
      }

      return new ComprobantePago;
  }

  private completarDatosComprobante(comprobante : ComprobantePago) : void {
    comprobante.motivoDeTraslado = this.motivosTraslado.find( ( motivo : DataCatalogo ) => motivo.codDatacat == this.frmCtrlMotivoTraslado.value ) as DataCatalogo;
    comprobante.ubigeoDestino = this.ubigeoService.obtenerUgibeo(this.ubigeoSeleccionado.codDatacat);
  }

  private crearGuiaRemision() : GuiaRemision {

    var guiaRemision : GuiaRemision = new GuiaRemision();
    guiaRemision.type = TipoComprobante.GUIA_REMISION;
    guiaRemision.tipoComprobante = new DataCatalogo();
    guiaRemision.tipoComprobante.codDatacat = ConstantesApp.COD_TIPO_COMP_GUIA_REMISION;
    guiaRemision.tipoComprobante.desDataCat = "Guia de remisión del remitente";

    guiaRemision.numSerie = this.frmCtrlNumSerieGuia.value;
    guiaRemision.numGuia = this.frmCtrlNumGuia.value;
    guiaRemision.numRucRemitente = this.rucRemitente.numero;
    guiaRemision.desRazonSocialRemitente = this.rucRemitente.razonSocial;

    guiaRemision.numRucDestinatario = this.rucDestinatario?.numero as string;
    guiaRemision.desRazonSocialDestinatario = this.rucDestinatario?.razonSocial as string;

    this.completarDatosComprobante(guiaRemision);

    return guiaRemision;
  }

  private crearCartaPorte() : CartaPorte {

    let cartaPorte : CartaPorte = new CartaPorte();
    cartaPorte.type = TipoComprobante.CARTA_PORTE;
    cartaPorte.tipoComprobante = new DataCatalogo();
    cartaPorte.tipoComprobante.codDatacat = ConstantesApp.COD_TIPO_COMP_CARTA_PORTE;
    cartaPorte.tipoComprobante.desDataCat = "Carta porte";

    cartaPorte.numCartaPorte = this.frmCtrlNumCartaPorte.value;
    cartaPorte.nomEmpresa = this.frmCtrlEmpCartaPorte.value;

    cartaPorte.numRucDestinatario = this.rucDestinatario?.numero as string;
    cartaPorte.desRazonSocialDestinatario = this.rucDestinatario?.razonSocial as string;

    this.completarDatosComprobante(cartaPorte);

    return cartaPorte;
  }

  private crearFacturaBoleta() : BoletaFactura {

    var boletaFactura : BoletaFactura = new BoletaFactura();
    boletaFactura.type = TipoComprobante.BOLETA_FACTURA;
    boletaFactura.tipoComprobante = new DataCatalogo();

    boletaFactura.tipoComprobante.codDatacat = this.frmCtrlTipoComprobante.value;
    boletaFactura.tipoComprobante.desDataCat = this.frmCtrlTipoComprobante.value==ConstantesApp.COD_TIPO_COMP_FACTURA?"Factura":"Boleta de Venta";

    boletaFactura.numSerie = this.frmCtrlNumSerieBoletaFactura.value;
    boletaFactura.numComprobante = this.frmCtrlNumBoletaFactura.value;
    boletaFactura.numRuc = this.rucRemitente.numero;
    boletaFactura.tipoDocAdquiriente = new DataCatalogo();
    boletaFactura.tipoDocAdquiriente.codDatacat = this.frmCtrlTipoDocAdquiriente.value;
    boletaFactura.tipoDocAdquiriente.desDataCat = this.obtenerTipoDocIdentidad(this.frmCtrlTipoDocAdquiriente.value).desDataCat;
    boletaFactura.numDocAdquiriente = this.frmCtrlNumDocAdquiriente.value;
    boletaFactura.nomAdquiriente = this.frmCtrlNombreAdquiriente.value;

    boletaFactura.desRazonSocial = this.rucRemitente.razonSocial;


    this.completarDatosComprobante(boletaFactura);
    return boletaFactura;
  }

  private obtenerTipoDocIdentidad(codigo : string) : DataCatalogo {
    return this.catalogoTiposDocIdentidad.find(item => item.codDatacat == codigo) as DataCatalogo;
  }

  private buildCtrlsGuiaRemision() : void {
      this.cleanCtrlPorTipoComprob();
      this.addComprobanteForm.addControl("numSerieGuia", new FormControl('', [Validators.required, this.noWhitespaceValidator]));
      this.addComprobanteForm.addControl("numGuia", new FormControl('', [Validators.required, this.noWhitespaceValidator]));
      this.addComprobanteForm.addControl("numRucGuia", new FormControl('', [Validators.required]));
      this.addComprobanteForm.addControl("razSocialGuia", new FormControl('', [Validators.required]));
      this.addComprobanteForm.addControl("rucDestinatario", new FormControl('', [Validators.required]));
      this.addComprobanteForm.addControl("razonSocialDestinatario", new FormControl('', [Validators.required]));
  }

  private buildCtrlsCartaPorte() : void {
    this.cleanCtrlPorTipoComprob();
    this.addComprobanteForm.addControl("numCartaPorte", new FormControl('', [Validators.required, this.noWhitespaceValidator]));
    this.addComprobanteForm.addControl("empCartaPorte", new FormControl('', [Validators.minLength(3), this.noWhitespaceValidator, Validators.required]));
    this.addComprobanteForm.addControl("rucDestinatario", new FormControl('', [Validators.required]));
    this.addComprobanteForm.addControl("razonSocialDestinatario", new FormControl('', [Validators.required]));
  }

  private buildCtrlsBoletaFactura() : void {
    this.cleanCtrlPorTipoComprob();
    this.addComprobanteForm.addControl("numSerieBF", new FormControl('', [Validators.required, this.noWhitespaceValidator]));
    this.addComprobanteForm.addControl("numBF", new FormControl('', [Validators.required, this.noWhitespaceValidator]));
    this.addComprobanteForm.addControl("numRucBF", new FormControl('', [Validators.required]));
    this.addComprobanteForm.addControl("tipDocAdq", new FormControl('', [Validators.required]));
    this.addComprobanteForm.addControl("numDocAdq", new FormControl('', [Validators.required, this.noWhitespaceValidator]));
    this.addComprobanteForm.addControl("nombreAdq", new FormControl('', [Validators.required, this.noWhitespaceValidator]));
    this.addComprobanteForm.addControl("razSocialGuia", new FormControl('', [Validators.required]));
    
    this.frmCtrlTipoDocAdquiriente.valueChanges.subscribe((value: string) => {
      this.configCtrlIdentidadConductor(value);
    });

    this.frmCtrlNumDocAdquiriente.valueChanges.subscribe((valor: string) => {
      if ( this.frmCtrlTipoDocAdquiriente.value == "3" ) {
        this.frmCtrlNombreAdquiriente.setValue("");
        this.dniService.buscar(valor, "1");
      }

      if ( this.frmCtrlTipoDocAdquiriente.value == "4" ) {
        this.frmCtrlNombreAdquiriente.setValue("");
        let regexRUC : RegExp = /[0-9]{11}/;

        var rucInvalido =  valor == null || !valor.match(regexRUC); 
        if(rucInvalido)
          return;
        
        this.rucService.buscarRuc(valor).subscribe( (objRuc : Ruc) => {

          if ( this.esNoValidoCondicionEstadoRuc(objRuc) ) {
            this.showMsgErrorCondicionEstadoRuc();
            this.frmCtrlNombreAdquiriente.setValue("");
            return;
          }
  
          this.frmCtrlNombreAdquiriente.setValue(objRuc.razonSocial);
  
        }, () => {
          this.messageService.add({severity:"warn", summary: 'Mensaje',
                    detail: 'Numero de RUC no existe'});
        } );


        //this.dniService.buscar(valor, "1");
      }     
    });

    this.busqDniSubs = this.dniService.rptaDni$.subscribe((valor: Respuesta<Dni>) => {
      if(valor.data!=undefined && valor.data.nombres!=undefined)
        this.frmCtrlNombreAdquiriente.setValue(valor.data.nombres + " " + valor.data.apellidos);
  });
}

  private cleanCtrlPorTipoComprob() : void {
    this.nomCtrlsPorTipoComp.forEach(nombre => {
      if ( this.addComprobanteForm.contains(nombre) ) {
        this.addComprobanteForm.removeControl(nombre);
      }
    });
  }

  private iniSubsCtrlsGuiaRemision() : void {

    if ( this.numRucGuiaRemSubs != null ) {
      this.numRucGuiaRemSubs.unsubscribe();
    }

    if ( this.buscarGuiaRemisionSubs != null ) {
      this.buscarGuiaRemisionSubs.unsubscribe();
    }

    this.buscarGuiaRemisionSubs = this.guiaRemisionService.rptaGuiaRemision$.subscribe((rpta : Respuesta<GuiaRemisionTransp>) => {

      this.rptaGuiaRemision = rpta;

      if ( rpta == null ) {
        return;
      }

      if ( rpta.estado === Estado.LOADING ) {
        return;
      }

      if(this.frmCtrlNumRucGuia.value ==null || this.frmCtrlNumRucGuia.value == ""){
        return;
      }

      let isbusqNoExitosa = rpta.estado != Estado.SUCCESS;

      if ( isbusqNoExitosa ) {
        this.mostrarMsgGuiaRemisionNoExiste();
        return;
      }

      let noExisteGuiaRemision = rpta.data?.respuesta != '01';

      if ( noExisteGuiaRemision ) {
        this.mostrarMsgGuiaRemisionNoExiste();
        return
      }

      this.agregarComprobanteDeclaracion();

    });

    this.numRucGuiaRemSubs = this.frmCtrlNumRucGuia.valueChanges.subscribe((valor : string) => {

      if ( valor == null  ) {
        return;
      }

      if ( valor.length != 11 ) {
        this.frmCtrlRazSocialGuia.setValue("");
        return;
      }

      this.rucService.buscarRuc(valor).subscribe( (objRuc : Ruc) => {

        if ( this.esNoValidoCondicionEstadoRuc(objRuc) ) {
          this.showMsgErrorCondicionEstadoRuc();
          this.frmCtrlRazSocialGuia.setValue("");
          return;
        }

        this.rucRemitente = objRuc;
        this.frmCtrlRazSocialGuia.setValue(objRuc.razonSocial);

      }, () => {
        this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'Numero de RUC no existe'});
      } );

    });

  }

  private iniSubcCtrlDestinatario() : void {
    this.frmCtrlRucDestinatario.valueChanges.subscribe((valor: string) => {

      this.rucDestinatario = null;

      if ( valor == null  ) {
        return;
      }

      if ( valor.length != 11 ) {
        this.frmCtrlRazonSocialDestinatario.setValue("");
        return;
      }

      this.rucService.buscarRuc(valor).subscribe( (objRuc : Ruc) => {

        if ( this.esNoValidoCondicionEstadoRuc(objRuc) ) {
          this.showMsgErrorCondicionEstadoRuc();
          this.frmCtrlRazonSocialDestinatario.setValue("");
          return;
        }

        this.rucDestinatario = objRuc;
        this.frmCtrlRazonSocialDestinatario.setValue(objRuc.razonSocial);
      }, () => {
        this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'Numero de RUC no existe'});
      } );

    });

  }


  private iniSubsCtrlsBoletaFactura() : void {

    if ( this.numRucBoletaFacturaSubs != null ) {
      this.numRucBoletaFacturaSubs.unsubscribe();
    }

    if ( this.buscarBoletaFacturaSubs != null ) {
      this.buscarBoletaFacturaSubs.unsubscribe();
    }

    this.buscarBoletaFacturaSubs = this.boletaFacturaService.rptaBoletaFactura$.subscribe((rpta : Respuesta<any>) => {

      this.rptaGuiaRemision = rpta;

      if ( rpta == null ) {
        return;
      }

      if ( rpta.estado === Estado.LOADING ) {
        return;
      }

      if(this.frmCtrlNumRucBoletaFactura.value ==null || this.frmCtrlNumRucBoletaFactura.value == ""){
        return;
      }

      let isbusqNoExitosa = rpta.estado != Estado.SUCCESS;


      if ( isbusqNoExitosa ) {
        this.mostrarMsgBoletaFacturaNoExiste();
        return;
      }

      //El indicador de estado 0 es una factura no anulada
      let noExisteBoletaFactura = rpta.data?.indicadorEstado != '0';

      if ( noExisteBoletaFactura ) {
        this.mostrarMsgBoletaFacturaNoExiste();
        return
      }

      this.agregarComprobanteDeclaracion();

    });

    this.numRucBoletaFacturaSubs = this.frmCtrlNumRucBoletaFactura.valueChanges.subscribe((valor : string) => {

      if ( valor == null  ) {
        return;
      }

      if ( valor.length != 11 ) {
        return;
      }

      this.rucService.buscarRuc(valor).subscribe( (objRuc : Ruc) => {

        if ( this.esNoValidoCondicionEstadoRuc(objRuc) ) {
          this.showMsgErrorCondicionEstadoRuc();
          this.frmCtrlNumRucBoletaFactura.setValue("");
          return;
        }

        this.rucRemitente = objRuc;
        this.frmCtrlRazSocialGuia.setValue(objRuc.razonSocial);

      }, () => {
        this.frmCtrlNumRucBoletaFactura.setValue("");
        this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'Numero de RUC no existe'});
      } );

    });


  }

  private validarCondicionEstadoRuc(ruc : Ruc) : void {
    if ( this.esNoValidoCondicionEstadoRuc(ruc) ) {
      this.showMsgErrorCondicionEstadoRuc();
    }
  }

  private showMsgErrorCondicionEstadoRuc() : void {
    this.messageService.clear();
    this.messageService.add({severity:"warn", summary: 'Mensaje',
        detail: 'Número de RUC no se encuentra Activo o tiene la condición de No habido o No hallado'});
  }

  private esNoValidoCondicionEstadoRuc(ruc : Ruc) : boolean {

    if ( ruc == null ) {
      return false;
    }

    let esNoHabidoOrNoHallado : boolean = this.rucService.tieneCondicion(ruc, CondicionRuc.NO_HABIDO) ||
                                          this.rucService.tieneCondicion(ruc, CondicionRuc.NO_HALLADO);

    let esNoActivo : boolean = !this.rucService.tieneEstado(ruc, EstadoRuc.ACTIVO);

    return  esNoHabidoOrNoHallado || esNoActivo;
  }

  private obtenerSeriesSolicitadas() : number[] {
    let resultado : number[] = new Array();
    let seriesBuscadas : string = this.frmCtrlDclSeries.value;

    if ( seriesBuscadas == null || seriesBuscadas.trim().length <= 0 ) {
      return resultado;
    }

    let maxSigNumSerie = Math.max.apply(Math, this.rptaDamSeriesDpmn?.data?.map( (itDamSerieDpmn) => itDamSerieDpmn.numSerie)) + 1;

    seriesBuscadas = seriesBuscadas.replace(" ", "");

    resultado = seriesBuscadas.split(",")
    .reduce<any>((a, str) => {
      if (!str.includes("-")) {
        a.push(Number(str));
        return a;
      }
      const [low, high] = str.split("-");

      let nLow = Number(low);
      let nHight = Number(high);

      let valMin = nLow;
      let valMax = nHight;

      if (nHight < nLow) {
        valMin = nHight;
        valMax = nLow;
      }

      if ( valMax > maxSigNumSerie ) {
        valMax = maxSigNumSerie;
      }

      for (let i = Number(valMin); i <= Number(valMax); i++) {
        a.push(i);
      }
      return a;
    }, []);

    resultado = resultado.filter(function(elem, index, self) {
      return index === self.indexOf(elem);
    });

    return resultado.sort((n1,n2) => n1 - n2);
  }

  validarCantidadRetirada( seriedpm : DamSerieDpmn ): void {

    let saldoSeries = this.valDclRegDpmService.listaSaldoSerie;
    let saldo: SaldoSerieDam = saldoSeries.find((ser:SaldoSerieDam)=>
        ser.numSerie == seriedpm.numSerie
      ) as SaldoSerieDam;

      if(saldo==undefined){
        saldo = new SaldoSerieDam();
        saldo.cntSaldo = seriedpm.cntUnidadFisica;
        saldo.numSecDescarga = 0;
      }

    if ( seriedpm.cntRetirada == null || seriedpm.cntRetirada <= 0 ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'La cantidad a retirar debe ser mayor a cero (0)'});
      seriedpm.cntRetirada = 0;
      seriedpm.cntSaldo = saldo.cntSaldo;
      seriedpm.numSecDescarga = saldo.numSecDescarga;
      return;
    }

    let regexNumero : RegExp = /^(?:\d{1,17}\.\d{1,3})$|^\d{1,17}$/;

    let isCntRetiradaNoValido = !seriedpm.cntRetirada.toString().match(regexNumero);

    if ( isCntRetiradaNoValido ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'La cantidad a retirar debe ser un campo numérico de máximo 17 enteros y 3 decimales'});
      seriedpm.cntRetirada = 0;
      seriedpm.cntSaldo = saldo.cntSaldo;
      seriedpm.numSecDescarga = saldo.numSecDescarga;
      return;
    }

    let noHaySaldo : boolean = saldo.cntSaldo === 0;
    let excedeSaldo : boolean =  saldo.cntSaldo != null && seriedpm.cntRetirada > saldo.cntSaldo;
    let seRetiraDeMas = seriedpm.cntRetirada >  seriedpm.cntUnidadFisica;

    if ( noHaySaldo ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'No existe saldo para la serie N° ' + seriedpm.numSerie});
      seriedpm.cntRetirada = 0;
      seriedpm.cntSaldo = saldo.cntSaldo;
      seriedpm.numSecDescarga = saldo.numSecDescarga;
      return;
    }

    if ( excedeSaldo ) {
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'La cantidad ingresada excede el saldo disponible'});
      seriedpm.cntRetirada = 0;
      seriedpm.cntSaldo = saldo.cntSaldo;
      seriedpm.numSecDescarga = saldo.numSecDescarga;
      return;
    }

    if ( seRetiraDeMas ) {
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'La cantidad ingresada excede la cantidad de la serie de la DAM'});
      seriedpm.cntRetirada = 0;
      seriedpm.cntSaldo = saldo.cntSaldo;
      seriedpm.numSecDescarga = saldo.numSecDescarga;
      return;
    }


    seriedpm.cntRetirada = seriedpm.cntRetirada - 0;
    //seriedpm.cntSaldo = parseFloat((saldo.cntSaldo - seriedpm.cntRetirada).toFixed(3));
    //seriedpm.numSecDescarga = saldo.numSecDescarga + 1;
    seriedpm.numSecDescarga = saldo.numSecDescarga;
  }

  private esDestinoNoValido() : boolean {
    let mismaCiudad : boolean = this.rectificacionCcmnService.ciudadOrigenIgual(this.ubigeoSeleccionado?.codDatacat);

    if ( mismaCiudad ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'Ciudad origen y destino no pueden ser la misma'});

      return true;
    }

    return false;
  }

  private mostrarMsgGuiaRemisionNoExiste() {
    this.messageService.clear();
    this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'Guía de remisión ingresada no existe'});
  }

  private mostrarMsgBoletaFacturaNoExiste() {
    this.messageService.clear();
    this.messageService.add({severity:"warn", summary: 'Mensaje',
                  detail: 'Factura/Boleta de Venta ingresada no existe'});
  }

  private validarExistenciaGuiaRemision() {

    let numRuc : string = this.frmCtrlNumRucGuia.value;
    let numSerieGuia : string = this.frmCtrlNumSerieGuia.value;
    let numGuia : string = this.frmCtrlNumGuia.value;

    this.guiaRemisionService.buscar(numRuc, numSerieGuia.trim(), numGuia.trim());
  }

  private validarExistenciaBoletaFactura() {

    let numRuc : string = this.frmCtrlNumRucBoletaFactura.value;
    let numSerie : string = this.frmCtrlNumSerieBoletaFactura.value;
    let numero : string = this.frmCtrlNumBoletaFactura.value;

    this.boletaFacturaService.buscar(numRuc, numSerie.trim(), numero.trim(), this.frmCtrlTipoComprobante.value);
  }



  private filtrarSeriesBuscadas() : void {

    let numSeriesParaBusq : number[] = this.obtenerSeriesSolicitadas();

    let noHayQueFiltrarSeries = !( this.rptaDamSeriesDpmn?.estado == Estado.SUCCESS &&
                                      this.rptaDamSeriesDpmn?.data?.length > 0 && numSeriesParaBusq.length > 0 );

    if (noHayQueFiltrarSeries) {
      this.mostrarDatosDAM = true;
      return;
    }

    let numSeriesDam : number[] = new Array();
    this.rptaDamSeriesDpmn.data.forEach((item: DamSerieCcmn) => numSeriesDam.push(item.numSerie));

    let seriesNoEncontradas : number[] = numSeriesParaBusq.filter(item => numSeriesDam.indexOf(item) < 0);
    let noSeHanEncontradoAlgunasSeries = seriesNoEncontradas?.length > 0;

    if ( noSeHanEncontradoAlgunasSeries ) {
      this.mostrarDatosDAM = false;
      this.rptaDamSeriesDpmn.data = new Array;
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Número(s) /rango de series no existe en la declaración'});
      return;
    }

    let damSeriesFiltradas : DamSerieCcmn[] = new Array();

    numSeriesParaBusq.forEach( (numSerieParaBusq : number) => {
      let damSerieBusq : DamSerieCcmn = this.rptaDamSeriesDpmn.data.find( ( damSerieDpmn : DamSerieCcmn ) => damSerieDpmn.numSerie == numSerieParaBusq ) as DamSerieCcmn;
      damSeriesFiltradas.push(damSerieBusq);
    });

    this.rptaDamSeriesDpmn.data = damSeriesFiltradas;
  }

  private mostrarDatosDam(paramBusqDcl : ParamBusqDcl) : void {
    let codAduana: string = paramBusqDcl.codAduana;
    let anio: number = Number(paramBusqDcl.anio);
    let codRegimen : string = paramBusqDcl.codRegimen;
    let numero : number = Number(paramBusqDcl.numero);

    this.rptaDeclaracion = Respuesta.create(new Declaracion, Estado.LOADING);
    this.colorCanal = null;

    this.declaracionService.buscar(codAduana, codRegimen, anio, numero).subscribe((declaracion : Declaracion) => {
      this.rptaDeclaracion = Respuesta.create(declaracion, Estado.SUCCESS);
      this.colorCanal = ConstantesApp.COLOR_CONTROL.get(this.rptaDeclaracion?.data?.canal?.codigo) as string;
    }, () => {
      this.rptaDeclaracion = Respuesta.create(new Declaracion, Estado.SUCCESS);
    });
  }

  private buildForm() {
    this.validarDeclaracionForm = this.formBuilder.group({
        aduana : ['', [Validators.required]],
        annio : ['', [Validators.required]],
        regimen : ['', [Validators.required]],
        numero : ['', [Validators.required]],
        series : ['', [Validators.pattern(this.patternBusqSeries)]]
    });

    this.addComprobanteForm = this.formBuilder.group({
      tipoComprobante : ['', [Validators.required]],
      motivoTraslado :  ['', [Validators.required]]
      //rucDestinatario : ['']
      //razonSocialDestinatario : ['']
    });
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
}
