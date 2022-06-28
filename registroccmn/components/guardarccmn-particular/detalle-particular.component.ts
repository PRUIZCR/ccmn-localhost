import { Component,OnInit } from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';
import { Router } from '@angular/router';
import { throwError} from 'rxjs';
import { map, catchError} from 'rxjs/operators';
import { HttpClient, HttpErrorResponse} from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { DocumentodescargaService } from 'src/app/services/documentodescarga.service';
import { DocumentoDpmn } from 'src/app/model/domain/documentoDpmn';

import { environment } from 'src/environments/environment';
import { ConstantesApp } from 'src/app/utils/constantes-app';
import { DamSerieCcmn } from 'src/app/model/domain/dam-serie-ccmn.model';
import { RespuestaError } from 'src/app/model/common/response-error';
import { Ccmn } from 'src/app/model/domain/ccmn.model';
import { TokenAccesoService } from 'src/app/services/token-acceso.service';
import { Respuesta } from 'src/app/model/common/Respuesta';
import { IdentificadorCcmn } from 'src/app/model/domain/identificador-ccmn.model';
import { Estado } from 'src/app/model/common/Estado';
import { TipoRegistro } from 'src/app/model/common/tipo-registro';
import { RegistroCcmnService } from 'src/app/services/registro-ccmn.service';
import { PciDetalle } from 'src/app/model/domain/pcidetalle.model';


@Component({
  selector: 'detalle-particular',
  templateUrl: './detalle-particular.component.html',
  styleUrls:['./detalle-particular.component.css'],
  providers: [MessageService]
})
export class DetalleParticularComponent implements OnInit {
  [x: string]: any;

  datosConfirmarDpmn!: FormGroup;

  private URL_RESOURCE_DATOS_DECLARACION : string = environment.urlBase + ConstantesApp.RESOURCE_DATOS_DECLARACION;
  private URL_RESOURCE_ENDPOINT_CCMN: string = environment.urlBase + ConstantesApp.RESOURCE_ENDPOINT_CCMN;
  

  loading: boolean = true;
  respuestaData: any;

  pciDetalle!: PciDetalle;

  localEmpresaTransporte = [];
  constructor(private documentodescargaService:DocumentodescargaService,
    private router:Router,
    private http: HttpClient,
    private messageService: MessageService,
    private tokenAccesoService: TokenAccesoService,
    private registroCcmnService: RegistroCcmnService,
    private rutaActiva: ActivatedRoute,
    private formBuilder: FormBuilder){  }

  ngOnInit() {
    //this.pciDetalle = this.registroCcmnService.pciDetalle;
    this.pciDetalle = this.registroCcmnService.getPciDetalle();
    this.buildFormConfirmarDpmn();
  }



  private buildFormConfirmarDpmn() {
    this.datosConfirmarDpmn = this.formBuilder.group({
      paisPlaca: [{ value: sessionStorage.getItem("paisPlaca"), disabled: true}],
      numPlaca: [{ value: sessionStorage.getItem("placa"), disabled: true}],
      canalControl : [{ value: sessionStorage.getItem("canalControl"), disabled: true}],
      controlPaso: [{ value: sessionStorage.getItem("numeroDeControlPaso"), disabled: true}]
    });
  }

  btnSalir(){
    this.registroCcmnService.limpiarData();
    this.router.navigateByUrl('/iaregistroccmn/registroccmn');
  }

  async validarCCMN(){
    this.damSeriesCcmn = new Array();
    this.serieCcmn = new DamSerieCcmn;
    this.errorValidacion = new Array();
  }

  continuarRegistroCcmn() : void {
    this.registroCcmnService.tipoRegistro = TipoRegistro.PARTICULAR;
    this.router.navigate(['../datos-transporte'], { relativeTo: this.rutaActiva });
  }

  getColorControl(pci : PciDetalle) : string {

    let tipoControl : string = pci?.tipoControl?.codDatacat;

    if ( tipoControl == null ) {
      return "";
    }

    return ConstantesApp.COLOR_CONTROL.get(tipoControl) as string;
  }

}