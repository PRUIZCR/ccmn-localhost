import { DataCatalogo } from "../common/data-catalogo.model";
import { Auditoria } from "../domain/auditoria.model";
import { ComprobantePago } from "./comprobante-pago.model";
import { Conductor } from "./conductor.model";
import { DatoComplementario } from "./dato-complementario.model";
import { EmpresaTransporte } from "./empresa-transporte.model";
import { FuncionarioAduanero } from "./funcionario-aduanero.model";
import { Responsable } from "./responsable.model";

export class Ccmn{
    numCorrelativo!: number;
    numCorrelativoPCI!: number;
    aduana!: DataCatalogo;
    puestoControl!: DataCatalogo;
    annCcmn!: number;
    numCcmn!: number;
    fecCcmn!: any;
    estado!: DataCatalogo;
    aduanaDescarga!: DataCatalogo;
    puestoControlDescarga!: DataCatalogo;
    moduloRegistro!: DataCatalogo;
    codVariableControl!: string;
    tipoAnulacion!: DataCatalogo;
    auditoria!: Auditoria;
    numCorrelativoDpmn!: number;
    funcionarioAduanero!: FuncionarioAduanero;
    cntDamSeries!: number;
    cntAdjuntos!: number;
    datoComplementario!: DatoComplementario;
    empresaTransporte!: EmpresaTransporte;
    conductor!: Conductor;
    responsable!:Responsable;
    comprobantePago!:ComprobantePago[];
}
