import {DataCatalogo} from '../common/data-catalogo.model';
import { Auditoria } from '../../model/domain/auditoria.model';

export class ItemCcmnParaRectificar {
    correlativoCcmn!: number;
    numeroCcmn!: string;
    paisPlaca!: DataCatalogo;
    nomPlaca!: string;
    paisPlacaCarreta!: DataCatalogo;
    nomPlacaCarreta!: string;
    flujoVehiculo!: DataCatalogo;
    auditoria!: Auditoria;
    tieneDpmnUsuarioExterno!: boolean;
}
