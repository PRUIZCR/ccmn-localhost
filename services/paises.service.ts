import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, forkJoin, Observable } from 'rxjs';
import { catchError, map, mergeMap, shareReplay } from 'rxjs/operators';
import { ConfigAduanaControl } from '../model/bean/config-aduana-control.model';
import { DataCatalogo } from '../model/common/data-catalogo.model';
import { TipoNacionalidad } from '../model/common/tipo-nacionalidad.enum';
import { CatalogoService } from './catalogo.service';

@Injectable()
export class PaisesService {

  private mapCachePorAduana : Map<string, Observable<DataCatalogo[]>> = new Map();
  private cfgAduCtrl : ConfigAduanaControl[] = new Array;

  private rptPaisesAduCtrl : DataCatalogo[] = new Array;
  private rptPaisesAduCtrlSrc = new BehaviorSubject<DataCatalogo[]>(new Array);
  public rptPaisesAduCtrl$ = this.rptPaisesAduCtrlSrc.asObservable();


  constructor(private catalogoService: CatalogoService, private http: HttpClient) {}

  /**
   * Busca los paises segun la aduana de control
   * @author rcontreras
   * @param codAduana Codigo aduana de control
   */
  public buscarPaisesPorAduaCtrl(codAduana : string, codNacionalidad: string) : void {
    if(codAduana==undefined)
      return;

    this.getPaisesOrderSegunAduCtrl(codAduana).subscribe(respuesta => {
        let paises : DataCatalogo[] = respuesta[0];
        let paisesSudamerica : DataCatalogo[] = respuesta[1];
        this.rptPaisesAduCtrl = this.ordenarSegunAduana(codNacionalidad==TipoNacionalidad.EXTRANJERO?"000":codAduana, paises, paisesSudamerica, this.cfgAduCtrl, codNacionalidad);

        this.rptPaisesAduCtrlSrc.next(this.rptPaisesAduCtrl);
    });
  }

  /**
   * Obtiene los paises ordenados segun la aduana de control
   * @param codAduana  Codigo aduana de control
   * @author rcontreras
   * @returns
   * Lista de paises ordenados segun aduana control
   */
  private getPaisesOrderSegunAduCtrl(codAduana : string) : Observable<any[]> {

    let observableInCache = this.mapCachePorAduana.get(codAduana);

    if ( observableInCache != null ) {
      return observableInCache;
    }

    observableInCache = this.http.get<any[]>("assets/json/cfgaductrl.json").pipe(
        map( (respuesta : ConfigAduanaControl[]) => {
          this.cfgAduCtrl = respuesta;
          return respuesta;
        }),
        mergeMap( (respuesta : ConfigAduanaControl[]) => {
          let peticiones : Observable<any>[] = new Array();
          peticiones.push(this.catalogoService.cargarDesdeJson("assets/json/paises.json"));
          peticiones.push(this.catalogoService.cargarDesdeJson("assets/json/paises-sudamerica.json"));
          return forkJoin(peticiones);
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
        catchError(err => {
          this.mapCachePorAduana.delete(codAduana);
          return EMPTY;
        })
    );

    this.mapCachePorAduana.set(codAduana, observableInCache);

    return observableInCache;
  }

  /**
   * Ordena los paises segun la aduana seleccionada
   * @param codAduana Código de la aduana
   * @param paises catalogo de paises
   * @returns
   * Lista ordenada de los paises segun la aduana
   */
  private ordenarSegunAduana(codAduana: string, todosLosPaises: DataCatalogo[],
                              paisesSudamerica: DataCatalogo[], cfgAduCtrl: ConfigAduanaControl[], codNacionalidad:string) : DataCatalogo[] {

    let resultado : DataCatalogo[] = todosLosPaises;

    this.ordenarAlfabeticamente(resultado);
    this.colocarPrimeroPaisesSudamerica(resultado, paisesSudamerica);
    this.colocarPrimeroPaisesFronteraAduana(codAduana, cfgAduCtrl, resultado);

    if(codNacionalidad==TipoNacionalidad.NACIONAL)
      this.colocarPrimeroPeru(resultado);

    return resultado;
  }

  private ordenarAlfabeticamente(paises: DataCatalogo[]) : void {

    paises.sort((paisPrev : DataCatalogo, paisNext: DataCatalogo) => {

      if ( paisNext.desDataCat < paisPrev.desDataCat ) { return 1 }

      if ( paisNext.desDataCat > paisPrev.desDataCat ) { return -1 }

      return 0;

    });
  }

  private colocarPrimeroPaisesSudamerica(paises: DataCatalogo[], paisesSudamerica: DataCatalogo[]) {

    paises.sort((paisPrev : DataCatalogo, paisNext: DataCatalogo) => {
      let paisPrevSudamericano = paisesSudamerica.find( (item : DataCatalogo) => item.codDatacat == paisPrev.codDatacat);
      let paisNextSudamericano = paisesSudamerica.find( (item : DataCatalogo) => item.codDatacat == paisNext.codDatacat);
      let isPaisPrevSud : boolean =  paisPrevSudamericano != null;
      let isPaisNextSud : boolean =  paisNextSudamericano != null;

      return isPaisNextSud ? 1 :  isPaisPrevSud? -1 : 0;
    });

  }

  private colocarPrimeroPaisesFronteraAduana( codAduana: string, cfgAduCtrl: ConfigAduanaControl[], paises: DataCatalogo[]) : void {
    let configAduCtrl : ConfigAduanaControl = cfgAduCtrl.find( ( item : ConfigAduanaControl) => item.codAduana ==  codAduana) as ConfigAduanaControl;

    paises.sort((paisPrev: DataCatalogo, paisNext: DataCatalogo) => {
      let paisPrevFront : string = configAduCtrl.codPaisesFrontera.find( (codPaisFront : String) => paisPrev.codDatacat == codPaisFront ) as string;
      let paisNextFront : string = configAduCtrl.codPaisesFrontera.find( (codPaisFront : String) => paisNext.codDatacat == codPaisFront ) as string;

      let isPaisPrevFront : boolean = paisPrevFront != null;
      let isPaisNextFront : boolean = paisNextFront != null;

      return isPaisNextFront ? 1 :  isPaisPrevFront ? -1 : 0;
    });
  }

  private colocarPrimeroPeru( paises: DataCatalogo[] ) : void {
    paises.sort((paisPrev: DataCatalogo, paisNext: DataCatalogo) => {
      let esPaisPrevPeru : boolean = paisPrev.codDatacat == "PE";
      let esPaisNextPeru : boolean = paisNext.codDatacat == "PE";
      return esPaisPrevPeru ? -1 : esPaisNextPeru ? 1 : 0;
    });
  }

}
