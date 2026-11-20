package GescolabHR.Backend.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import GescolabHR.Backend.dto.ContadoresSolicitudesDTO;
import GescolabHR.Backend.dto.ResumenSolicitudesDTO;
import GescolabHR.Backend.dto.SolicitudAusenciaRequestDTO;
import GescolabHR.Backend.dto.SolicitudAusenciaResponseDTO;
import GescolabHR.Backend.repository.EmpleadoRepository;
import GescolabHR.Backend.service.SolicitudAusenciaService;
import jakarta.validation.Valid;

// Aprobación de vacaciones y permisos para admin y solicitudes propias
@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudAusenciaController {

	private final SolicitudAusenciaService solicitudService;
	private final EmpleadoRepository empleadoRepository;

	public SolicitudAusenciaController(SolicitudAusenciaService solicitudService,
			EmpleadoRepository empleadoRepository) {
		this.solicitudService = solicitudService;
		this.empleadoRepository = empleadoRepository;
	}

	@GetMapping
	@PreAuthorize("hasRole('ADMIN_RRHH')")
	public ResponseEntity<Page<SolicitudAusenciaResponseDTO>> listar(
			@RequestParam(required = false) String estado,
			@RequestParam(required = false) String tipo,
			@RequestParam(required = false) Long departamento,
			@RequestParam(required = false) String buscar,
			@RequestParam(defaultValue = "0") int pagina,
			@RequestParam(defaultValue = "10") int tamano) {
		return ResponseEntity.ok(solicitudService.listar(estado, tipo, departamento, buscar,
				PageRequest.of(pagina, tamano)));
	}

	@GetMapping("/contadores")
	@PreAuthorize("hasRole('ADMIN_RRHH')")
	public ResponseEntity<ContadoresSolicitudesDTO> obtenerContadores() {
		return ResponseEntity.ok(solicitudService.obtenerContadores());
	}

	@GetMapping("/resumen")
	@PreAuthorize("hasRole('ADMIN_RRHH')")
	public ResponseEntity<ResumenSolicitudesDTO> obtenerResumen() {
		return ResponseEntity.ok(solicitudService.obtenerResumen());
	}

	@GetMapping("/mias")
	public ResponseEntity<List<SolicitudAusenciaResponseDTO>> listarPropias(Principal principal) {
		return ResponseEntity.ok(solicitudService.listarPorEmpleado(obtenerIdEmpleado(principal)));
	}

	@PostMapping
	public ResponseEntity<SolicitudAusenciaResponseDTO> crear(Principal principal,
			@Valid @RequestBody SolicitudAusenciaRequestDTO peticion) {
		return ResponseEntity.ok(solicitudService.crear(peticion, obtenerIdEmpleado(principal)));
	}

	@PutMapping("/{id}/aprobar")
	@PreAuthorize("hasRole('ADMIN_RRHH')")
	public ResponseEntity<SolicitudAusenciaResponseDTO> aprobar(@PathVariable Long id,
			@RequestParam(required = false) String observacion) {
		return ResponseEntity.ok(solicitudService.aprobar(id, observacion));
	}

	@PutMapping("/{id}/rechazar")
	@PreAuthorize("hasRole('ADMIN_RRHH')")
	public ResponseEntity<SolicitudAusenciaResponseDTO> rechazar(@PathVariable Long id,
			@RequestParam(required = false) String observacion) {
		return ResponseEntity.ok(solicitudService.rechazar(id, observacion));
	}

	private Long obtenerIdEmpleado(Principal principal) {
		return empleadoRepository.findByCorreo(principal.getName())
				.map(empleado -> empleado.getId())
				.orElseThrow(() -> new IllegalStateException("Sesión inválida"));
	}
}
