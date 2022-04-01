import { Component, Input, OnInit } from '@angular/core';
import { ChangeDetectorRef} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TipoRegistro } from 'src/app/model/common/tipo-registro';
import { PciDetalle } from 'src/app/model/domain/pcidetalle.model';
import { RegistroCcmnService } from 'src/app/services/registro-ccmn.service';
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
@Component({
  selector: 'app-ea-editccmn-motivo',
  templateUrl: './ea-editccmn-motivo.component.html',
  styleUrls: ['./ea-editccmn-motivo.component.scss']
})
export class EaEditccmnMotivoComponent implements OnInit {
  [x: string]: any;

  private URL_RESOURCE_DATOS_JEFE : string = 'http://192.168.56.106' + '/v1/recurso/humano/personal/e/personalsunat/';
  private URL_RESOURCE_DATOS_INFORME : string = 'http://192.168.56.106' + '/v1/recurso/administracion/tramitedoc/t/sia/datosexpediente/';
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
  esVisible!:boolean;
  constructor(private registroCcmnService: RegistroCcmnService,
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
     this.getValidarNumeroInforme();      
     
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
  var urlConsultaDetalle=this.URL_RESOURCE_DATOS_JEFE;
  var numeroRegistro = this.motivoForm.controls.numeroRegistro.value;
  return this.http.get<PersonalSunat>(urlConsultaDetalle+numeroRegistro) 
  .subscribe(async data=>{ this.personalSunat=data
      console.log('this.funcionarioAduanero: '+ this.personalSunat);
      this.getBuscarNombresApellidosJefe(this.personalSunat);
  });
}

getValidarNumeroInforme(){
  var aduana = this.motivoForm.controls.codAduanaDocumento.value;
  var anio = this.motivoForm.controls.anio.value;
  var area = this.motivoForm.controls.area.value;
  var numero = this.motivoForm.controls.numero.value;
  var urlConsultaInforme=this.URL_RESOURCE_DATOS_INFORME;
  this.strIdExpediente=aduana+'-'+area+'-'+anio+'-'+numero;
  this.esVisible=false;
  if (aduana == '' || anio == '' || area == '' || numero == '') {
    this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Para consultar por Número de Informe debe ingresar la aduana, area, año, y número' });
    return false;
  }
  return this.http.get<DatosExpediente>(urlConsultaInforme+this.strIdExpediente) 
  .subscribe(async data=>{ this.datosExpediente=data
      console.log('this.datosExpediente: '+ this.datosExpediente);
      this.esVisible=true;
  });



}

getBuscarNombresApellidosJefe(personalSunat:PersonalSunat){
  this.nombresApellidos=personalSunat.nomApePaterno.split(" ").join("")+' '+personalSunat.nomApeMaterno.split(" ").join("")+' '+personalSunat.nombres.trim();
  this.txtNombresApellidos.setValue( this.nombresApellidos);
}


get txAduanaDocumento() : AbstractControl {
  return this.motivoForm.get("codAduanaDocumento") as FormControl;
}

  get txtNumCcmn() : AbstractControl {
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

  // if (  this.faltaCompletarInformacion() ) {
  //   return;
  // }

  // this.guardarInformacion();
  // this.eliminarSubscripciones();
  //  sessionStorage.setItem("numCorrelativo", tipDocum?tipDocum.toString():"");
  //     sessionStorage.setItem("numCorrelativoDocumento", id2?.toString());
      // this.lstPci.forEach(
      //   (documentos: any)=>{
      //   this.numeroControlPaso=documentos.aduana.codDatacat + "-" + documentos.puestoControl.codDatacat + "-" + documentos.annPci + "-" + ('000000' + documentos.numPci).slice(-6)
      //    }
      //    );
      //    return this.numeroControlPaso;
      // this.router.navigate(['../datos-transporte']);    
      this.router.navigate(['../datos-transporte'], { relativeTo: this.activatedRoute });
}
regresarBandeja(){
  // this.rectificacionCcmnService.limpiarData();
  // this.router.navigateByUrl('/iaregistroccmn');
 }
}
