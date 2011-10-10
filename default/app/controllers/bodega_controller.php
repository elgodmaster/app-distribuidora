<?php 
	class BodegaController extends ApplicationController {
		public function index() {
			if(!Auth::is_valid()) $this->redirect("usuario/login");
			
			$this->mostrarMenu="bodega";
		}
	}
?>