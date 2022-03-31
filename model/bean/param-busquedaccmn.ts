
import { DataCatalogo } from "../common/data-catalogo.model";
export class ConsultaCcmn {
    codigoTransportista!: string;
    rucTransportista!: string;
    razonSocialTransportista!: string;
    tipoDocumentoDescarga!: DataCatalogo;
    estadoDelDocumentoDeDescarga!: DataCatalogo;
    tipoDeControl!: DataCatalogo;
    paisPlacaDelVehiculo!: DataCatalogo;
    placaDelVehiculo!: string;
    indicadorPorDocumento!: boolean;
    numeroDeDescarga!: number;
    aduanaDeDescarga!: DataCatalogo;
    puestoDeControlDescarga!: DataCatalogo;
    anoDeDescarga!: number;
    rucDelRemitente!: string;
    razonSocialDelRemitente!: string;
    indicadorPorDeclaracion!: boolean;
    aduanaDeDeclaracion!: DataCatalogo;
    anoDeDeclaracion!: number;
    regimenDeDeclaracion!: DataCatalogo;
    numeroDeDeclaracion!: number;
    indicadorPorFecha!: boolean;
    fechaDeInicioConsulta!: string;
    fechaFinConsulta!: string;
    indicadorConsultaFuncionario!: boolean;
    codAduanaFuncionario!:string;
}