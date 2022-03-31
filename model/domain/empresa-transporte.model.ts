import { DataCatalogo } from "../common/data-catalogo.model";

export class EmpresaTransporte {
  tipoNacionalidad!: DataCatalogo;
  codEmpTransporte!: string;
  /** Tipo de documento con el que se identifica el transportista
   * que será 4 si se identifica con RUC o 14 si se identifica
   * con su código de 4 dígitos de transportista terrestre internacional */
  tipoDocIdentidad!: DataCatalogo;
  /** Corresponde al número de RUC con al código de 4 dígitos
   * con el que se identifica el transportista */
  numDocIdentidad!: string;
  paisEmpresa!: DataCatalogo;
  nomEmpresa!: string;
  flujoVehiculo!: DataCatalogo;
  paisPlaca!: DataCatalogo;
  nomPlaca!: string;
  valEmail!: string;
  paisPlacaCarreta!: DataCatalogo;
  nomPlacaCarreta!: string;
  numTelefono!: string;
  forEach!: any;
}
