package GescolabHR.Backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import GescolabHR.Backend.dto.CargoRequestDTO;
import GescolabHR.Backend.dto.CargoResponseDTO;
import GescolabHR.Backend.dto.DetalleDepartamentoDTO;
import GescolabHR.Backend.dto.DepartamentoRequestDTO;
import GescolabHR.Backend.dto.DepartamentoResponseDTO;
import GescolabHR.Backend.service.CargoService;
import GescolabHR.Backend.service.DepartamentoService;
import jakarta.validation.Valid;

// Maestro y detalle de departamentos con sus cargos asignados
@RestController
@RequestMapping("/api")
@PreAuthorize("hasRole('ADMIN_RRHH')")
public class DepartamentoController {

	private final DepartamentoService departamentoService;
	private final CargoService cargoService;

	public DepartamentoController(DepartamentoService departamentoService, CargoService cargoService) {
		this.departamentoService = departamentoService;
		this.cargoService = cargoService;
	}

	@GetMapping("/departamentos")
	public ResponseEntity<List<DepartamentoResponseDTO>> listar(
			@RequestParam(required = false) String buscar) {
		return ResponseEntity.ok(departamentoService.listar(buscar));
	}

	@GetMapping("/departamentos/{id}/detalle")
	public ResponseEntity<DetalleDepartamentoDTO> obtenerDetalle(@PathVariable Long id) {
		return ResponseEntity.ok(departamentoService.obtenerDetalle(id));
	}

	@PostMapping("/departamentos")
	public ResponseEntity<DepartamentoResponseDTO> crear(@Valid @RequestBody DepartamentoRequestDTO peticion) {
		return ResponseEntity.ok(departamentoService.crear(peticion));
	}

	@PutMapping("/departamentos/{id}")
	public ResponseEntity<DepartamentoResponseDTO> actualizar(@PathVariable Long id,
			@Valid @RequestBody DepartamentoRequestDTO peticion) {
		return ResponseEntity.ok(departamentoService.actualizar(id, peticion));
	}

	@DeleteMapping("/departamentos/{id}")
	public ResponseEntity<Void> eliminarDepartamento(@PathVariable Long id) {
		departamentoService.eliminar(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/departamentos/{id}/cargos")
	public ResponseEntity<List<CargoResponseDTO>> listarCargos(@PathVariable Long id) {
		return ResponseEntity.ok(cargoService.listarPorDepartamento(id));
	}

	@PostMapping("/departamentos/{id}/cargos")
	public ResponseEntity<CargoResponseDTO> crearCargo(@PathVariable Long id,
			@Valid @RequestBody CargoRequestDTO peticion) {
		peticion.setIdDepartamento(id);
		return ResponseEntity.ok(cargoService.crear(peticion));
	}

	@PutMapping("/cargos/{id}")
	public ResponseEntity<CargoResponseDTO> actualizarCargo(@PathVariable Long id,
			@Valid @RequestBody CargoRequestDTO peticion) {
		return ResponseEntity.ok(cargoService.actualizar(id, peticion));
	}

	@DeleteMapping("/cargos/{id}")
	public ResponseEntity<Void> eliminarCargo(@PathVariable Long id) {
		cargoService.eliminar(id);
		return ResponseEntity.noContent().build();
	}
}
