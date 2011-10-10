<?php 
	class VentasController extends ApplicationController {
		public function index() {
			if(!Auth::is_valid()){
				$this->redirect("usuario/login");
			}
		}
	}
?>