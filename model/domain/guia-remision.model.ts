import { ComprobantePago } from "./comprobante-pago.model";

export class GuiaRemision extends ComprobantePago {
  numSerie!: string;
  numGuia!: string;
  numRucRemitente!: string;
  desRazonSocialRemitente!: string;
}
