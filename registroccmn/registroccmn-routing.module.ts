import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddDamComprobanteComponent } from './components/commons/add-dam-comprobante/add-dam-comprobante.component';
import { ArchivoAdjuntoComponent } from './components/commons/archivo-adjunto/archivo-adjunto.component';
import { FormDamComprobanteComponent } from './components/commons/form-dam-comprobante/form-dam-comprobante.component';
import { FormTransportistaComponent } from './components/commons/form-transportista/form-transportista.component';
import { IniciarRegistroComponent } from './components/commons/iniciar-registro/iniciar-registro.component';
import { DetalleBusComponent } from './components/guardarccmn-bus/detalle-bus.component';
import { DetalleComponent } from './components/guardarccmn-carga/detalle-dpmn.component';
import { DetalleParticularComponent } from './components/guardarccmn-particular/detalle-particular.component';
import {InicioComponent} from './components/inicio/inicio.component';

const routes: Routes = [
  {
    path: '', component: InicioComponent,
    children: [
      { path:'registroccmn',component:InicioComponent}
    ]
  },
  {
    path:'confirmarccmn',component:DetalleComponent,
  },
  {
    path:'detallebusccmn',component:DetalleBusComponent,
  },
  {
    path:'detalleparticularccmn',component:DetalleParticularComponent
  },
  {
    path: '', component: IniciarRegistroComponent,
    children: [
      { path: 'datos-transporte', component: FormTransportistaComponent },
      { path: 'comprobantes', component: FormDamComprobanteComponent },
      { path: 'adjuntar-archivos', component: ArchivoAdjuntoComponent },
      { path: 'add-declaracion', component: AddDamComprobanteComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistroCcmnRoutingModule { }
