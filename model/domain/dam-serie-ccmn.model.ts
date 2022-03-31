import { DataCatalogo } from "../common/data-catalogo.model";
import { Auditoria } from "../domain/auditoria.model";

export class DamSerieCcmn {
    numCorreCcmn!: number;
    numCorreCompCcmn!: number;
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
    numSecDescarga!: number;
    cntSaldo!: number;
    fecRegistro!: string;
    indEliminado!: boolean;
    auditoria!: Auditoria;
}