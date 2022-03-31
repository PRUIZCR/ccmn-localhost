import { TipoEntidadNegocio } from "./tipo-entidad-negocio.enum";
import { TipoEvento } from "./tipo-evento.enum";

export class MsgRectiCcmn {
  uuid!: string;
  secuencia!: number;
  correlativoCcmn!: number;
  tipoEvento!: TipoEvento;
  jsonPkNegocio!: string;
  tipoEntidadNegocio!: TipoEntidadNegocio;
  jsonData!: string;
  usuario!: string;
  version!: number;
}
