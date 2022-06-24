import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UbicacionFuncionario } from '../model/bean/ubicacion-funcionario';
import { FlujoVehiculo } from '../model/common/flujo-vehiculo.enum';
import { PciDetalle } from '../model/domain/pcidetalle.model';
import { ConstantesApp } from '../utils/constantes-app';
import { RegistroCcmnService } from './registro-ccmn.service';

@Injectable({
  providedIn: 'root'
})
export class CargaComponentesService {

  constructor(private http: HttpClient,
    private router: Router, private registroCcmnService: RegistroCcmnService) { }

  guardarNumCorrePci(numCorrePci: string) : void{
    sessionStorage.setItem(ConstantesApp.KEY_SESSION_NUMCORR_PCI, numCorrePci);
  }

  get numCorrePci() : string {
    return sessionStorage.getItem(ConstantesApp.KEY_SESSION_NUMCORR_PCI) as string;
  }

  async cargarConfirmacionDeDpmn(ubicacion: UbicacionFuncionario) {
    let numCorrePci = this.numCorrePci;    
    let pci = await this.getDataPciSynchronous(numCorrePci) as PciDetalle[];    
    sessionStorage.setItem("vieneDesdePCI", ConstantesApp.VIENE_DESDE_PCI); //Yes/No
    sessionStorage.setItem("numeroDeControlPaso", pci[0].controlPaso);
    sessionStorage.setItem("paisPlaca", pci[0].paisPlaca.codDatacat);
    sessionStorage.setItem("placa", pci[0].nomPlaca);
    sessionStorage.setItem("canalControl", pci[0].tipoControl.desDataCat);
    sessionStorage.setItem("pci", JSON.stringify(pci[0]));    
    sessionStorage.setItem("funcionario", JSON.stringify(ubicacion));

    if (pci[0].flujoVehiculo.codDatacat == FlujoVehiculo.CARGA) {
      this.router.navigateByUrl('/iaregistroccmn/confirmarccmn');      
    }

    if (pci[0].flujoVehiculo.codDatacat == FlujoVehiculo.PARTICULAR) {
      this.router.navigateByUrl('/iaregistroccmn/detalleparticularccmn');      
    }

    if (pci[0].flujoVehiculo.codDatacat == FlujoVehiculo.BUS) {
      this.router.navigateByUrl('/iaregistroccmn/detallebusccmn');      
    }
    
  }

  getDataPciSynchronous(numCorrelativo : string) {
    let ubicacionFuncionario = this.registroCcmnService.datosFuncionario;
    let aduana = ubicacionFuncionario.puestoControl.aduana.codigo;
    let puesto = ubicacionFuncionario.puestoControl.codigo;
    //return this.http.get("http://localhost:3001/v1/controladuanero/scci/pcis/"+numCorrelativo).toPromise()
    return this.http.get(`${environment.urlBase}/v1/controladuanero/scci/pcis/${aduana}-${puesto}/listapararegistro?numCorrelativo=${numCorrelativo}`).toPromise()
  }


}
