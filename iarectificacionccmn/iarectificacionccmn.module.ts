import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {RouterModule} from '@angular/router';
import { DatePipe } from '@angular/common'
import {ButtonModule} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {RadioButtonModule} from 'primeng/radiobutton';
import {InputTextModule} from 'primeng/inputtext';
import {KeyFilterModule} from 'primeng/keyfilter';
import {AccordionModule} from 'primeng/accordion';
import { FieldsetModule, } from 'primeng/fieldset';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {ToastModule} from 'primeng/toast';
import {PanelModule} from 'primeng/panel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { TreeSelectModule } from 'primeng/treeselect';
import {CalendarModule} from 'primeng/calendar';
import { IarectificacionccmnRoutingModule } from './iarectificacionccmn-routing.module';
import { BuscarCcmnComponent } from './components/buscar-ccmn/buscar-ccmn.component';
import { ListarCcmnComponent } from './components/listar-ccmn/listar-ccmn.component';

import { SharedModule } from 'src/app/shared/shared.module';

import { PerfilesUsuarioService } from 'src/app/services/perfiles-usuario.service';
import { BuscarRectiCcmnService } from 'src/app/services/buscar-recti-ccmn.service';
import { UbicacionFuncionarioService } from 'src/app/services/ubicacion-funcionario.service';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { PaisesService } from 'src/app/services/paises.service';
import { EmpredtiService } from 'src/app/services/empredti.service';
import { EntvehiculoService } from 'src/app/services/entvehiculo.service';
import { UbigeoService } from 'src/app/services/ubigeo.service';
import { EaEditccmnInicioComponent } from './components/ea-editccmn-inicio/ea-editccmn-inicio.component';
import { EaEditccmnDatostranspComponent } from './components/ea-editccmn-datostransp/ea-editccmn-datostransp.component';
import { EaEditccmnDatoscompComponent } from './components/ea-editccmn-datoscomp/ea-editccmn-datoscomp.component';
import { EaEditccmnAdjuntoComponent } from './components/ea-editccmn-adjunto/ea-editccmn-adjunto.component';
import { EaEditccmnAdddclComponent } from './components/ea-editccmn-adddcl/ea-editccmn-adddcl.component';
import { EaEditccmnMotivoComponent } from './components/ea-editccmn-motivo/ea-editccmn-motivo.component';
//import { RegistroCcmnService } from 'src/app/services/registro-ccmn.service';
import { RectificacionCcmnService } from 'src/app/services/rectificacion-ccmn.service';
import { PuestoControlService } from 'src/app/services/puesto-control.service';
import { BoletaFacturaService } from 'src/app/services/boleta-factura.service';
import { PaisesServicEmprNac } from 'src/app/services/paises.nac.service';
import { SaldoSeriesService } from 'src/app/services/saldos-series.service';
import { BuscarCcmnService } from 'src/app/services/buscar-ccmn.service';
import { DeclaracionService } from 'src/app/services/declaracion.service';
import { BusquedaPciService } from 'src/app/services/busqueda-pci.service';

import { RucService } from 'src/app/services/ruc.service';
@NgModule({
  declarations: [
    BuscarCcmnComponent,
    ListarCcmnComponent,
    EaEditccmnInicioComponent,
    EaEditccmnDatostranspComponent,
    EaEditccmnDatoscompComponent,
    EaEditccmnAdjuntoComponent,
    EaEditccmnAdddclComponent,
    EaEditccmnMotivoComponent
  ],
  imports: [
    CommonModule,
    IarectificacionccmnRoutingModule,
    TableModule,
    RadioButtonModule,
    InputTextModule,
    KeyFilterModule,
    AccordionModule,
    FieldsetModule,
    RouterModule,
    ButtonModule,
    PanelModule,
    SharedModule,
    AutoCompleteModule,
    ConfirmDialogModule,
    DialogModule,
    ProgressSpinnerModule,
    ToastModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    TreeSelectModule,
    CalendarModule
  ],
  providers: [
    DeclaracionService,
    PerfilesUsuarioService,
    BuscarRectiCcmnService,
    CatalogoService,
    PaisesService,
    EmpredtiService,
    EntvehiculoService,
    UbigeoService,
    UbicacionFuncionarioService,
    PaisesServicEmprNac,
    //RegistroCcmnService,
    RectificacionCcmnService,
    CatalogoService,
    PuestoControlService,
    SaldoSeriesService,
    BoletaFacturaService,
    BuscarCcmnService,
    DatePipe,
    BusquedaPciService,
    RucService
  ]
})
export class IarectificacionccmnModule { }
