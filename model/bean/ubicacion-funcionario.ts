import { MensajeBean } from "./../common/MensajeBean";
import { PuestoControlFuncionario } from "./puesto-control-funcionario";

export class UbicacionFuncionario {

  numeroRegistro!: string;
  turno!: string;
  servicio!: string;
  puestoControl!: PuestoControlFuncionario;
  errores!: MensajeBean[];

}
