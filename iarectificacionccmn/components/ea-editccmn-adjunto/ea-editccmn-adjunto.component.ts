import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataCatalogo } from 'src/app/model/common/data-catalogo.model';
import {ConfirmationService} from 'primeng/api';
import {MessageService} from 'primeng/api';
import { ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ConstantesApp } from 'src/app/utils/constantes-app';
import { Respuesta } from 'src/app/model/common/Respuesta';
import { Estado } from 'src/app/model/common/Estado';
import { CatalogoService } from 'src/app/services/catalogo.service';
//import { RegistroCcmnService } from 'src/app/services/registro-ccmn.service';
import { ArchivoCcmn } from 'src/app/model/bean/archivo-ccmn.model';
import { IdentificadorCcmn } from 'src/app/model/domain/identificador-ccmn.model';
import { ValDclRegistroDpmnService } from 'src/app/services/val-dcl-registro-dpmn.service';
import { SaldoSeriesService } from 'src/app/services/saldos-series.service';
import { RespuestaError } from 'src/app/model/common/response-error';
import { RectificacionCcmnService } from 'src/app/services/rectificacion-ccmn.service';
import { MsgRectiCcmn } from 'src/app/model/bean/msg-recti-ccmn.model';
import { DamSerieCcmn } from 'src/app/model/domain/dam-serie-ccmn.model';
import { MensajeBean } from 'src/app/model/common/MensajeBean';
@Component({
  selector: 'app-ea-editccmn-adjunto',
  templateUrl: './ea-editccmn-adjunto.component.html',
  styleUrls: ['./ea-editccmn-adjunto.component.scss'],
  providers: [ConfirmationService, MessageService, ValDclRegistroDpmnService, SaldoSeriesService]
})
export class EaEditccmnAdjuntoComponent implements OnInit {

  catalogoTipoDocAdjuntos: DataCatalogo[] = new Array();
  adjuntosForm!: FormGroup;

  archivo!: any;

  archivosCcmn : ArchivoCcmn[] = new Array();
  cargandoArchivo : boolean = false;

  mostrarDlgGuardarCcmn: boolean = false;

  rptaGrabarCcmn : Respuesta<IdentificadorCcmn> = new Respuesta<IdentificadorCcmn>();
  estado = Estado;
  rptaValidacionSaldos : Respuesta<Boolean>=new Respuesta<Boolean>();
  generandoQR: boolean = false;
  private rptaValSaldosSerieDam : Respuesta<Boolean>= new Respuesta<Boolean>();
  private validacionSaldosSerieDamSubject = new BehaviorSubject<Respuesta<Boolean>>(new Respuesta<Boolean>());;
  public validacionSaldosSerieDam$ = this.validacionSaldosSerieDamSubject.asObservable();

  private archivosCcmnSubs !: Subscription;
  private grabadoCcmnSubs !: Subscription;
  private errorValidacion: RespuestaError[] = new Array();
  private damSeriesCcmn : DamSerieCcmn[] = new Array();
  private damSeriesCcmnSubs: Subscription = new Subscription;
  @ViewChild('inputArchivo')
  inputArchivoRef!: ElementRef;

  constructor(  private formBuilder: FormBuilder,
                private rectificacionCcmnService:RectificacionCcmnService,
                private messageService: MessageService,
                private confirmationService: ConfirmationService,
                private renderer: Renderer2,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private catalogoService : CatalogoService,
                private saldoSeriesService: SaldoSeriesService) { }

  ngOnInit(): void {
    this.catalogoService.cargarDesdeJson("assets/json/adjuntos-registrodpmn.json").subscribe((resultado : DataCatalogo[])=> this.catalogoTipoDocAdjuntos = resultado);
    this.buildForm();

    this.archivosCcmnSubs = this.rectificacionCcmnService.archivosCcmn$.subscribe( ( respuesta : ArchivoCcmn[] ) => {
        this.archivosCcmn = [...respuesta];
        this.cargandoArchivo = false;
    });

    this.grabadoCcmnSubs = this.rectificacionCcmnService.resultRectificacionCcmn$.subscribe( (respuesta : Respuesta<IdentificadorCcmn>) => {
      this.verificarEstadoGrabacion(respuesta);
    } );

    this.rectificacionCcmnService.colocarPasoActual(4);

    this.damSeriesCcmnSubs = this.rectificacionCcmnService.damSeriesCcmn$.subscribe(( respuesta : DamSerieCcmn[] ) => {
      this.damSeriesCcmn = respuesta;
     this.listenVerificacionSaldos();
    });
  }

  onFileSelected(event: any): void {
    this.archivo = event.target.files[0];

    if ( this.esArchivoInvalido(this.archivo) ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Tipo de archivo incorrecto'});
      this.limpiarArchivo();
    }

    let superaMaximoPeso : boolean = this.archivo.size > ConstantesApp.MAX_TAMANIO_ARCHIVO_CCMN;
    let maximaCantidadAlcanzada = this.archivosCcmn.length == ConstantesApp.MAX_CNT_ARCHIVO_CCMN;

    if ( superaMaximoPeso ) {
      this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Cantidad de peso máximo supera el límite de 1 Mb'});
      this.limpiarArchivo();
    }

    if ( maximaCantidadAlcanzada ) {
      this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Sólo se puede adjuntar ' +
                                ConstantesApp.MAX_CNT_ARCHIVO_CCMN + ' archivos'});
      this.limpiarArchivo();
    }
  }

  private esArchivoInvalido(archivo : any) : boolean {
    let nombreArchivo : string = archivo?.name;

    if ( nombreArchivo == null ) {
      return false;
    }

    return !(nombreArchivo.toLowerCase().endsWith(".pdf") || nombreArchivo.toLowerCase().endsWith(".jpg"));
  }

  private verificarEstadoGrabacion(respuesta : Respuesta<IdentificadorCcmn>) {
    if ( respuesta == null || respuesta.data==undefined ) {
      this.mostrarDlgGuardarCcmn = false;
      return;
    }

    this.mostrarDlgGuardarCcmn = true;
    this.rptaGrabarCcmn = respuesta;
  }

  private limpiarArchivo() : void {
    this.archivo = null;
    this.inputArchivoRef.nativeElement.value = "";
  }

  adjuntarArchivo() : void {
    if ( this.archivo ) {
      let tipoDoc = this.obtenerTipoDocumento();
      this.cargandoArchivo = true;
      this.rectificacionCcmnService.adjuntarArchivo(this.archivo, tipoDoc);
      this.limpiarArchivo();
    }

  }

  eliminarArchivo( archivo : ArchivoCcmn ) : void {
    this.confirmationService.confirm({
      message: '&iquest;Desea retirar el archivo?',
      header: 'Retirar archivo',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.rectificacionCcmnService.eliminarArchivo(archivo.id);
      }
    });
  }

  descargarArchivo( archivo : ArchivoCcmn ) : void {
    const link = this.renderer.createElement("a");
    link.href = 'data:' + archivo.nomContentType + ';base64,' + archivo.valArchivoBase64;
    link.download = archivo.nomArchivo;
    link.click();
    link.remove();
  }

  private descargarFichaResumenQR() : void {
    this.generandoQR = true;
    this.rectificacionCcmnService.descargarFicharResumen().subscribe(response => {
      let nombreArchivo = this.rectificacionCcmnService.numeroCcmnGenerado + ".pdf";
      let dataType = response.type;
      let binaryData = [];
      binaryData.push(response);
      const link = this.renderer.createElement("a");
      link.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
      link.download = nombreArchivo;
      link.click();
      link.remove();
      this.irAlInicioRegistroCcmn();
    }, () => {
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                detail: 'Ocurrió un error al generar el archivo PDF con el código QR de la CCMN'});
      this.irAlInicioRegistroCcmn();
    });
  }

  private irAlInicioRegistroCcmn() : void {
    this.rectificacionCcmnService.limpiarData();
    this.generandoQR = false;
    this.mostrarDlgGuardarCcmn = false;
    this.router.navigate(['../buscar-ccmn'], { relativeTo: this.activatedRoute });
  }

  private obtenerTipoDocumento() : DataCatalogo {
      let codTipoDoc = this.frmCtrlTipoDocumento.value
      return this.catalogoTipoDocAdjuntos.find( ( dataCat : DataCatalogo ) => dataCat.codDatacat == codTipoDoc ) as DataCatalogo;
  }

  irPaginaAnterior(): void {
    this.eliminarSubscripciones();
    this.router.navigate(['../comprobantes'], { relativeTo: this.activatedRoute });
  }

  async RectificarCcmn() {

    let mensajesValidacion : string[] = this.rectificacionCcmnService.validarGrabacionCcmn();

    if ( mensajesValidacion.length > 0 ) {
      this.messageService.clear();
      mensajesValidacion.forEach((mensaje: string) => {
        this.messageService.add({severity:"warn", summary: 'Mensaje', detail: mensaje});
      });
      return;
    }

    let damSeriesDpmValidarSaldos : DamSerieCcmn[] = this.rectificacionCcmnService.buscarDamSeriesParaValidarSaldos();

    if ( damSeriesDpmValidarSaldos.length > 0 ) {
      this.saldoSeriesService.validarSaldosDam(damSeriesDpmValidarSaldos);
      return;
    }

    this.procederRectificacion();
  }
  private procederRectificacion() : void {

    let listaCambios : MsgRectiCcmn[] = this.rectificacionCcmnService.generarListaCambios();

    let noHayNuevosArchivos : boolean = !this.rectificacionCcmnService.seAgregoNuevosArchivos();

    let noHayCambios : boolean = listaCambios.length <= 0 && noHayNuevosArchivos;

    if ( noHayCambios ) {
      this.messageService.add({severity:"warn", summary: 'Mensaje', detail: "No se ha hecho ningun cambio en la CCMN"});
      return;
    }

    this.confirmationService.confirm({
      message: '&iquest;Desea modificar la Constancia de Control de Mercanc&iacute;a nacionalizada CCMN?',
      header: 'Rectificar CCMN',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.rectificacionCcmnService.rectificar(listaCambios);
      }
    });

  }
  cancelarGrabarCcmn(): void {
    this.confirmationService.confirm({
      message: '&iquest;Desea Salir?',
      header: 'Grabar CCMN',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.irAlInicioRegistroCcmn();
      }
    });
  }

  cerrarDialogGrabarCcmn() : void {
    if (this.rptaGrabarCcmn?.estado == Estado.SUCCESS) {

       this.confirmationService.confirm({
        message: '&iquest;Desea imprimir la CCMN?',
        header: 'Descargar CCMN',
        icon: 'pi pi-question-circle',
        accept: () => {
          this.descargarFichaResumenQR();
        },
        reject: () => {
          this.irAlInicioRegistroCcmn();
        }
      });
    } else {
        this.mostrarDlgGuardarCcmn = false;
    }
  }

  private listenVerificacionSaldos() : void {

    this.saldoSeriesService.validacionSaldosSerieDam$.subscribe( ( respuesta : Respuesta<Boolean> ) => {

      this.rptaValidacionSaldos = respuesta;

      if ( respuesta == null ) {
        return;
      }

      if ( respuesta.estado === Estado.LOADING ) {
        return;
      }

      if ( respuesta.estado === Estado.ERROR ) {
        this.messageService.clear();

        respuesta.mensajes?.forEach( ( mensaje : MensajeBean ) => {
          this.messageService.add({severity:"warn", summary: 'Mensaje', detail:  mensaje.msg});
        } );

        return;
      }

      if ( respuesta.estado === Estado.SUCCESS ) {
        this.procederRectificacion();
      }

    });
  }

  // private listenVerificacionSaldos() : void {

  //   this.saldoSerieDamService.validacionSaldosSerieDam$.subscribe( ( respuesta : Respuesta<Boolean> ) => {

  //     if ( respuesta == null ) {
  //       return;
  //     }

  //     if ( respuesta.estado === Estado.LOADING ) {
  //       return;
  //     }

  //     if ( respuesta.estado === Estado.ERROR ) {
  //       this.messageService.clear();
  //       this.messageService.add({severity:"warn", summary: 'Mensaje', detail:  respuesta.mensajes[0].msg});
  //       return;
  //     }

  //     if ( respuesta.estado === Estado.SUCCESS ) {

  //       let listaCambios : MsgRectiCcmn[] = this.rectificacionCcmnService.generarListaCambios();

  //       let noHayNuevosArchivos : boolean = !this.rectificacionCcmnService.seAgregoNuevosArchivos();

  //       let noHayCambios : boolean = listaCambios.length <= 0 && noHayNuevosArchivos;

  //       if ( noHayCambios ) {
  //         this.messageService.add({severity:"warn", summary: 'Mensaje', detail: "No se ha hecho ningun cambio en la DPMN"});
  //         return;
  //       }

  //       this.confirmationService.confirm({
  //         message: '&iquest;Desea modificar la Descarga provisional de mercanc&iacute;a nacionalizada DPMN?',
  //         header: 'Rectificar DPMN',
  //         icon: 'pi pi-question-circle',
  //         accept: () => {
  //           this.rectificacionCcmnService.rectificar(listaCambios);
  //         }
  //       });
  //     }

  //   });
  // }

  private eliminarSubscripciones() : void {
    this.archivosCcmnSubs.unsubscribe();
    this.grabadoCcmnSubs.unsubscribe();
    this.damSeriesCcmnSubs.unsubscribe();
  }



  get frmCtrlTipoDocumento() : AbstractControl {
    return this.adjuntosForm.get("tipoDocumento") as FormControl;
  }

  private buildForm() {
    this.adjuntosForm = this.formBuilder.group({
      tipoDocumento: ['', [Validators.required]]
    });
  }
}
