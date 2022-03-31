export interface DocumentoDescarga {
    numCorrelativo:number;
    numeroDeDocumentoDescarga: string;
    estado:                    Datacatalogo;
    paisPlaca:                 Datacatalogo;
    placa:                     null;
    placaCarreta:              string;
    flujoVehiculo:             Datacatalogo;
    fechaDeRegistro:           string;
    rucDelRemitente:           string;
    cantidadDeSeries:          number;
    cantidadDeControles:       number;
    fechaDelUltimoControl:     string;
    canalDelUltimoControl:     Datacatalogo;
    nro:                        string;
}

export interface Datacatalogo {
    codDatacat: string;
    desDataCat: null | string;
}
