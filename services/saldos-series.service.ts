import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { ConstantesApp } from '../utils/constantes-app';
import { DamSerieCcmn } from '../model/domain/dam-serie-ccmn.model';
import { Respuesta } from '../model/common/Respuesta';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { Estado } from '../model/common/Estado';
import { SaldoSerieDam } from '../model/bean/saldo-serie-dam';

@Injectable()
export class SaldoSeriesService {

  private URL_RESOURCE_ENDPOINT_CCMN: string = environment.urlBase + ConstantesApp.RESOURCE_ENDPOINT_CCMN;
  private rptaValSaldosSerieDam : Respuesta<Boolean>= new Respuesta<Boolean>();
  private validacionSaldosSerieDamSubject = new BehaviorSubject<Respuesta<Boolean>>(new Respuesta<Boolean>());;
  public validacionSaldosSerieDam$ = this.validacionSaldosSerieDamSubject.asObservable();
  private cntDamAValidar: number=0;
  private cntDamValidadas: number=0;
  constructor(private http: HttpClient) {}

  buscar(codAduana : string, codRegimen: string, anio: number, numero: number): Observable<SaldoSerieDam[]> {
    let url : string =environment.urlBase + `/v1/controladuanero/scci/declaraciones/${codAduana}-${codRegimen}-${anio}-${numero}/saldoctacorriente`;
   // let url : string = this.appEndPointConfig.getSaldoCtaCorrienteDam(codAduana, codRegimen, anio, numero);
    return this.http.get<SaldoSerieDam[]>(url);
  }
  validarSaldoSeries(damSeriesCcmn: DamSerieCcmn[]) : Observable<any> {
    let url : string = this.URL_RESOURCE_ENDPOINT_CCMN + "/validargrabacion";
    return this.http.post<any>(url, damSeriesCcmn);
  }
  validarSaldosDam(damSeriesDpmn : DamSerieCcmn[]): void {

    this.rptaValSaldosSerieDam = Respuesta.create(true, Estado.LOADING);

    this.validacionSaldosSerieDamSubject.next(this.rptaValSaldosSerieDam);

    let dams : DamSerieCcmn[] = this.extraerDamConsultadas(damSeriesDpmn);

    this.cntDamAValidar = dams.length;
    this.cntDamValidadas = 0;

    dams.forEach( ( itemDam : DamSerieCcmn, key: number, arr: Array<DamSerieCcmn> ) => {

      let codAduana : string = itemDam.aduanaDam.codDatacat;
      let codRegimen : string = itemDam.regimenDam.codDatacat;
      let anioDam : number =  itemDam.annDam;
      let numDam : number = itemDam.numDam;

      let esUltimoDam: boolean = (key == arr.length - 1);

      this.buscar(codAduana, codRegimen, anioDam, numDam).
        subscribe( (saldosSerieDam : SaldoSerieDam[]) => {
          let subDamSeriesDpmn : DamSerieCcmn[] = damSeriesDpmn.filter( itemFilter => itemFilter.aduanaDam.codDatacat ==  codAduana &&
                                                                        itemFilter.regimenDam.codDatacat ==  codRegimen &&
                                                                        itemFilter.annDam ==  anioDam &&
                                                                        itemFilter.numDam ==  numDam );

          this.validarDamSeriesCcmnContraSaldos(subDamSeriesDpmn, saldosSerieDam);
          this.cntDamValidadas++;

          //if ( esUltimoDam ) {
          if ( this.cntDamAValidar == this.cntDamValidadas ) {
            this.enviarRptValidacionSaldos();
          }

        }, () => {
          //if ( esUltimoDam ) {
          if ( this.cntDamAValidar == this.cntDamValidadas ) {
            this.enviarRptValidacionSaldos();
          }
        });

    });

  }
  private extraerDamConsultadas (damSeriesDpmn : DamSerieCcmn[]) : DamSerieCcmn[] {

    if ( damSeriesDpmn == null || damSeriesDpmn.length <= 0 ) {
      return new Array();
    }

    let resultado : DamSerieCcmn[] = new Array();

    damSeriesDpmn.forEach( ( item : DamSerieCcmn ) => {

      if ( resultado.length <= 0 ) {
        resultado.push(item);
        return;
      }
       //   let damSerieCcmnBusq : DamSerieCcmn
      let damSerieCcmnBusq : any  = resultado.find( itemBusq => itemBusq.aduanaDam.codDatacat == item.aduanaDam.codDatacat &&
                                                          itemBusq.regimenDam.codDatacat == item.regimenDam.codDatacat &&
                                                          itemBusq.annDam == item.annDam &&
                                                          itemBusq.numDam == item.numDam );

      if ( damSerieCcmnBusq == null )  {
        resultado.push(item);
      }

    });

    return resultado;
  }

  private enviarRptValidacionSaldos() : void {
    let hayMensajes = this.rptaValSaldosSerieDam.mensajes.length > 0;
    this.rptaValSaldosSerieDam.estado = hayMensajes ? Estado.ERROR : Estado.SUCCESS;
    this.validacionSaldosSerieDamSubject.next(this.rptaValSaldosSerieDam);
  }
  private validarDamSeriesCcmnContraSaldos(damSeriesCcmn : DamSerieCcmn[], saldosSerieDam : SaldoSerieDam[]) : void {

    damSeriesCcmn.forEach( ( damSerieCcmn : DamSerieCcmn ) => {

      let codAduana : string = damSerieCcmn.aduanaDam.codDatacat;
      let codRegimen : string = damSerieCcmn.regimenDam.codDatacat;
      let anioDam : number =  damSerieCcmn.annDam;
      let numDam : number = damSerieCcmn.numDam;
      let numSerie : number = damSerieCcmn.numSerie;
      let cntRetirada : number = damSerieCcmn.cntRetirada;

      let numeroCompletoDam  = codAduana + "-" + anioDam + "-" + codRegimen + "-" + numDam;
      let saldoSerie :  SaldoSerieDam | undefined = saldosSerieDam.find( saldo => saldo.numSerie == damSerieCcmn.numSerie );
      //let saldoSerie :  any = saldosSerieDam.find( saldo => saldo.numSerie == damSerieCcmn.numSerie );

      if (saldoSerie!=null){
          let isSaldoInValido = saldoSerie?.cntSaldo < cntRetirada;
          if ( isSaldoInValido && saldoSerie?.cntSaldo > 0) {
            this.rptaValSaldosSerieDam.agregarMensaje(1, "La cantidad ingresada a retirar excede el saldo disponible de la serie N° " + numSerie + " de la DAM " + numeroCompletoDam);
          }
          if (saldoSerie?.cntSaldo == 0) {
            this.rptaValSaldosSerieDam.agregarMensaje(1, "No existe saldo para la serie N° " + numSerie + " de la DAM " + numeroCompletoDam);
          }

      }
    });
  }

}
