import { Injectable } from '@angular/core';
import { BehaviorSubject,of, EMPTY, Observable, throwError } from 'rxjs';
import { ArchivoCcmn } from '../model/bean/archivo-ccmn.model';
import { Ccmn } from '../model/domain/ccmn.model';
import { DamSerieCcmn } from '../model/domain/dam-serie-ccmn.model';
import { ComprobantePago } from '../model/domain/comprobante-pago.model';
import { CartaPorte } from '../model/domain/carta-porte.model';
import { TipoComprobante } from '../model/common/tipo-comprobante.enum';
import { GuiaRemision } from '../model/domain/guia-remision.model';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ConstantesApp } from '../utils/constantes-app';
import { map, catchError} from 'rxjs/operators';
import { SerieDeclaracionDpmn } from '../model/domain/serie-declaracion';
import { DocumentoAdjuntoDpmn } from '../model/domain/adjunto-dpmn.model';
import { Estado } from '../model/common/Estado';
import { Respuesta } from '../model/common/Respuesta';
import { DocumentoAdjuntoCcmn } from '../model/domain/adjunto-ccmn.model';
@Injectable()
export class BuscarCcmnService {

  private URL_RESOURCE_CONSULTA_CCMNS: string = environment.urlBase + "/v1/controladuanero/scci/ccmns";
  private URL_RESOURCE_ARCHIVOS_ADJUNTOS_CCMN: string =environment.urlBase +  ConstantesApp.RESOURCE_ARCHIVOS_ADJUNTOS_CCMN;
  private rptCcmns : Respuesta<Ccmn[]> = Respuesta.create(new Array, Estado.LOADING);
  private rptCcmnSource = new BehaviorSubject<Respuesta<Ccmn[]>>(new Respuesta<Ccmn[]>());
  public rptBuscarCcmn$ = this.rptCcmnSource.asObservable();


  constructor(private http: HttpClient) { }

  /**
   * Busca una CCMN por su correlativo
   * @param correlativoCcmn Correlativo de la CCMN
   */
  //  buscar(correlativoCcmn: number) : Observable<Ccmn> {
  //   //TODO Completar
  //   return EMPTY;
  // }
  buscar(numCorrelativo:  string | null){

    return this.http.get<Ccmn>
      (this.URL_RESOURCE_CONSULTA_CCMNS +"/"+ numCorrelativo).pipe(map( (data : any) => {
        let resultado : Ccmn = data;

        let infoComp :  ComprobantePago[] = []

        data.comprobantePago.filter( (dataComp:any) => dataComp.indEliminado == false ).forEach( (dataComp:any) => {
         infoComp.push( this.buildComprobante(dataComp) );
        });

        resultado.comprobantePago = infoComp;

        return resultado;

      }));

    }
  private crearDocumentoCcmn(resp:any){
    const documentosCCMN: Ccmn[] = [];

    Object.keys(resp).forEach(key=>{
        const docuDpmn:Ccmn=resp[key];
        documentosCCMN.push(docuDpmn);
    });
    return documentosCCMN;
  }

  /**
   * Busca las Series de la DAM asociadas a una CCMN
   * @param correlativoCcmn Correlativo de la CCMN
   */
   buscarDamSeries(correlativo: string|null ) : Observable<DamSerieCcmn>  {
   // let url : string = this.appEndPointConfig.dpmns + "/" + correlativo + "/damseriesdpmn";
   let url : string = this.URL_RESOURCE_CONSULTA_CCMNS + "/" + correlativo + "/damseriesccmn";
   return this.http.get<DamSerieCcmn>(url).pipe( map(
      ( lstDamSeriesCcmn : any ) => {
      return lstDamSeriesCcmn.filter( ( item : DamSerieCcmn ) => item.indEliminado == false );
      }
      )
    );

  }

  buscarAdjuntos(correlativo: string|null ) : Observable<ArchivoCcmn[]>  {
    //let url : string = this.appEndPointConfig.dpmns + "/" + correlativo + "/adjuntosdpmn";
    let url : string =this.URL_RESOURCE_CONSULTA_CCMNS + "/" + correlativo + "/adjuntosccmn";
    return this.http.get<ArchivoCcmn[]>(url).pipe(map((data : any[]) => {

      let resultado : ArchivoCcmn[] = new Array();
      let secuencia : number = 0;

      //data.forEach( (adjunto : ArchivoCcmn) => {
        data.filter( ( item : DocumentoAdjuntoCcmn ) => item.indEliminado == false ).forEach( (adjunto : DocumentoAdjuntoCcmn) => {
        let archivo : ArchivoCcmn = new ArchivoCcmn();
        archivo.id = secuencia++;
        archivo.numCorrelativoCcmn = adjunto.numCorrelativoCcmn;
        archivo.codTipoDocumento = adjunto.codTipoDocumento;
        archivo.desTipoDocumento = adjunto.desTipoDocumento;
        archivo.nomArchivo = adjunto.nomArchivo;
        archivo.nomContentType = adjunto.nomContentType;
        archivo.fechaRegistro = adjunto.fecRegistro;
        archivo.codArchivoEcm = adjunto.codArchivoEcm;
        resultado.push(archivo);
      });

      return resultado;
    }));
  }

  buscarVersion(correlativo: string|null) : Observable<number>  {
    //let url : string = this.appEndPointConfig.dpmns + "/" + correlativo + "/version";
    let url : string = this.URL_RESOURCE_CONSULTA_CCMNS + "/"  + correlativo + "/version";
    return this.http.get<number>(url);
  }
  getSeriesDeclaracionByNumcorredoc(numCorrelativo: string | null) {
    return this.http.get<DamSerieCcmn>
      (this.URL_RESOURCE_CONSULTA_CCMNS+ "/" + numCorrelativo + "/damseriesccmn")
      .pipe(
        map(
        (resp: DamSerieCcmn) => this.crearSerieDeclaracionCcmn(resp)
        )
      )
  }

  private buildComprobante( dataComp : any ) : ComprobantePago {

    let resultado : ComprobantePago = dataComp;

    switch ( dataComp?.tipoComprobante?.codDatacat ) {
      case ConstantesApp.COD_TIPO_COMP_GUIA_REMISION :
        return this.buildGuiaRemision(dataComp);
      case ConstantesApp.COD_TIPO_COMP_CARTA_PORTE :
        return this.buildCartaPorte(dataComp);
    }

    return resultado;
  }
  private buildCartaPorte( dataComp : any ) : CartaPorte {
    let cartaPorte : CartaPorte = new CartaPorte();
    cartaPorte.type = TipoComprobante.CARTA_PORTE;

    this.completeCommonPropsDataComp(dataComp, cartaPorte);

    cartaPorte.numCartaPorte = dataComp.numCartaPorte;
    cartaPorte.nomEmpresa = dataComp.nomEmpresa;

    return cartaPorte;
  }
  private buildGuiaRemision( dataComp : any ) : GuiaRemision {
    let guiaRemision : GuiaRemision =  new GuiaRemision();
    guiaRemision.type = TipoComprobante.GUIA_REMISION;

    this.completeCommonPropsDataComp(dataComp, guiaRemision);

    guiaRemision.numSerie = dataComp.numSerie;
    guiaRemision.numGuia = dataComp.numGuia;
    guiaRemision.numRucRemitente = dataComp.numRucRemitente;
    guiaRemision.desRazonSocialRemitente = dataComp.desRazonSocialRemitente;

    return guiaRemision;
  }


  private crearSerieDeclaracionCcmn(resp: any) {
    const SerieDeclaracionDpmn: DamSerieCcmn[] = [];
    Object.keys(resp).forEach(key => {
      const docCcmn: DamSerieCcmn = resp[key];
      SerieDeclaracionDpmn.push(docCcmn);
    });
    return SerieDeclaracionDpmn;
  }


  /**
   * Busca adjuntos asociados a una CCMN
   * @param correlativoCcmn Correlativo de la CCMN
   */
  // buscarAdjuntos(correlativoCcmn: number) : Observable<ArchivoCcmn> {
  //   //TODO Completar
  //   return EMPTY;
  // }
  descargarAdjunto(idEcm : string) : Observable<Blob> {
    //let url : string = this.appEndPointConfig.archivosadjuntodpmn + "/" + idEcm
    let url : string = this.URL_RESOURCE_ARCHIVOS_ADJUNTOS_CCMN+ "/" + idEcm
    return this.http.get(url,{responseType: 'blob'})
  }


  getDocumentoAdjuntoByNumcorredoc(numCorrelativo: string | null) {

    return this.http.get<DocumentoAdjuntoDpmn>
      // (this.URL_RESOURCE_ARCHIVOS_ADJUNTOS + numCorrelativo + "/" + "adjuntosdpmn")
      (this.URL_RESOURCE_CONSULTA_CCMNS + numCorrelativo)
      .pipe(
        map(
          (resp: DocumentoAdjuntoDpmn) => this.crearDocumentoAdjuntoDpmn(resp)
        )
      )
  }

  private crearDocumentoAdjuntoDpmn(resp: any) {
    const documentosAdjuntosDPMN: DocumentoAdjuntoDpmn[] = [];
    Object.keys(resp).forEach(key => {
      const docuAdjuntoDpmn: DocumentoAdjuntoDpmn = resp[key];
      // if(resp===null){  return []; }
      // docuDpmn.numCorrelativo=key;
      documentosAdjuntosDPMN.push(docuAdjuntoDpmn);
    });
    return documentosAdjuntosDPMN;
  }

  private completeCommonPropsDataComp( dataCompSource : any, dataCompTarget : ComprobantePago ) {
    dataCompTarget.numCorrelativo = dataCompSource.numCorrelativo;
    dataCompTarget.tipoComprobante = dataCompSource.tipoComprobante;
    dataCompTarget.numRucDestinatario = dataCompSource.numRucDestinatario;
    dataCompTarget.desRazonSocialDestinatario = dataCompSource.desRazonSocialDestinatario;
    dataCompTarget.motivoDeTraslado = dataCompSource.motivoDeTraslado;
    dataCompTarget.ubigeoDestino = dataCompSource.ubigeoDestino;
    dataCompTarget.indEliminado = dataCompSource.indEliminado;
  }
}
