package GescolabHR.Backend.controller;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
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

import GescolabHR.Backend.dto.AsistenciaResponseDTO;
import GescolabHR.Backend.dto.JornadaActualDTO;
import GescolabHR.Backend.dto.JustificacionAsistenciaDTO;
import GescolabHR.Backend.dto.MarcacionManualDTO;
import GescolabHR.Backend.dto.ResumenAsistenciaEmpleadoDTO;
import GescolabHR.Backend.dto.ResumenAsistenciaGlobalDTO;
import GescolabHR.Backend.model.MetodoMarcacion;
import GescolabHR.Backend.repository.EmpleadoRepository;
import GescolabHR.Backend.service.AsistenciaService;
import jakarta.validation.Valid;

// Control de asistencia global para admin y marcaciones propias del empleado
@RestController
@RequestMapping("/api/asistencia")
public class AsistenciaController {

	private final AsistenciaService asistenciaService;
	private final EmpleadoRepository empleadoRepository;

	public AsistenciaController(AsistenciaService asistenciaService,
			EmpleadoRepository empleadoRepository) {
		this.asistenciaService = asistenciaService;
		this.empleadoRepository = empleadoRepository;
	}

	// Listado global con filtros: solo administradores de RR.HH.
	@GetMapping
	@PreAuthorize("hasRole('ADMIN_RRHH')")
	public ResponseEntity<Page<AsistenciaResponseDTO>> listar(
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
			@RequestParam(required = false) Long departamento,
			@RequestParam(required = false) String estado,
			@RequestParam(required = false) String buscar,
			@RequestParam(defaultValue = "0") int pagina,
			@RequestParam(defaultValue = "10") int tamano) {
		return ResponseEntity.ok(asistenciaService.listar(fecha, fechaDesde, fechaHasta, departamento, estado, buscar,
				PageRequest.of(pagina, tamano)));
	}

	@GetMapping("/resumen")
	@PreAuthorize("hasRole('ADMIN_RRHH')")
	public ResponseEntity<ResumenAsistenciaGlobalDTO> obtenerResumen(
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta) {
		return ResponseEntity.ok(asistenciaService.obtenerResumenGlobal(
				fecha == null ? LocalDate.now() : fecha, fechaDesde, fechaHasta));
	}

	@PostMapping("/manual")
	@PreAuthorize("hasRole('ADMIN_RRHH')")
	public ResponseEntity<AsistenciaResponseDTO> registrarManual(
			@Valid @RequestBody MarcacionManualDTO peticion) {
		return ResponseEntity.ok(asistenciaService.registrarManual(peticion));
	}

	@PutMapping("/{id}/justificar")
	@PreAuthorize("hasRole('ADMIN_RRHH')")
	public ResponseEntity<AsistenciaResponseDTO> justificar(@PathVariable Long id,
			@Valid @RequestBody JustificacionAsistenciaDTO peticion) {
		return ResponseEntity.ok(asistenciaService.justificar(id, peticion));
	}

	@PutMapping("/{id}/auditar")
	@PreAuthorize("hasRole('ADMIN_RRHH')")
	public ResponseEntity<AsistenciaResponseDTO> auditar(@PathVariable Long id) {
		return ResponseEntity.ok(asistenciaService.auditar(id));
	}

	@PutMapping("/{id}/falta")
	@PreAuthorize("hasRole('ADMIN_RRHH')")
	public ResponseEntity<AsistenciaResponseDTO> registrarFalta(@PathVariable Long id) {
		return ResponseEntity.ok(asistenciaService.registrarFalta(id));
	}

	// Marcaciones del propio colaborador autenticado
	@GetMapping("/mias")
	public ResponseEntity<List<AsistenciaResponseDTO>> listarPropias(
			Principal principal,
			@RequestParam(required = false) Integer anio,
			@RequestParam(required = false) Integer mes,
			@RequestParam(required = false) String estado) {
		Long idEmpleado = obtenerIdEmpleado(principal);
		return ResponseEntity.ok(asistenciaService.listarPorEmpleado(idEmpleado, anio, mes, estado));
	}

	@PutMapping("/mias/{id}/justificar")
	public ResponseEntity<AsistenciaResponseDTO> justificarPropia(
			Principal principal,
			@PathVariable Long id,
			@Valid @RequestBody JustificacionAsistenciaDTO peticion) {
		Long idEmpleado = obtenerIdEmpleado(principal);
		return ResponseEntity.ok(asistenciaService.justificarPropia(id, idEmpleado, peticion));
	}

	@GetMapping("/mi-resumen")
	public ResponseEntity<ResumenAsistenciaEmpleadoDTO> obtenerResumenPropio(Principal principal) {
		return ResponseEntity.ok(asistenciaService.obtenerResumenEmpleado(obtenerIdEmpleado(principal)));
	}

	@GetMapping("/jornada-actual")
	public ResponseEntity<JornadaActualDTO> obtenerJornadaActual(Principal principal) {
		return ResponseEntity.ok(asistenciaService.obtenerJornadaActual(obtenerIdEmpleado(principal)));
	}

	@PostMapping("/entrada")
	public ResponseEntity<AsistenciaResponseDTO> marcarEntrada(Principal principal,
			@RequestParam(defaultValue = "PORTAL_WEB") String metodo) {
		return ResponseEntity.ok(asistenciaService.marcarEntrada(obtenerIdEmpleado(principal),
				MetodoMarcacion.valueOf(metodo)));
	}

	@PostMapping("/salida")
	public ResponseEntity<AsistenciaResponseDTO> marcarSalida(Principal principal) {
		return ResponseEntity.ok(asistenciaService.marcarSalida(obtenerIdEmpleado(principal)));
	}

	@PostMapping("/refrigerio")
	public ResponseEntity<AsistenciaResponseDTO> registrarRefrigerio(Principal principal) {
		return ResponseEntity.ok(asistenciaService.registrarRefrigerio(obtenerIdEmpleado(principal)));
	}

	// Resuelve el id del empleado desde el correo del token JWT
	private Long obtenerIdEmpleado(Principal principal) {
		return empleadoRepository.findByCorreo(principal.getName())
				.map(empleado -> empleado.getId())
				.orElseThrow(() -> new IllegalStateException("Sesión inválida"));
	}
}
