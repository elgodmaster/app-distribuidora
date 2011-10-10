<?php 
	class UsuarioController extends ApplicationController {
		
		public function index() {
			if(!Auth::is_valid()){
				$this->redirect("usuario/login");
			}else{
				$this->redirect("inicio");
			}
		}
		//Ingreso al sistema
		public function login(){
			//en login susamos el template sin menus
			$this->render("login", "portada");
			 
			if ($this->has_post("login","password")){			
				$pwd = $this->post("password");
				$usuario=$this->post('login');
				$auth = new Auth("model", "class: usuario", "username: $usuario", "password: $pwd");
				
				if ($auth->authenticate()) {
					$this->redirect("inicio");
					Flash::success("Bienvenido");
				} else {
					Flash::error("Error, Usuario y/o contraseña incorrecta");
				}
			}

		}
		//Deslogear
		public function logout(){
			Auth::destroy_identity();
			$this->redirect('');
		}
		//nuevo usuario
		public function registro(){
			//cambiar el template a uno sin menus
			$this->render("registro", "sin_menus");
		
		}
		//Perfil de usuario
		public function perfil($id){
			//$this->mostrarMenu="perfil";
		
		}
	}
?>