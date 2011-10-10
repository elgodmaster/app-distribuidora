<?php 
	class RrhhController extends ApplicationController {
		public function index() {
			if(!Auth::is_valid()){
				$this->redirect("usuario/login");
			}
		}
	}
?>