import { Canal } from "../model/common/canal.enum";
import { FlujoVehiculo } from "../model/common/flujo-vehiculo.enum";
import { TipoControl } from "../model/common/tipo-control.enum";

/**
 * Constantes relacionadas a toda esta APP
 */
export class ConstantesApp {

  /**
   * Nombre del key, almacenado en sessionstorage,
   * donde se guarda el Token de session
   */
  static readonly KEY_SESSION_TOKEN : string = "token-app-ctacorriente-impo-ccmn";

  /**
   * Nombre del key, almacenado en sessionstorage,
   * donde se guarda el valor userdata del token de session
   */
  static readonly KEY_SESSION_USER_DATA : string = "user-data-ctacorriente-impo-ccmn";

    /**
   * Nombre del key, almacenado en sessionstorage,
   * donde se guarda el RUC vinculado al token de session
   */
  static readonly KEY_SESSION_USER_RUC : string = "ruc-ctacorriente-impo-ccmn";

  static readonly KEY_SESSION_LOGIN : string = "login-ctacorriente-impo-ccmn";

  static readonly KEY_SESSION_ORIGEN : string = "origen-ctacorriente-impo-ccmn";

  static readonly KEY_SESSION_NRO_REGISTRO : string = "nroregistro-ctacorriente-impo-ccmn";

  static readonly KEY_SESSION_NOMBRE_COMPLETO : string = "nombrecompleto-ctacorriente-impo-ccmn";

  /**
   * Endpoints REST
   */
  //static readonly RESOURCE_LISTAR_PCI : string = "/v1/controladuanero/prevencion/cuentacorrienteimpo/e/pcis/";
  static readonly RESOURCE_LISTAR_PCI : string = "/v1/controladuanero/scci/pcis/"; //AENA

  //static readonly RESOURCE_DATOS_DECLARACION : string = "/v1/controladuanero/dpmns/";
  static readonly RESOURCE_DATOS_DECLARACION : string = "/v1/controladuanero/scci/dpmns/"; //AENA

  static readonly RESOURCE_DATOS_DECLARACION_CCMN : string = "/v1/controladuanero/scci/ccmns/";//pase85

  static readonly RESOURCE_ARCHIVOS_ADJUNTOS : string = "/v1/controladuanero/scci/archivosadjuntodpmn/";

  static readonly RESOURCE_ENDPOINT_CCMN: string = "/v1/controladuanero/scci/ccmn";

  static readonly RESOURCE_ENDPOINT_DAM_SERIES_CCMN: string = "/v1/controladuanero/scci/damseriesccmn";

  static readonly RESOURCE_ENDPOINT_ADJUNTOS_CCMN: string = "/v1/controladuanero/scci/adjuntosccmn";

  static readonly RESOURCE_ENDPOINT_VERIFICAR_GRABACION: string = "/v1/controladuanero/scci/ccmn/verificargrabacion";

  static readonly RESOURCE_ENDPOINT_DPMN: string = "/v1/controladuanero/scci/dpmn";

  static readonly RESOURCE_ENDPOINT_DNI: string = "/v1/controladuanero/scci/dni";

  static readonly RESOURCE_ENDPOINT_FUNCIONARIO_UBICACION: string = "/v1/controladuanero/scci/funcionario/ubicacion";

  static readonly RESOURCE_ENDPOINT_EMPRESA_TRANS_INTER: string = "/v1/controladuanero/scci/empresasdetranspinter";

  static readonly RESOURCE_ENDPOINT_ENT_VEHICULO: string = "/v1/controladuanero/scci/entvehiculos";

  static readonly RESOURCE_RUC : string = "/v1/controladuanero/scci/ruc";

  static readonly RESOURCE_UBIGEOS : string  = "/v1/controladuanero/scci/ubigeos";

  static readonly RESOURCE_DNI : string = "/v1/controladuanero/scci/dni";

  static readonly RESOURCE_PUESTOS_CONTROL : string = "/v1/controladuanero/scci/puestoscontrol";

  static readonly RESOURCE_VALIDAR_DAM_REGISTRO_DPMN : string = "/v1/controladuanero/scci/registrodpmn/validardeclaracion";

  static readonly RESOURCE_GUIA_REM_TRANSPORTISTA : string = "/v1/contribuyente/gretransportista";

  static readonly RESOURCE_BOLETA : string = "/v1/controladuanero/scci/boleta/";

  static readonly RESOURCE_FACTURA : string = "/v1/controladuanero/scci/factura/";

  static readonly RESOURCE_DECLARACIONES : string = "/v1/controladuanero/scci/declaraciones";

  static readonly RESOURCE_BUSQUEDA : string = "/v1/controladuanero/scci/declaraciones";

  /**
   * Indica cuantas series de la DAM, se pueden grabar en una petición HTTP
   */
   static readonly TAMANIO_BATCH_DAMSERIESDPMN_POR_REQUEST : number = 100;


   static readonly COLOR_CANAL = new Map<string, string>([
    [Canal.ROJO, 'Red'],
    [Canal.NARANJA, 'Orange'],
    [Canal.VERDE, 'Green']
  ]);

  static readonly COLOR_CONTROL = new Map<string, string>([
    [TipoControl.FISICO, 'Red'],
    [TipoControl.DOCUMENTARIO, 'Orange'],
    [TipoControl.ROJO, 'Red'],
    [TipoControl.NARANJA, 'Orange'],
    [TipoControl.VERDE, 'Green']
  ]);

  static readonly ICONS_FLUJO_VEHICULO = new Map<string, string>([
    [FlujoVehiculo.BUS, 'bus_icon_64.ico'],
    [FlujoVehiculo.CARGA, 'truck__icon_64.ico'],
    [FlujoVehiculo.PARTICULAR, 'car_icon_64.ico']
  ]);


/*******************************/

  static readonly RESOURCE_DPMN : string = "/v1/controladuanero/dpmn";

  static readonly RESOURCE_DAMSERIESDPMN : string = "/v1/controladuanero/damseriesdpmn";

  static readonly RESOURCE_ADJUNTOSDPMN : string = "/v1/controladuanero/adjuntosdpmn";

  static readonly RESOURCE_VERIFICAR_GRABACION_DPMN : string = "/v1/controladuanero/dpmn/verificargrabacion";

/*******************************/
/**************085*****************/

static readonly RESOURCE_CCMN : string = "/v1/controladuanero/ccmn";

static readonly RESOURCE_DAMSERIESCCMN : string = "/v1/controladuanero/damseriesccmn";

static readonly RESOURCE_ADJUNTOSCCMN : string = "/v1/controladuanero/adjuntosccmn";

static readonly RESOURCE_VERIFICAR_GRABACION_CCMN : string = "/v1/controladuanero/ccmn/verificargrabacion";

/*******************************/





static readonly RESOURCE_CONSULTA_RECTI_CCMN : string = "/v1/controladuanero/scci/consultaccmn/buscarpararectificar";
static readonly RESOURCE_PERFILES_USUARIO : string = "/v1/controladuanero/scci/perfilesusuario";


  /**
   * Tamaño máximo en bytes permitdos para un archivo
   * que se desea adjuntar a la DPMN
   */
  static readonly MAX_TAMANIO_ARCHIVO_CCMN : number = 1048576;

  /**
   * Cantidad máxima de archivos que se pueden adjuntar a la DPMN
   */
  static readonly MAX_CNT_ARCHIVO_CCMN : number = 20;

  /**
   * Indica cuantas series de la DAM, se pueden grabar en una petición HTTP
   */
  static readonly TAMANIO_BATCH_DAMSERIESCCMN_POR_REQUEST : number = 100;

  static readonly COD_TIPO_COMP_GUIA_REMISION : string = "01";
  static readonly COD_TIPO_COMP_CARTA_PORTE : string = "02";
  static readonly COD_TIPO_COMP_FACTURA : string = "03";
  static readonly COD_TIPO_COMP_BOLETA : string = "04";

  static readonly ORIGEN_INTERNET : string = "IT";
  static readonly ORIGEN_INTRANET : string = "IA";


  static getResourceFichaResumenQr(correlativoCcmn : number) : string {
    return `/v1/controladuanero/scci/ccmns/${correlativoCcmn}/formatopdf`;
  }


 static readonly RESOURCE_RECTIFICACION_CHEK_ESTADO_EVENTOS_CCMN : string = "/v1/controladuanero/scci/dpmn/checkestadoeventos";
 static readonly RESOURCE_RECTIFICACION_CONFIRM_RECTIFICACION_CCMN : string =  "/v1/controladuanero/scci/dpmn/confirmarectificacion";
 static readonly RESOURCE_RECTIFICACION_PUBLICACION_RECTIFICACION_CCMN : string =  "/v1/controladuanero/ccmn/publicarectificacion";
 static readonly RESOURCE_RECTIFICACION_DOCUMENTOSECM_CCMN : string =  "/v1/controladuanero/scci/documentosecm";
}
