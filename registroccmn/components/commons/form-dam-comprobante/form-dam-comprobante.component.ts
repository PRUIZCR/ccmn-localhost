import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';

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
import { RegistroCcmnService } from 'src/app/services/registro-ccmn.service';
import { DamSerieCcmn } from 'src/app/model/domain/dam-serie-ccmn.model';
import { BoletaFactura } from 'src/app/model/domain/boleta-factura.model';
import { PuestoControlService } from 'src/app/services/puesto-control.service';
import { TipoRegistro } from 'src/app/model/common/tipo-registro';
import { FlujoVehiculo } from 'src/app/model/common/flujo-vehiculo.enum';

@Component({
  selector: 'app-form-dam-comprobante',
  templateUrl: './form-dam-comprobante.component.html',
  styleUrls: ['./form-dam-comprobante.component.css'],
  providers: [MessageService, BuilderCcmnService, ConfirmationService]
})
export class FormDamComprobanteComponent implements OnInit, AfterViewInit {

  private rptDataCatUbigeos: Respuesta<DataCatalogo[]> = Respuesta.create(new Array(), Estado.LOADING);
  private rptUbigeos!: Respuesta<Ubigeo[]>;
  private dataCcmn!: Ccmn;

  private rptUbigeosSubs !: Subscription;
  private damSeriesDpmnSubs !: Subscription;
  private ccmnSubs !: Subscription;
  private msgNewDamSerieDpmnSubs !: Subscription;

  observaciones!: string;
  rowsTblComprobante : RowTblCompago[] = new Array();
  descColumnaTipoComprobante!: string;

  ubigeoSeleccionado!: DataCatalogo;
  ubigeosFiltrados!: DataCatalogo[];

  damSeriesDpmn : DamSerieCcmn[] = new Array();

  constructor(private ubigeoService : UbigeoService,
              private registroCcmnService : RegistroCcmnService,
              private messageService: MessageService,
              private builderCcmnService: BuilderCcmnService,
              private confirmationService: ConfirmationService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private puestoControlService: PuestoControlService) { }

  ngOnInit(): void {
    this.ubigeoService.obtenerUbigeos();
    this.rptUbigeosSubs = this.ubigeoService.rptUgigeos$.subscribe((respuesta : Respuesta<Ubigeo[]>) => {
        this.rptUbigeos = respuesta;
        this.rptDataCatUbigeos.mensajes = respuesta.mensajes;
        this.rptDataCatUbigeos.data = this.ubigeoService.convertirToDataCatalogo(respuesta.data);
        this.rptDataCatUbigeos.estado = respuesta.estado;

        if(this.registroCcmnService.tipoRegistro == TipoRegistro.CAF){
          this.ubigeoSeleccionado = this.encontrarDatCatUbigeo(this.puestoControlService.codigoUbigeoCAF);
        }

        if(this.registroCcmnService.tipoRegistro == TipoRegistro.BUS){
          if(this.registroCcmnService.ubigeoOrigenBus?.codUbigeo!=undefined && this.registroCcmnService.ubigeoOrigenBus?.codUbigeo!=null){
            this.ubigeoSeleccionado = this.encontrarDatCatUbigeo(this.registroCcmnService.ubigeoOrigenBus.codUbigeo);
          }
        }
    });

    this.damSeriesDpmnSubs = this.registroCcmnService.damSeriesCcmn$.subscribe(( respuesta : DamSerieCcmn[] ) => {
      this.damSeriesDpmn = respuesta;
    });

    this.ccmnSubs = this.registroCcmnService.ccmn$.subscribe((newCcmn : Ccmn) => {
        this.dataCcmn = newCcmn;
        this.observaciones = this.dataCcmn?.datoComplementario?.desObservacion;
        if(this.ubigeoSeleccionado==undefined || this.ubigeoSeleccionado==null)
          this.ubigeoSeleccionado = this.encontrarDatCatUbigeo(this.dataCcmn?.datoComplementario?.ubigeoOrigen?.codUbigeo);
        this.completarDataTblComprobantes(newCcmn);
    });

    this.registroCcmnService.colocarPasoActual(2);

  }

  ngAfterViewInit() {
    this.msgNewDamSerieDpmnSubs = this.registroCcmnService.msgConfirmNewDamSerieCcmn$?.subscribe( ( respuesta : any ) => {

      if ( respuesta == null ) {
        return;
      }
      this.messageService.add({severity:"info", summary: 'Mensaje', detail: respuesta});

      this.registroCcmnService.limpiarMsgConfirmNewDamSeriesCcmn();
    });
  }

  private completarDataTblComprobantes(newCcmn : Ccmn) : void {

    //Se completa la etiqueta
    this.descColumnaTipoComprobante = "Guía Remisión del Remitente/Comprobante de pago";

    if(newCcmn?.empresaTransporte?.flujoVehiculo?.codDatacat == FlujoVehiculo.CARGA){
      this.descColumnaTipoComprobante = "Guía Remisión del Remitente/Carta Porte";
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

    this.actualizarData();
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
    this.eliminarSubscripciones();
    this.router.navigate(['../adjuntar-archivos'], { relativeTo: this.activatedRoute });
  }

  eliminarComprobante(rowTblCompago : RowTblCompago)  : void {
    let mensajeComprobante = 'Comprobante Pago';
    if(this.dataCcmn?.empresaTransporte?.flujoVehiculo?.codDatacat == FlujoVehiculo.CARGA)
    mensajeComprobante = mensajeComprobante + '/Carta Porte';
    this.confirmationService.confirm({
        message: '&iquest;Desea retirar el ' + mensajeComprobante + ' y sus declaraciones de importaci&oacute;n?',
        header: 'Retirar comprobante: ' + rowTblCompago.numero,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.registroCcmnService.eliminarComprobante(rowTblCompago.correlativo);
        }
    });
  }

  eliminarSerie(rowDamSerie : DamSerieCcmn)  : void {
    this.confirmationService.confirm({
        message: '&iquest;Desea eliminar la serie de la declaraci&oacute;n a descargar?',
        header: 'Retirar Serie: ' + rowDamSerie.numSerie + ' de Declaración: ' + rowDamSerie.aduanaDam.codDatacat + '-' + rowDamSerie.annDam + '-' + rowDamSerie.regimenDam.codDatacat + '-' + rowDamSerie.numDam,
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.registroCcmnService.eliminarSerie(rowDamSerie);
        }
    });
  }

  actualizarData() : void {
    this.builderCcmnService.iniciar(this.dataCcmn);
    this.builderCcmnService.setUbigeoOrigen(this.ubigeoService.obtenerUgibeo(this.ubigeoSeleccionado?.codDatacat));
    this.builderCcmnService.setObservaciones(this.observaciones);
    this.registroCcmnService.putCcmn(this.builderCcmnService.resultado);
  }

  private eliminarSubscripciones() : void {
    this.rptUbigeosSubs.unsubscribe();
    this.damSeriesDpmnSubs.unsubscribe();
    this.ccmnSubs.unsubscribe();
    this.msgNewDamSerieDpmnSubs?.unsubscribe();
  }



}
