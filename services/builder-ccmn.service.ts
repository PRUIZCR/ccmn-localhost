import { Injectable } from '@angular/core';
import { DataCatalogo } from '../model/common/data-catalogo.model';
import { Ccmn } from '../model/domain/ccmn.model';
import { ComprobantePago } from '../model/domain/comprobante-pago.model';
import { Conductor } from '../model/domain/conductor.model';
import { DatoComplementario } from '../model/domain/dato-complementario.model';
import { EmpresaTransporte } from '../model/domain/empresa-transporte.model';
import { Responsable } from '../model/domain/responsable.model';
import { Ubigeo } from '../model/domain/ubigeo.model';

/**
 * Builder para crear el objeto CCMN
 */
@Injectable()
export class BuilderCcmnService {

  private ccmn: Ccmn = new Ccmn();

  constructor() {}

  reset() {
    this.ccmn = new Ccmn();
  }

  iniciar(newCcmn: Ccmn) : void {
    this.ccmn = newCcmn;
  }

  get resultado() : Ccmn {
    return this.ccmn;
  }

  private setPropertyDataCatalogo(obj: any, nomProp: string, cod: string, desc: string) : void {
    if ( cod == null && desc == null ) {
      obj[nomProp] = null;
      return;
    }

    obj[nomProp] = new DataCatalogo();

    obj[nomProp].codDatacat = cod;
    obj[nomProp].desDataCat = desc;
  }

  private configDatoComplementario() {
    if ( this.ccmn.datoComplementario == null ) {
      this.ccmn.datoComplementario = new DatoComplementario();
    }
  }

  public setNumCorrelativo(newNumCorrelativo: number) {
    this.ccmn.numCorrelativo = newNumCorrelativo;
  }

  setAduana(cod: string, desc: string) : void {
    this.setPropertyDataCatalogo(this.ccmn, "aduana", cod, desc);
  }

  setAnio(anio: number) : void {
    this.ccmn.annCcmn = anio;
  }

  setEstado(cod: string, desc: string) : void {
    this.setPropertyDataCatalogo(this.ccmn, "estado", cod, desc);
  }

  setAduanaDescarga(cod: string, desc: string) : void {
    this.setPropertyDataCatalogo(this.ccmn, "aduanaDescarga", cod, desc);
  }

  setPuestoControlDescarga(cod: string, desc: string) : void {
    this.setPropertyDataCatalogo(this.ccmn, "puestoControlDescarga", cod, desc);
  }

  setPuestoControl(cod: string, desc: string) : void {
    this.setPropertyDataCatalogo(this.ccmn, "puestoControl", cod, desc);
  }

  setActorRegistro(cod: string, desc: string) : void {
    this.setPropertyDataCatalogo(this.ccmn, "moduloRegistro", cod, desc);
  }

  setTipoAnulacion(cod: string, desc: string) : void {
    this.setPropertyDataCatalogo(this.ccmn, "tipoAnulacion", cod, desc);
  }

  setUbigeoOrigen(newUbigeoOrigen: Ubigeo) : void {
    this.configDatoComplementario();
    this.ccmn.datoComplementario.ubigeoOrigen = newUbigeoOrigen;
  }

  setObservaciones(newObs: string) : void {
    this.configDatoComplementario();
    this.ccmn.datoComplementario.desObservacion = newObs;

  }

  addComprobantePago( newComprobantePago: ComprobantePago ) : void {
    if ( this.ccmn == null ) {
      this.ccmn = new Ccmn();
    }

    if ( this.ccmn.comprobantePago == null ) {
      this.ccmn.comprobantePago = new Array();
    }

    let correlativo : number = this.obtenerCorrelativoComprob();
    newComprobantePago.numCorrelativo = correlativo;
    this.ccmn.comprobantePago.push(newComprobantePago);
  }

  private obtenerCorrelativoComprob() : number {

    if ( this.ccmn.comprobantePago == null || this.ccmn.comprobantePago.length <= 0 ) {
      return 1;
    }

    return Math.max.apply(Math, this.ccmn.comprobantePago.map( (itComp) => itComp.numCorrelativo)) + 1;
  }

  public setEmpresaTransporte(empTrans : EmpresaTransporte) : void {
    this.ccmn.empresaTransporte = empTrans;
  }

  public setConductor (valor : Conductor) : void {
    this.ccmn.conductor = valor;
  }

  public setResponsable(valor: Responsable): void {
    this.ccmn.responsable = valor;
  }

  public transporte = new class {

    private empTrans : EmpresaTransporte = new EmpresaTransporte();

    constructor(private builderCcmn: BuilderCcmnService) {
      this.builderCcmn.ccmn.empresaTransporte = this.empTrans;
    }

    public setTipoNacionalidad(tipoNac : DataCatalogo) : void {
      this.empTrans.tipoNacionalidad = tipoNac;
    }

    public setCodigo(valor : string) : void {
      this.empTrans.codEmpTransporte = valor;
    }

    public setTipoDocIdentidad(tipoDocIdentidad : DataCatalogo) : void {
      this.empTrans.tipoDocIdentidad = tipoDocIdentidad;
    }

    public setNumDocIdentidad(valor : string) : void {
      this.empTrans.numDocIdentidad = valor;
    }

    public setPais(newPais : DataCatalogo) : void {
      this.empTrans.paisEmpresa = newPais;
    }

    public setNombre(valor : string) : void {
      this.empTrans.nomEmpresa = valor;
    }

    public setFlujoVehiculo(newFlujoVehi : DataCatalogo) : void {
      this.empTrans.flujoVehiculo = newFlujoVehi;
    }

    public setPaisPlaca(newPaisPlaca : DataCatalogo) : void {
      this.empTrans.paisPlaca = newPaisPlaca;
    }

    public setPlaca(valor : string) : void {
      this.empTrans.nomPlaca = valor;
    }

    public setEmail(valor : string) : void {
      this.empTrans.valEmail = valor;
    }

    public setPaisPlacaCarreta(valor : DataCatalogo) : void {
      this.empTrans.paisPlacaCarreta = valor;
    }

    public setPlacaCarreta(valor : string) : void {
      this.empTrans.nomPlacaCarreta = valor;
    }

    public setNumTelefono(valor : string) : void {
      this.empTrans.numTelefono = valor;
    }

  }(this);

}
