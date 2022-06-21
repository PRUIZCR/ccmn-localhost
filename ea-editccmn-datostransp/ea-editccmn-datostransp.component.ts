
import { Component, Input, OnInit, Output } from '@angular/core';

import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { PuestoControl } from 'src/app/model/bean/PuestoControl';
import { Respuesta } from 'src/app/model/common/Respuesta';
import { Dni } from 'src/app/model/bean/dni.model';
import { Estado } from 'src/app/model/common/Estado';
import { EmpresaTransporte } from 'src/app/model/domain/empresa-transporte.model';
import { DataCatalogo } from 'src/app/model/common/data-catalogo.model';
import { Conductor } from 'src/app/model/domain/conductor.model';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Ruc } from 'src/app/model/bean/ruc.model';
import { PaisesService } from 'src/app/services/paises.service';
import { MensajeBean } from 'src/app/model/common/MensajeBean';
import { ConstantesApp } from 'src/app/utils/constantes-app';
import { CondicionRuc } from 'src/app/model/common/condicion-ruc.enum';
import { EstadoRuc } from 'src/app/model/common/estado-ruc.enum';
import { TipoNacionalidad } from 'src/app/model/common/tipo-nacionalidad.enum';
import { UbicacionFuncionarioService } from 'src/app/services/ubicacion-funcionario.service';
import { EmpredtiService } from 'src/app/services/empredti.service';
import { UbicacionFuncionario } from 'src/app/model/bean/ubicacion-funcionario';
import { Empredti } from 'src/app/model/bean/empredti';
import { Entvehiculo } from 'src/app/model/bean/entvehiculo';
import { DniService } from 'src/app/services/dni.service';
import { TokenAccesoService } from 'src/app/services/token-acceso.service';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { RucService } from 'src/app/services/ruc.service';
import { EntvehiculoService } from 'src/app/services/entvehiculo.service';
import { PciDetalle } from 'src/app/model/domain/pcidetalle.model';
import { Ccmn } from 'src/app/model/domain/ccmn.model';
import { BuilderCcmnService } from 'src/app/services/builder-ccmn.service';
//import { RegistroCcmnService } from 'src/app/services/registro-ccmn.service';
import { RectificacionCcmnService } from 'src/app/services/rectificacion-ccmn.service';
import { TipoRegistro } from 'src/app/model/common/tipo-registro';
import { Responsable } from 'src/app/model/domain/responsable.model';
import { PuestoControlService } from 'src/app/services/puesto-control.service';
import { Ubigeo } from 'src/app/model/domain/ubigeo.model';
import { UbigeoService } from 'src/app/services/ubigeo.service';
import { PaisesServicEmprNac } from 'src/app/services/paises.nac.service';
import{BuscarCcmnService} from 'src/app/services/buscar-ccmn.service';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
@Component({
  selector: 'app-ea-editccmn-datostransp',
  templateUrl: './ea-editccmn-datostransp.component.html',
  styleUrls: ['./ea-editccmn-datostransp.component.scss'],
  providers: [DniService, BuilderCcmnService, MessageService, RucService]
})
export class EaEditccmnDatostranspComponent implements OnInit {


  private URL_RESOURCE_DATOS_DECLARACION_CCMN : string = environment.urlBase + ConstantesApp.RESOURCE_DATOS_DECLARACION_CCMN;
  //private URL_RESOURCE_DATOS_DECLARACION_CCMN : string = 'http://localhost:7109' + '/v1/controladuanero/prevencion/cuentacorrienteimpo/e/ccmns/';

  private patternLicencia : string = "^[A-Z0-9]*$";
  private patternNumTelefono : string = "^[0-9]*$";
  private patternPlaca : string = "^[A-Z0-9]*$";
  //private dataCcmn : Ccmn = new Ccmn;
  private busqDniSubs : Subscription = new Subscription;
  private busqDniResSubs : Subscription = new Subscription;
  private dataCcmnSubs : Subscription = new Subscription;
  private paisesAduCtrlSubs : Subscription = new Subscription;
  private paisesAduEmpNacionalCtrlSubs : Subscription = new Subscription;

  descIdentificacion : string = "Identificación";
  mostrarDlgRucNoValido: boolean = false;
  mostrarResponsable: boolean = false;
  esDniConductor: boolean = false;
  esDniResponsable: boolean = false;

  catalogoPaises: DataCatalogo[] = new Array();
  catalogoPais: DataCatalogo[] = new Array();
  catalogoPaisesEmpNac: DataCatalogo[] = new Array();
  catalogoAduanasDescarga: DataCatalogo[] = new Array();
  catalogoTiposDocIdentidad: DataCatalogo[] = new Array();
  catalogoTiposNacionalidad: DataCatalogo[] = new Array();
  catalogoFlujoVehiculo: DataCatalogo[] = new Array();
  lstTipoDocumentoIdentidad:  DataCatalogo[] = new Array();
  tipoDocIdentidad:string = "";
  datosTransporteForm: FormGroup = new FormGroup({});
  maxlengthNumDocConductor: number = 11;
  maxlengthNumDocResponsable: number = 11;
  rptaPuestoControl : Respuesta<PuestoControl[]> = new Respuesta<PuestoControl[]>();
  ubicacionFuncionario: UbicacionFuncionario = new UbicacionFuncionario;
  maxlengthNumIdentificacion: number = 0;
  tipoRegistro!:TipoRegistro;
  estado = TipoRegistro;
  aas!: Observable<PuestoControl[]>;
  descErrorIdentificacionEmpTrans: string = "Debe ingresare el dato solicitado";
  descErrorNombreEmpresa: string = "Ingresar el nombre de la empresa";
  numeroCorrelativo !:string | null;
  newCcmn!: Ccmn;
  flujoVehiculo:string="";
  numDocIdenConductorC:string="";
  tipoNacionalidadC:string="";
  nombreC:string="";
  apellidoC:string="";

  private dataCcmn! : Ccmn;
  private damSeriesCcmnSubs! : Subscription;
  private ccmnSubs! : Subscription;

  mostrarFormConductor : boolean = false;
  mostrarFormResponsable : boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    //private registroCcmnService : RegistroCcmnService,
    private rectificacionCcmnService:RectificacionCcmnService,
    private builderCcmn : BuilderCcmnService,
    private messageService: MessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private catalogoService: CatalogoService,
    private tokenAccesoService: TokenAccesoService,
    private rucService: RucService,
    private paisesService: PaisesService,
    private paisesServiceNac: PaisesServicEmprNac,
    private ubicacionFuncionarioService: UbicacionFuncionarioService,
    private empredtiService: EmpredtiService,
    private entvehiculoService: EntvehiculoService,
    private dniService : DniService,
    private puestoControlService: PuestoControlService,
    private ubigeoService : UbigeoService,
    private buscarCcmnService : BuscarCcmnService,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {

    this.buildForm();
    this.getCatalogo('assets/json/27.json', 13);
    this.iniciarSuscripciones();

    this.ccmnSubs = this.rectificacionCcmnService.ccmn$.subscribe((newCcmn : Ccmn) => {
      this.dataCcmn = newCcmn;
      if(this.dataCcmn.numCorrelativo!=null){
        this.buscarFlujoVehiculo(this.dataCcmn);
        this.buscarInformacionConductor(this.dataCcmn);
        this.evalShowFormResponOrConductor();
      }
      //this.observaciones = this.dataCcmn?.datoComplementario?.desObservacion;
     });

    this.rectificacionCcmnService.colocarPasoActual(2);

  }

  private evalShowFormResponOrConductor() : void {
    this.mostrarFormConductor = this.dataCcmn.conductor != null;
    this.mostrarFormResponsable = this.dataCcmn.responsable != null;
  }

 /*Obtiene los valores a cargar en los dropdown*/
 getCatalogo(url: string, tipojson: number) {
  return this.http
    .get<any>(url).subscribe((data) => {
      if (tipojson == 13) {
        this.lstTipoDocumentoIdentidad = data;
      }
    }, error => {
      console.log({ error });
    })
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
  buscarInformacionConductor(dataCcmn: Ccmn){

    let noHayConductor = dataCcmn.conductor == null;

    if ( noHayConductor ) {
      return;
    }

    this.numDocIdenConductorC=dataCcmn.conductor.numDocIdentidad;
    this.nombreC=dataCcmn.conductor.nomConductor;
    this.apellidoC=dataCcmn.conductor.apeConductor;
    this.tipoNacEmpTrans.setValue(dataCcmn.empresaTransporte.tipoNacionalidad.codDatacat);
    this.numDocIdenConductor.setValue(this.numDocIdenConductorC);
    this.apellidoConductor.setValue( dataCcmn.conductor.apeConductor);
    this.nombreConductor.setValue(dataCcmn.conductor.nomConductor);
    this.identificacionEmpTrans.setValue(dataCcmn.empresaTransporte.numDocIdentidad);
    this.nombreEmpTrans.setValue(dataCcmn.empresaTransporte.nomEmpresa);
    this.tipoDocIdenConductor.setValue(dataCcmn.conductor.tipoDocIdentidad.codDatacat)
    this.identificacionEmpTrans.valueChanges.subscribe( (valor: string) => {
      this.mostrarNombreEmpresa(valor);
     });
 }
 private iniciarSuscripciones() {

  this.catalogoService.cargarDesdeJson("assets/json/27.json").subscribe((resultado : DataCatalogo[]) => {
    this.catalogoTiposDocIdentidad = resultado;
    this.tipoDocIdenConductor.setValue("3");
    this.tipoDocumentoResponsable.setValue("3");
  });

    this.catalogoService.cargarDesdeJson("assets/json/143.json").subscribe((resultado : DataCatalogo[]) => {
      this.catalogoTiposNacionalidad = resultado;
      if(this.tipoRegistro == this.estado.TTA)
        this.tipoNacEmpTrans.setValue("");
    });

  // this.catalogoService.cargarDesdeJson("assets/json/flujo-vehiculo.json").subscribe((resultado : DataCatalogo[]) => {
  //   this.catalogoFlujoVehiculo = resultado;
  //   switch (this.tipoRegistro) {
  //     case this.estado.BUS:
  //         this.flujoVehiculoEmpTrans.setValue("02");
  //         break;
  //     case this.estado.PARTICULAR:
  //         this.flujoVehiculoEmpTrans.setValue("03")
  //         break;
  //     case this.estado.CAF:
  //         this.flujoVehiculoEmpTrans.setValue("01")
  //         break;
  //     default:
  //         break;
  // }
  // });

  this.paisesAduCtrlSubs = this.paisesService.rptPaisesAduCtrl$.subscribe( (resultado : DataCatalogo[]) => {
    this.catalogoPaises = resultado;
  });

  this.paisesAduEmpNacionalCtrlSubs = this.paisesServiceNac.rptPaisesEmprNacional$.subscribe( (resultado : DataCatalogo[]) => {
    this.catalogoPaisesEmpNac = resultado;
  });

  // this.aduanaDescarga.valueChanges.subscribe((value: string) => {
  //   if ( value?.length > 0 ) {
  //     this.paisesService.buscarPaisesPorAduaCtrl(value, this.tipoNacEmpTrans.value);
  //     this.paisesServiceNac.buscarPaisesPorAduaEmpNacional(value, this.tipoNacEmpTrans.value);
  //   }
  // });

    this.tipoNacEmpTrans.valueChanges.subscribe((value: string) => {
      this.identificacionEmpTrans.setValue("");
      // this.paisesService.buscarPaisesPorAduaCtrl(this.aduanaDescarga.value, this.tipoNacEmpTrans.value);
      // this.paisesServiceNac.buscarPaisesPorAduaEmpNacional(this.aduanaDescarga.value, this.tipoNacEmpTrans.value);

      if ( value == "0" ) {
        this.descIdentificacion = "RUC";
        this.maxlengthNumIdentificacion = 11;
        this.descErrorIdentificacionEmpTrans = "Debe ingresar el RUC de la empresa";
        this.descErrorNombreEmpresa = "Debe ingresar la razón social de la empresa";
      } else if ( value == "1" ) {
        this.descIdentificacion = "Código";
        this.maxlengthNumIdentificacion = 4;
        this.descErrorIdentificacionEmpTrans = "Debe ingresar el código de la empresa";
        this.descErrorNombreEmpresa = "Debe ingresar el nombre de la empresa";
      }

    });

  // this.identificacionEmpTrans.valueChanges.subscribe( (valor: string) => {
  //   this.mostrarNombreEmpresa(valor);
  // });

  // this.tipoDocIdenConductor.valueChanges.subscribe((value: string) => {
  //     this.configCtrlIdentidadConductor(value==undefined?"3":value);
  // });

  // this.tipoDocumentoResponsable.valueChanges.subscribe((value: string) => {
  //   this.configCtrlIdentidadResponsable(value==undefined?"3":value);
  //  });

  // this.numDocIdenConductor.valueChanges.subscribe((valor: string) => {
  //   if ( this.tipoDocIdenConductor.value == "3" ) {
  //     this.limpiarNombresConductor();
  //     // this.dniService.buscar(valor, "1");
  //   }
  // });

  // this.numDocIdenResponsable.valueChanges.subscribe((valor: string) => {
  //   if ( this.tipoDocumentoResponsable.value == "3" ) {
  //     this.nombreResponsable.setValue("");
  //     this.apellidoResponsable.setValue("");
  //     this.dniService.buscarResponsable(valor, "2");
  //   }
  // });

  this.placaEmpTrans.valueChanges.subscribe( (valor: string) => {
    this.validarPlacaEmpTrans(valor);
  });

  this.busqDniSubs = this.dniService.rptaDni$.subscribe((valor: Respuesta<Dni>) => {
      this.completarDatosConductor(valor);
  });

  // this.busqDniResSubs = this.dniService.rptaDniRes$.subscribe((valor: Respuesta<Dni>) => {
  //     this.completarDatosResponsable(valor);
  // });

  this.dataCcmnSubs = this.rectificacionCcmnService.ccmn$.subscribe((objCcmn : Ccmn ) => {
    this.dataCcmn = objCcmn;
    this.cargarLugarControl();
    this.cargarInformacion(this.dataCcmn);
  });

  }
 private validarPlacaEmpTrans( valorPlaca : string ) : void {
    let esPaisPlacaInvalido = this.paisPlacaEmpTrans.invalid;

    if (esPaisPlacaInvalido) {
      return;
    }

    let esPlacaInvalido = this.placaEmpTrans.invalid;

    if (esPlacaInvalido) {
      return;
    }


    if(this.tipoNacEmpTrans.value == TipoNacionalidad.NACIONAL)
      return;

    let codPais : string = this.paisPlacaEmpTrans.value;

    this.entvehiculoService.buscar(codPais, valorPlaca).subscribe( (entvehiculo : Entvehiculo) => {
      let codPlaca : string = entvehiculo?.cplaca

      if ( codPlaca == null ) {
        this.mostrarMsgNoExistePlacaEmpTransp();
        //this.placaEmpTrans.setValue("");
      }

    }, () => {
      this.mostrarMsgNoExistePlacaEmpTransp();
      //this.placaEmpTrans.setValue("");
    });
  }

  private mostrarMsgNoExistePlacaEmpTransp() : void {
    this.messageService.clear();
    this.messageService.add({severity:"info", summary: 'Mensaje',
              detail: 'Placa de vehículo no existe en el directorio de vehículos de empresas de transporte terrestre'});
  }

  private mostrarNombreEmpresa(identidad: string) : void {

    if ( identidad == null ) {
      return;
    }

    let regexRUC : RegExp = /[0-9]{11}/;
    let regexCodEmp : RegExp = /[0-9a-zA-Z]{4}/;

    let tipoNacionalidad : string = this.tipoNacEmpTrans.value;

    let esRucValido = identidad.match(regexRUC);
    let isCodEmpValido = identidad.match(regexCodEmp);

      if ( tipoNacionalidad == TipoNacionalidad.NACIONAL && esRucValido ) {
          this.mostrarRazonSocialEmpTransp(identidad);
          return;
      }

      if ( tipoNacionalidad == TipoNacionalidad.EXTRANJERO && isCodEmpValido ) {
        this.mostrarNombreEmpTransp(identidad);
        return;
      }

      this.nombreEmpTrans.setValue("");
  }

  validarIdentificacion(identidad: string){
    let identificador = this.identificacionEmpTrans.value as string;
    if(identificador == "" || identificador ==null)
      return;

    if(this.nombreEmpTrans.value==""){
      let regexRUC : RegExp = /[0-9]{11}/;
      let regexCodEmp : RegExp = /[0-9a-zA-Z]{4}/;
      let tipoNacionalidad : string = this.tipoNacEmpTrans.value;
      let esRucValido = regexRUC.test(identidad);
      let isCodEmpValido = regexCodEmp.test(identidad)

      if ( tipoNacionalidad == TipoNacionalidad.NACIONAL && !esRucValido ) {
        this.identificacionEmpTrans.setValue("");
        return;
      }

      if ( tipoNacionalidad == TipoNacionalidad.EXTRANJERO && !isCodEmpValido ) {
        this.identificacionEmpTrans.setValue("");
        return;
      }
    }
  }

  private mostrarRazonSocialEmpTransp(numeroRUC: string) : void {
    this.rucService.buscarRuc(numeroRUC).subscribe( (rpta : Ruc) => {
      if ( this.isNoValidoEstadoCondicionRuc(rpta) ) {
        this.nombreEmpTrans.setValue("");
        this.identificacionEmpTrans.setValue("");
        this.mostrarMsgNoValidoEstadoCondicionRuc();
        return;
      }

      this.nombreEmpTrans.setValue(rpta.razonSocial);
    }, () => {
      this.mostrarMsgNoValidoEstadoCondicionRuc();
      this.identificacionEmpTrans.setValue("");
      this.nombreEmpTrans.setValue("");
    });
  }

  private mostrarNombreEmpTransp(codEmpTrans: string) : void {
    this.empredtiService.buscar(codEmpTrans).subscribe( (empredti : Empredti) => {

      if ( empredti == null ) {
        this.mostrarMsgEmpTranspNoExiste();
        this.identificacionEmpTrans.setValue("");
        this.nombreEmpTrans.setValue("");
        return;
      }

      this.nombreEmpTrans.setValue(empredti.dnombre);
    }, () => {
      this.mostrarMsgEmpTranspNoExiste();
      this.identificacionEmpTrans.setValue("");
      this.nombreEmpTrans.setValue("");
    });
  }

  private mostrarMsgEmpTranspNoExiste() : void {
    this.messageService.clear();
      this.messageService.add({severity:"warn", summary: 'Mensaje',
                detail: 'Empresa de transporte no existe en el directorio de empresas de transporte terrestre'});
  }

  private isNoValidoEstadoCondicionRuc(ruc: Ruc) : boolean {

    let esNoHabidoOrNoHallado : boolean = this.rucService.tieneCondicion(ruc, CondicionRuc.NO_HABIDO) ||
    this.rucService.tieneCondicion(ruc, CondicionRuc.NO_HALLADO);

    let esNoActivo : boolean = !this.rucService.tieneEstado(ruc, EstadoRuc.ACTIVO);

    return esNoHabidoOrNoHallado || esNoActivo;
  }

  private mostrarMsgNoValidoEstadoCondicionRuc() : void {
    this.messageService.clear();
    this.messageService.add({severity:"warn", summary: 'Mensaje',
        detail: 'RUC no se encuentra activo y/o tiene condición de No habido o no hallado'});
  }

 private eliminarSubscripciones() : void {
    this.busqDniSubs.unsubscribe();
    this.busqDniResSubs.unsubscribe();
    this.dataCcmnSubs.unsubscribe();
    this.paisesAduCtrlSubs.unsubscribe();
    this.paisesAduEmpNacionalCtrlSubs.unsubscribe();
  }

  private obtenerPais(codigo : string) : DataCatalogo {
    return this.catalogoPaises.find(item => item.codDatacat == codigo) as DataCatalogo;
  }
  private obtenerPais2(codigo : string) : DataCatalogo {
    let tipoDocIden : DataCatalogo = new DataCatalogo();
    return this.catalogoTiposNacionalidad.find(item => item.codDatacat == codigo) as DataCatalogo;
  }

  private obtenerFlujoVehiculo(codigo : string) : DataCatalogo {
    return this.catalogoFlujoVehiculo.find(item => item.codDatacat == codigo) as DataCatalogo;
  }

  private obtenerTipoNacionalidad(codigo : string) : DataCatalogo {
    return this.catalogoTiposNacionalidad.find(item => item.codDatacat == codigo) as DataCatalogo;
  }

  private obtenerTipoDocIdentidad(codigo : string) : DataCatalogo {
    return this.catalogoTiposDocIdentidad.find(item => item.codDatacat == codigo) as DataCatalogo;
  }
  private cargarLugarControl() : void {


    let nroRegistro : string = this.tokenAccesoService.nroRegistro as string;

    this.ubicacionFuncionarioService.buscar(nroRegistro).subscribe(async ( ubicacion : UbicacionFuncionario ) => {
      this.ubicacionFuncionario = ubicacion;
      this.aduanaDescarga.setValue(ubicacion?.puestoControl?.aduana?.codigo);
      this.puestoControl.setValue(ubicacion?.puestoControl?.codigo);

      let arrPuestosControl : PuestoControl[] = new Array();
      let datCatPtoControl : PuestoControl = new PuestoControl();


      if(this.tipoRegistro != TipoRegistro.CAF){
        datCatPtoControl.codigo = ubicacion?.puestoControl?.codigo;
        datCatPtoControl.descripcion = ubicacion?.puestoControl?.descripcion;
        arrPuestosControl.push(datCatPtoControl);
        this.rptaPuestoControl = Respuesta.create(arrPuestosControl, Estado.SUCCESS);
      }else{
        this.puestoControl.setValue(this.puestoControlService.codigoPuestoControlCAF);
        this.rptaPuestoControl = Respuesta.create(this.puestoControlService.lstPuestosControl, Estado.SUCCESS);
      }

      if ( this.catalogoAduanasDescarga.length <= 0 ) {
        let datCatAduanaDescarga : DataCatalogo = new DataCatalogo();
        datCatAduanaDescarga.codDatacat = ubicacion?.puestoControl?.aduana?.codigo;
        datCatAduanaDescarga.desDataCat = ubicacion?.puestoControl?.aduana?.descripcion;

        this.catalogoAduanasDescarga.push(datCatAduanaDescarga);
      }

    });

  }
  private cargarInformacion(ccmn:Ccmn) : void {

    if(ccmn.empresaTransporte.flujoVehiculo.codDatacat!= this.estado.CAF && ccmn.empresaTransporte.flujoVehiculo.codDatacat != this.estado.TTA){
      // let pci: PciDetalle = this.rectificacionCcmnService.pciDetalle;/*descomentar*/
      // this.paisPlacaEmpTrans.setValue(pci.paisPlaca.codDatacat);
      // this.placaEmpTrans.setValue(pci.nomPlaca);
      // this.paisPlacaEmpTrans.setValue(ccmn.empresaTransporte.paisPlaca.codDatacat);
      // this.placaEmpTrans.setValue(ccmn.empresaTransporte.nomPlaca);

    }

   this.buscarFlujoVehiculo(ccmn);
    this.aduanaDescarga.setValue(this.dataCcmn?.aduanaDescarga?.codDatacat);

    if(this.tipoRegistro != TipoRegistro.CAF){
      this.puestoControl.setValue(this.dataCcmn?.puestoControlDescarga?.codDatacat);
    }else{
      this.puestoControl.setValue(this.puestoControlService.codigoPuestoControlCAF);
    }

    if(this.dataCcmn?.empresaTransporte?.tipoNacionalidad?.codDatacat != undefined){
      this.tipoNacEmpTrans.setValue(this.dataCcmn?.empresaTransporte?.tipoNacionalidad?.codDatacat);
    }else{
      if(this.tipoRegistro == TipoRegistro.TTA){
        this.tipoNacEmpTrans.setValue("");
      }else{
        this.tipoNacEmpTrans.setValue("0");
      }
    }

    this.identificacionEmpTrans.setValue(this.dataCcmn?.empresaTransporte?.numDocIdentidad);
    this.paisEmpTrans.setValue(this.dataCcmn?.empresaTransporte?.paisEmpresa?.codDatacat);
    this.nombreEmpTrans.setValue(this.dataCcmn?.empresaTransporte?.nomEmpresa);
    this.emailEmpTrans.setValue(this.dataCcmn?.empresaTransporte?.valEmail);
    this.paisPlacaCarretaEmpTrans.setValue(this.dataCcmn?.empresaTransporte?.paisPlacaCarreta?.codDatacat);
    this.placaCarretaEmpTrans.setValue(this.dataCcmn?.empresaTransporte?.nomPlacaCarreta);
    this.telefonoEmpTrans.setValue(this.dataCcmn?.empresaTransporte?.numTelefono);

    if(this.rectificacionCcmnService.tipoRegistro == TipoRegistro.CAF){
      this.paisPlacaEmpTrans.setValue(this.dataCcmn?.empresaTransporte?.paisPlaca?.codDatacat);
      this.placaEmpTrans.setValue(this.dataCcmn?.empresaTransporte?.nomPlaca);
    }

    this.nacionalidadConductor.setValue( this.dataCcmn?.conductor?.pais?.codDatacat);

    let tipoDocIden = this.dataCcmn?.conductor?.tipoDocIdentidad?.codDatacat==undefined?"3":this.dataCcmn?.conductor?.tipoDocIdentidad?.codDatacat;

    if ( tipoDocIden ) {
      this.tipoDocIdenConductor.setValue(tipoDocIden);
    }

    this.numDocIdenConductor.setValue( this.dataCcmn?.conductor?.numDocIdentidad);
    //this.nombreConductor.setValue( this.dataCcmn?.conductor?.nomConductor);
    this.apellidoConductor.setValue( this.dataCcmn?.conductor?.apeConductor );
    //this.numDocIdenConductor.setValue( this.dataCcmn?.conductor?.numLicencia );

    let tipoNacionalidad = this.dataCcmn?.empresaTransporte?.tipoNacionalidad?.codDatacat;

    if ( tipoNacionalidad == "0" ) {
      this.descIdentificacion = "RUC";
    } else if (tipoNacionalidad == "1" ) {
      this.descIdentificacion = "Código";
    }

    /*datos del responsable*/
    let tipoDocIdenRes = this.dataCcmn?.responsable?.tipoDocumentoRes?.codDatacat==undefined?"3":this.dataCcmn?.responsable?.tipoDocumentoRes?.codDatacat;
    if ( tipoDocIdenRes ) {
      this.tipoDocumentoResponsable.setValue(tipoDocIdenRes);
    }
    this.numDocIdenResponsable.setValue(this.dataCcmn?.responsable?.numDocumentoRes);
    this.nombreResponsable.setValue(this.dataCcmn?.responsable?.nomResponsable);
    this.apellidoResponsable.setValue(this.dataCcmn?.responsable?.apeResponsable);
    this.emailResponsable.setValue(this.dataCcmn?.responsable?.valEmail);
    this.telefonoResponsable.setValue(this.dataCcmn?.responsable?.numTelefono);

    if(this.dataCcmn?.empresaTransporte?.flujoVehiculo?.codDatacat!=undefined)
      this.flujoVehiculoEmpTrans.setValue(this.dataCcmn?.empresaTransporte?.flujoVehiculo?.codDatacat)
  }


  private faltaCompletarInformacion() : boolean {
    //let formularioValido = this.datosTransporteForm.valid;
    this.messageService.clear();


      // if ( !formularioValido ) {
      //   this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Falta completar informacion'});
      //   return true;
      // }

    return false;
  }

  irPaginaSiguiente() : void {

      if (  this.faltaCompletarInformacion() ) {
        return;
      }

      this.guardarInformacion();
      //this.eliminarSubscripciones();
      this.router.navigate(['../comprobantes'], { relativeTo: this.activatedRoute });
  }
  private guardarInformacion() : void {
    this.builderCcmn.iniciar(this.dataCcmn);

   /* let puestoControl = this.rptaPuestoControl.data.find( ( itemPuestoControl : PuestoControl ) =>
                                  itemPuestoControl.codigo ==  this.puestoControl.value) as any;*/

    let objAduanaDescarga : DataCatalogo = this.catalogoAduanasDescarga.find( ( itemAduanaDescarga : DataCatalogo ) =>
                                                itemAduanaDescarga.codDatacat == this.aduanaDescarga.value) as DataCatalogo;

    //this.builderCcmn.setAduana(objAduanaDescarga?.codDatacat, objAduanaDescarga?.desDataCat);
    //this.builderCcmn.setAnio(new Date().getFullYear());
    //this.builderCcmn.setAduanaDescarga(objAduanaDescarga?.codDatacat, objAduanaDescarga?.desDataCat);
    // this.builderCcmn.setPuestoControlDescarga(puestoControl?.codigo, puestoControl?.descripcion);
    // this.builderCcmn.setPuestoControl(puestoControl?.codigo, puestoControl?.descripcion);

    let empTrans : EmpresaTransporte = new EmpresaTransporte();

    if(this.rectificacionCcmnService.ccmn.empresaTransporte.flujoVehiculo.codDatacat!= TipoRegistro.PARTICULAR){
      let tipoNacionalidad : DataCatalogo = this.obtenerTipoNacionalidad(this.tipoNacEmpTrans.value);
      empTrans.tipoNacionalidad = tipoNacionalidad;
      empTrans.numDocIdentidad = this.identificacionEmpTrans.value;
      this.completarTipoDocIdentidadEmpTrans(empTrans);

      let paisEmprTrans = this.obtenerPais(this.paisEmpTrans.value);
      let paisPlacaCa : DataCatalogo = new DataCatalogo();
      let flujoVehi : DataCatalogo = new DataCatalogo();
      paisPlacaCa.codDatacat=this.dataCcmn.empresaTransporte.paisPlaca.codDatacat;
      paisPlacaCa.desDataCat=this.dataCcmn.empresaTransporte.paisPlaca.desDataCat;
      flujoVehi.codDatacat=this.dataCcmn.empresaTransporte.flujoVehiculo.codDatacat;
      flujoVehi.desDataCat=this.dataCcmn.empresaTransporte.flujoVehiculo.desDataCat;
      empTrans.paisEmpresa = paisPlacaCa;
      empTrans.paisPlaca = paisPlacaCa;
      empTrans.flujoVehiculo=flujoVehi;
      empTrans.nomEmpresa = this.dataCcmn.empresaTransporte.nomEmpresa;
      empTrans.nomPlaca=this.dataCcmn.empresaTransporte.nomPlaca;
    }


   // let flujoVehiculo = this.obtenerFlujoVehiculo(this.flujoVehiculoEmpTrans.value);
  //  empTrans.flujoVehiculo =  flujoVehiculo;

   //  let paisPlaca = this.obtenerPais(this.paisPlacaEmpTrans.value);
   // empTrans.paisPlaca = paisPlaca;

   // empTrans.nomPlaca = this.placaEmpTrans.value;
    empTrans.valEmail = this.emailEmpTrans.value;

    // this.paisEmpTrans.setValue(this.dataCcmn.empresaTransporte?.paisEmpresa?.codDatacat);
    // this.nombreEmpTrans.setValue(this.dataCcmn.empresaTransporte?.nomEmpresa);
    // this.paisPlacaEmpTrans.setValue(this.dataCcmn.empresaTransporte?.paisPlaca?.codDatacat);
    // this.placaEmpTrans.setValue(this.dataCcmn.empresaTransporte?.nomPlaca);

    let paisPlacaCarreta = this.obtenerPais(this.paisPlacaCarretaEmpTrans.value);

    empTrans.paisPlacaCarreta = paisPlacaCarreta;
    empTrans.nomPlacaCarreta = this.placaCarretaEmpTrans.value;
    empTrans.numTelefono = this.telefonoEmpTrans.value;
    this.builderCcmn.setEmpresaTransporte(empTrans);

    /*Datos del conductor*/
    let tieneConductor : boolean = this.dataCcmn.conductor != null;
    //if(this.rectificacionCcmnService.tipoRegistro == TipoRegistro.CAF || this.rectificacionCcmnService.tipoRegistro == TipoRegistro.BUS){
      if ( tieneConductor ) {
      let conductor = new Conductor();
      let paisConductor = this.obtenerPais(this.nacionalidadConductor.value);
      conductor.pais = paisConductor;
      let tipoDocIdenConductor = this.obtenerTipoDocIdentidad(this.tipoDocIdenConductor.value);

      conductor.tipoDocIdentidad = tipoDocIdenConductor;
      conductor.numDocIdentidad = this.numDocIdenConductor.value;
      conductor.nomConductor = this.nombreConductor.value;
      conductor.apeConductor = this.apellidoConductor.value;
      //conductor.numLicencia = this.licenciaConductor.value;

      this.builderCcmn.setConductor(conductor);
     }


    /*Datos del responsable*/
    let tieneResponsable : boolean = this.dataCcmn.responsable != null;
    //if(this.rectificacionCcmnService.tipoRegistro == TipoRegistro.PARTICULAR || this.rectificacionCcmnService.tipoRegistro == TipoRegistro.TTA || this.rectificacionCcmnService.tipoRegistro == TipoRegistro.BUS){
    if ( tieneResponsable ) {
      let responsable  = new Responsable();
      let tipoDocResponsable = this.obtenerTipoDocIdentidad(this.tipoDocumentoResponsable.value);
      responsable.tipoDocumentoRes = tipoDocResponsable;
      responsable.numDocumentoRes = this.numDocIdenResponsable.value;
      responsable.nomResponsable = this.nombreResponsable.value;
      responsable.apeResponsable = this.apellidoResponsable.value;
      responsable.valEmail = this.emailResponsable.value;
      responsable.numTelefono = this.telefonoResponsable.value;
      this.builderCcmn.setResponsable(responsable);
    }

    if(this.rectificacionCcmnService.tipoRegistro == TipoRegistro.CAF){
      let ubigeo: Ubigeo = new Ubigeo();
      ubigeo.codUbigeo = this.puestoControlService.codigoUbigeoCAF;
    }

    this.dataCcmn = this.builderCcmn.resultado;
    this.rectificacionCcmnService.putCcmn(this.dataCcmn);
  }

   private completarTipoDocIdentidadEmpTrans(empTrans : EmpresaTransporte) {
    let tieneIdentificacion : boolean = empTrans?.numDocIdentidad!=undefined && empTrans?.numDocIdentidad.length > 0

    if ( tieneIdentificacion ) {
      let tipoDocIden : DataCatalogo = new DataCatalogo();
      let tipoDoc: string = empTrans.tipoNacionalidad.codDatacat == '0'?"4":"14";
      tipoDocIden = this.obtenerTipoDocIdentidad(tipoDoc);
      empTrans.tipoDocIdentidad = tipoDocIden;
    }
  }

  private limpiarNombresConductor() {
    this.nombreConductor.setValue("");
    this.apellidoConductor.setValue("");
  }

  private completarDatosConductor(valor: Respuesta<Dni>) : void {
    if ( valor?.data != null && valor?.estado == Estado.SUCCESS ) {
        this.apellidoConductor.setValue(valor.data.apellidos);
        this.nombreConductor.setValue(valor.data.nombres);
        //this.numDocIdenConductor.setValue(valor.data.numero);
        console.log('valor.data.numero : '+ valor.data.numero)

    } else {
      this.messageService.clear();
      this.limpiarNombresConductor();

      valor?.mensajes?.forEach( ( mensaje: MensajeBean ) => {
        this.messageService.add({severity:"warn", summary: 'Mensaje', detail: mensaje.msg});
      });

    }
  }

  private completarDatosResponsable(valor: Respuesta<Dni>) : void {
    if ( valor?.data != null && valor?.estado == Estado.SUCCESS ) {
        this.nombreResponsable.setValue(valor.data.nombres!=undefined?valor.data.nombres:"");
        this.apellidoResponsable.setValue(valor.data.apellidos!=undefined?valor.data.apellidos:"")
      } else {
      this.messageService.clear();
      this.nombreResponsable.setValue('');
      this.apellidoResponsable.setValue('');

      valor?.mensajes?.forEach( ( mensaje: MensajeBean ) => {
        this.messageService.add({severity:"warn", summary: 'Mensaje', detail: mensaje.msg});
      });

    }
  }
  private configCtrlIdentidadConductor(tipoDocIdentidad: string) : void {
    if ( tipoDocIdentidad == "3" ) {
      this.maxlengthNumDocConductor = 8;
      this.numDocIdenConductor.setValue("");
      this.esDniConductor = true;
      this.limpiarNombresConductor();
      return;
    }
    this.esDniConductor = false;
    this.maxlengthNumDocConductor = 11;
  }

  private configCtrlIdentidadResponsable(tipoDocIdentidad: string) : void {
    if ( tipoDocIdentidad == "3" ) {
      this.maxlengthNumDocResponsable = 8;
      this.numDocIdenResponsable.setValue("");
      this.esDniResponsable = true;
      this.nombreResponsable.setValue("");
      this.apellidoResponsable.setValue("");
      return;
    }
    this.esDniResponsable = false;
    this.maxlengthNumDocResponsable = 11;
  }

  private formControlSetReadOnly(formControl: AbstractControl, isReadonly: boolean) : void {
    (<any>formControl).nativeElement.readOnly = isReadonly;
}
// Controles de datos de la aduana / lugar control
get aduanaDescarga(): AbstractControl {
  return this.datosTransporteForm.controls['lugarDescarga'].get('aduana') as FormControl;
}

get puestoControl(): AbstractControl {
  return this.datosTransporteForm.controls['lugarDescarga'].get('puestoControl') as FormControl;
}
// =================================================

// Controles de la empresa de transporte:
get tipoNacEmpTrans(): AbstractControl {
  return this.datosTransporteForm.controls['empresaTransporte'].get('tipoNacionalidad') as FormControl;
}

get identificacionEmpTrans(): AbstractControl {
  return this.datosTransporteForm.controls['empresaTransporte'].get('identificacion') as FormControl;
}

get paisEmpTrans(): AbstractControl {
  return this.datosTransporteForm.controls['empresaTransporte'].get('pais') as FormControl;
}

get nombreEmpTrans(): AbstractControl {
  return this.datosTransporteForm.controls['empresaTransporte'].get('nombre') as FormControl;
}

get flujoVehiculoEmpTrans(): AbstractControl {
  return this.datosTransporteForm.controls['empresaTransporte'].get('flujoVehiculo') as FormControl;
}

get paisPlacaEmpTrans(): AbstractControl {
  return this.datosTransporteForm.controls['empresaTransporte'].get('paisPlaca') as FormControl;
}

get placaEmpTrans(): AbstractControl {
  return this.datosTransporteForm.controls['empresaTransporte'].get('placa') as FormControl;
}

get emailEmpTrans(): AbstractControl {
  return this.datosTransporteForm.controls['empresaTransporte'].get('email') as FormControl;
}

get paisPlacaCarretaEmpTrans(): AbstractControl {
  return this.datosTransporteForm.controls['empresaTransporte'].get('paisPlacaCarreta') as FormControl;
}

get placaCarretaEmpTrans(): AbstractControl {
  return this.datosTransporteForm.controls['empresaTransporte'].get('placaCarreta') as FormControl;
}

get telefonoEmpTrans(): AbstractControl {
  return this.datosTransporteForm.controls['empresaTransporte'].get('telefono') as FormControl;
}
// =============================================

// Controles de la info del conductor:
get nacionalidadConductor(): AbstractControl {
  return this.datosTransporteForm.controls['conductor'].get('nacionalidad') as FormControl;
}

get tipoDocIdenConductor(): AbstractControl {
  return this.datosTransporteForm.controls['conductor'].get('tipoDocIdentidad') as FormControl;
}

get numDocIdenConductor(): AbstractControl {
  return this.datosTransporteForm.controls['conductor'].get('numDocIdentidad') as FormControl;
}

get nombreConductor(): AbstractControl {
  return this.datosTransporteForm.controls['conductor'].get('nombre') as FormControl;
}

get apellidoConductor(): AbstractControl {
  return this.datosTransporteForm.controls['conductor'].get('apellido') as FormControl;
}

// get licenciaConductor(): AbstractControl {
//   return this.datosTransporteForm.controls['conductor'].get('licencia') as FormControl;
// }

get tipoDocumentoResponsable(): AbstractControl{
  return this.datosTransporteForm.controls['responsable'].get('tipoDocIdentidadRes') as FormControl;
}

get numDocIdenResponsable(): AbstractControl{
  return this.datosTransporteForm.controls['responsable'].get('numDocIdentidadRes') as FormControl;
}

get nombreResponsable(): AbstractControl{
  return this.datosTransporteForm.controls['responsable'].get('nombreRes') as FormControl;
}

get apellidoResponsable(): AbstractControl{
  return this.datosTransporteForm.controls['responsable'].get('apellidoRes') as FormControl;
}

get emailResponsable(): AbstractControl{
  return this.datosTransporteForm.controls['responsable'].get('emailRes') as FormControl;
}

get telefonoResponsable(): AbstractControl{
  return this.datosTransporteForm.controls['responsable'].get('telefonoRes') as FormControl;
}

// =============================================

  private buildForm() {
    this.mostrarResponsable = (this.tipoRegistro==this.estado.BUS || this.tipoRegistro==this.estado.PARTICULAR || this.tipoRegistro==this.estado.TTA)?true:false as boolean;

    var esParticularOrTTA = (this.tipoRegistro==this.estado.PARTICULAR || this.tipoRegistro==this.estado.TTA)
    let emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
    this.datosTransporteForm = this.formBuilder.group(
      {
        //Lugar de descarga
        lugarDescarga: this.formBuilder.group({
          aduana: [{value: '', disabled: true}, [Validators.required]],
          puestoControl: [{value: '', disabled: true}, [Validators.required]]
        }),
        //Empresa de Transporte
        empresaTransporte: this.formBuilder.group({
          tipoNacionalidad: ['', [!esParticularOrTTA?Validators.required:Validators.nullValidator]],
          identificacion: ['', [!esParticularOrTTA?Validators.required:Validators.nullValidator]],
          pais: [{value: '', disabled: true}, [!esParticularOrTTA?Validators.required:Validators.nullValidator]],
          nombre: ['', [!esParticularOrTTA?Validators.required:Validators.nullValidator]],
          flujoVehiculo: [{value: '', disabled: this.tipoRegistro!=this.estado.TTA?true:false}, [this.tipoRegistro!=this.estado.TTA?Validators.required:Validators.nullValidator]],
          paisPlaca: [{value: '', disabled: (this.tipoRegistro==this.estado.CAF || this.tipoRegistro == this.estado.TTA)?false:true}, [this.tipoRegistro!=this.estado.TTA?Validators.required:Validators.nullValidator]],
          placa: [{value: '', disabled: (this.tipoRegistro==this.estado.CAF || this.tipoRegistro == this.estado.TTA)?false:true}, [this.tipoRegistro!=this.estado.TTA?Validators.required:Validators.nullValidator, Validators.minLength(5), Validators.pattern(this.patternPlaca)]],
          email: ['', [(this.tipoRegistro!=this.estado.PARTICULAR && this.tipoRegistro!=this.estado.TTA)?Validators.required:Validators.nullValidator, Validators.email]],
          paisPlacaCarreta: '',
          placaCarreta: ['', [Validators.minLength(5), Validators.pattern(this.patternPlaca)]],
          telefono: ['', [(this.tipoRegistro!=this.estado.PARTICULAR && this.tipoRegistro!=this.estado.TTA)?Validators.required:Validators.nullValidator, Validators.minLength(5), Validators.pattern(this.patternNumTelefono)]]
        }),
        //Conductor
        conductor: this.formBuilder.group({
          nacionalidad: ['', [(this.tipoRegistro!=this.estado.PARTICULAR && this.tipoRegistro!=this.estado.TTA)?Validators.required:Validators.nullValidator]],
          tipoDocIdentidad: ['', [(this.tipoRegistro!=this.estado.PARTICULAR && this.tipoRegistro!=this.estado.TTA)?Validators.required:Validators.nullValidator]],
          numDocIdentidad: ['', [(this.tipoRegistro!=this.estado.PARTICULAR &&
            this.tipoRegistro!=this.estado.TTA)?(Validators.required, this.noWhitespaceValidator):Validators.nullValidator]],
          nombre: ['', [(this.tipoRegistro!=this.estado.PARTICULAR && this.tipoRegistro!=this.estado.TTA)?(Validators.required, this.noWhitespaceValidator):Validators.nullValidator, Validators.minLength(2)]],
          apellido: ['', [(this.tipoRegistro!=this.estado.PARTICULAR && this.tipoRegistro!=this.estado.TTA)?(Validators.required, this.noWhitespaceValidator):Validators.nullValidator, Validators.minLength(2)]],
          licencia: ['', [(this.tipoRegistro!=this.estado.PARTICULAR && this.tipoRegistro!=this.estado.TTA)?Validators.required:Validators.nullValidator, Validators.pattern(this.patternLicencia)]]
        }),
        //Responsable
        responsable: this.formBuilder.group({
          tipoDocIdentidadRes: ['', [this.mostrarResponsable?Validators.required:Validators.nullValidator]],
          numDocIdentidadRes: ['', [this.mostrarResponsable?(Validators.required, this.noWhitespaceValidator):Validators.nullValidator]],
          nombreRes: ['', [this.mostrarResponsable?(Validators.required, this.noWhitespaceValidator):Validators.nullValidator, Validators.minLength(2)]],
          apellidoRes: ['', [this.mostrarResponsable?(Validators.required, this.noWhitespaceValidator):Validators.nullValidator, Validators.minLength(2)]],
          emailRes: ['', [this.mostrarResponsable?Validators.required:Validators.nullValidator, Validators.email]],
          telefonoRes: ['', [Validators.minLength(5), this.mostrarResponsable?Validators.required:Validators.nullValidator]]
        })
      }
    );
  }

  onBlurValidarPlacaEmpTrans(){
    this.validarPlacaEmpTrans(this.placaEmpTrans.value);
   }

   public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

   regresarBandeja(){
   //this.rectificacionCcmnService.limpiarData();
    this.router.navigate(['../motivo'], { relativeTo: this.activatedRoute });
   }
}
