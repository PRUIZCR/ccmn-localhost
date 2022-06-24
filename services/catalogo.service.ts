import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataCatalogo } from '../model/common/data-catalogo.model';
import { EMPTY, Observable } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';

@Injectable()
export class CatalogoService {

  private mapCache : Map<string, Observable<DataCatalogo[]>> = new Map();

  constructor(private http: HttpClient) { }

  cargarDesdeJson(rutaJson : string) : Observable<DataCatalogo[]> {

    let observableInCache = this.mapCache.get(rutaJson);

    if ( observableInCache ) {
      return observableInCache;
    }

    observableInCache = this.http.get<any[]>(rutaJson).pipe(
          map(res => {
              if ( res == null ) {
                return null;
              }

              let respuesta : DataCatalogo[] = new Array();

              res.forEach(itemRes => {
                let objDatCat = new DataCatalogo();
                objDatCat.codDatacat =  itemRes.codigo;
                objDatCat.desDataCat =  itemRes.descripcion;
                respuesta.push(objDatCat);
              });

              return respuesta;
          }),
          shareReplay<any>({ bufferSize: 1, refCount: true }),
          catchError(err => {
            this.mapCache.delete(rutaJson);
            return EMPTY;
          })
        );

    this.mapCache.set(rutaJson, observableInCache);

    return observableInCache;
  }

}
