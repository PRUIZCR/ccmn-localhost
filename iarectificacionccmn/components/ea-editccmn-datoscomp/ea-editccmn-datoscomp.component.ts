import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { forkJoin, Subscription } from 'rxjs';

import { AbstractControl, FormBuilder,FormControl, FormGroup,Validators,ReactiveFormsModule  } from '@angular/forms';
import {MessageService} from 'primeng/api';
import {ConfirmationService} from 'primeng/api';

import { Respuesta } from 'src/app/model/common/Respuesta';
import { DataCatalogo } from 'src/app/model/common/data-catalogo.model';

import { CartaPorte } from 'src/app/model/domain/carta-porte.model';
import { UbigeoService } from 'src/app/services/ubigeo.service';
import { RowTblCompago } from 'src/app/model/bean/row-tbl-compago.model';
import { Ubigeo } from 'src/app/model/domain/ubigeo.model';
import { GuiaRemision } from 'src/app/model/domain/guia-remision.model';
import { Estado } from 'src/app/model/common/Estado';
import { BuilderCcmnService } from 'src/app/services/builder-ccmn.service';
import { Ccmn } from 'src/app/model/domain/ccmn.model';
//import { RegistroCcmnService } from 'src/app/services/registro-ccmn.service';
import { DamSerieCcmn } from 'src/app/model/domain/dam-serie-ccmn.model';
import { BoletaFactura } from 'src/app/model/domain/boleta-factura.model';
import { PuestoControlService } from 'src/app/services/puesto-control.service';
import { TipoRegistro } from 'src/app/model/common/tipo-registro';
import { FlujoVehiculo } from 'src/app/model/common/flujo-vehiculo.enum';
import { BuscarCcmnService } from 'src/app/services/buscar-ccmn.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { SerieDeclaracionDpmn } from 'src/app/model/domain/serie-declaracion';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogRectiItemComponent } from 'src/app/shared/components/dialog-recti-item/dialog-recti-item.component';
import { RectificacionCcmnService } from 'src/app/services/rectificacion-ccmn.service';
import { environment } from 'src/environments/environment';
import { ConstantesApp } from '../../../../utils/constantes-app';
import { Ruc } from 'src/app/model/bean/ruc.model';
import { ComprobantePago } from 'src/app/model/domain/comprobante-pago.model';
import { RucService } from 'src/app/services/ruc.service';
import { CondicionRuc } from 'src/app/model/common/condicion-ruc.enum';
import { EstadoRuc } from 'src/app/model/common/estado-ruc.enum';
import { TipoComprobante } from 'src/app/model/common/tipo-comprobante.enum';
import { GuiaRemisionService } from 'src/app/services/guia-remision.service';
import { GuiaRemisionTransp } from 'src/app/model/bean/guia-remision-transp.model';
import { Datacatalogo } from 'src/app/model/domain/documentoDescarga';
import { DniService } from 'src/app/services/dni.service';
import { MensajeBean } from 'src/app/model/common/MensajeBean';
import { Dni } from 'src/app/model/bean/dni.model';
import { BoletaFacturaService } from 'src/app/services/boleta-factura.service';
@Component({
  selector: 'app-ea-editccmn-datoscomp',
  templateUrl: './ea-editccmn-datoscomp.component.html',
  styleUrls: ['./ea-editccmn-datoscomp.component.scss'],
  providers: [MessageService, BuilderCcmnService, ConfirmationService,DialogService,GuiaRemisionService,DniService]
})
export class EaEditccmnDatoscompComponent implements OnInit {
  private rptDataCatUbigeos: Respuesta<DataCatalogo[]> = Respuesta.create(new Array(), Estado.LOADING);
  private rptUbigeos!: Respuesta<Ubigeo[]>;
  private dataCcmn!: Ccmn;

  private rptUbigeosSubs !: Subscription;
  private damSeriesCcmnSubs !: Subscription;
  private ccmnSubs !: Subscription;
  private msgNewDamSerieCcmnSubs !: Subscription;
  rptaGuiaRemision  !: Respuesta<GuiaRemisionTransp>;
  private buscarGuiaRemisionSubs! : Subscription;
  private URL_RESOURCE_RUC : string = environment.urlBase + ConstantesApp.RESOURCE_RUC;

  observaciones!: string;
  rowsTblComprobante : RowTblCompago[] = new Array();
  descColumnaTipoComprobante!: string;

  ubigeoSeleccionado!: DataCatalogo;
  ubigeoSeleccionadoEdit!: DataCatalogo;
  ubigeosFiltrados!: DataCatalogo[];

  damSeriesDpmn : DamSerieCcmn[] = new Array();

  seriesDeclaracionDpmn: SerieDeclaracionDpmn[]= new Array();
  numeroCorrelativo!:string|null;
  ccmn!: Ccmn;
  ref!: DynamicDialogRef;

  //datosTransporteForm: FormGroup = new FormGroup({});
  datosCompEdit:boolean=false;
  tipoBusqueda!:string;
  lstTipoComprobante:  DataCatalogo[] = new Array();
  lstMotivoTraslado:  DataCatalogo[] = new Array();
  display: boolean = false;
  displayRuc: boolean = false;
  datosComprobanteForm!: FormGroup;
  rowTblCompago : RowTblCompago = new RowTblCompago();
  esDeshabilitado!:boolean;
  constructor(private ubigeoService : UbigeoService,
    //private registroCcmnService : RegistroCcmnService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private builderCcmnService: BuilderCcmnService,
    private confirmationService: ConfirmationService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private puestoControlService: PuestoControlService,
    private buscarCcmnService:BuscarCcmnService,
    private http: HttpClient,
    private dialogService: DialogService,
    private rectificacionCcmnService : RectificacionCcmnService,
    private rucService : RucService,
    private dniService : DniService,
    private boletaFacturaService: BoletaFacturaService,
    private guiaRemisionService: GuiaRemisionService,
    ) { }

  ngOnInit(): void {
    this.ubigeoService.obtenerUbigeos();

    this.rptUbigeosSubs = this.ubigeoService.rptUgigeos$.subscribe((respuesta : Respuesta<Ubigeo[]>) => {
        this.rptUbigeos = respuesta;
        this.rptDataCatUbigeos.mensajes = respuesta.mensajes;
        this.rptDataCatUbigeos.data = this.ubigeoService.convertirToDataCatalogo(respuesta.data);
        this.rptDataCatUbigeos.estado = respuesta.estado;

        if(this.rectificacionCcmnService.tipoRegistro == TipoRegistro.CAF){
          this.ubigeoSeleccionado = this.encontrarDatCatUbigeo(this.puestoControlService.codigoUbigeoCAF);
        }
        this.loadDatosComprobantesDeclaracion();
    });

    this.rectificacionCcmnService.colocarPasoActual(3);
    this.tipoBusqueda='2';
    this.buildForm();
  }
  private loadDatosComprobantesDeclaracion() : void {

    this.ccmnSubs = this.rectificacionCcmnService.ccmn$.subscribe((newCcmn : Ccmn) => {
      this.dataCcmn = newCcmn;
      if(this.dataCcmn.numCorrelativo!=null){
        this.observaciones = this.dataCcmn?.datoComplementario?.desObservacion;
        this.ubigeoSeleccionado = this.encontrarDatCatUbigeo(this.dataCcmn?.datoComplementario?.ubigeoOrigen?.codUbigeo);
        this.completarDataTblComprobantes(this.dataCcmn);

      }
    });

    this.damSeriesCcmnSubs = this.rectificacionCcmnService.damSeriesCcmn$.subscribe(( respuesta : DamSerieCcmn[] ) => {
      this.damSeriesDpmn = respuesta;
    });

  }

  getCatalogo(url: string, tipojson: number) {
    return this.http
      .get<any>(url).subscribe((data) => {
        if (tipojson == 13) {
          this.lstTipoComprobante = data;
        }else if (tipojson == 17) {
          this.lstMotivoTraslado = data;
        }
      }, error => {
        console.log({ error });
      })
  }





  private completarDataTblComprobantes(newCcmn : Ccmn) : void {

    //Se completa la etiqueta
    this.descColumnaTipoComprobante = "Guía Remisión del Remitente/Comprobante de pago";

    if(newCcmn?.empresaTransporte?.flujoVehiculo?.codDatacat == FlujoVehiculo.CARGA){
      this.descColumnaTipoComprobante = "Guía Remisión del Remitente/Carta Porte";
    }else{
      this.descColumnaTipoComprobante = "Guía Remisión del Remitente/Factura o Boleta";
    }

    this.rowsTblComprobante = new Array();

    if ( newCcmn == null ) {
      return;
    }

    if ( newCcmn.comprobantePago == null || newCcmn.comprobantePago.length <= 0 ) {
      return;
    }

    newCcmn.comprobantePago.forEach((itComprob: any) => {

      let rowTblCompago : RowTblCompago = new RowTblCompago();

      rowTblCompago.correlativo = itComprob.numCorrelativo;

      if(itComprob.tipoComprobante?.codDatacat == "03" || itComprob.tipoComprobante.codDatacat == "04"){
        rowTblCompago.destinatarioRuc = itComprob.numDocAdquiriente;
        rowTblCompago.destinatarioRazonSocial = itComprob.nomAdquiriente;
      }else{
        rowTblCompago.destinatarioRuc = itComprob.numRucDestinatario;
        rowTblCompago.destinatarioRazonSocial = itComprob.desRazonSocialDestinatario;
      }

      rowTblCompago.destino = itComprob.ubigeoDestino.nomDepartamento + "-" +
                              itComprob.ubigeoDestino.nomProvincia + "-" +
                              itComprob.ubigeoDestino.nomDistrito;
      rowTblCompago.motivoTraslado = itComprob.motivoDeTraslado.desDataCat;

      if ( itComprob instanceof GuiaRemision  ) {
        rowTblCompago.numero = itComprob.numSerie + "-" + itComprob.numGuia;
        rowTblCompago.remitenteRazonSocial = itComprob.desRazonSocialRemitente;
        rowTblCompago.remitenteRuc = itComprob.numRucRemitente;
      }

      if ( itComprob instanceof CartaPorte  ) {
        rowTblCompago.numero = itComprob.numCartaPorte;
        rowTblCompago.remitenteRuc = itComprob.nomEmpresa;
      }

      if ( itComprob instanceof BoletaFactura  ) {
        rowTblCompago.numero = itComprob.numSerie + "-" + itComprob.numComprobante;
        rowTblCompago.remitenteRuc = itComprob.numRuc;
      }

      this.rowsTblComprobante.push(rowTblCompago);

    });

    this.rowsTblComprobante = [...this.rowsTblComprobante];

  }

  encontrarDatCatUbigeo(codUbigeo : string) : DataCatalogo {
    return this.rptDataCatUbigeos.data.find(( datCatUbigeo : DataCatalogo) => datCatUbigeo.codDatacat == codUbigeo) as DataCatalogo;
  }



  private verificarUbigeoExiste() : void {
    this.messageService.clear();
    let noHayUbigeos = this.ubigeosFiltrados == null  || this.ubigeosFiltrados.length <= 0;

    if ( noHayUbigeos ) {
      this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Ciudad origen no existe'});
    }
  }


  irPaginaAnterior() : void {

    /*if ( this.faltaIngresarUbigeo() ) {
      return;
    }*/

    //this.actualizarData();
    this.eliminarSubscripciones();
    this.router.navigate(['../datos-transporte'], { relativeTo: this.activatedRoute });
  }

  faltaIngresarUbigeo() : boolean {

    if ( this.ubigeoSeleccionado == null ) {
      this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Falta seleccionar la ciudad de origen'});
      return true;
    }

    return false;
  }

  private faltaIngresarComprobantes() : boolean {
    let faltaIngresarComprobantes =  this.rowsTblComprobante.length <= 0;
    let faltaIngresarDamSeriesDpmn = this.damSeriesDpmn.length <= 0;

    let resultado = faltaIngresarComprobantes ||  faltaIngresarDamSeriesDpmn;

    if ( resultado ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Debe registrar por lo menos una serie de declaración y un comprobante de pago'});
    }

    return resultado;
  }

  irPageAddDeclaracion() {

    if ( this.faltaIngresarUbigeo() ) {
      return;
    }

    this.actualizarData();
    this.eliminarSubscripciones();
    this.router.navigate(['../add-declaracion'], { relativeTo: this.activatedRoute });
  }

  irPaginaSiguiente() {

    if ( this.faltaIngresarUbigeo() ) {
      return;
    }

    if ( this.faltaIngresarComprobantes() ) {
      return;
    }

    this.actualizarData();
    //this.eliminarSubscripciones();
    this.router.navigate(['../adjuntar-archivos'], { relativeTo: this.activatedRoute });
  }

  eliminarComprobante(rowTblCompago : RowTblCompago)  : void {
    let mensajeComprobante = 'Comprobante Pago';
    this.ccmnSubs = this.rectificacionCcmnService.ccmn$.subscribe((newCcmn : Ccmn) => {
      this.dataCcmn = newCcmn;
    });
    if(this.dataCcmn?.empresaTransporte?.flujoVehiculo?.codDatacat == FlujoVehiculo.CARGA)
    mensajeComprobante = mensajeComprobante + '/Carta Porte';
    this.confirmationService.confirm({
        message: '&iquest;Desea retirar el ' + mensajeComprobante + ' y sus declaraciones de importaci&oacute;n?',
        header: 'Retirar comprobante: ' + rowTblCompago.numero,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
             this.rectificacionCcmnService.eliminarComprobante(rowTblCompago.correlativo);
             this.display = true;
        }

    });
  }

  eliminarSerie(rowDamSerie : DamSerieCcmn)  : void {
    this.confirmationService.confirm({
        message: '&iquest;Desea eliminar la serie de la declaraci&oacute;n a descargar?',
        header: 'Retirar Serie: ' + rowDamSerie.numSerie + ' de Declaración: ' + rowDamSerie.aduanaDam.codDatacat + '-' + rowDamSerie.annDam + '-' + rowDamSerie.regimenDam.codDatacat + '-' + rowDamSerie.numDam,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.rectificacionCcmnService.eliminarSerie(rowDamSerie);
        }
    });
  }

  actualizarData() : void {
    this.builderCcmnService.iniciar(this.dataCcmn);
    this.builderCcmnService.setUbigeoOrigen(this.ubigeoService.obtenerUgibeo(this.ubigeoSeleccionado?.codDatacat));
    this.builderCcmnService.setObservaciones(this.observaciones);
   /*poner la informacion de los comprobantes*/
   let comprobanteNew : ComprobantePago = this.crearComprobante();

   this.builderCcmnService.addComprobantePago(comprobanteNew);
    //this.builderCcmnService.addComprobantePago( this.rowsTblComprobante);


    this.rectificacionCcmnService.putCcmn(this.builderCcmnService.resultado);
  }
  private crearComprobante() : ComprobantePago {

    let tipoComprobante= this.datosComprobanteForm.controls.codTipoComprobante.value;

    if ( tipoComprobante == ConstantesApp.COD_TIPO_COMP_GUIA_REMISION ) {
      return this.crearGuiaRemision();
    } else if ( tipoComprobante.value == ConstantesApp.COD_TIPO_COMP_CARTA_PORTE ) {
      //return this.crearCartaPorte()
    }else if ( tipoComprobante.value == ConstantesApp.COD_TIPO_COMP_FACTURA || tipoComprobante.value == ConstantesApp.COD_TIPO_COMP_BOLETA) {
      //return this.crearFacturaBoleta()
    }

    return new ComprobantePago;
}

private crearGuiaRemision() : GuiaRemision {

  var guiaRemision : GuiaRemision = new GuiaRemision();
  guiaRemision.type = TipoComprobante.GUIA_REMISION;
  guiaRemision.tipoComprobante = new DataCatalogo();
  guiaRemision.tipoComprobante.codDatacat = ConstantesApp.COD_TIPO_COMP_GUIA_REMISION;
  guiaRemision.tipoComprobante.desDataCat = "Guia de remisión del remitente";

  guiaRemision.numSerie = this.datosComprobanteForm.controls.numSerieComprobante.value;
  guiaRemision.numGuia =    this.datosComprobanteForm.controls.numeroComprobante.value;
  guiaRemision.numRucRemitente = this.datosComprobanteForm.controls.numeroRucRemitente.value;
  guiaRemision.desRazonSocialRemitente = this.datosComprobanteForm.controls.razonSocialDestinatarioComprobante.value;

  guiaRemision.numRucDestinatario = this.datosComprobanteForm.controls.numeroRucDestinatario.value;
  guiaRemision.desRazonSocialDestinatario =  this.datosComprobanteForm.controls.razonSocialDestinatarioComprobante.value;

  this.completarDatosComprobante(guiaRemision);

  return guiaRemision;
}
private completarDatosComprobante(comprobante : ComprobantePago) : void {
  comprobante.motivoDeTraslado =   this.datosComprobanteForm.controls.codMotivoTraslado.value;
  comprobante.ubigeoDestino = this.ubigeoService.obtenerUgibeo(this.ubigeoSeleccionado.codDatacat);
}


  editarSerieCcmn(itemDamSerieDpmn : DamSerieCcmn) : void {

    this.ref = this.dialogService.open(DialogRectiItemComponent, {
      data : {
        damSerieDpmn: itemDamSerieDpmn
      },
      header: 'Rectificación de descarga de Ítem',
      width: '40vw',
      contentStyle: {"max-height": "500px", "overflow": "auto"},
      baseZIndex: 10000
    });

  }
  onChangeTipoComprob() {
    let tipoDocumentoform = this.datosComprobanteForm.controls.codTipoComprobante.value;
    if (tipoDocumentoform!="01") {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
          detail: 'Seleccione guía de remisión del remitente'});
    }

   }
  editarComprobantePago(rowTblCompago : RowTblCompago) : void {

    this.getCatalogo('assets/json/tipo-comprobante.json', 13);
    this.getCatalogo('assets/json/motivo-traslado.json', 17);
    this.tipoBusqueda='3';
    if(this.dataCcmn.comprobantePago!=null){
      this.completarDataTblEditComprobantes(this.dataCcmn);
   }


  }

  cancelarirPaginacomprobantes() : void {
    this.eliminarSubscripciones();
    // this.router.navigate(['../datos-transporte'], { relativeTo: this.activatedRoute });
    this.tipoBusqueda='2';
    this.getCatalogo('assets/json/tipo-comprobante.json', 13);
    this.getCatalogo('assets/json/motivo-traslado.json', 17);
    this.router.navigate(['../comprobantes'], { relativeTo: this.activatedRoute });

  }
  validarUbigeo(ubigeo:DataCatalogo):void{
    let  mismaCiudad : boolean = this.rectificacionCcmnService.ciudadOrigenIgual(this.ubigeoSeleccionadoEdit?.codDatacat);

    if ( mismaCiudad ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',detail: 'Ciudad origen y destino no pueden ser la misma'});
      this.esDeshabilitado=true;
    }else{
      this.esDeshabilitado=false;
    }
  }


  aceptarComprobantes() : void {
   // this.eliminarSubscripciones();
    // this.router.navigate(['../datos-transporte'], { relativeTo: this.activatedRoute });
    this.tipoBusqueda='2';
    this.getCatalogo('assets/json/tipo-comprobante.json', 13);
    this.getCatalogo('assets/json/motivo-traslado.json', 17);

    if(this.dataCcmn.comprobantePago!=null){
      this.completarDataTblEditComprobantesAceptar(this.dataCcmn);
   }

    this.router.navigate(['../comprobantes'], { relativeTo: this.activatedRoute });

  }

  filtrarUbigeo(event: any)  {
    let filtered: DataCatalogo[] = [];
    let query = event.query;
    for (let i = 0; i < this.rptDataCatUbigeos?.data?.length; i++) {
      let itemUbigeo = this.rptDataCatUbigeos.data[i];
      if (itemUbigeo.desDataCat.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
        filtered.push(itemUbigeo);
      }
    }

    this.ubigeosFiltrados = filtered;
    this.verificarUbigeoExiste();

  }



  cancelar() : void {
    this.ref.close();
  }
  private eliminarSubscripciones() : void {
    this.rptUbigeosSubs.unsubscribe();
    this.damSeriesCcmnSubs.unsubscribe();
    this.ccmnSubs.unsubscribe();
    this.msgNewDamSerieCcmnSubs?.unsubscribe();
  }

  private formControlSetReadOnly(formControl: AbstractControl, isReadonly: boolean) : void {
    (<any>formControl).nativeElement.readOnly = isReadonly;
}
// Controles de la info del Comprobante:
// get tipoComprobante(): AbstractControl {
//   return this.datosComprobanteForm.controls['comprobante'].get('codTipoComprobante') as FormControl;
// }

// get numeroSerieComprobante(): AbstractControl {
//   return this.datosComprobanteForm.controls['comprobante'].get('numSerieComprobante') as FormControl;
// }

// get numeroComprobante(): AbstractControl {
//   return this.datosComprobanteForm.controls['comprobante'].get('numeroComprobante') as FormControl;
// }

// get motivoTrasladoComprobante(): AbstractControl {
//   return this.datosComprobanteForm.controls['comprobante'].get('codMotivoTraslado') as FormControl;
// }


// get razonSocialComprobante(): AbstractControl {
//   return this.datosComprobanteForm.controls['comprobante'].get('razonSocialMotivoComprobante') as FormControl;
// }

// get rucDestinatarioComprobante(): AbstractControl {
//   return this.datosComprobanteForm.controls['comprobante'].get('rucDestinatarioComprobante') as FormControl;
// }

// get razonSocialDestinatarioComprobante(): AbstractControl {
//   return this.datosComprobanteForm.controls['comprobante'].get('razonSocialDestinatario') as FormControl;
// }

// get ubigeo(): AbstractControl {
//   return this.datosComprobanteForm.controls['comprobante'].get('ubigeo') as FormControl;
// }

private completarDataTblEditComprobantesAceptar(newCcmn : Ccmn) : void {


  newCcmn.comprobantePago.forEach((itComprob: any) => {
    this.rowTblCompago.correlativo = itComprob.numCorrelativo;

    if(itComprob.tipoComprobante?.codDatacat == "03" || itComprob.tipoComprobante.codDatacat == "04"){
      this.rowTblCompago.destinatarioRuc = itComprob.numDocAdquiriente;
      this.rowTblCompago.destinatarioRazonSocial = itComprob.nomAdquiriente;
    }else{
      this.rowTblCompago.destinatarioRuc = itComprob.numRucDestinatario;
      this.rowTblCompago.destinatarioRazonSocial = itComprob.desRazonSocialDestinatario;
    }

    if ( itComprob instanceof GuiaRemision  ) {
      this.rowTblCompago.numero = this.datosComprobanteForm.controls.numSerieComprobante.value + "-" + this.datosComprobanteForm.controls.numeroComprobante.value;
      this.rowTblCompago.remitenteRazonSocial = itComprob.desRazonSocialRemitente;
      this.rowTblCompago.remitenteRuc = itComprob.numRucRemitente;
    }

    if ( itComprob instanceof CartaPorte  ) {
      this.rowTblCompago.numero = this.datosComprobanteForm.controls.numeroComprobante.value;
      this.rowTblCompago.remitenteRuc = itComprob.nomEmpresa;
    }

    if ( itComprob instanceof BoletaFactura  ) {
      this.rowTblCompago.numero = this.datosComprobanteForm.controls.numSerieComprobante.value+ "-" + this.datosComprobanteForm.controls.numeroComprobante.value;
      this.rowTblCompago.remitenteRuc = itComprob.numRuc;
    }

    //this.rowTblCompago.motivoTraslado=
    this.rowTblCompago.motivoTraslado=this.getTipoMotivo(this.datosComprobanteForm.controls.codMotivoTraslado.value);
    var destinoUbigeo=this.ubigeoService.obtenerUgibeo(this.datosComprobanteForm.controls.ubigeo.value);
    this.ubigeoSeleccionadoEdit=this.datosComprobanteForm.controls.ubigeo.value;
    this.rowTblCompago.destino=this.datosComprobanteForm.controls.ubigeo.value.desDataCat;


    this.rowsTblComprobante = [this.rowTblCompago];
    // this.datosComprobanteForm.controls.codTipoComprobante.setValue(itComprob.tipoComprobante.codDatacat);
    // this.datosComprobanteForm.controls.numSerieComprobante.setValue(itComprob.numSerie);
    // this.datosComprobanteForm.controls.numeroComprobante.setValue(itComprob.numGuia);
    // this.datosComprobanteForm.controls.numeroRucRemitente.setValue(itComprob.numRucRemitente);
    // this.datosComprobanteForm.controls.razonSocialRemitenteComprobante.setValue(itComprob.desRazonSocialRemitente);
    // this.datosComprobanteForm.controls.razonSocialDestinatarioComprobante.setValue(itComprob.desRazonSocialDestinatario);
    // this.datosComprobanteForm.controls.numeroRucDestinatario.setValue(itComprob.numRucDestinatario);
  });

}

getTipoMotivo(codMotivoTraslado:string ){
    var objMotivo = "";
      if(codMotivoTraslado=="01"){
        objMotivo="Venta";
      }else if(codMotivoTraslado=="02"){
        objMotivo="Venta sujeta a confirmaci\u00f3n del comprador";
      }else if(codMotivoTraslado=="03"){
        objMotivo="Compra";
      }else if(codMotivoTraslado=="04"){
        objMotivo="Consignaci\u00f3n";
      }else if(codMotivoTraslado=="05"){
        objMotivo="Devoluci\u00f3n";
      }else if(codMotivoTraslado=="06"){
        objMotivo="Traslado entre establecimiento de misma empresa";
      }else if(codMotivoTraslado=="07"){
        objMotivo="Traslado de bienes para transformaci\u00f3n";
      }else if(codMotivoTraslado=="08"){
        objMotivo="Recojo de bienes transformados";
      }else if(codMotivoTraslado=="09"){
        objMotivo="Traslado de emisor itinerante de comprobante de pago";
      }else if(codMotivoTraslado=="10"){
        objMotivo="Traslado zona primaria";
      }else if(codMotivoTraslado=="11"){
        objMotivo="Importaci\u00f3n";
      }else if(codMotivoTraslado=="12"){
        objMotivo="Exportaci\u00f3n";
      }else if(codMotivoTraslado=="13"){
        objMotivo="Otros";
      }
      return objMotivo;
}

private completarDataTblEditComprobantes(newCcmn : Ccmn) : void {

  let flujoVehiculo=newCcmn.empresaTransporte.flujoVehiculo.codDatacat;
  newCcmn.comprobantePago.forEach((itComprob: any) => {
    this.rowTblCompago.correlativo = itComprob.numCorrelativo;

    if(itComprob.tipoComprobante?.codDatacat == "03" || itComprob.tipoComprobante.codDatacat == "04"){
      this.rowTblCompago.destinatarioRuc = itComprob.numDocAdquiriente;
      this.rowTblCompago.destinatarioRazonSocial = itComprob.nomAdquiriente;
    }else{
      this.rowTblCompago.destinatarioRuc = itComprob.numRucDestinatario;
      this.rowTblCompago.destinatarioRazonSocial = itComprob.desRazonSocialDestinatario;
    }

    if ( itComprob instanceof GuiaRemision  ) {
      this.rowTblCompago.numero = this.datosComprobanteForm.controls.numSerieComprobante.value + "-" + this.datosComprobanteForm.controls.numeroComprobante.value;
      this.rowTblCompago.remitenteRazonSocial = itComprob.desRazonSocialRemitente;
      this.rowTblCompago.remitenteRuc = itComprob.numRucRemitente;
    }

    if ( itComprob instanceof CartaPorte  ) {
      this.rowTblCompago.numero = this.datosComprobanteForm.controls.numeroComprobante.value;
      this.rowTblCompago.remitenteRuc = itComprob.nomEmpresa;
    }

    if ( itComprob instanceof BoletaFactura  ) {
      this.rowTblCompago.numero = this.datosComprobanteForm.controls.numSerieComprobante.value+ "-" + this.datosComprobanteForm.controls.numeroComprobante.value;
      this.rowTblCompago.remitenteRuc = itComprob.numRuc;
    }
    this.ubigeoSeleccionadoEdit = this.encontrarDatCatUbigeo(itComprob.ubigeoDestino.codUbigeo);
    if(flujoVehiculo=="01"){
    this.datosComprobanteForm.controls.codTipoComprobante.setValue("01");
    }else{
      this.datosComprobanteForm.controls.codTipoComprobante.setValue("02");
    }
    this.datosComprobanteForm.controls.numSerieComprobante.setValue(itComprob.numSerie);
    this.datosComprobanteForm.controls.numeroComprobante.setValue(itComprob.numGuia);
    this.datosComprobanteForm.controls.numeroRucRemitente.setValue(itComprob.numRucRemitente);
    this.datosComprobanteForm.controls.codMotivoTraslado.setValue(itComprob.motivoDeTraslado.codDatacat);
    this.datosComprobanteForm.controls.razonSocialRemitenteComprobante.setValue(itComprob.desRazonSocialRemitente);
    this.datosComprobanteForm.controls.razonSocialDestinatarioComprobante.setValue(itComprob.desRazonSocialDestinatario);
    this.datosComprobanteForm.controls.numeroRucDestinatario.setValue(itComprob.numRucDestinatario);
    this.datosComprobanteForm.controls.ubigeo.setValue(this.ubigeoSeleccionadoEdit.desDataCat);
  });


}

  private buildForm() : void {
    this.datosComprobanteForm = this.formBuilder.group({
      codTipoComprobante: [{ value: ' ', disabled: false}, Validators.required],
      numSerieComprobante: [{ value: ' ', disabled: false}, Validators.required],
      numeroComprobante: [{ value: ' ', disabled: false}, Validators.required],
      codMotivoTraslado: [{ value:' ', disabled: false}],
      numeroRucDestinatario: [{ value:' ', disabled: false}],
      razonSocialRemitenteComprobante: [{ value:' ', disabled: false}],
      razonSocialDestinatarioComprobante: [{ value:' ', disabled: false}],
      numeroRucRemitente: [{ value:' ', disabled: false}],
      ubigeo:[{ value:' ', disabled: false}]
    });
  }

  /*Obtiene la razon social por RUC*/
buscarRUC(tipo: string) {
  var numRuc = '';
  if (tipo == '1') {
    numRuc = this.datosComprobanteForm.controls.numeroRucRemitente.value;
  } else {
    numRuc = this.datosComprobanteForm.controls.numeroRucDestinatario.value;
  }

  var regexp = new RegExp('^[0-9]{11}$');

  if (numRuc== undefined || numRuc==null || numRuc == '')
    return;

  if (!regexp.test(numRuc)) {
    this.messageService.add({ key: 'msj', severity: 'warn', detail: 'El número de RUC debe tener 11 dígitos' });
    if (tipo == '1') {
      this.datosComprobanteForm.controls.numeroRucRemitente.setValue(numRuc);
    } else {
      this.datosComprobanteForm.controls.numeroRucDestinatario.setValue(numRuc);
    }
    return;
  }
  var url = this.URL_RESOURCE_RUC + "/" + numRuc;
  var msjError = "";
  this.rucService.buscarRuc(numRuc).subscribe( (objRuc : Ruc) => {

    if ( this.esNoValidoCondicionEstadoRuc(objRuc) ) {
      this.showMsgErrorCondicionEstadoRuc();
      this.datosComprobanteForm.controls.razonSocialDestinatarioComprobante.setValue("");
      return;
    }
    // this.rucDestinatario = objRuc;
    this.datosComprobanteForm.controls.razonSocialDestinatarioComprobante.setValue(objRuc.razonSocial);
  }, () => {
    this.messageService.clear();
    this.messageService.add({severity:"warn", summary: 'Mensaje',
              detail: 'Numero de RUC no existe'});
  } );
  // this.rucService.buscarRuc(numRuc).subscribe( (objRuc : Ruc) => {

  //   if ( this.esNoValidoCondicionEstadoRuc(objRuc) ) {
  //     this.showMsgErrorCondicionEstadoRuc();
  //     return;
  //   }
  // }, () => {
  //   this.messageService.clear();
  //   this.messageService.add({severity:"warn", summary: 'Mensaje',
  //             detail: 'Numero de RUC no existe'});
  // } );
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



onChangeguiaRemision() {

  let numRucGuia : string = this.datosComprobanteForm.controls.numeroRucRemitente.value;
  let numSerieGuia : string = this.datosComprobanteForm.controls.numSerieComprobante.value;
  let numGuia : string = this.datosComprobanteForm.controls.numeroComprobante.value;
  let valueTipoComp=this.datosComprobanteForm.controls.codTipoComprobante.value;

    if(valueTipoComp == ConstantesApp.COD_TIPO_COMP_GUIA_REMISION){
      this.validarExistenciaGuiaRemision(numRucGuia, numSerieGuia,numGuia);
    }

    if(valueTipoComp == ConstantesApp.COD_TIPO_COMP_BOLETA || valueTipoComp == ConstantesApp.COD_TIPO_COMP_FACTURA){
      this.validarExistenciaBoletaFactura(numRucGuia, numSerieGuia,numGuia,valueTipoComp);
    }
}
private validarExistenciaGuiaRemision(numRucGuia:string,numSerieGuia:string,numGuia:string) {
  this.guiaRemisionService.buscar(numRucGuia, numSerieGuia.trim(), numGuia.trim());
}

private validarExistenciaBoletaFactura(numRucGuia:string, numSerieGuia:string,numGuia:string,valueTipoComp:string) {
  this.boletaFacturaService.buscar(numRucGuia, numSerieGuia.trim(), numGuia.trim(), valueTipoComp);
}
private mostrarMsgGuiaRemisionNoExiste() {
  this.messageService.clear();
  this.messageService.add({severity:"warn", summary: 'Mensaje',
                detail: 'Guía de remisión ingresada no existe'});
}
 private completarDatosConductor(valor: Respuesta<Dni>) : void {
  if ( valor?.data != null && valor?.data.numero != null && valor?.estado == Estado.SUCCESS ) {
      let nombreCompleto = valor.data.nombres + " " + valor.data.nombres
      this.datosComprobanteForm.controls.razonSocialDestinatarioComprobante.setValue(nombreCompleto);

  } else {
    this.messageService.clear();
    valor?.mensajes?.forEach( ( mensaje: MensajeBean ) => {
      this.messageService.add({severity:"warn", summary: 'Mensaje', detail: mensaje.msg});
    });

  }
}

// private buildCtrlsGuiaRemision() : void {
//   this.cleanCtrlPorTipoComprob();
//   this.addComprobanteForm.addControl("numSerieGuia", new FormControl('', [Validators.required, this.noWhitespaceValidator]));
//   this.addComprobanteForm.addControl("numGuia", new FormControl('', [Validators.required, this.noWhitespaceValidator]));
//   this.addComprobanteForm.addControl("numRucGuia", new FormControl('', [Validators.required]));
//   this.addComprobanteForm.addControl("razSocialGuia", new FormControl('', [Validators.required]));
//   this.addComprobanteForm.addControl("rucDestinatario", new FormControl('', [Validators.required]));
//   this.addComprobanteForm.addControl("razonSocialDestinatario", new FormControl('', [Validators.required]));
// }
// private cleanCtrlPorTipoComprob() : void {
//   this.nomCtrlsPorTipoComp.forEach(nombre => {
//     if ( this.addComprobanteForm.contains(nombre) ) {
//       this.addComprobanteForm.removeControl(nombre);
//     }
//   });
// }
}
