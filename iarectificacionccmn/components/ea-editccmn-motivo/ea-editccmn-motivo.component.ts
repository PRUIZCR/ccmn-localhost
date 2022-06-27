import { Component, Input, OnInit } from '@angular/core';
import { ChangeDetectorRef} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TipoRegistro } from 'src/app/model/common/tipo-registro';
import { PciDetalle } from 'src/app/model/domain/pcidetalle.model';
//import { RegistroCcmnService } from 'src/app/services/registro-ccmn.service';
import { RectificacionCcmnService } from 'src/app/services/rectificacion-ccmn.service';
import { ConstantesApp } from 'src/app/utils/constantes-app';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Ccmn } from 'src/app/model/domain/ccmn.model';
import { PersonalSunat } from 'src/app/model/domain/personal-sunat.model';
import { TreeNode,MessageService, Message } from 'primeng/api';
import {TreeSelectModule} from 'primeng/treeselect';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataCatalogo } from 'src/app/model/common/data-catalogo.model';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { DatosExpediente } from 'src/app/model/bean/datos-expediente.model';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { FuncionarioAduanero } from 'src/app/model/domain/funcionario-aduanero.model';
import { Sustento } from 'src/app/model/bean/sustento.model';
import { Informe } from 'src/app/model/bean/informe.model';
import { datosFuncionario } from 'src/app/model/domain/datos-funcionario.model';
import { TokenAccesoService } from 'src/app/services/token-acceso.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-ea-editccmn-motivo',
  templateUrl: './ea-editccmn-motivo.component.html',
  styleUrls: ['./ea-editccmn-motivo.component.scss']
})
export class EaEditccmnMotivoComponent implements OnInit {
  [x: string]: any;
   private URL_RESOURCE_DATOS_JEFE_DE_REGISTRO : string = environment.urlBase  + ConstantesApp.RESOURCE_DATOS_JEFE_DE_REGISTRO;
   private URL_RESOURCE_DATOS_INFORME : string = environment.urlBase + ConstantesApp.RESOURCE_DATOS_INFORME;
  //private URL_RESOURCE_DATOS_JEFE : string = 'http://192.168.56.106' + '/v1/recurso/humano/personal/e/personalsunat/';
  //private URL_RESOURCE_DATOS_INFORME : string = 'http://192.168.56.106' + '/v1/recurso/administracion/tramitedoc/t/sia/datosexpediente/';
  motivoForm!: FormGroup;
  @Input() numCorrelativo="562";
  selectedNodes2: any[]=[];
  nodes3!: any[];
  numeroRegistro!:string;
  personalSunat!:PersonalSunat;
  datosExpediente!:DatosExpediente;
  nombresApellidos!:string;
  date = new Date();
  catalogoAduanas: DataCatalogo[] = new Array();
  strIdExpediente!:string;
  aduana!:string;
  area!:string;
  anio!:string;
  numero!:string;
  esDeshabilitado!:boolean;
  codUO!:string;
  codAduanaCCmmn!:string;
  private ccmnSubs! : Subscription;
  private msgNewDamSerieCcmnSubs! : Subscription;
  constructor(
    //private registroCcmnService: RegistroCcmnService,
    private rectificacionCcmnService: RectificacionCcmnService,
    private formBuilder: FormBuilder,private messageService: MessageService,
    private cdRef:ChangeDetectorRef,private http: HttpClient,
    private catalogoService: CatalogoService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.buildForm();
  }

  ngOnInit(): void {
    this.getFiles().then(files => this.nodes3 = files);

    this.catalogoService.cargarDesdeJson("assets/json/aduanas-busq-exp.json").subscribe((resultado : DataCatalogo[])=> {
      this.catalogoAduanas = resultado;
     });
     this.rectificacionCcmnService.colocarPasoActual(1);
     this.esDeshabilitado=true;
     this.ccmnSubs = this.rectificacionCcmnService.ccmn$.subscribe((newCcmn : Ccmn) => {
      this.dataCcmn = newCcmn;
      if(this.dataCcmn.numCorrelativo!=null){
        this.codAduanaCCmmn=this.dataCcmn.aduana.codDatacat;
       }
      //this.observaciones = this.dataCcmn?.datoComplementario?.desObservacion;
     });

  }


getNumCorrelativo(){
  console.log(this.numCorrelativo);
  return this.numCorrelativo;
}

getFiles() {
  return this.http.get<any>('assets/json/files.json')
    .toPromise()
    .then(res => <TreeNode[]>res.data);
  }


getNombreJefeAutoriza(){
  var urlConsultaDetalle=this.URL_RESOURCE_DATOS_JEFE_DE_REGISTRO;
  var numeroRegistro = this.motivoForm.controls.numeroRegistro.value;
  if(numeroRegistro.trim()==''){
    this.messageService.clear();
    this.txtNombresApellidos.setValue('');
    this.messageService.add({ key: 'msj', severity: 'warn', detail: 'El registro ingresado no corresponde a un directivo de la aduana: ' + this.codAduanaCCmmn });
    return;
  }

  var numeroRegistro = this.motivoForm.controls.numeroRegistro.value;
  return this.http.get<datosFuncionario>(urlConsultaDetalle+numeroRegistro)
  .subscribe(async data=>{ this.datosFuncionario=data
      this.aduanaFuncionario=this.datosFuncionario.codAduana;
      this.validardatosFuncionario(this.aduanaFuncionario);
  });


}

validardatosFuncionario(aduanaFuncionario:string){
    if(aduanaFuncionario==this.codAduanaCCmmn&&this.datosFuncionario.esDirectivoUUOO){
        this.getBuscarNombresApellidosJefe(this.datosFuncionario);
    }else{
    this.messageService.clear();
    this.txtNombresApellidos.setValue('');
    this.messageService.add({ key: 'msj', severity: 'warn', detail: 'El registro ingresado no corresponde a un directivo de la aduana: ' + this.codAduanaCCmmn  });
}
}



getValidarNumeroInforme(){
  var aduana = this.motivoForm.controls.codAduanaDocumento.value;
  var anio = this.motivoForm.controls.anio.value;
  var area = this.motivoForm.controls.area.value;
  var numero = this.motivoForm.controls.numero.value;
  var urlConsultaInforme=this.URL_RESOURCE_DATOS_INFORME;
  this.strIdExpediente=aduana+'-'+area+'-'+anio+'-'+numero;
  if (aduana == '' || anio == '' || area == '' || numero == '') {
    this.esDeshabilitado=true;
    this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Para consultar por Número de Informe debe ingresar la aduana, area, año, y número' });
    return false;
  }
  return this.http.get<DatosExpediente>(urlConsultaInforme+this.strIdExpediente)
  .subscribe(async data=>{ this.datosExpediente=data
      console.log('this.datosExpediente: '+ this.datosExpediente);
      this.esDeshabilitado=false;
  });
}

getBuscarNombresApellidosJefe(datosFuncionario:PersonalSunat){
  this.nombresApellidos=datosFuncionario.nomApePaterno.split(" ").join("")+' '+datosFuncionario.nomApeMaterno.split(" ").join("")+' '+datosFuncionario.nombres.trim();
  this.txtNombresApellidos.setValue( this.nombresApellidos);
}


get txAduanaDocumento() : AbstractControl {
  return this.motivoForm.get("codAduanaDocumento") as FormControl;
}

  get txtMotRectificacion() : AbstractControl {
    return this.motivoForm.get("motivoRectificacion") as FormControl;
  }

  get motivoRectificacion() : AbstractControl {
    return this.motivoForm.get("observaciones") as FormControl;
  }

  get txtNumeroRegistro() : AbstractControl {
    return this.motivoForm.get("numeroRegistro") as FormControl;
  }

  get txtNombresApellidos() : AbstractControl {
    return this.motivoForm.get("nombresApellidos") as FormControl;
  }

  get txtArea() : AbstractControl {
    return this.motivoForm.get("area") as FormControl;
  }

  get txtAnio() : AbstractControl {
    return this.motivoForm.get("anio") as FormControl;
  }

  get txtNumero() : AbstractControl {
    return this.motivoForm.get("numero") as FormControl;
  }
private buildForm() : void {
  this.motivoForm = this.formBuilder.group({
    codAduanaDocumento: ['', [Validators.required]],
    motivoRectificacion:['', [Validators.required]],
    observaciones: ['', [Validators.required]],
    numeroRegistro: ['', [Validators.required]],
    nombresApellidos: ['', [Validators.required]],
    area: ['', [Validators.required]],
    anio: ['', [Validators.required]],
    numero: ['', [Validators.required]]

  });
}
validarAnioDocumento(){
  if(this.motivoForm.controls.anio.value > this.date.getFullYear()){
    this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Año del documento no debe ser mayor a año actual' });
    this.motivoForm.controls.anio.setValue('');
  }
}

onChangeTipoDoc() {
    const tipoMotivo= this.motivoForm.controls.tipoDocumento.value;
    if(tipoMotivo=="01"){

    }
//  console.log('tipo: ' + this.tipoDocumentoform);
//  if (this.tipoDocumentoform == "1") {
//    this.maxLengthNumDoc = 10;
//    this.esVisible = true;

//    this.consultaForm.controls.numeroDocumento.setValue('');
//    this.getCatalogo('assets/json/estadosccmn.json', 7);
//  } else {
//    this.maxLengthNumDoc = 6;
//    this.esVisible = false;

//    this.consultaForm.controls.numeroDocumento.setValue('');
//    this.getCatalogo('assets/json/estados.json', 6);
//  }
 //this.enviar(this.tipoDocumentoform);
}
private faltaCompletarInformacion() : boolean {
  let formularioValido = this.motivoForm.valid;
  this.messageService.clear();
    if ( !formularioValido ) {
      this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Falta completar información'});
      return true;
    }

  return false;
}
private guardarInformacion() : void {

}
irPaginaSiguiente() : void {
let motiRec=this.txtMotRectificacion.value;
      if(motiRec.length <=0){
        this.messageService.clear();
        this.txtNombresApellidos.setValue('');
        this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Debe ingresar el motivo de rectificación'  });
        return;
      }

      let jefeAutoriza=this.motivoForm.controls.numeroRegistro.value;
      if(jefeAutoriza.length <=0){
        this.messageService.clear();
        this.txtNombresApellidos.setValue('');
        this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Debe ingresar el registro del superior que autoriza'  });
        return;
      }
      this.completarSustento();
      this.router.navigate(['../datos-transporte'], { relativeTo: this.activatedRoute });
}
regresarBandeja(){
  //this.rectificacionCcmnService.limpiarData();
  this.router.navigate(['../listar-ccmn'], { relativeTo: this.activatedRoute });
 }

completarSustento() : void {
  let sustento : Sustento = new Sustento();

  let funcionario : FuncionarioAduanero = new FuncionarioAduanero();
  funcionario.nroRegistro = this.txtNumeroRegistro.value;
  funcionario.nombre = this.txtNombresApellidos.value;

  let informe : Informe = new Informe();
  informe.area = this.txtArea.value;
  informe.anio = Number(this.txtAnio.value);
  informe.numero = this.txtNumero.value;

  sustento.informe = informe;
  sustento.jefeAutoriza = funcionario;
  sustento.observaciones = this.motivoRectificacion.value;

  sustento.motivo = [];

  this.selectedNodes2?.forEach( ( itemMotivo : any ) => {
    let motivoDatCat : DataCatalogo = new DataCatalogo();
    motivoDatCat.codDatacat = itemMotivo.codigo;
    motivoDatCat.desDataCat = itemMotivo.label;
    sustento.motivo.push(motivoDatCat);
  });

  this.rectificacionCcmnService.putSustentoRectificacion(sustento);
}


}
