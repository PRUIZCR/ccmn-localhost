import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataCatalogo } from 'src/app/model/common/data-catalogo.model';
import {ConfirmationService} from 'primeng/api';
import {MessageService} from 'primeng/api';
import { ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConstantesApp } from 'src/app/utils/constantes-app';
import { Respuesta } from 'src/app/model/common/Respuesta';
import { Estado } from 'src/app/model/common/Estado';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { RegistroCcmnService } from 'src/app/services/registro-ccmn.service';
import { ArchivoCcmn } from 'src/app/model/bean/archivo-ccmn.model';
import { IdentificadorCcmn } from 'src/app/model/domain/identificador-ccmn.model';
import { ValDclRegistroDpmnService } from 'src/app/services/val-dcl-registro-dpmn.service';
import { SaldoSeriesService } from 'src/app/services/saldos-series.service';
import { RespuestaError } from 'src/app/model/common/response-error';
import { environment } from 'src/environments/environment';
import { TokenAccesoService } from 'src/app/services/token-acceso.service';

@Component({
  selector: 'app-archivo-adjunto',
  templateUrl: './archivo-adjunto.component.html',
  styleUrls: ['./archivo-adjunto.component.css'],
  providers: [ConfirmationService, MessageService, ValDclRegistroDpmnService]
})
export class ArchivoAdjuntoComponent implements OnInit {

  catalogoTipoDocAdjuntos: DataCatalogo[] = new Array();
  adjuntosForm!: FormGroup;

  archivo!: any;

  archivosCcmn : ArchivoCcmn[] = new Array();
  cargandoArchivo : boolean = false;

  mostrarDlgGuardarCcmn: boolean = false;

  rptaGrabarCcmn : Respuesta<IdentificadorCcmn> = new Respuesta<IdentificadorCcmn>();
  estado = Estado;

  generandoQR: boolean = false;

  private archivosCcmnSubs !: Subscription;
  private grabadoCcmnSubs !: Subscription;
  private errorValidacion: RespuestaError[] = new Array();

  @ViewChild('inputArchivo')
  inputArchivoRef!: ElementRef;

  constructor(  private formBuilder: FormBuilder,
                private registroCcmnService: RegistroCcmnService,
                private messageService: MessageService,
                private confirmationService: ConfirmationService,
                private renderer: Renderer2,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private catalogoService : CatalogoService,
                private saldoSeriesService: SaldoSeriesService,
                private valDclRegDpmService : ValDclRegistroDpmnService,
                private tokenAccesoService: TokenAccesoService ) { }

  ngOnInit(): void {
    this.catalogoService.cargarDesdeJson("assets/json/adjuntos-registrodpmn.json").subscribe((resultado : DataCatalogo[])=> this.catalogoTipoDocAdjuntos = resultado);
    this.buildForm();

    this.archivosCcmnSubs = this.registroCcmnService.archivosCcmn$.subscribe( ( respuesta : ArchivoCcmn[] ) => {
        this.archivosCcmn = [...respuesta];
        this.cargandoArchivo = false;
    });

    this.grabadoCcmnSubs = this.registroCcmnService.resultadoGrabadoCcmn$.subscribe( (respuesta : Respuesta<IdentificadorCcmn>) => {
      this.verificarEstadoGrabacion(respuesta);
    } );

    this.registroCcmnService.colocarPasoActual(3);
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
      this.registroCcmnService.adjuntarArchivo(this.archivo, tipoDoc);
      this.limpiarArchivo();
    }

  }

  eliminarArchivo( archivo : ArchivoCcmn ) : void {
    this.confirmationService.confirm({
      message: '&iquest;Desea retirar el archivo?',
      header: 'Retirar archivo',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.registroCcmnService.eliminarArchivo(archivo.id);
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
      if(this.registroCcmnService.getVieneDesdePci() == ConstantesApp.VIENE_DESDE_PCI) 
        window.location.href= `${environment.urlComponentPCI}?modulo=registro-pci&token=${this.tokenAccesoService.token}`;

      this.irAlInicioRegistroCcmn();
    }, () => {
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                detail: 'Ocurrió un error al generar el archivo PDF con el código QR de la CCMN'});
      if(this.registroCcmnService.getVieneDesdePci() == ConstantesApp.VIENE_DESDE_PCI) 
         window.location.href= `${environment.urlComponentPCI}?modulo=registro-pci&token=${this.tokenAccesoService.token}`;
                  
      this.irAlInicioRegistroCcmn();
    });
  }

  private irAlInicioRegistroCcmn() : void {
    this.registroCcmnService.limpiarData();
    this.generandoQR = false;
    this.mostrarDlgGuardarCcmn = false;
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  private obtenerTipoDocumento() : DataCatalogo {
      let codTipoDoc = this.frmCtrlTipoDocumento.value
      return this.catalogoTipoDocAdjuntos.find( ( dataCat : DataCatalogo ) => dataCat.codDatacat == codTipoDoc ) as DataCatalogo;
  }

  irPaginaAnterior(): void {
    this.eliminarSubscripciones();
    this.router.navigate(['../comprobantes'], { relativeTo: this.activatedRoute });
  }

  async grabarCcmn() {
    let mensajesValidacion : string[] = this.registroCcmnService.validarGrabacionCcmn();

    if ( mensajesValidacion.length > 0 ) {
      this.messageService.clear();
      mensajesValidacion.forEach((mensaje: string) => {
        this.messageService.add({severity:"warn", summary: 'Mensaje', detail: mensaje});
      });
      return;
    }

    //Valida saldos
    this.saldoSeriesService.validarSaldoSeries(this.registroCcmnService.getSeries()).subscribe((respuesta: any) => {
      this.errorValidacion = new Array();
      if (respuesta == true) {
        this.confirmationService.confirm({
          message: '&iquest;Desea registrar la CCMN?',
          header: 'Grabar CCMN',
          icon: 'pi pi-question-circle',
          accept: () => {
            this.registroCcmnService.grabarCcmn();
          }
        });
      } else {
        this.messageService.clear();
        let errorHttp: RespuestaError[] = respuesta;
        this.errorValidacion = errorHttp;
        this.errorValidacion.forEach(log => {
          this.messageService.add({severity:"warn", summary: 'Mensaje', detail: log.msg});
        })
      }

    }, (error: any) => {
      this.messageService.clear();
      let errorHttp: RespuestaError[] = error.error;
      this.errorValidacion = errorHttp;
      this.errorValidacion.forEach(log => {
        this.messageService.add({severity:"warn", summary: 'Mensaje', detail: log.msg});
      })
    });
  }

  cancelarGrabarCcmn(): void {
    this.confirmationService.confirm({
      message: '&iquest;Desea Salir?',
      header: 'Grabar CCMN',
      icon: 'pi pi-question-circle',
      accept: () => {
        if(this.registroCcmnService.getVieneDesdePci() == ConstantesApp.VIENE_DESDE_PCI) 
          window.location.href= `${environment.urlComponentPCI}?modulo=registro-pci&token=${this.tokenAccesoService.token}`;
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
          if(this.registroCcmnService.getVieneDesdePci() == ConstantesApp.VIENE_DESDE_PCI) 
            window.location.href= `${environment.urlComponentPCI}?modulo=registro-pci&token=${this.tokenAccesoService.token}`;
          this.irAlInicioRegistroCcmn();
        }
      });   
    } else {
        this.mostrarDlgGuardarCcmn = false;
    }
  }

  private eliminarSubscripciones() : void {
    this.archivosCcmnSubs.unsubscribe();
    this.grabadoCcmnSubs.unsubscribe();
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
