import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-mensaje-modal',
  templateUrl: './mensaje-modal.component.html',
  styleUrls: ['./mensaje-modal.component.css']
})
export class MensajeModalComponent implements OnInit {

  mensaje: string | undefined;

  constructor(private config: DynamicDialogConfig) { }

  ngOnInit(): void {
    this.mensaje = this.config.data?.mensaje;
  }

}
