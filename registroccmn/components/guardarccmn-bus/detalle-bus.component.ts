import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';

import { ConstantesApp } from 'src/app/utils/constantes-app';
import { RegistroCcmnService } from 'src/app/services/registro-ccmn.service';
import { TipoRegistro } from 'src/app/model/common/tipo-registro';
import { BusquedaPciService } from 'src/app/services/busqueda-pci.service';
import { Pci } from 'src/app/model/domain/pci.model';
import { EmpresaTransporte } from 'src/app/model/domain/empresa-transporte.model';
import { Conductor } from 'src/app/model/domain/conductor.model';
import { ManifiestoPasajero } from 'src/app/model/domain/manifiesto-pasajero.model';
import { PciDetalle } from 'src/app/model/domain/pcidetalle.model';


@Component({
  selector: 'detalle-bus',
  templateUrl: './detalle-bus.component.html',
  styleUrls: ['./detalle-bus.component.css'],
  providers: [MessageService]
})
export class DetalleBusComponent implements OnInit {

  datosConfirmarDpmn!: FormGroup;
  pciDetalle!: PciDetalle;
  nombredeEmpresa!: string;
  paisEmpresa!: string;
  tipoNacionalidad!: string;
  tipoIdentificacion!: string;
  desIdentificacion!: string;
  nomEmpresa!: string;
  flujoVehiculo!: string;

  nacionalidad!: string;
  tipoDocumentoConductor!: string;
  numDocIdentidad!: string;
  nomConductor!: string;
  apeConductor!: string;
  numLicencia!: string;

  ubigeoOrigen!: string;
  ubigeoDestino!: string;
  cantidadPasajeros!: number;
  fechaHoraSalida!: string;
  desObservacion!: string;

  loading: boolean = true;
  respuestaData: any;

  localEmpresaTransporte = [];
  constructor(private registroCcmnService: RegistroCcmnService,
    private busquedaPciService: BusquedaPciService,
    private router: Router,
    private rutaActiva: ActivatedRoute,
    private formBuilder: FormBuilder) { }

  ngOnInit() {
    //this.pciDetalle = this.registroCcmnService.pciDetalle;
    this.pciDetalle = this.registroCcmnService.getPciDetalle();    
    var correlativo = this.pciDetalle.numCorrelativo;
    
    this.obtenerDatosPci(correlativo);
    this.buildFormConfirmarDpmn();
  }

  obtenerDatosPci(correlativo: number) {
    this.busquedaPciService.buscarPorCorrelativo(correlativo).subscribe((pci: Pci) => {
      this.registroCcmnService.pci = pci;

      let empresaTransporte = pci.manifiestoPasajero?.empresaTransporte;
      if (empresaTransporte != undefined)
        this.cargandoEmpresaTransporte(empresaTransporte);

      let datosConductor = pci.manifiestoPasajero?.conductor;
      if (datosConductor != undefined)
        this.cargandoconductor(datosConductor);

      this.cargandoDatosComplementario(pci.manifiestoPasajero);
    }, () => {
    });


  }
  cargandoEmpresaTransporte(data: EmpresaTransporte) {
    this.tipoNacionalidad = data.tipoNacionalidad.desDataCat;
    this.paisEmpresa = data.paisEmpresa.desDataCat;
    this.tipoIdentificacion = data.tipoDocIdentidad.codDatacat + ' - ' + data.tipoDocIdentidad.desDataCat;
    this.desIdentificacion = data.numDocIdentidad;
    this.nomEmpresa = data.nomEmpresa;
    this.flujoVehiculo = data.flujoVehiculo.codDatacat.toString() + ' - ' + data.flujoVehiculo.desDataCat;
  }

  cargandoconductor(data: Conductor) {
    this.nacionalidad = data.pais.codDatacat + ' - ' + data.pais.desDataCat;
    this.tipoDocumentoConductor = data.tipoDocIdentidad.codDatacat + ' - ' + data.tipoDocIdentidad.desDataCat;
    this.numDocIdentidad = data.numDocIdentidad;
    this.nomConductor = data.nomConductor;
    this.apeConductor = data.apeConductor;
    this.numLicencia = data.numLicencia;
  }

  cargandoDatosComplementario(data: ManifiestoPasajero) {
    this.desObservacion = data.obsManifiesto;
    this.ubigeoOrigen = data.ubigeoOrigen.codUbigeo + ' - ' + data.ubigeoOrigen.nomDepartamento + ' - ' +
      data.ubigeoOrigen.nomProvincia + ' - ' + data.ubigeoOrigen.nomDistrito;
    this.ubigeoDestino = data.ubigeoDestino.codUbigeo + ' - ' + data.ubigeoDestino.nomDepartamento + ' - ' +
      data.ubigeoDestino.nomProvincia + ' - ' + data.ubigeoDestino.nomDistrito;
    this.cantidadPasajeros = data.cntPasajeros;
    this.fechaHoraSalida = data.fecSalidaBus;
  }


  private buildFormConfirmarDpmn() {
    this.datosConfirmarDpmn = this.formBuilder.group({
      paisPlaca: [{ value: sessionStorage.getItem("paisPlaca"), disabled: true }],
      numPlaca: [{ value: sessionStorage.getItem("placa"), disabled: true }],
      canalControl: [{ value: sessionStorage.getItem("canalControl"), disabled: true }],
      controlPaso: [{ value: sessionStorage.getItem("numeroDeControlPaso"), disabled: true }]
    });
  }

  getColorControl(pci : PciDetalle) : string {
    let tipoControl : string = pci?.tipoControl?.codDatacat;
    if ( tipoControl == null ) {
      return "";
    }
    return ConstantesApp.COLOR_CONTROL.get(tipoControl) as string;
  }

  btnSalir() {
    this.router.navigateByUrl('/iaregistroccmn/registroccmn');
  }

  continuarRegistroCcmn(): void {
    this.registroCcmnService.tipoRegistro = TipoRegistro.BUS;
    this.router.navigate(['../datos-transporte'], { relativeTo: this.rutaActiva });
  }

}