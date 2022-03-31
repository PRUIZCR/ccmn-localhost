import { DataCatalogo } from "../common/data-catalogo.model";

export class PciDetalle{
    numCorrelativo!: number;
    aduana: DataCatalogo = new DataCatalogo;
    puestoControl: DataCatalogo = new DataCatalogo;
    annPci!: number;
    numPci!: number;
    motivoViaje: DataCatalogo = new DataCatalogo;
    numCorrelativoDocumento!: number;
    codTipoDocumento!: string;
    aduanaDocumento: DataCatalogo = new DataCatalogo;
    puestoControlDocumento: DataCatalogo = new DataCatalogo;
    annDocumento!: number;
    numDocumento!: number;
    paisPlaca: DataCatalogo = new DataCatalogo;
    nomPlaca!: string;
    paisPlacaCarreta: DataCatalogo = new DataCatalogo;
    nomPlacaCarreta!: string;
    flujoVehiculo: DataCatalogo = new DataCatalogo;
    tipoControl: DataCatalogo = new DataCatalogo;
    fecInicioControl: any;
    codFuncionario!: string;
    nomFuncionario!: string;
    estado: DataCatalogo = new DataCatalogo;
    nomConductor!: string;
    tipoDocIdentidad: DataCatalogo = new DataCatalogo;
    numDocIdentidad!: string;
    tiempoTranscurrido!: number;
    controlPaso!:string;
}