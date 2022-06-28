import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { PciDetalle } from 'src/app/model/domain/pcidetalle.model';
import { environment } from 'src/environments/environment';
import { ConstantesApp } from 'src/app/utils/constantes-app';
import { PrimeNGConfig, MessageService, Message } from 'primeng/api';
import { RegistroCcmnService } from 'src/app/services/registro-ccmn.service';
import { TokenAccesoService } from 'src/app/services/token-acceso.service';
import { UbicacionFuncionarioService } from 'src/app/services/ubicacion-funcionario.service';
import { UbicacionFuncionario } from 'src/app/model/bean/ubicacion-funcionario';
import { Router } from '@angular/router';
import { TipoRegistro } from 'src/app/model/common/tipo-registro';
import { PuestoControlService } from 'src/app/services/puesto-control.service';
import { FlujoVehiculo } from 'src/app/model/common/flujo-vehiculo.enum';
import { DocumentodescargaService } from 'src/app/services/documentodescarga.service';
import { SerieDeclaracionDpmn } from 'src/app/model/domain/serie-declaracion';
import { DamSerieCcmn } from 'src/app/model/domain/dam-serie-ccmn.model';
import { RespuestaError } from 'src/app/model/common/response-error';
import { throwError } from 'rxjs';
import { SaldoSeriesService } from 'src/app/services/saldos-series.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  providers: [MessageService]

})
export class InicioComponent implements OnInit {

  constructor(
    private documentodescargaService: DocumentodescargaService,
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private registroCcmnService: RegistroCcmnService,
    private tokenAccesoService: TokenAccesoService,
    private ubicacionFuncionarioService: UbicacionFuncionarioService,
    private cdRef: ChangeDetectorRef,
    private saldoSeriesService: SaldoSeriesService,
    private puestoControlService: PuestoControlService) { }

  private RESOURCE_LISTAR_PCI: string = environment.urlBase + ConstantesApp.RESOURCE_LISTAR_PCI;
  private URL_RESOURCE_ENDPOINT_CCMN: string = environment.urlBase + ConstantesApp.RESOURCE_ENDPOINT_CCMN;


  public lstPciDetalle: any[] = new Array();
  seriesDeclaracionDpmn: SerieDeclaracionDpmn[] = new Array();
  private damSeriesCcmn: DamSerieCcmn[] = new Array();
  serieCcmn: DamSerieCcmn = new DamSerieCcmn;
  private errorValidacion: RespuestaError[] = new Array();
  ubicacionFuncionario: UbicacionFuncionario = new UbicacionFuncionario;
  mostrarSaldoInsuficiente: boolean = false;
  msjSaldoInsuficiente: string = "";
  numCorrelativo: number = 0;
  loading = true;

  first = 0;
  rows = 10;

  inicioForm: FormGroup = this.formBuilder.group({
    tipoSeleccion: ['1', [Validators.required]],
  });

  onLoadServer(pci: PciDetalle) {
    this.mostrarSaldoInsuficiente = false;
    this.registroCcmnService.pciDetalle = pci;
    this.numCorrelativo = pci.numCorrelativo;
    sessionStorage.setItem("numeroDeControlPaso", pci.controlPaso);
    sessionStorage.setItem("paisPlaca", pci?.paisPlaca?.codDatacat);
    sessionStorage.setItem("placa", pci.nomPlaca);
    sessionStorage.setItem("canalControl", pci?.tipoControl?.desDataCat);

    if (pci.flujoVehiculo.codDatacat == FlujoVehiculo.CARGA) {
      this.router.navigateByUrl('/iaregistroccmn/confirmarccmn');
      //this.validarSaldoEnSeries(pci.numCorrelativoDocumento);
    }

    if (pci.flujoVehiculo.codDatacat == FlujoVehiculo.PARTICULAR) {
      this.router.navigateByUrl('/iaregistroccmn/detalleparticularccmn');
    }

    if (pci.flujoVehiculo.codDatacat == FlujoVehiculo.BUS) {
      this.router.navigateByUrl('/iaregistroccmn/detallebusccmn');
    }
  }

  pasoActual: number = 1;

  ngOnInit(): void {
    this.obtenerDatosFuncionario();
  }

  async obtenerDatosFuncionario() {
    let nroRegistro: string = this.tokenAccesoService.nroRegistro as string;

    this.ubicacionFuncionarioService.buscar(nroRegistro).subscribe((ubicacion: UbicacionFuncionario) => {
      this.ubicacionFuncionario = ubicacion;
      this.registroCcmnService.datosFuncionario = ubicacion;
      this.cargarListaPciInicial(this.ubicacionFuncionario.puestoControl.aduana.codigo, this.ubicacionFuncionario.puestoControl.codigo);

      this.puestoControlService.getPuestoControlFromJson(ubicacion.puestoControl.aduana.codigo);

    });
  }

  async cargarListaPciInicial(aduana: string, puestoControl: string) {
    //var urlDatos = aduana + "-" + puestoControl + "/listaParaRegistro"
    var urlDatos = aduana + "-" + puestoControl + "/listapararegistro"//AENA

    await this.http
      .get<PciDetalle[]>(this.RESOURCE_LISTAR_PCI + urlDatos).toPromise().then((res: PciDetalle[]) => {
        this.lstPciDetalle = res;
      }, error => {
        console.log({ error });
        this.lstPciDetalle = [];
      });

    this.lstPciDetalle.forEach(pci => {
      pci.controlPaso = pci.aduana.codDatacat + "-" + pci.puestoControl.codDatacat + "-" + pci.annPci + "-" + pci.numPci;
    });

    this.loading = false;
  }

  onRadioChange() {
    let radio = this.inicioForm.controls.tipoSeleccion.value as string;

    if (radio == '1') {
      this.router.navigateByUrl('/iaregistroccmn/registroccmn');
    } else if (radio == '2') {
      this.registroCcmnService.tipoRegistro = TipoRegistro.CAF;
      this.router.navigateByUrl('/iaregistroccmn/datos-transporte');
    } else if (radio == '3') {
      this.registroCcmnService.tipoRegistro = TipoRegistro.TTA;
      this.router.navigateByUrl('/iaregistroccmn/datos-transporte');
    }
  }

  getColorControl(pci: PciDetalle): string {

    let tipoControl: string = pci?.tipoControl?.codDatacat;

    if (tipoControl == null) {
      return "";
    }

    return ConstantesApp.COLOR_CONTROL.get(tipoControl) as string;
  }


  next() {
    this.first = this.first + this.rows;
  }

  prev() {
    this.first = this.first - this.rows;
  }

  reset() {
    this.first = 0;
  }

  isLastPage(): boolean {
    return this.lstPciDetalle ? this.first === (this.lstPciDetalle.length - this.rows) : true;
  }

  isFirstPage(): boolean {
    return this.lstPciDetalle ? this.first === 0 : true;
  }

  btnSalir() {
    this.mostrarSaldoInsuficiente = false;
  }

  validarSaldoEnSeries(numCorredoc: number) {

    this.documentodescargaService.getSeriesDeclaracionByNumcorredoc(numCorredoc.toString())
      .toPromise()
      .then((resp: any) => <SerieDeclaracionDpmn[]>resp)
      .then(data => {
        return data;
      })
      .then(async serieDeclaracionDpmns => {
        this.seriesDeclaracionDpmn = serieDeclaracionDpmns;
        this.damSeriesCcmn = new Array();
        this.seriesDeclaracionDpmn.forEach(
          series => {
            this.serieCcmn = new DamSerieCcmn;
            this.serieCcmn.aduanaDam = series.aduanaDam;
            this.serieCcmn.regimenDam = series.regimenDam;
            this.serieCcmn.annDam = series.annDam;
            this.serieCcmn.numDam = series.numDam;
            this.serieCcmn.numSerie = series.numSerie;
            this.serieCcmn.cntUnidadFisica = series.cntUnidadFisica;
            this.serieCcmn.cntRetirada = series.cntRetirada;
            this.damSeriesCcmn.push(this.serieCcmn);
          }
        );

        this.saldoSeriesService.validarSaldoSeries(this.damSeriesCcmn).subscribe((respuesta: any) => {
          this.msjSaldoInsuficiente = "";
          this.errorValidacion = new Array();
          if (respuesta == true) {
            this.mostrarSaldoInsuficiente = false;
            this.router.navigateByUrl('/iaregistroccmn/confirmarccmn');
          } else {
            this.mostrarSaldoInsuficiente = true;
            let errorHttp: RespuestaError[] = respuesta;
            this.errorValidacion = errorHttp;
            this.errorValidacion.forEach(log => {
              this.msjSaldoInsuficiente = this.msjSaldoInsuficiente + '<br/>' + log.msg
            })
          }

        }, (error: any) => {
          this.msjSaldoInsuficiente = "";
          this.mostrarSaldoInsuficiente = true;
          let errorHttp: RespuestaError[] = error.error;
          this.errorValidacion = errorHttp;
          this.errorValidacion.forEach(log => {
            this.msjSaldoInsuficiente = this.msjSaldoInsuficiente + '<br/>' + log.msg
          })
        });


      })
  }
}
