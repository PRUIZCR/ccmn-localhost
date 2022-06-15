import { Component, OnInit } from '@angular/core';
import { BuscarRectiCcmnService } from 'src/app/services/buscar-recti-ccmn.service';
import { TokenAccesoService } from 'src/app/services/token-acceso.service';
import { PerfilesUsuarioService } from 'src/app/services/perfiles-usuario.service';
import { UbicacionFuncionarioService } from 'src/app/services/ubicacion-funcionario.service';
import { UbicacionFuncionario } from 'src/app/model/bean/ubicacion-funcionario';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PuestoControl } from 'src/app/model/bean/PuestoControl';
import { AbstractControl,FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PrimeNGConfig, MessageService } from 'primeng/api';
import { Ruc } from 'src/app/model/bean/ruc.model';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { RucService } from '../../../../services/ruc.service';
import { CondicionRuc } from 'src/app/model/common/condicion-ruc.enum';
import { EstadoRuc } from 'src/app/model/common/estado-ruc.enum';
import { ParamBusqCcmnParaRectificar } from 'src/app/model/bean/param-busq-ccmn-para-rectificar.model';
import { ParamBusqPlacaVehiculo } from 'src/app/model/bean/param-busq-placa-vehiculo.model';
import { ParamBusqRangoFecha } from 'src/app/model/bean/param-busq-rango-fecha.model';
import { ParamBusqDcl } from 'src/app/model/bean/param-busq-dcl.model';
import { ParamBusqDocumento } from "src/app/model/bean/param-busq-documento";
import { ParamBusqFuncionario } from "src/app/model/bean/param-busq-funcionario";
import { ParamBusqConductor } from  "src/app/model/bean/param-busq-conductor";
import { Respuesta } from 'src/app/model/common/Respuesta';
import { ItemCcmnParaRectificar} from 'src/app/model/bean/item-ccmn-para-rectificar.model';
import { Estado } from 'src/app/model/common/Estado';
import { DataCatalogo } from 'src/app/model/common/data-catalogo.model';
import { MensajeBean } from "src/app/model/common/MensajeBean";
import { DniService } from 'src/app/services/dni.service';
import { Subscription } from "rxjs"
import { Dni } from 'src/app/model/bean/dni.model';
import { PerfilUsuario } from 'src/app/model/bean/usuario-perfil-item';

import { HttpClient} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ConstantesApp } from 'src/app/utils/constantes-app';
@Component({
  selector: 'app-buscar-ccmn',
  templateUrl: './buscar-ccmn.component.html',
  styleUrls: ['./buscar-ccmn.component.scss'],
  providers: [ DniService, MessageService, RucService, DatePipe]
})
export class BuscarCcmnComponent implements OnInit {

  consultaRectiCcmnForm!: FormGroup;
  private patternPlaca : string = "^[A-Z0-9]*$";
  date = new Date();
  catalogoPais: DataCatalogo[] = new Array();
  catalogoAduanas: DataCatalogo[] = new Array();
  catalogoRegimen: DataCatalogo[] = new Array();
  catalogoEstado: DataCatalogo[] = new Array();
  catalogoTiposDocIdentidad: DataCatalogo[] = new Array();
  mostrarDlgFuncionarioError: boolean = false;
  mostrarFormularioBusqueda: boolean = false;
  ubicacionFuncionario : UbicacionFuncionario = new UbicacionFuncionario();
  errorFuncionario : MensajeBean = new MensajeBean();
  mensajeFuncionario! :string ;
  maxLengthNumDoc: number = 6;
  rptaPuestoControl! : Respuesta<PuestoControl[]>;
  rptaUbicacionFuncionario : Respuesta<UbicacionFuncionario> =  Respuesta.create(new UbicacionFuncionario, Estado.LOADING);
  rucDestinatario! : Ruc;
  maxlengthNumDocConductor: number = 11;
  esDniConductor: boolean = false;
  esDni: boolean = false;
  rptaItemCcmnParaRectificar : Respuesta<ItemCcmnParaRectificar[]> = Respuesta.create(new Array, Estado.LOADING);;
  private busqDniSubs : Subscription = new Subscription;
  loadingConsultar = false;
  estadoBusqueda = Estado;
  perfilesUsuario : PerfilUsuario[] = new Array();
  tienePerfilJefeSupervisorFuncionario : boolean =false ;
  codPtoControlFuncionario!:string;
  codAduanaControlFuncionario!:string;
  aduanaFuncionario!:string;
  nroRegistro!:string;
  usuarioLogin!:string;

  lstPaisVehiculo: any;
  lstPaisVehiculoPuno: any;
  lstPaisVehiculoTacna: any;

  lstPuestoControl: any;
  cantPuestoControl:number=0;
  constructor(  private tokenAccesoService: TokenAccesoService,
                private ubicacionFuncionarioService: UbicacionFuncionarioService,
                private messageService: MessageService,
                private formBuilder: FormBuilder,
                private catalogoService: CatalogoService,
                private perfilesUsuarioService: PerfilesUsuarioService,
                private router:Router,
                private rucService : RucService,
                private dniService : DniService,
                private config: PrimeNGConfig,
                private datePipe: DatePipe,
                private activatedRoute: ActivatedRoute,
                private buscarRectiCcmnService : BuscarRectiCcmnService,
                private http: HttpClient
               ) { }

  ngOnInit(): void {
    this.cargarInformacionFuncionario();
    this.buildForm();
    this.config.setTranslation({
      accept: 'Accept',
      reject: 'Cancel',
      dayNamesMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
      monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"]
    });


    this.catalogoService.cargarDesdeJson("assets/json/paises.json").subscribe((resultado : DataCatalogo[])=> {
      this.catalogoPais = resultado;
    });

    this.catalogoService.cargarDesdeJson("assets/json/aduanas-busq-dam.json").subscribe((resultado : DataCatalogo[])=> {
     this.catalogoAduanas = resultado;
     let aduanaFuncionario = this.ubicacionFuncionario?.puestoControl?.aduana?.codigo;
     this.frmCtrlCodAduanaDocumento.setValue(aduanaFuncionario);
     this.frmCtrlCodAduanaDAM.setValue(aduanaFuncionario);
    });

    this.catalogoService.cargarDesdeJson("assets/json/regimen.json").subscribe((resultado : DataCatalogo[])=> {
      this.catalogoRegimen = resultado;
      this.frmCtrlCodRegimen.setValue("10");
      this.frmCtrlCodRegimen.disable();
    });

    this.catalogoService.cargarDesdeJson("assets/json/estados.json").subscribe((resultado : DataCatalogo[])=> {
      this.catalogoEstado = resultado;
    });

    this.catalogoService.cargarDesdeJson("assets/json/27.json").subscribe((resultado : DataCatalogo[]) => {
      this.catalogoTiposDocIdentidad = resultado;
      this.frmCtrlTipoDocIdentidadConductor.setValue("3");

    });
    this.getCatalogo('assets/json/paisPlaca.json', 3);
    this.getCatalogo('assets/json/paisPlacaPuno.json', 9);
    this.getCatalogo('assets/json/paisPlacaTacna.json', 10);

    this.iniCtrlRucRemitente();
    this.escucharRespuestaBusqDpmn();

    this.frmCtrlTipoDocIdentidadConductor.valueChanges.subscribe((value: string) => {
      this.configCtrlIdentidadConductor(value);
    });

    this.frmCtrlNumDocIdentidadConductor.valueChanges.subscribe((valor: string) => {
      if ( this.frmCtrlTipoDocIdentidadConductor.value == "3" ) {
        this.limpiarNombresConductor();
        this.dniService.buscar(valor, "1");
      }
    });

    this.busqDniSubs = this.dniService.rptaDni$.subscribe((valor: Respuesta<Dni>) => {
      this.completarDatosConductor(valor);
    });
  }

  private buildForm() {
    this.limpiar();
  }

  limpiar = () => {
    this.consultaRectiCcmnForm = this.formBuilder.group({
      tipoBusqueda: ['', [Validators.required]],
      codPaisPlaca: [''],
      numeroPlaca: ['', [Validators.minLength(5), Validators.pattern(this.patternPlaca)]],
      codAduanaDocumento: [{ value: '', disabled: true }],
      puestoControl: [{ value: '', disabled: true }],
      anoDocumento: [{ value: this.date.getFullYear(), disabled: true }],
      numeroDocumento: [{ value: '', disabled: true }],
      codAduanaDAM: [{ value: '', disabled: true }],
      anoDAM: [{ value: this.date.getFullYear(), disabled: true }],
      codRegimen: [{ value: this.obtenerRegimen("10"), disabled: true }],
      numeroDAM: [{ value: '', disabled: true }],
      numeroRucRemitente: [''],
      descRazonSocialRemitente: new FormControl(),
      tipoDocIdentidad :  [''],
      numDocIdentidad :  [''],
      nombreApellidoConductor :  [''],
      fechaInicio: new FormControl({ value: new Date(this.date.getFullYear(), this.date.getMonth(), 1), disabled: true }),
      fechaFin: new FormControl({ value: new Date(this.date.getFullYear(),this.date.getMonth(),this.date.getDate()), disabled: true }),
    });
    this.consultaRectiCcmnForm.controls.fechaInicio.disable;
    this.consultaRectiCcmnForm.controls.fechaFin.disable;
    this.iniCtrlRucRemitente();
    let aduanaFuncionario = this.ubicacionFuncionario?.puestoControl?.aduana?.codigo;
    this.frmCtrlCodAduanaDocumento.setValue(aduanaFuncionario);
    this.frmCtrlCodAduanaDAM.setValue(aduanaFuncionario);
    this.frmCtrlCodRegimen.setValue("10") ;
    this.frmCtrlTipoDocIdentidadConductor.setValue("3");
    this.frmCtrlPuestoControl.setValue(this.ubicacionFuncionario?.puestoControl?.codigo);
   }

  private cargarInformacionFuncionario(): void {
    this.nroRegistro = this.tokenAccesoService.nroRegistro;
    this.usuarioLogin = this.tokenAccesoService.login;
    this.ubicacionFuncionarioService.buscar(this.nroRegistro).subscribe( (ubicacion: UbicacionFuncionario) => {
      this.rptaUbicacionFuncionario = Respuesta.create(ubicacion, Estado.SUCCESS);
      this.ubicacionFuncionario = ubicacion;
      this.errorFuncionario = ubicacion.error;

      if ( this.errorFuncionario != null) {
        this.mostrarDlgFuncionarioError=true;
        this.mostrarFormularioBusqueda=false;
        this.mensajeFuncionario = "Al validar ubicación de funcionario aduanero, se ha obtenido el siguiente mensaje de error: ";
        let mensaje  =  this.errorFuncionario.msg + "\n" ;
          this.mensajeFuncionario =  this.mensajeFuncionario + mensaje;
      }else{
        this.mostrarDlgFuncionarioError=false;
        this.mostrarFormularioBusqueda=true;
        let aduanaFuncionario = this.ubicacionFuncionario?.puestoControl?.aduana?.codigo;
        this.frmCtrlCodAduanaDocumento.setValue(aduanaFuncionario);
        this.cargarAduanaPuno(aduanaFuncionario);
        //this.frmCtrlCodAduanaDAM.setValue(aduanaFuncionario);
        this.frmCtrlCodRegimen.setValue("10");
        this.aduanaFuncionario = aduanaFuncionario;

        this.frmCtrlPuestoControl.setValue(ubicacion?.puestoControl?.codigo);
        let arrPuestosControl : PuestoControl[] = new Array();
        let datCatPtoControl : PuestoControl = new PuestoControl();
        this.codPtoControlFuncionario = ubicacion?.puestoControl?.codigo;
        datCatPtoControl.codigo = ubicacion?.puestoControl?.codigo;
        datCatPtoControl.descripcion = ubicacion?.puestoControl?.descripcion;
        arrPuestosControl.push(datCatPtoControl);
        this.rptaPuestoControl = Respuesta.create(arrPuestosControl, Estado.SUCCESS);
        if( this.aduanaFuncionario=="019"){
          this.lstPaisVehiculo=this.lstPaisVehiculo;
        }else if(this.aduanaFuncionario=="172"){
          this.lstPaisVehiculo=this.lstPaisVehiculoTacna;
        }else if(this.aduanaFuncionario=="181"){
          this.lstPaisVehiculo=this.lstPaisVehiculoPuno;
        }
      }

    }, () => {
      this.rptaUbicacionFuncionario = Respuesta.create(new UbicacionFuncionario(), Estado.ERROR);
      this.rptaUbicacionFuncionario.agregarMensaje(1, "Ha ocurrido un error")
    });
  }
  cargarAduanaPuno(aduanaFuncionario:string){
    if(aduanaFuncionario=="181" ){
       aduanaFuncionario="262";
       this.frmCtrlCodAduanaDAM.setValue(aduanaFuncionario);
    }
}

/*Obtiene los valores a cargar en los dropdown*/
getCatalogo(url: string, tipojson: number) {
  return this.http
    .get<any>(url).subscribe((data) => {
    if (tipojson == 3) {
      this.lstPaisVehiculo = data;
    } else if (tipojson == 9) {
      this.lstPaisVehiculoPuno = data;
    }else if (tipojson == 10) {
      this.lstPaisVehiculoTacna = data;
      }
    }, error => {
      console.log({ error });
    })
}

  consultar() {
    this.loadingConsultar = true;
    this.rptaItemCcmnParaRectificar  = Respuesta.create(new Array, Estado.LOADING);;
    var tipo = this.frmCtrlTipoBusqueda.value;
    let enviaPlaca = this.frmCtrlCodPaisPlaca.value!=="" || this.frmCtrlNumeroPlaca.value !=="";
    let enviaConductor = this.frmCtrlTipoDocIdentidadConductor.value!=="" && this.frmCtrlNumDocIdentidadConductor.value!=="";
    let enviaRucRemitente = this.frmCtrlRucRemitente.value!=="";
    this.cargarCambioAduanaDAM();

    if (this.consultaRectiCcmnForm.invalid) {
      this.messageService.clear();
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Por favor seleccione uno de los criterios a consultar' });
      this.loadingConsultar = false;
      this.rptaItemCcmnParaRectificar.estado=Estado.ERROR
      return;
    }

    if (tipo == 1) {
      if (!this.cumpleValidacionPorNumeroDocumento()){
        this.loadingConsultar = false;
        return;
      }
    } else if (tipo == 2) {
      if (!this.cumpleValidacionPorDAM()){
        this.loadingConsultar = false;
        return;
      }
    } else {
      if (!this.cumpleValidacionPorFecha()){
        this.loadingConsultar = false;
        return;
      }
    }
    var paramConsultar = new ParamBusqCcmnParaRectificar();
    if (enviaRucRemitente){
      paramConsultar.rucRemitente= this.frmCtrlRucRemitente.value;
    }
    if (enviaPlaca)
    {
      paramConsultar.placaVehiculo =  new ParamBusqPlacaVehiculo();
      let enviaCodPais = this.frmCtrlCodPaisPlaca.value!=="";
      if (enviaCodPais)
          {  paramConsultar.placaVehiculo.codPais =  this.frmCtrlCodPaisPlaca.value;}
      let enviaPlacaVehiculo = this.frmCtrlNumeroPlaca.value!=="";
      if (enviaPlacaVehiculo)
          {  paramConsultar.placaVehiculo.numero =  this.frmCtrlNumeroPlaca.value;}
    }
    if (tipo == 1) {
      paramConsultar.documento = new ParamBusqDocumento();
      paramConsultar.documento.codAduana = this.frmCtrlCodAduanaDocumento.value;
      paramConsultar.documento.anio = this.frmCtrlAnoDocumento.value;
      paramConsultar.documento.numero = this.frmCtrlNumeroDocumento.value;
    }
    if (tipo == 2) {
      paramConsultar.declaracion = new ParamBusqDcl();
      paramConsultar.declaracion.codAduana = this.frmCtrlCodAduanaDAM.value;
      paramConsultar.declaracion.codRegimen = this.frmCtrlCodRegimen.value;
      paramConsultar.declaracion.numero = this.frmCtrlNumeroDAM.value;
      paramConsultar.declaracion.anio = this.frmCtrlAnoDAM.value;
    }
    if (tipo == 3) {
      paramConsultar.rangoFechaRegistro = new ParamBusqRangoFecha();
      paramConsultar.rangoFechaRegistro.fechaInicio = this.frmCtrlFechaInicio.value;
      var fechfin= this.frmCtrlFechaFin.value;
      paramConsultar.rangoFechaRegistro.fechaFin =  new Date(fechfin.getFullYear(),fechfin.getMonth(),fechfin.getDate(),23,59,59);

    }
    paramConsultar.funcionario = new ParamBusqFuncionario();
    paramConsultar.funcionario.usuario = this.usuarioLogin;
    paramConsultar.funcionario.codPtoControl=this.codPtoControlFuncionario;
    paramConsultar.funcionario.aduana=this.aduanaFuncionario;

    if (enviaConductor){
      paramConsultar.conductor =  new ParamBusqConductor();
      paramConsultar.conductor.codTipoDoc = this.frmCtrlTipoDocIdentidadConductor.value;
      paramConsultar.conductor.numDoc =this.frmCtrlNumDocIdentidadConductor.value;

    }

    this.perfilesUsuarioService.buscar(this.usuarioLogin, "CPASO_JEFE_SUPERVISOR").subscribe( (data : PerfilUsuario[]) => {

      if (data.length>0) {
        paramConsultar.funcionario.tienePerfilJefeSupervisor=true;
      }
      else {
    paramConsultar.funcionario.tienePerfilJefeSupervisor= false;

      }
      this.messageService.clear;
      /*Se consume el servicio REST de validacion y busqueda de CCMS*/
      this.buscarRectiCcmnService.buscarParaRectificar(paramConsultar);
      //this.loadingConsultar = false;

    },()  =>{
      paramConsultar.funcionario.tienePerfilJefeSupervisor=false;
    this.messageService.clear;
    /*Se consume el servicio REST de validacion y busqueda de CCMS*/
    this.buscarRectiCcmnService.buscarParaRectificar(paramConsultar);
      //this.loadingConsultar = false;
    })

  }

  private escucharRespuestaBusqDpmn() : void  {
    this.buscarRectiCcmnService.rptaBusqDcl$.subscribe((resultado : Respuesta<ItemCcmnParaRectificar[]>) =>{
    this.rptaItemCcmnParaRectificar=resultado;

      if ( resultado == null ) {
        return;
      }

      if ( resultado.estado === Estado.LOADING ) {
        return;
      }

      let isbusqNoExitosa = (resultado==null || resultado==undefined || resultado.estado != Estado.SUCCESS);
      var cumpleValidacion = false;

        if(isbusqNoExitosa){
          this.rptaItemCcmnParaRectificar.estado=Estado.SUCCESS;
          cumpleValidacion = false;
          this.messageService.clear();
          this.messageService.add({ key: 'msj', severity: 'warn', detail: "No existe información de CCMNs según criterio(s) ingresado(s)" });
          this.loadingConsultar = false;
          return;
        }else{
          cumpleValidacion = true;
        }


      if(cumpleValidacion){
        this.router.navigate(['../listar-ccmn'], { relativeTo: this.activatedRoute })
      }
    });


  }

  validarAnioDocumento = () => {
    if(this.consultaRectiCcmnForm.controls.anoDocumento.value > this.date.getFullYear()){
      this.messageService.clear();
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Año del documento no debe ser mayor a año actual' });
      this.consultaRectiCcmnForm.controls.anoDocumento.setValue('');
    }
  }

  onRadioChange = () => {
    var tipo = this.consultaRectiCcmnForm.controls.tipoBusqueda.value;

    if (tipo == 1) {
      this.enabledDocumento();
    } else if (tipo == 2) {
      this.enabledDAM();
    } else if (tipo == 3) {
      this.enabledFechas();
    }
  }

  enabledFechas = () => {
    this.consultaRectiCcmnForm.controls.fechaInicio.enable();
    this.consultaRectiCcmnForm.controls.fechaFin.enable();
    this.consultaRectiCcmnForm.controls.codAduanaDocumento.disable();
    this.consultaRectiCcmnForm.controls.puestoControl.disable();
    this.consultaRectiCcmnForm.controls.anoDocumento.disable();
    this.consultaRectiCcmnForm.controls.numeroDocumento.disable();
    this.consultaRectiCcmnForm.controls.codAduanaDAM.disable();
    this.consultaRectiCcmnForm.controls.anoDAM.disable();
    this.consultaRectiCcmnForm.controls.codRegimen.disable();
    this.consultaRectiCcmnForm.controls.numeroDAM.disable();
  }
  enabledDocumento = () => {
    this.consultaRectiCcmnForm.controls.codAduanaDocumento.enable();
    this.consultaRectiCcmnForm.controls.anoDocumento.enable();
    this.consultaRectiCcmnForm.controls.numeroDocumento.enable();
    this.consultaRectiCcmnForm.controls.puestoControl.enable();
    this.consultaRectiCcmnForm.controls.codAduanaDAM.disable();
    this.consultaRectiCcmnForm.controls.fechaInicio.disable();
    this.consultaRectiCcmnForm.controls.fechaFin.disable();
    this.consultaRectiCcmnForm.controls.anoDAM.disable();
    this.consultaRectiCcmnForm.controls.codRegimen.disable();
    this.consultaRectiCcmnForm.controls.numeroDAM.disable();
  }
  enabledDAM = () => {
    this.consultaRectiCcmnForm.controls.codAduanaDAM.disable();
    this.consultaRectiCcmnForm.controls.anoDAM.enable();
    this.consultaRectiCcmnForm.controls.codRegimen.enable();
    this.consultaRectiCcmnForm.controls.numeroDAM.enable();
    this.consultaRectiCcmnForm.controls.fechaInicio.disable();
    this.consultaRectiCcmnForm.controls.fechaFin.disable();
    this.consultaRectiCcmnForm.controls.codAduanaDocumento.disable();
    this.consultaRectiCcmnForm.controls.puestoControl.disable();
    this.consultaRectiCcmnForm.controls.anoDocumento.disable();
    this.consultaRectiCcmnForm.controls.numeroDocumento.disable();
  }

  private obtenerRegimen(codigo : string) : DataCatalogo {
    return this.catalogoRegimen.find(item => item.codDatacat == codigo) as DataCatalogo;
  }

  private obtenerAduana(aduana : string) : DataCatalogo {
    return this.catalogoAduanas.find(item => item.codDatacat == aduana) as DataCatalogo;
  }

  validarAnioDeclaracion = () => {
    if(this.consultaRectiCcmnForm.controls.anoDAM.value > this.date.getFullYear()){
      this.messageService.clear();
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Año de la declaración no debe ser mayor a año actual' });
      this.consultaRectiCcmnForm.controls.anoDAM.setValue('');
    }
  }

  private cargarCambioAduanaDAM() : void  {
    this.frmCtrlCodAduanaDAM.value?.codDatacat==="181"?this.frmCtrlCodAduanaDAM.setValue(this.obtenerAduana("262")):this.frmCtrlCodAduanaDAM.value;
  }
  private iniCtrlRucRemitente() : void {

    this.frmCtrlRucRemitente.valueChanges.subscribe((valor: string) => {

          this.rucDestinatario = new Ruc();

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
            this.messageService.clear();
            this.messageService.add({severity:"warn", summary: 'Mensaje',
                      detail: 'Numero de RUC no existe'});
          } );

        });
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

  private showMsgErrorCondicionEstadoRuc() : void {
    this.messageService.clear();
    this.messageService.add({severity:"warn", summary: 'Mensaje',
        detail: 'Número de RUC no se encuentra Activo o tiene la condición de No habido o No hallado'});
  }

  private limpiarNombresConductor() {
    this.frmCtrlNombreApellidoConductor.setValue("");
  }

  private completarDatosConductor(valor: Respuesta<Dni>) : void {
    if ( valor?.data != null && valor?.data.numero != null && valor?.estado == Estado.SUCCESS ) {
        let nombreCompleto = valor.data.nombres + " " + valor.data.nombres
        this.frmCtrlNombreApellidoConductor.setValue(nombreCompleto);

    } else {
      this.messageService.clear();
      this.limpiarNombresConductor();

      valor?.mensajes?.forEach( ( mensaje: MensajeBean ) => {
        this.messageService.add({severity:"warn", summary: 'Mensaje', detail: mensaje.msg});
      });

    }
  }

  private configCtrlIdentidadConductor(tipoDocIdentidad: string) : void {

    if ( tipoDocIdentidad == "3" ) {
      this.maxlengthNumDocConductor = 8;
      this.frmCtrlNombreApellidoConductor.setValue("");
      this.frmCtrlNombreApellidoConductor.disable();
      this.esDni = true;
      this.limpiarNombresConductor();
      return;
    }

    this.esDni = false;
    this.maxlengthNumDocConductor = 11;

    this.frmCtrlNumDocIdentidadConductor.setValue("");
    this.frmCtrlNombreApellidoConductor.setValue("");
    this.frmCtrlNombreApellidoConductor.disable();

  }

  cumpleValidacionPorNumeroDocumento(): any {
    var aduana = this.consultaRectiCcmnForm.controls.codAduanaDocumento.value;
    var anio = this.consultaRectiCcmnForm.controls.anoDocumento.value;
    var numero = this.consultaRectiCcmnForm.controls.numeroDocumento.value;

    if (aduana == '' || anio == '' || numero == '') {
      this.messageService.clear();
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Para consultar por Documento debe ingresar la aduana, año y número' });
      return false;
    }
    return true;
  }

  cumpleValidacionPorDAM(): any {
    var aduana = this.consultaRectiCcmnForm.controls.codAduanaDAM.value;
    var anio = this.consultaRectiCcmnForm.controls.anoDAM.value;
    var regimen = this.consultaRectiCcmnForm.controls.codRegimen.value;
    var numero = this.consultaRectiCcmnForm.controls.numeroDAM.value;

    if (aduana == '' || anio == '' || regimen == '' || numero == '') {
      this.messageService.clear();
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Para consultar por Declaración debe ingresar la aduana, año, régimen y número' });
      return false;
    }

    return true;
  }

  cumpleValidacionPorFecha(): any {
    var fechaInicio = this.consultaRectiCcmnForm.controls.fechaInicio.value;
    var fechaFin = this.consultaRectiCcmnForm.controls.fechaFin.value;
    var diasDif = fechaInicio.getTime() - fechaFin.getTime();
    var dias = Math.abs(Math.round(diasDif/(1000 * 60 * 60 * 24)));
    var fechaActual = new Date();
    this.messageService.clear();

    if (fechaInicio == null || fechaFin == null) {
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Para consultar por Fecha de registro debe ingresar fecha de inicio y fin' });
      return false;
    }

    if (fechaInicio > fechaActual) {
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'La fecha de inicio no puede ser mayor a la fecha actual' });
      return false;
    }

    if (fechaFin > fechaActual) {
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'La fecha de fin no puede ser mayor a la fecha actual' });
      return false;
    }

    if (fechaInicio > fechaFin) {
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'La fecha de inicio no puede ser mayor a la fecha fin' });
      return false;
    }

    if (dias > 5) {
      this.messageService.add({ key: 'msj', severity: 'warn', detail: 'Rango de Fecha a consultar no puede ser mayor a 5 dias' });
      return false;
    }

    return true;
  }



  /**Inicializando ****/
  get frmCtrlCodPaisPlaca() : AbstractControl {
    return this.consultaRectiCcmnForm.get('codPaisPlaca') as FormControl;
  }

  get frmCtrlNumeroPlaca() : AbstractControl {
    return this.consultaRectiCcmnForm.get('numeroPlaca') as FormControl;
  }

  get frmCtrlRucRemitente() : AbstractControl {
    return this.consultaRectiCcmnForm.get('numeroRucRemitente') as FormControl;
  }

  get frmCtrlRazonSocialDestinatario() : AbstractControl {
    return this.consultaRectiCcmnForm.get('descRazonSocialRemitente') as FormControl;
  }

  get frmCtrlCodAduanaDocumento() : AbstractControl {
    return this.consultaRectiCcmnForm.get('codAduanaDocumento') as FormControl;
  }

  get frmCtrlPuestoControl() : AbstractControl {
    return this.consultaRectiCcmnForm.get('puestoControl') as FormControl;
  }

  get frmCtrlAnoDocumento() : AbstractControl {
    return this.consultaRectiCcmnForm.get('anoDocumento') as FormControl;
  }

  get frmCtrlNumeroDocumento() : AbstractControl {
    return this.consultaRectiCcmnForm.get('numeroDocumento') as FormControl;
  }

  get frmCtrlCodAduanaDAM() : AbstractControl {
    return this.consultaRectiCcmnForm.get('codAduanaDAM') as FormControl;
  }

  get frmCtrlCodRegimen() : AbstractControl {
    return this.consultaRectiCcmnForm.get('codRegimen') as FormControl;
  }

  get frmCtrlAnoDAM() : AbstractControl {
    return this.consultaRectiCcmnForm.get('anoDAM') as FormControl;
  }

  get frmCtrlTipoDocIdentidadConductor() : AbstractControl {
    return this.consultaRectiCcmnForm.get('tipoDocIdentidad') as FormControl;
  }

  get frmCtrlNumDocIdentidadConductor() : AbstractControl {
    return this.consultaRectiCcmnForm.get('numDocIdentidad') as FormControl;
  }

  get frmCtrlNombreApellidoConductor() : AbstractControl {
    return this.consultaRectiCcmnForm.get('nombreApellidoConductor') as FormControl;
  }

  get frmCtrlNumeroDAM() : AbstractControl {
    return this.consultaRectiCcmnForm.get('numeroDAM') as FormControl;
  }

  get frmCtrlFechaInicio() : AbstractControl {
    return this.consultaRectiCcmnForm.get('fechaInicio') as FormControl;
  }
  get frmCtrlFechaFin() : AbstractControl {
    return this.consultaRectiCcmnForm.get('fechaFin') as FormControl;
  }

  get frmCtrlTipoBusqueda() : AbstractControl {
    return this.consultaRectiCcmnForm.get('tipoBusqueda') as FormControl;
  }

}
