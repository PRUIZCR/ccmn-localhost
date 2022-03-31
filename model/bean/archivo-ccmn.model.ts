import { Auditoria } from "../domain/auditoria.model";

export class ArchivoCcmn {
  id!: number;
  numCorrelativoCcmn!: number;
  //numeroDpmn!: string;
  codAduanaCcmn!: string;
  annioCcmn!: string;
  codTipoDocumento!: string;
  desTipoDocumento!: string;
  origenInvocacion!: string;
  usuarioRegistra!: string;
  nomArchivo!: string;
  nomContentType!: string;
  valArchivoBase64!: string;
  fecRegistro!: Date;
  indEliminado!: boolean;
  auditoria!:Auditoria;
  codArchivoEcm!: string;
}
