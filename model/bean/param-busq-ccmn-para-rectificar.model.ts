import { ParamBusqPlacaVehiculo } from "./param-busq-placa-vehiculo.model";
import { ParamBusqDocumento } from "./param-busq-documento";
import { ParamBusqRangoFecha } from "./param-busq-rango-fecha.model";
import { ParamBusqDcl } from 'src/app/model/bean/param-busq-dcl.model';
import { ParamBusqConductor } from 'src/app/model/bean/param-busq-conductor';
import { ParamBusqFuncionario } from 'src/app/model/bean/param-busq-funcionario';

export class ParamBusqCcmnParaRectificar {
    rucRemitente!: string;
    placaVehiculo!: ParamBusqPlacaVehiculo;
    documento!: ParamBusqDocumento;
    declaracion!: ParamBusqDcl;
    rangoFechaRegistro!: ParamBusqRangoFecha;  
    conductor!: ParamBusqConductor;
    funcionario!: ParamBusqFuncionario;
}