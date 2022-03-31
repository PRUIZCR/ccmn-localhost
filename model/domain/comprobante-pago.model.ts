import { DataCatalogo } from "../common/data-catalogo.model";
import { TipoComprobante } from "../common/tipo-comprobante.enum";
import { Auditoria } from "./auditoria.model";
import { Ubigeo } from "./ubigeo.model";

export class ComprobantePago {
  type!: TipoComprobante;
  numCorrelativo!: number;
  tipoComprobante!: DataCatalogo;
  numRucDestinatario!: string;
  desRazonSocialDestinatario!: string;
  motivoDeTraslado!: DataCatalogo;
  ubigeoDestino!: Ubigeo;
  indEliminado!: boolean;
  auditoria!: Auditoria;
  
  numSerie!: string;
  numGuia!: string;
  numRucRemitente!: string;
  desRazonSocialRemitente!: string;
  numCartaPorte!: string;
  nomEmpresa!: string;

}

