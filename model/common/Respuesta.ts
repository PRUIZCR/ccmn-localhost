import { HttpErrorResponse } from '@angular/common/http';
import { Estado } from './Estado';
import { RespuestaError } from './response-error';

export class Respuesta<T> {
  data!: T;
  mensajes: RespuestaError[] = new Array();
  estado!: Estado;

  public static  create<U>(newData: U, newEstado: Estado) : Respuesta<U> {
      var resultado = new Respuesta<U>();
      resultado.data = newData;
      resultado.estado = newEstado;
      return resultado;
  }

  public static  createFromErrorHttp(error: HttpErrorResponse) : Respuesta<any> {
    var resultado = new Respuesta<any>();

    resultado.data = null;

      if ( error.status >= 500  ) {
        resultado.estado = Estado.ERROR;
      } else {
        resultado.estado = Estado.WARNING;
      }

    resultado.mensajes = this.obtenerMensajes(error);

    return resultado;
  }

  public static obtenerMensajes(error: HttpErrorResponse) : RespuestaError[] {
    var mensajesError : RespuestaError[] = new Array();
    var erroresHttp = error.error;

    if (Array.isArray( erroresHttp ) ) {
      erroresHttp.forEach(itemError => {
        if ( itemError.cod != null && itemError.msg != null) {
          let newMensajeBean = new RespuestaError();
          newMensajeBean.cod = itemError.cod;
          newMensajeBean.msg = itemError.msg;
          mensajesError.push(newMensajeBean);
        }
      })
    };

    if ( mensajesError.length > 0 ) {
      return mensajesError;
    }

    if ( erroresHttp.msg != null ) {
      let newMensajeBean = new RespuestaError();
      newMensajeBean.cod = erroresHttp.cod != null ? erroresHttp.cod : 1;
      newMensajeBean.msg = erroresHttp.msg;
      mensajesError.push(newMensajeBean);
      return mensajesError;
    }

    let mensajeBean = new RespuestaError();
    mensajeBean.cod = 1;

    if ( error.status == 404  ) {
      mensajeBean.msg = "No existe el recurso solicitado";
    } else {
      mensajeBean.msg = "Ha ocurrido un error";
    }

    mensajesError.push(mensajeBean);

    return mensajesError;
  }

  public agregarMensaje(newCodigo: number, newMensaje: string ): void {
    var mensaje = new RespuestaError();
    mensaje.cod = newCodigo;
    mensaje.msg = newMensaje;
    this.mensajes.push(mensaje);
  }

}
