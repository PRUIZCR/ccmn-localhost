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

@Component({
  selector: 'app-listar-ccmn',
  templateUrl: './listar-ccmn.component.html',
  styleUrls: ['./listar-ccmn.component.scss'],
  providers: [MessageService]
})
export class ListarCcmnComponent implements OnInit {
  public rptaListaCtrlCcmns!: Respuesta<ItemCcmnParaRectificar[]>;
  public lstDpmns: any[] = new Array();
  usuarioLogin!:string;
  coUsuarioRegistroCCMN!: String;
  actorRegistro!: String;  
  public lstDpmnsSelected: any[] = new Array();
  usuarioTienePerfilJefeSupervisor!: boolean;

  constructor(  private buscarRectiCcmnService : BuscarRectiCcmnService,
                private messageService: MessageService,
                private router:Router,
                private activatedRoute: ActivatedRoute,
                private perfilesUsuarioService: PerfilesUsuarioService,
                private tokenAccesoService: TokenAccesoService) {                   
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
        this.perfilesUsuarioService.buscar(this.usuarioLogin, "CPASO_JEFE_SUPERVISOa").subscribe( (data : PerfilUsuario[]) => {
          if (data.length>0) {
            this.usuarioTienePerfilJefeSupervisor=true; 
          }
          else {
            this.usuarioTienePerfilJefeSupervisor=true;             
          }  
                    
        },()  =>{
          this.usuarioTienePerfilJefeSupervisor=true; 

        })

      }
    
    
      private configRespuestaConError() : void {
        this.rptaListaCtrlCcmns = Respuesta.create(new Array, Estado.ERROR);
        this.rptaListaCtrlCcmns.agregarMensaje(1, "Ha ocurrido un error")
      }
    
      continuarRectificaCcmn(item : ItemCcmnParaRectificar) : any {
        this.buscarRectiCcmnService.itemCcmn = item;
        console.log(this.buscarRectiCcmnService.itemCcmn.correlativoCcmn);
        sessionStorage.setItem("numCorrelativo", this.buscarRectiCcmnService.itemCcmn.correlativoCcmn.toString());
        this.coUsuarioRegistroCCMN = item.auditoria.codUsuRegis;
        if (item.tieneDpmnUsuarioExterno  && !this.usuarioTienePerfilJefeSupervisor ){
          this.messageService.add({ key: 'msj' , severity:"warn", summary: 'Mensaje',   detail: 'Usted no puede rectificar la CCMN seleccionada'});
          return false;
        }
        
        console.log(this.buscarRectiCcmnService.itemCcmn.correlativoCcmn);
        return true;
      }
    
      irPageBusquedaInicial() {
        this.buscarRectiCcmnService.limpiarData();
        this.router.navigate(['../buscar-ccmn'], { relativeTo: this.activatedRoute });
      }
}
