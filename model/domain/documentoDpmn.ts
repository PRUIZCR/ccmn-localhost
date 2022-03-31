import { DataCatalogo } from "../common/data-catalogo.model";
import { DatoComplementario } from "../domain/dato-complementario.model";
import { EmpresaTransporte } from "../domain/empresa-transporte.model";
import { Conductor } from "../domain/conductor.model";
import { ComprobantePago } from "../domain/comprobante-pago.model";
//import { DataCatalogo } from "../common/data-catalogo.model";
export class DocumentoDpmn {
    [x: string]: any;
    numCorrelativo!:        number;
    aduana!:                DataCatalogo;
    annDpmn!:               number;
    numDpmn!:               number;
    fecDpmn!:               number;
    estado!:                DataCatalogo;
    aduanaDescarga!:        DataCatalogo;
    puestoControlDescarga!: DataCatalogo;
    actorRegistro!:         DataCatalogo;
    codVariableControl!:    string;
    tipoAnulacion!:         DataCatalogo;
    datoComplementario!:    DatoComplementario;
    empresaTransporte!:     EmpresaTransporte;
    conductor!:             Conductor;
    comprobantePago!:       ComprobantePago[];
}
