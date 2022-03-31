import { DataCatalogo } from "../common/data-catalogo.model";
import { ComprobantePago } from "./comprobante-pago.model";

export class BoletaFactura extends ComprobantePago {
  numSerie!: string;
  numComprobante!: string;
  numRuc!: string;
  tipoDocAdquiriente!:DataCatalogo;
  numDocAdquiriente!:string;
  nomAdquiriente!:string;
  desRazonSocial!:string;
}
