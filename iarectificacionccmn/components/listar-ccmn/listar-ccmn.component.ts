import { Component, OnInit } from '@angular/core';
import { Respuesta } from 'src/app/model/common/Respuesta';
import { TokenAccesoService } from 'src/app/services/token-acceso.service';
import { Estado } from 'src/app/model/common/Estado';
import { ItemCcmnParaRectificar} from 'src/app/model/bean/item-ccmn-para-rectificar.model';
import { BuscarRectiCcmnService } from 'src/app/services/buscar-recti-ccmn.service';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { PerfilesUsuarioService } from 'src/app/services/perfiles-usuario.service';
import { PerfilUsuario } from 'src/app/model/bean/usuario-perfil-item';
import { BuscarCcmnService } from 'src/app/services/buscar-ccmn.service';
import { forkJoin, Observable } from 'rxjs';
import { RectificacionCcmnService } from 'src/app/services/rectificacion-ccmn.service';

@Component({
  selector: 'app-listar-ccmn',
  templateUrl: './listar-ccmn.component.html',
  styleUrls: ['./listar-ccmn.component.scss'],
  providers: [MessageService, BuscarCcmnService]
})
export class ListarCcmnComponent implements OnInit {
  public rptaListaCtrlCcmns!: Respuesta<ItemCcmnParaRectificar[]>;
  public lstDpmns: any[] = new Array();
  usuarioLogin!:string;
  coUsuarioRegistroCCMN!: String;
  actorRegistro!: String;
  public lstDpmnsSelected: any[] = new Array();
  usuarioTienePerfilJefeSupervisor!: boolean;
  fechaRegistro = new Date();
  constructor(  private buscarRectiCcmnService : BuscarRectiCcmnService,
                private messageService: MessageService,
                private router:Router,
                private activatedRoute: ActivatedRoute,
                private perfilesUsuarioService: PerfilesUsuarioService,
                private tokenAccesoService: TokenAccesoService,
                private rectificacionCcmnService : RectificacionCcmnService,
                private buscarCcmnService: BuscarCcmnService
                ) {
                }



  ngOnInit(): void {
        this.cargarCcmns();
  }


      private cargarCcmns() : void {
        this.buscarRectiCcmnService.rptaBusqDcl$.subscribe((resultado : Respuesta<ItemCcmnParaRectificar[]>) =>{
          this.rptaListaCtrlCcmns= resultado;
        }, () => {
          this.configRespuestaConError();
        });

        this.usuarioLogin = this.tokenAccesoService.login;
        this.perfilesUsuarioService.buscar(this.usuarioLogin, "CPASO_JEFE_SUPERVISOR").subscribe( (data : PerfilUsuario[]) => {
          if (data.length>0) {
            this.usuarioTienePerfilJefeSupervisor=true;
          }
          else {
            this.usuarioTienePerfilJefeSupervisor=false;
          }

        },()  =>{
          this.usuarioTienePerfilJefeSupervisor=false;

        })

      }

      private getObsDataCcmn( correlativo: string|null ) : Observable<any> {
        return forkJoin({
          ccmn : this.buscarCcmnService.buscar(correlativo),
          damSeriesCcmn: this.buscarCcmnService.buscarDamSeries(correlativo),
          adjuntosCcmn: this.buscarCcmnService.buscarAdjuntos(correlativo),
          versionCcmn: this.buscarCcmnService.buscarVersion(correlativo)
        });
      }
      validarDateFormat(fecha : string) : any {
        var d=fecha;
        var d1=d.split(" ");
        var date1=d1[0].split("/");
        var time=d1[1].split(":");
        var dd=date1[0];
        var mm =date1[1];
        var yy=date1[2];
        var hh=time[0];
        var min=time[1];
        var ss=time[2];
        this.fechaRegistro= new Date(+yy,+mm-1,+dd,+hh,+min,+ss);             
        return this.fechaRegistro;
      }
      private configRespuestaConError() : void {
        this.rptaListaCtrlCcmns = Respuesta.create(new Array, Estado.ERROR);
        this.rptaListaCtrlCcmns.agregarMensaje(1, "Ha ocurrido un error")
      }

      continuarRectificaCcmn(item : ItemCcmnParaRectificar) : any {
        this.buscarRectiCcmnService.itemCcmn = item;
        console.log(this.buscarRectiCcmnService.itemCcmn.correlativoCcmn);
        //sessionStorage.setItem("numCorrelativo", this.buscarRectiCcmnService.itemCcmn.correlativoCcmn.toString());
       
        this.coUsuarioRegistroCCMN = item.auditoria.codUsuRegis;
        if (item.tieneDpmnUsuarioExterno  && !this.usuarioTienePerfilJefeSupervisor ){
          this.messageService.add({ key: 'msj' , severity:"warn", summary: 'Mensaje',   detail: 'Usted no puede rectificar la CCMN seleccionada'});
          return false;
        }

        console.log(this.buscarRectiCcmnService.itemCcmn.correlativoCcmn);



        this.getObsDataCcmn(item.correlativoCcmn).subscribe( data => {
          this.rectificacionCcmnService.putDataOriginal(data.ccmn, data.damSeriesCcmn, data.adjuntosCcmn, data.versionCcmn);
          this.rectificacionCcmnService.putCcmn(data.ccmn);
          this.rectificacionCcmnService.putNewDamSeriesCcmn(data.damSeriesCcmn);
          this.rectificacionCcmnService.putAdjuntosOriginales(data.adjuntosCcmn);
          // this.router.navigate(['../datos-transporte'], { relativeTo: this.activatedRoute });
        });

        return true;
      }

      irPageBusquedaInicial() {
        this.buscarRectiCcmnService.limpiarData();
        this.router.navigate(['../buscar-ccmn'], { relativeTo: this.activatedRoute });
      }
}
