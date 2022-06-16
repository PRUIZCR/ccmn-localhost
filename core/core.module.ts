import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MensajeModalComponent } from './components/mensaje-modal/mensaje-modal.component';
import { AuthInterceptor } from './utils/auth.interceptor';
import { DialogService } from 'primeng/dynamicdialog';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DynamicDialogModule } from 'primeng/dynamicdialog';


@NgModule({
  declarations: [
    MensajeModalComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    DynamicDialogModule
  ],
  entryComponents: [
    MensajeModalComponent
  ],
  exports: [
    MensajeModalComponent,
    HttpClientModule,
    DynamicDialogModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }, DialogService, DatePipe]
})
export class CoreModule { }
