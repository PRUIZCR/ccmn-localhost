import { ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TipoRegistro } from 'src/app/model/common/tipo-registro';
import { PciDetalle } from 'src/app/model/domain/pcidetalle.model';
//import { RegistroCcmnService } from 'src/app/services/registro-ccmn.service';
import { ConstantesApp } from 'src/app/utils/constantes-app';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Ccmn } from 'src/app/model/domain/ccmn.model';

import { environment } from 'src/environments/environment';
import { RectificacionCcmnService } from 'src/app/services/rectificacion-ccmn.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ea-editccmn-inicio',
  templateUrl: './ea-editccmn-inicio.component.html',
  styleUrls: ['./ea-editccmn-inicio.component.scss']
})
export class EaEditccmnInicioComponent implements OnInit {
  private URL_RESOURCE_DATOS_DECLARACION_CCMN : string = environment.urlBase + ConstantesApp.RESOURCE_DATOS_DECLARACION_CCMN;
  //private URL_RESOURCE_DATOS_DECLARACION_CCMN : string = 'http://localhost:7109' + '/v1/controladuanero/prevencion/cuentacorrienteimpo/e/ccmns/';
  pasoActual : number = 1;
  controlPasoForm!: FormGroup;
  tipoRegistro!:TipoRegistro;
  estado=TipoRegistro;
  titulo!:string;
  tituloPaso1!:string;
  pci!: PciDetalle;
  numeroCorrelativo !:string | null;
  ccmnEdit!: Ccmn;
  nroCcmn!:string;
  paisPlaca!:string;
  fechaNumeracion!:string;
  placa!:string;
  estadoCcmn!:string;
  placaCarreta!:string;
  observaciones!: string;
  private dataCcmn! : Ccmn;
  private damSeriesCcmnSubs! : Subscription;
  private ccmnSubs! : Subscription;
  private msgNewDamSerieCcmnSubs! : Subscription;
  constructor(
    //private registroCcmnService: RegistroCcmnService,
    private formBuilder: FormBuilder,
    private cdRef:ChangeDetectorRef,private http: HttpClient,
    private rectificacionCcmnService:RectificacionCcmnService) {
      this.buildForm();
     }

  ngOnInit(): void {
    this.tipoRegistro = this.rectificacionCcmnService.tipoRegistro;
    console.log('tipo'+ 'this.tipoRegistro ');
    this.rectificacionCcmnService.pasoActual$.subscribe( (numPaso : number) => {
        this.pasoActual = numPaso;
        this.cdRef.detectChanges();
    });

    //this.numeroCorrelativo="618";//CARGA tiene doc identidad
    //this.numeroCorrelativo="560";//BUS
    //this.numeroCorrelativo="676";//PARTICULAR
    // this.numeroCorrelativo=sessionStorage.getItem("numCorrelativo");
    // this.buscarCcmn(this.numeroCorrelativo);

    this.ccmnSubs = this.rectificacionCcmnService.ccmn$.subscribe((newCcmn : Ccmn) => {
      this.dataCcmn = newCcmn;
      if(this.dataCcmn.numCorrelativo!=null){
        this.completarDatosControlPaso(this.dataCcmn);
        this.buscarFlujoVehiculo(this.dataCcmn);
      }
      //this.observaciones = this.dataCcmn?.datoComplementario?.desObservacion;
     });

     this.rectificacionCcmnService.colocarPasoActual(1);

  }
  // buscarCcmn(numCorrelativo:string|null){
  //   const params=new HttpParams().set('anulado',true);
  //   var urlConsultaDetalle=this.URL_RESOURCE_DATOS_DECLARACION_CCMN;
  //   return this.http.get<Ccmn>(urlConsultaDetalle+numCorrelativo)
  //   .subscribe(async data=>{ this.ccmnEdit=data
  //     this.completarDatosControlPaso(this.ccmnEdit);
  //   });
  // }

  get txtNumCcmn() : AbstractControl {
    return this.controlPasoForm.get("numCcmn") as FormControl;
  }

  get txtFecRegistro() : AbstractControl {
    return this.controlPasoForm.get("fechaRegistro") as FormControl;
  }

  get txtEstado() : AbstractControl {
    return this.controlPasoForm.get("estado") as FormControl;
  }

  get txtPaisPlaca() : AbstractControl {
    return this.controlPasoForm.get("paisPlaca") as FormControl;
  }

  get txtPlaca() : AbstractControl {
    return this.controlPasoForm.get("placa") as FormControl;
  }

  get txtPlacaCarreta() : AbstractControl {
    return this.controlPasoForm.get("placaCarreta") as FormControl;
  }

  private buildForm() : void {
    this.controlPasoForm = this.formBuilder.group({
      numCcmn: ['', [Validators.required]],
      fechaRegistro: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      paisPlaca: ['', [Validators.required]],
      placa: ['', [Validators.required]],
      placaCarreta: ['', [Validators.required]]
    });
  }

  private completarDatosControlPaso(dataCcmn: Ccmn) : void {

    switch (this.tipoRegistro) {
      case "01":
          this.titulo = "Carga";
          break;
      case "02":
          this.titulo = "Buses";
          break;
      case "03":
          this.titulo = "Particulares";
          this.tituloPaso1 = "del Viaje y Responsable"
          break;
      case "04":
          this.titulo = "CAF";
          this.tituloPaso1 = "de la Empresa y Conductor"
          break;
      case "05":
          this.titulo = "TTA";
          this.tituloPaso1 = "de la Empresa y Responsable"
          break;
      default:
          this.titulo = "";
          break;
     }
     this.nroCcmn=dataCcmn.aduana.codDatacat+'-'+dataCcmn.puestoControl.codDatacat+'-'+dataCcmn.annCcmn+'-'+ this.dataCcmn.numCcmn;
     this.paisPlaca=dataCcmn.empresaTransporte?.paisPlaca?.codDatacat+ '-' +dataCcmn.empresaTransporte?.paisPlaca?.desDataCat;
     this.fechaNumeracion=dataCcmn.fecCcmn;
     this.placa=dataCcmn.empresaTransporte.nomPlaca;
     this.estadoCcmn=dataCcmn.estado.desDataCat;
     this.placaCarreta=dataCcmn.empresaTransporte.nomPlacaCarreta;

    this.txtFecRegistro.setValue(this.fechaNumeracion.substring(0,10));
    this.txtNumCcmn.setValue(this.nroCcmn);
    this.txtEstado.setValue(this.estadoCcmn);
    this.txtPaisPlaca.setValue(this.paisPlaca);
    this.txtPlaca.setValue( this.placa);
    this.txtPlacaCarreta.setValue(this.placaCarreta);
  }

  getColorControl(pci : PciDetalle) : string {

    let tipoControl : string = pci?.tipoControl?.codDatacat;

    if ( tipoControl == null ) {
      return "";
    }

    return ConstantesApp.COLOR_CONTROL.get(tipoControl) as string;
  }
  private eliminarSubscripciones() : void {

    this.damSeriesCcmnSubs.unsubscribe();
    this.ccmnSubs.unsubscribe();
    this.msgNewDamSerieCcmnSubs?.unsubscribe();
  }
  buscarFlujoVehiculo(dataCcmn: Ccmn){
    switch (dataCcmn.empresaTransporte?.flujoVehiculo?.codDatacat) {
      case this.estado.CARGA:
          this.tipoRegistro=this.estado.CARGA;
          break;
      case this.estado.BUS:
        this.tipoRegistro=this.estado.BUS;
          break;
      case this.estado.PARTICULAR:
        this.tipoRegistro=this.estado.PARTICULAR;
          break;
      case this.estado.CAF:
        this.tipoRegistro=this.estado.CAF;
          break;
      default:
          break;
  }
}
}
