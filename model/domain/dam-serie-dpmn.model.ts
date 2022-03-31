import { DataCatalogo } from "../common/data-catalogo.model";
import { Auditoria } from "./auditoria.model";

export class DamSerieDpmn {
  numCorreDpmn!: number;
  numCorreCompDpmn!: number;
  numCorrelativo!: number;
  aduanaDam!: DataCatalogo;
  regimenDam!: DataCatalogo;
  annDam!: number;
  numDam!: number;
  numSerie!: number;
  codSubPartida!: string;
  desComercial!: string;
  mtoPesoBruto!: number;
  mtoPesoNeto!: number;
  unidadFisica!: DataCatalogo;
  cntUnidadFisica!: number;
  cntRetirada!: number;
  fecRegistro!: any;
  indEliminado!: boolean;
  auditoria!: Auditoria;

  cntSaldo!: number;
  numSecDescarga!: number;
}
