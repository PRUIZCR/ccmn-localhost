import { ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TipoRegistro } from 'src/app/model/common/tipo-registro';
import { PciDetalle } from 'src/app/model/domain/pcidetalle.model';
import { RegistroCcmnService } from 'src/app/services/registro-ccmn.service';
import { ConstantesApp } from 'src/app/utils/constantes-app';

@Component({
  selector: 'app-iniciar-registro',
  templateUrl: './iniciar-registro.component.html',
  styleUrls: ['./iniciar-registro.component.css']
})
export class IniciarRegistroComponent implements OnInit {

  pasoActual : number = 1;
  controlPasoForm!: FormGroup;
  tipoRegistro!:TipoRegistro;
  estado=TipoRegistro;
  titulo!:string;
  tituloPaso1!:string;
  pci!: PciDetalle;

  constructor(private registroCcmnService: RegistroCcmnService,
              private formBuilder: FormBuilder,
              private cdRef:ChangeDetectorRef) {
    this.buildForm();
  }

  ngOnInit(): void {
    this.tipoRegistro = this.registroCcmnService.tipoRegistro;

    this.registroCcmnService.pasoActual$.subscribe( (numPaso : number) => {
        this.pasoActual = numPaso;
        this.cdRef.detectChanges();
    });
    this.completarDatosControlPaso();
  }

  get txtNumControlPaso() : AbstractControl {
    return this.controlPasoForm.get("controlPaso") as FormControl;
  }

  get txtFechaRegistro() : AbstractControl {
    return this.controlPasoForm.get("fechaRegistro") as FormControl;
  }

  get txtPaisPlaca() : AbstractControl {
    return this.controlPasoForm.get("paisPlaca") as FormControl;
  }

  get txtnumPlaca() : AbstractControl {
    return this.controlPasoForm.get("numPlaca") as FormControl;
  }

  get txtCanalControl() : AbstractControl {
    return this.controlPasoForm.get("canalControl") as FormControl;
  }

  private buildForm() : void {
    this.controlPasoForm = this.formBuilder.group({
      controlPaso: ['', [Validators.required]],
      fechaRegistro: ['', [Validators.required]],
      paisPlaca: ['', [Validators.required]],
      numPlaca: ['', [Validators.required]],
      canalControl: ['', [Validators.required]]
    });
  }

  private completarDatosControlPaso() : void {
    
    switch (this.tipoRegistro) {
      case "01":
          this.titulo = "Carga";
          break;
      case "02":
          this.titulo = "Buses";
          this.tituloPaso1 = "de la Empresa, Conductor y Responsable"
          break;
      case "03":
          this.titulo = "Particulares";
          this.tituloPaso1 = "del Viaje y Responsable"
          break;
      case "04":
          this.titulo = "CAF";
          this.tituloPaso1 = "de la Empresa y Conductor"
          break;
      case "05":
          this.titulo = "TTA";
          this.tituloPaso1 = "de la Empresa y Responsable"
          break;
      default:
          this.titulo = "";
          break;
  }
    
    this.pci = this.registroCcmnService.pciDetalle;

    if ( this.pci == null ) {
      return;
    }

    let numPciNew : string =  ('0000000000' + this.pci.numPci).slice(-10);

    let numCtrlPaso : string = this.pci?.aduana?.codDatacat + "-" + this.pci?.puestoControl?.codDatacat + "-" + this.pci.annPci + "-" + numPciNew;

    this.txtFechaRegistro.setValue(this.pci.fecInicioControl);
    this.txtNumControlPaso.setValue(numCtrlPaso);
    this.txtPaisPlaca.setValue(this.pci.paisPlaca.codDatacat);
    this.txtnumPlaca.setValue(this.pci.nomPlaca);
    this.txtCanalControl.setValue(this.pci.tipoControl.desDataCat);
  }

  getColorControl(pci : PciDetalle) : string {

    let tipoControl : string = pci?.tipoControl?.codDatacat;

    if ( tipoControl == null ) {
      return "";
    }

    return ConstantesApp.COLOR_CONTROL.get(tipoControl) as string;
  }

}
