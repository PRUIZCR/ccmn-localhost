import { Component, OnInit } from '@angular/core';
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
import { RegistroCcmnService } from 'src/app/services/registro-ccmn.service';
import { TipoRegistro } from 'src/app/model/common/tipo-registro';
import { Responsable } from 'src/app/model/domain/responsable.model';
import { PuestoControlService } from 'src/app/services/puesto-control.service';
import { Ubigeo } from 'src/app/model/domain/ubigeo.model';
import { UbigeoService } from 'src/app/services/ubigeo.service';
import { PaisesServicEmprNac } from 'src/app/services/paises.nac.service';
import { Pci } from 'src/app/model/domain/pci.model';
import { ConstantesApp } from 'src/app/utils/constantes-app';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-form-transportista',
  templateUrl: './form-transportista.component.html',
  styleUrls: ['./form-transportista.component.css'],
  providers: [DniService, BuilderCcmnService, MessageService, RucService]
})
export class FormTransportistaComponent implements OnInit {

  private patternLicencia : string = "^[A-Z0-9]*$";
  private patternNumTelefono : string = "^[0-9]*$";
  private patternPlaca : string = "^[A-Z0-9]*$";

  private dataCcmn : Ccmn = new Ccmn;

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
  catalogoPaisesEmpNac: DataCatalogo[] = new Array();
  catalogoAduanasDescarga: DataCatalogo[] = new Array();
  catalogoTiposDocIdentidad: DataCatalogo[] = new Array();
  catalogoTiposNacionalidad: DataCatalogo[] = new Array();
  catalogoFlujoVehiculo: DataCatalogo[] = new Array();

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

  constructor(private formBuilder: FormBuilder,
              private registroCcmnService : RegistroCcmnService,
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
              private ubigeoService : UbigeoService) {}

  ngOnInit(): void {
    this.tipoRegistro = this.registroCcmnService.tipoRegistro;
    this.buildForm();
    this.iniciarSuscripciones();
    this.registroCcmnService.colocarPasoActual(1);
    this.registroCcmnService.ubigeoOrigenBus = new Ubigeo;
    if(this.dataCcmn==undefined || this.dataCcmn.empresaTransporte==undefined)
      this.completarDatosBUS(this.registroCcmnService.pci);
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

    this.catalogoService.cargarDesdeJson("assets/json/flujo-vehiculo.json").subscribe((resultado : DataCatalogo[]) => {
      this.catalogoFlujoVehiculo = resultado;
      switch (this.tipoRegistro) {
        case this.estado.BUS:
            this.flujoVehiculoEmpTrans.setValue("02");
            break;
        case this.estado.PARTICULAR:
            this.flujoVehiculoEmpTrans.setValue("03")
            break;
        case this.estado.CAF:
            this.flujoVehiculoEmpTrans.setValue("01")
            break;
        default:
            break;
    }
    });

    this.paisesAduCtrlSubs = this.paisesService.rptPaisesAduCtrl$.subscribe( (resultado : DataCatalogo[]) => {
      this.catalogoPaises = resultado;
    });

    this.paisesAduEmpNacionalCtrlSubs = this.paisesServiceNac.rptPaisesEmprNacional$.subscribe( (resultado : DataCatalogo[]) => {
      this.catalogoPaisesEmpNac = resultado;
    });

    this.aduanaDescarga.valueChanges.subscribe((value: string) => {
      if ( value?.length > 0 ) {
        this.paisesService.buscarPaisesPorAduaCtrl(value, this.tipoNacEmpTrans.value);
        this.paisesServiceNac.buscarPaisesPorAduaEmpNacional(value, this.tipoNacEmpTrans.value);
      }
    });

    this.tipoNacEmpTrans.valueChanges.subscribe((value: string) => {
      this.identificacionEmpTrans.setValue("");
      this.paisesService.buscarPaisesPorAduaCtrl(this.aduanaDescarga.value, this.tipoNacEmpTrans.value);
      this.paisesServiceNac.buscarPaisesPorAduaEmpNacional(this.aduanaDescarga.value, this.tipoNacEmpTrans.value);

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

    this.identificacionEmpTrans.valueChanges.subscribe( (valor: string) => {
      this.mostrarNombreEmpresa(valor);
    });

    this.tipoDocIdenConductor.valueChanges.subscribe((value: string) => {
        this.configCtrlIdentidadConductor(value==undefined?"3":value);
    });

    this.tipoDocumentoResponsable.valueChanges.subscribe((value: string) => {
      this.configCtrlIdentidadResponsable(value==undefined?"3":value);
  });

    this.numDocIdenConductor.valueChanges.subscribe((valor: string) => {
      if ( this.tipoDocIdenConductor.value == "3" ) {
        this.limpiarNombresConductor();
        this.dniService.buscar(valor, "1");
      }
    });

    this.numDocIdenResponsable.valueChanges.subscribe((valor: string) => {
      if ( this.tipoDocumentoResponsable.value == "3" ) {
        this.nombreResponsable.setValue("");
        this.apellidoResponsable.setValue("");
        this.dniService.buscarResponsable(valor, "2");
      }
    });

    //this.placaEmpTrans.valueChanges.subscribe( (valor: string) => {
    //   this.validarPlacaEmpTrans(valor);
    //});

    this.busqDniSubs = this.dniService.rptaDni$.subscribe((valor: Respuesta<Dni>) => {
        this.completarDatosConductor(valor);
    });

    this.busqDniResSubs = this.dniService.rptaDniRes$.subscribe((valor: Respuesta<Dni>) => {
        this.completarDatosResponsable(valor);
    });

    this.dataCcmnSubs = this.registroCcmnService.ccmn$.subscribe((objCcmn : Ccmn ) => {
      this.dataCcmn = objCcmn;
      this.cargarLugarControl();
      this.cargarInformacion();
    });

  }

  completarDatosBUS(pci: Pci) {
    if (this.tipoRegistro != TipoRegistro.BUS)
      return;

    if(pci?.manifiestoPasajero?.empresaTransporte!=undefined)
      this.completarDatosEmpresaTransporteBUS(pci?.manifiestoPasajero?.empresaTransporte);
    
    if(pci?.manifiestoPasajero?.conductor!=undefined)
      this.completarDatosConductorBUS(pci?.manifiestoPasajero?.conductor)

    if(pci?.manifiestoPasajero?.ubigeoOrigen!=undefined)
      this.registroCcmnService.ubigeoOrigenBus = pci?.manifiestoPasajero?.ubigeoOrigen;
  }

  completarDatosEmpresaTransporteBUS(empresaTransporte: EmpresaTransporte) {
    this.tipoNacEmpTrans.setValue(empresaTransporte.tipoNacionalidad?.codDatacat);
    this.identificacionEmpTrans.setValue(empresaTransporte.numDocIdentidad);
    this.paisEmpTrans.setValue(empresaTransporte.paisEmpresa?.codDatacat);
    this.paisPlacaEmpTrans.setValue(empresaTransporte.paisPlaca?.codDatacat);
    this.placaEmpTrans.setValue(empresaTransporte.nomPlaca);
    this.paisPlacaCarretaEmpTrans.setValue(empresaTransporte.paisPlacaCarreta?.codDatacat);
    this.placaCarretaEmpTrans.setValue(empresaTransporte.nomPlacaCarreta);
    this.emailEmpTrans.setValue(empresaTransporte.valEmail);
    this.telefonoEmpTrans.setValue(empresaTransporte.numTelefono);
  }

  async completarDatosConductorBUS(conductor: Conductor) {
    this.nacionalidadConductor.setValue(conductor.pais?.codDatacat);
    this.tipoDocIdenConductor.setValue(conductor.tipoDocIdentidad?.codDatacat);
    await new Promise(f => setTimeout(f, 100));
    this.numDocIdenConductor.setValue(conductor.numDocIdentidad);
    this.apellidoConductor.setValue(conductor.apeConductor);
    this.nombreConductor.setValue(conductor.nomConductor);
    this.licenciaConductor.setValue(conductor.numLicencia);
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

  private cargarInformacion() : void {

    if(this.tipoRegistro != this.estado.CAF && this.tipoRegistro != this.estado.TTA){
      let pci: PciDetalle = this.registroCcmnService.pciDetalle;
      this.paisPlacaEmpTrans.setValue(pci.paisPlaca.codDatacat);
      this.placaEmpTrans.setValue(pci.nomPlaca);
    } 

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

    if(this.registroCcmnService.tipoRegistro == TipoRegistro.CAF){
      this.paisPlacaEmpTrans.setValue(this.dataCcmn?.empresaTransporte?.paisPlaca?.codDatacat);
      this.placaEmpTrans.setValue(this.dataCcmn?.empresaTransporte?.nomPlaca);
    }

    this.nacionalidadConductor.setValue( this.dataCcmn?.conductor?.pais?.codDatacat);

    let tipoDocIden = this.dataCcmn?.conductor?.tipoDocIdentidad?.codDatacat==undefined?"3":this.dataCcmn?.conductor?.tipoDocIdentidad?.codDatacat;

    if ( tipoDocIden ) {
      this.tipoDocIdenConductor.setValue(tipoDocIden);
    }

    this.numDocIdenConductor.setValue( this.dataCcmn?.conductor?.numDocIdentidad);
    this.nombreConductor.setValue( this.dataCcmn?.conductor?.nomConductor);
    this.apellidoConductor.setValue( this.dataCcmn?.conductor?.apeConductor );
    this.licenciaConductor.setValue( this.dataCcmn?.conductor?.numLicencia );

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
    let formularioValido = this.datosTransporteForm.valid;
    this.messageService.clear();


      if ( !formularioValido ) {
        this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Falta completar informacion'});
        return true;
      }

      if(this.tipoRegistro == TipoRegistro.BUS){
        let esNumDocVacio = this.numDocIdenResponsable.value == undefined || this.numDocIdenResponsable.value.trim()=="";
        let esApellidoVacio = this.apellidoResponsable.value == undefined || this.apellidoResponsable.value.trim()=="";
        let esNombreVacio = this.nombreResponsable.value == undefined || this.nombreResponsable.value.trim()=="";
        let esCorreoVacio = this.emailResponsable.value == undefined || this.emailResponsable.value.trim()=="";
        let esTelefonoVacio = this.telefonoResponsable.value == undefined || this.telefonoResponsable.value.trim()=="";
        let esAlgunoConDato = !esNumDocVacio || !esApellidoVacio || !esNombreVacio || !esCorreoVacio || !esTelefonoVacio;

        if(esAlgunoConDato && (esNumDocVacio || esApellidoVacio || esNombreVacio || esCorreoVacio || esTelefonoVacio)){
          this.messageService.add({severity:"warn", summary: 'Mensaje', detail: 'Si el responsable es el titular de la CCMN debe ingresar el tipo de documento de identidad, el número de documento de identidad y los apellidos y nombres del responsable. Si el titular de la CCMN es el conductor no debe ingresar datos del responsable.'});
          return true;
        }
      }

    return false;
  }

  irPaginaSiguiente() : void {

      if (  this.faltaCompletarInformacion() ) {
        return;
      }

      this.guardarInformacion();
      this.eliminarSubscripciones();
      this.router.navigate(['../comprobantes'], { relativeTo: this.activatedRoute });
  }

  private guardarInformacion() : void {
    this.builderCcmn.iniciar(this.dataCcmn);

    let puestoControl = this.rptaPuestoControl.data.find( ( itemPuestoControl : PuestoControl ) =>
                                  itemPuestoControl.codigo ==  this.puestoControl.value) as any;
    
    let objAduanaDescarga : DataCatalogo = this.catalogoAduanasDescarga.find( ( itemAduanaDescarga : DataCatalogo ) =>
                                                itemAduanaDescarga.codDatacat == this.aduanaDescarga.value) as DataCatalogo;

    this.builderCcmn.setAduana(objAduanaDescarga?.codDatacat, objAduanaDescarga?.desDataCat);
    this.builderCcmn.setAnio(new Date().getFullYear());
    this.builderCcmn.setAduanaDescarga(objAduanaDescarga?.codDatacat, objAduanaDescarga?.desDataCat);
    this.builderCcmn.setPuestoControlDescarga(puestoControl?.codigo, puestoControl?.descripcion);
    this.builderCcmn.setPuestoControl(puestoControl?.codigo, puestoControl?.descripcion);

    let empTrans : EmpresaTransporte = new EmpresaTransporte();

    if(this.registroCcmnService.tipoRegistro != TipoRegistro.PARTICULAR){
      let tipoNacionalidad : DataCatalogo = this.obtenerTipoNacionalidad(this.tipoNacEmpTrans.value);
      empTrans.tipoNacionalidad = tipoNacionalidad;
      empTrans.numDocIdentidad = this.identificacionEmpTrans.value;
      this.completarTipoDocIdentidadEmpTrans(empTrans);

      let paisEmprTrans = this.obtenerPais(this.paisEmpTrans.value);
      empTrans.paisEmpresa = paisEmprTrans;
      empTrans.nomEmpresa = this.nombreEmpTrans.value;
    }


    let flujoVehiculo = this.obtenerFlujoVehiculo(this.flujoVehiculoEmpTrans.value);
    empTrans.flujoVehiculo =  flujoVehiculo;

    let paisPlaca = this.obtenerPais(this.paisPlacaEmpTrans.value);

    empTrans.paisPlaca = paisPlaca;
    empTrans.nomPlaca = this.placaEmpTrans.value;
    empTrans.valEmail = this.emailEmpTrans.value;

    let paisPlacaCarreta = this.obtenerPais(this.paisPlacaCarretaEmpTrans.value);

    empTrans.paisPlacaCarreta = paisPlacaCarreta;
    empTrans.nomPlacaCarreta = this.placaCarretaEmpTrans.value;

    empTrans.numTelefono = this.telefonoEmpTrans.value;

    this.builderCcmn.setEmpresaTransporte(empTrans);

    /*Datos del conductor*/
    if(this.registroCcmnService.tipoRegistro == TipoRegistro.CAF || this.registroCcmnService.tipoRegistro == TipoRegistro.BUS){
      let conductor = new Conductor();
      let paisConductor = this.obtenerPais(this.nacionalidadConductor.value);
      conductor.pais = paisConductor;
      let tipoDocIdenConductor = this.obtenerTipoDocIdentidad(this.tipoDocIdenConductor.value);
      conductor.tipoDocIdentidad = tipoDocIdenConductor;
      conductor.numDocIdentidad = this.numDocIdenConductor.value;
      conductor.nomConductor = this.nombreConductor.value;
      conductor.apeConductor = this.apellidoConductor.value;
      conductor.numLicencia = this.licenciaConductor.value;
  
      this.builderCcmn.setConductor(conductor);
    }


    /*Datos del responsable*/
    if(this.registroCcmnService.tipoRegistro == TipoRegistro.PARTICULAR || this.registroCcmnService.tipoRegistro == TipoRegistro.TTA || this.registroCcmnService.tipoRegistro == TipoRegistro.BUS){
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

    if(this.registroCcmnService.tipoRegistro == TipoRegistro.CAF){
      let ubigeo: Ubigeo = new Ubigeo();
      ubigeo.codUbigeo = this.puestoControlService.codigoUbigeoCAF;
    }

    this.dataCcmn = this.builderCcmn.resultado;
    this.registroCcmnService.putCcmn(this.dataCcmn);
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

  get licenciaConductor(): AbstractControl {
    return this.datosTransporteForm.controls['conductor'].get('licencia') as FormControl;
  }

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
    var requiredResponsable = (this.tipoRegistro==this.estado.PARTICULAR || this.tipoRegistro==this.estado.TTA)?true:false as boolean;

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
          pais: ['', [!esParticularOrTTA?Validators.required:Validators.nullValidator]],
          nombre: ['', [!esParticularOrTTA?Validators.required:Validators.nullValidator]],
          flujoVehiculo: [{value: '', disabled: this.tipoRegistro!=this.estado.TTA?true:false}, [this.tipoRegistro!=this.estado.TTA?Validators.required:Validators.nullValidator]],
          paisPlaca: [{value: '', disabled: (this.tipoRegistro==this.estado.CAF || this.tipoRegistro == this.estado.TTA)?false:true}, [this.tipoRegistro!=this.estado.TTA?Validators.required:Validators.nullValidator]],
          placa: [{value: '', disabled: (this.tipoRegistro==this.estado.CAF || this.tipoRegistro == this.estado.TTA)?false:true}, [this.tipoRegistro!=this.estado.TTA?Validators.required:Validators.nullValidator, Validators.minLength(5), Validators.pattern(this.patternPlaca)]],
          email: ['', [(this.tipoRegistro!=this.estado.PARTICULAR && this.tipoRegistro!=this.estado.TTA && this.tipoRegistro!=this.estado.BUS)?Validators.required:Validators.nullValidator, Validators.email]],
          paisPlacaCarreta: '',
          placaCarreta: ['', [Validators.minLength(5), Validators.pattern(this.patternPlaca)]],
          telefono: ['', [(this.tipoRegistro!=this.estado.PARTICULAR && this.tipoRegistro!=this.estado.TTA && this.tipoRegistro!=this.estado.BUS)?Validators.required:Validators.nullValidator, Validators.minLength(5), Validators.pattern(this.patternNumTelefono)]]
        }),
        //Conductor
        conductor: this.formBuilder.group({
          nacionalidad: ['', [(this.tipoRegistro!=this.estado.PARTICULAR && this.tipoRegistro!=this.estado.TTA)?Validators.required:Validators.nullValidator]],
          tipoDocIdentidad: ['', [(this.tipoRegistro!=this.estado.PARTICULAR && this.tipoRegistro!=this.estado.TTA)?Validators.required:Validators.nullValidator]],
          numDocIdentidad: ['', [(this.tipoRegistro!=this.estado.PARTICULAR && this.tipoRegistro!=this.estado.TTA)?(Validators.required, this.noWhitespaceValidator):Validators.nullValidator]],
          nombre: ['', [(this.tipoRegistro!=this.estado.PARTICULAR && this.tipoRegistro!=this.estado.TTA)?(Validators.required, this.noWhitespaceValidator):Validators.nullValidator, Validators.minLength(2)]],
          apellido: ['', [(this.tipoRegistro!=this.estado.PARTICULAR && this.tipoRegistro!=this.estado.TTA)?(Validators.required, this.noWhitespaceValidator):Validators.nullValidator, Validators.minLength(2)]],
          licencia: ['', [(this.tipoRegistro!=this.estado.PARTICULAR && this.tipoRegistro!=this.estado.TTA)?Validators.required:Validators.nullValidator, Validators.pattern(this.patternLicencia)]]
        }),
        //Responsable
        responsable: this.formBuilder.group({
          tipoDocIdentidadRes: ['', [requiredResponsable?Validators.required:Validators.nullValidator]],
          numDocIdentidadRes: ['', [requiredResponsable?(Validators.required, this.noWhitespaceValidator):Validators.nullValidator]],
          nombreRes: ['', [requiredResponsable?(Validators.required, this.noWhitespaceValidator):Validators.nullValidator, Validators.minLength(2)]],
          apellidoRes: ['', [requiredResponsable?(Validators.required, this.noWhitespaceValidator):Validators.nullValidator, Validators.minLength(2)]],
          emailRes: ['', [Validators.email]],
          telefonoRes: ['', [Validators.minLength(5), requiredResponsable?Validators.required:Validators.nullValidator]]
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
    if(this.registroCcmnService.getVieneDesdePci() == ConstantesApp.VIENE_DESDE_PCI) window.location.href= `${environment.urlComponentPCI}?modulo=registro-pci&token=${this.tokenAccesoService.token}`;
    this.router.navigateByUrl('/iaregistroccmn');
   }

}
