import { Injectable } from '@angular/core';
import { PuestoControl } from '../model/bean/PuestoControl';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class PuestoControlService {

  lstPuestosControl: PuestoControl[] = new Array();
  codigoPuestoControlCAF!: string;
  codigoUbigeoCAF!:string;

  constructor(private http: HttpClient) {
  }



  async getPuestoControlFromJson(codAduana : string) : Promise<PuestoControl[]> {
    this.lstPuestosControl = new Array();


    await this.http
    .get<any>("assets/json/puestos-control.json").toPromise().then((res: any) => {
        if ( res == null ) {
          return this.lstPuestosControl;
        }

        let itemPuestoControl = res.find((item : any) => item.codAduana ==  codAduana );

        if ( itemPuestoControl == null ) {
          return this.lstPuestosControl;
        }

        itemPuestoControl.puestosControlCAF.forEach((element: any) => {
          let puestoControl : PuestoControl = new PuestoControl();
          this.codigoPuestoControlCAF = element.codigo;
          this.codigoUbigeoCAF = element.ubigeo;
          puestoControl.codigo = element.codigo;
          puestoControl.descripcion = element.descripcion;
          this.lstPuestosControl.push(puestoControl);
        });
        return;
    }, error => {
      console.log({ error });
    });

    return this.lstPuestosControl;
  }

}
