import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {TableModule} from 'primeng/table';
import {RadioButtonModule} from 'primeng/radiobutton';
import {InputTextModule} from 'primeng/inputtext';
import {KeyFilterModule} from 'primeng/keyfilter';
import {AccordionModule} from 'primeng/accordion';
import { FieldsetModule, } from 'primeng/fieldset';
import {RouterModule} from '@angular/router';
import {ButtonModule} from 'primeng/button';

import {AutoCompleteModule} from 'primeng/autocomplete';
import {ToastModule} from 'primeng/toast';
import {PanelModule} from 'primeng/panel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import { RegistroCcmnRoutingModule } from './registroccmn-routing.module';
import { InicioComponent } from './components/inicio/inicio.component';
import {TreeSelectModule} from 'primeng/treeselect';

import { DetalleComponent } from './components/guardarccmn-carga/detalle-dpmn.component';
import { DetalleBusComponent } from './components/guardarccmn-bus/detalle-bus.component';
import { DetalleParticularComponent } from './components/guardarccmn-particular/detalle-particular.component';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { PaisesService } from 'src/app/services/paises.service';
import { UbicacionFuncionarioService } from 'src/app/services/ubicacion-funcionario.service';
import { EmpredtiService } from 'src/app/services/empredti.service';
import { EntvehiculoService } from 'src/app/services/entvehiculo.service';
import { UbigeoService } from 'src/app/services/ubigeo.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { DeclaracionService } from 'src/app/services/declaracion.service';
import { RegistroCcmnService } from 'src/app/services/registro-ccmn.service';
import { FormTransportistaComponent } from './components/commons/form-transportista/form-transportista.component';
import { FormDamComprobanteComponent } from './components/commons/form-dam-comprobante/form-dam-comprobante.component';
import { IniciarRegistroComponent } from './components/commons/iniciar-registro/iniciar-registro.component';
import { AddDamComprobanteComponent } from './components/commons/add-dam-comprobante/add-dam-comprobante.component';
import { ArchivoAdjuntoComponent } from './components/commons/archivo-adjunto/archivo-adjunto.component';
import { PuestoControlService } from 'src/app/services/puesto-control.service';
import { BoletaFacturaService } from 'src/app/services/boleta-factura.service';
import { DropdownModule } from 'primeng/dropdown';
import { PaisesServicEmprNac } from 'src/app/services/paises.nac.service';
import { SaldoSeriesService } from 'src/app/services/saldos-series.service';
import { BusquedaPciService } from 'src/app/services/busqueda-pci.service';
import { GuiaRemisionService } from 'src/app/services/guia-remision.service';

@NgModule({
  declarations: [
    InicioComponent,
    DetalleComponent,
    DetalleBusComponent,
    DetalleParticularComponent,
    FormTransportistaComponent,
    FormDamComprobanteComponent,
    IniciarRegistroComponent,
    AddDamComprobanteComponent,
    ArchivoAdjuntoComponent
  ],
  imports: [
    CommonModule,
    RegistroCcmnRoutingModule,
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
    TreeSelectModule
  ],
  exports: [

  ],
  providers: [
    DeclaracionService,
    UbigeoService,
    EntvehiculoService,
    EmpredtiService,
    UbicacionFuncionarioService,
    PaisesService,
    PaisesServicEmprNac,
    RegistroCcmnService,
    CatalogoService,
    PuestoControlService,
    SaldoSeriesService,
    BoletaFacturaService,
    BusquedaPciService,
    DatePipe,
    GuiaRemisionService
  ]
})
export class RegistroccmnModule { }
