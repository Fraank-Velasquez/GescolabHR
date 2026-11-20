package GescolabHR.Backend.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import GescolabHR.Backend.dto.EmpleadoRequestDTO;
import GescolabHR.Backend.dto.EmpleadoResponseDTO;
import GescolabHR.Backend.dto.ResumenEmpleadosDTO;
import GescolabHR.Backend.service.EmpleadoService;
import jakarta.validation.Valid;

// Directorio y registro centralizado de colaboradores
@RestController
@RequestMapping("/api/empleados")
@PreAuthorize("hasRole('ADMIN_RRHH')")
public class EmpleadoController {

	private final EmpleadoService empleadoService;

	public EmpleadoController(EmpleadoService empleadoService) {
		this.empleadoService = empleadoService;
	}

	@GetMapping
	public ResponseEntity<Page<EmpleadoResponseDTO>> listar(
			@RequestParam(required = false) String buscar,
			@RequestParam(required = false) Long departamento,
			@RequestParam(required = false) String estado,
			@RequestParam(defaultValue = "0") int pagina,
			@RequestParam(defaultValue = "10") int tamano) {
		return ResponseEntity.ok(empleadoService.listar(buscar, departamento, estado,
				PageRequest.of(pagina, tamano, Sort.by("apellidos").ascending())));
	}

	@GetMapping("/resumen")
	public ResponseEntity<ResumenEmpleadosDTO> obtenerResumen() {
		return ResponseEntity.ok(empleadoService.obtenerResumen());
	}

	@GetMapping("/{id}")
	public ResponseEntity<EmpleadoResponseDTO> obtenerPorId(@PathVariable Long id) {
		return ResponseEntity.ok(empleadoService.obtenerPorId(id));
	}

	@PostMapping
	public ResponseEntity<EmpleadoResponseDTO> crear(@Valid @RequestBody EmpleadoRequestDTO peticion) {
		return ResponseEntity.ok(empleadoService.crear(peticion));
	}

	@PutMapping("/{id}")
	public ResponseEntity<EmpleadoResponseDTO> actualizar(@PathVariable Long id,
			@Valid @RequestBody EmpleadoRequestDTO peticion) {
		return ResponseEntity.ok(empleadoService.actualizar(id, peticion));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> darDeBaja(@PathVariable Long id) {
		empleadoService.darDeBaja(id);
		return ResponseEntity.noContent().build();
	}
}
