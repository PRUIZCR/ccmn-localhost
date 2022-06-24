// this.perfilesUsuarioService.buscar(this.usuarioLogin, "CPASO_JEFE_SUPERVISOR").subscribe( (data : PerfilUsuario[]) => {

    //   if (data.length>0) {
    //     paramConsultar.funcionario.tienePerfilJefeSupervisor=true;
    //   }
    //   else {
    // paramConsultar.funcionario.tienePerfilJefeSupervisor= false;

    //   }
    //   this.messageService.clear;
    //   /*Se consume el servicio REST de validacion y busqueda de CCMS*/
    //   this.buscarRectiCcmnService.buscarParaRectificar(paramConsultar);
    this.perfilesUsuarioService.buscar(this.usuarioLogin, "CPASO_JEFE_SUPERVISOR123").subscribe( (data : PerfilUsuario[]) => {
      if (data.length>0) {
        paramConsultar.funcionario.tienePerfilJefeSupervisor=true;
      }else {
         paramConsultar.funcionario.tienePerfilJefeSupervisor= false;
      }
            this.perfilesUsuarioService.buscar(this.usuarioLogin, "CPASO_FUNCIONA_REGISTRO").subscribe( (data2 : PerfilUsuario[]) => {
              if (data2.length>0) {
                paramConsultar.funcionario.tienePerfilJefeSupervisor=false;
                this.perfilRegistro=true;
              }
              else {
                paramConsultar.funcionario.tienePerfilJefeSupervisor= false;
                this.perfilRegistro=true;
              }
              if(paramConsultar.funcionario.tienePerfilJefeSupervisor||this.perfilRegistro){
                this.buscarRectiCcmnService.buscarParaRectificar(paramConsultar);
                }
          },()  =>{
              //  paramConsultar.funcionario.tienePerfilJefeSupervisor=false;
              this.messageService.clear;
              /*Se consume el servicio REST de validacion y busqueda de CCMS*/
              this.buscarRectiCcmnService.buscarParaRectificar(paramConsultar);
                //this.loadingConsultar = false;
          })
        if(paramConsultar.funcionario.tienePerfilJefeSupervisor||this.perfilRegistro){
          this.buscarRectiCcmnService.buscarParaRectificar(paramConsultar);
        }
    //   //this.loadingConsultar = false;

    // },()  =>{
    },()  =>{

    //  paramConsultar.funcionario.tienePerfilJefeSupervisor=false;
    this.messageService.clear;
    /*Se consume el servicio REST de validacion y busqueda de CCMS*/
    this.buscarRectiCcmnService.buscarParaRectificar(paramConsultar);
      //this.loadingConsultar = false;
   // })
    })

  }
