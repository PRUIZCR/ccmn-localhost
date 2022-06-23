import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuscarCcmnComponent } from './components/buscar-ccmn/buscar-ccmn.component';
import { EaEditccmnAdddclComponent } from './components/ea-editccmn-adddcl/ea-editccmn-adddcl.component';
import { EaEditccmnAdjuntoComponent } from './components/ea-editccmn-adjunto/ea-editccmn-adjunto.component';
import { EaEditccmnDatoscompComponent } from './components/ea-editccmn-datoscomp/ea-editccmn-datoscomp.component';
import { EaEditccmnDatostranspComponent } from './components/ea-editccmn-datostransp/ea-editccmn-datostransp.component';
import { EaEditccmnInicioComponent } from './components/ea-editccmn-inicio/ea-editccmn-inicio.component';
import { EaEditccmnMotivoComponent } from './components/ea-editccmn-motivo/ea-editccmn-motivo.component';
import { ListarCcmnComponent } from './components/listar-ccmn/listar-ccmn.component';

const routes: Routes = [
  { path: 'buscar-ccmn', component: BuscarCcmnComponent },
  { path: 'listar-ccmn', component: ListarCcmnComponent },
  {
    path: '', component: EaEditccmnInicioComponent,
    children: [
      { path: 'motivo', component: EaEditccmnMotivoComponent },
      { path: 'datos-transporte', component: EaEditccmnDatostranspComponent },
      { path: 'comprobantes', component: EaEditccmnDatoscompComponent },
      { path: 'adjuntar-archivos', component: EaEditccmnAdjuntoComponent },
      { path: 'add-declaracion', component: EaEditccmnAdddclComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IarectificacionccmnRoutingModule { }
