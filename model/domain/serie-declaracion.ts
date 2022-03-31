 export interface SerieDeclaracionDpmn {
    numCorreDpmn:     number;
    numCorreCompDpmn: number;
    numCorrelativo:   number;
    aduanaDam:        Datacatalogo;
    regimenDam:       Datacatalogo;
    annDam:           number;
    numDam:           number;
    numSerie:         number;
    codSubPartida:    string;
    desComercial:     string;
    mtoPesoBruto:     number;
    mtoPesoNeto:      number;
    unidadFisica:     Datacatalogo;
    cntUnidadFisica:  number;
    cntRetirada:      number;
    fecRegistro:      string;
    indEliminado:     boolean;
    auditoria:        Auditoria;
    dam: string;
    cntSaldo :      number;
    numSecDescarga : number;
}

export interface Datacatalogo {
    codDatacat: string;
    desDataCat: DESDataCat;
}



export enum DESDataCat {
    DESAduana = "Des Aduana",
    DESRegimen = "Des Regimen",
    DESUnidad = "Des Unidad",
}

export interface Auditoria {
    fecRegis:    string;
    codUsuRegis: CodUsuRegis;
    fecModif:    string;
    codUsumodif: CodUsumodif;
}

export enum CodUsuRegis {
    Usuarioregis = "usuarioregis",
}

export enum CodUsumodif {
    Usuariomodif = "usuariomodif",
}
