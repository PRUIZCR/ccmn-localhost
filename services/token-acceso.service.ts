import { Injectable } from '@angular/core';
import { ConstantesApp } from '../utils/constantes-app'

@Injectable({
  providedIn: 'root'
})
export class TokenAccesoService {

  constructor() { }

  guardarTokenSession(token: string) : void {
    sessionStorage.setItem(ConstantesApp.KEY_SESSION_TOKEN, token);
    this.guardarUserData();
  }

  private guardarUserData() : void {
    let tokenSession = sessionStorage.getItem(ConstantesApp.KEY_SESSION_TOKEN) as string;
    let currentData = this.decodeToken(tokenSession);
    let numeroRUC = currentData?.userdata?.numRUC;
    let login = currentData?.userdata?.login;
    let origen = currentData?.userdata?.map?.tipOrigen;
    let nroRegistro = currentData?.userdata?.nroRegistro;
    let nombreCompleto = currentData?.userdata?.nombreCompleto;

    if ( numeroRUC != null ) {
      sessionStorage.setItem(ConstantesApp.KEY_SESSION_USER_RUC, numeroRUC);
    }

    if ( login != null ) {
      sessionStorage.setItem(ConstantesApp.KEY_SESSION_LOGIN, login);
    }

    if ( origen != null ) {
      sessionStorage.setItem(ConstantesApp.KEY_SESSION_ORIGEN, origen);
    }

    if ( nroRegistro != null ) {
      sessionStorage.setItem(ConstantesApp.KEY_SESSION_NRO_REGISTRO, nroRegistro);
    }

    if ( nombreCompleto != null ) {
      sessionStorage.setItem(ConstantesApp.KEY_SESSION_NOMBRE_COMPLETO, nombreCompleto);
    }

    sessionStorage.setItem(ConstantesApp.KEY_SESSION_USER_DATA, currentData?.userdata);
  }

  get token() : any {
    return sessionStorage.getItem(ConstantesApp.KEY_SESSION_TOKEN);
  }

  get userData() : any {
    return sessionStorage.getItem(ConstantesApp.KEY_SESSION_USER_DATA);
  }

  get numeroRUC() : string {
    return sessionStorage.getItem(ConstantesApp.KEY_SESSION_USER_RUC) as string;
  }

  get login() : string {
    return sessionStorage.getItem(ConstantesApp.KEY_SESSION_LOGIN) as string;
  }

  get origen() : string {
    return sessionStorage.getItem(ConstantesApp.KEY_SESSION_ORIGEN) as string;
  }

  get nroRegistro() : string {
    return sessionStorage.getItem(ConstantesApp.KEY_SESSION_NRO_REGISTRO) as string;
  }

  get nombreCompleto() : string {
    return sessionStorage.getItem(ConstantesApp.KEY_SESSION_NOMBRE_COMPLETO) as string;
  }

  private decodeToken(token: string): any {
    token = token || '';
    if (token === null || token === '') {
      return { upn: '' };
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('JWT debe tener 3 partes');
    }
    const decoded = this.urlBase64Decode(parts[1]);
    if (!decoded) {
      throw new Error('No se puede decodificar el token');
    }
    return JSON.parse(decoded);
  }

  private urlBase64Decode(str: string) {
    var output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
        case 0:
            break;
        case 2:
            output += '==';
            break;
        case 3:
            output += '=';
            break;
        default:
            throw 'Illegal base64url string!';
    }
    return decodeURIComponent(window.escape(window.atob(output)));
  }

}
