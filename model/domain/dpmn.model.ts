import { DataCatalogo } from "../common/data-catalogo.model";
import { DatoComplementario } from "./dato-complementario.model";
import { EmpresaTransporte } from "./empresa-transporte.model";
import { Conductor } from "./conductor.model";
import { ComprobantePago } from "./comprobante-pago.model";
import { Auditoria } from "./auditoria.model";

export class Dpmn {
  numCorrelativo!: number;
  aduana!: DataCatalogo;
  annDpmn!: number;
  numDpmn!: number;
  fecDpmn!: any;
  estado!: DataCatalogo;
  aduanaDescarga!: DataCatalogo;
  puestoControlDescarga!: DataCatalogo;
  actorRegistro!: DataCatalogo;
  codVariableControl!: string;
  tipoAnulacion!: DataCatalogo;
  datoComplementario!: DatoComplementario;
  empresaTransporte!: EmpresaTransporte;
  conductor!: Conductor;
  comprobantePago!: ComprobantePago[];
  auditoria!: Auditoria;
}
