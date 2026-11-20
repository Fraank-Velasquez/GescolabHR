package GescolabHR.Backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import GescolabHR.Backend.dto.LoginRequestDTO;
import GescolabHR.Backend.dto.LoginResponseDTO;
import GescolabHR.Backend.service.AutenticacionService;
import jakarta.validation.Valid;

// Expone el endpoint público de inicio de sesión
@RestController
@RequestMapping("/api/autenticacion")
public class AutenticacionController {

	private final AutenticacionService autenticacionService;

	public AutenticacionController(AutenticacionService autenticacionService) {
		this.autenticacionService = autenticacionService;
	}

	// Devuelve el token JWT tras validar las credenciales corporativas
	@PostMapping("/login")
	public ResponseEntity<LoginResponseDTO> iniciarSesion(@Valid @RequestBody LoginRequestDTO peticion) {
		return ResponseEntity.ok(autenticacionService.iniciarSesion(peticion));
	}
}
