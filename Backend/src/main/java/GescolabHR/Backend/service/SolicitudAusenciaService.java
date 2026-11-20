package GescolabHR.Backend.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import GescolabHR.Backend.dto.ContadoresSolicitudesDTO;
import GescolabHR.Backend.dto.ResumenSolicitudesDTO;
import GescolabHR.Backend.dto.SolicitudAusenciaRequestDTO;
import GescolabHR.Backend.dto.SolicitudAusenciaResponseDTO;
import GescolabHR.Backend.model.Empleado;
import GescolabHR.Backend.model.EstadoSolicitud;
import GescolabHR.Backend.model.SolicitudAusencia;
import GescolabHR.Backend.model.TipoSolicitud;
import GescolabHR.Backend.exception.RecursoNoEncontradoException;
import GescolabHR.Backend.exception.ReglaNegocioException;
import GescolabHR.Backend.repository.AsistenciaRepository;
import GescolabHR.Backend.repository.EmpleadoRepository;
import GescolabHR.Backend.repository.SolicitudAusenciaRepository;

// Controla el ciclo de vida de solicitudes y el saldo vacacional disponible
@Service
public class SolicitudAusenciaService {

	private final SolicitudAusenciaRepository solicitudRepository;
	private final EmpleadoRepository empleadoRepository;
	private final AsistenciaRepository asistenciaRepository;

	public SolicitudAusenciaService(SolicitudAusenciaRepository solicitudRepository,
			EmpleadoRepository empleadoRepository,
			AsistenciaRepository asistenciaRepository) {
		this.solicitudRepository = solicitudRepository;
		this.empleadoRepository = empleadoRepository;
		this.asistenciaRepository = asistenciaRepository;
	}

	@Transactional(readOnly = true)
	public Page<SolicitudAusenciaResponseDTO> listar(String estado, String tipo, Long departamentoId,
			String buscar, Pageable pageable) {
		EstadoSolicitud estadoEnum = estado == null || estado.isBlank() ? null : EstadoSolicitud.valueOf(estado);
		TipoSolicitud tipoEnum = tipo == null || tipo.isBlank() ? null : TipoSolicitud.valueOf(tipo);
		return solicitudRepository.buscar(estadoEnum, tipoEnum, departamentoId, normalizar(buscar), pageable)
				.map(this::convertir);
	}

	@Transactional(readOnly = true)
	public ContadoresSolicitudesDTO obtenerContadores() {
		return new ContadoresSolicitudesDTO(
				solicitudRepository.contarPorEstado(EstadoSolicitud.PENDIENTE),
				solicitudRepository.contarPorEstado(EstadoSolicitud.APROBADA),
				solicitudRepository.contarPorEstado(EstadoSolicitud.RECHAZADA),
				solicitudRepository.contarTodas());
	}

	@Transactional(readOnly = true)
	public ResumenSolicitudesDTO obtenerResumen() {
		long pendientes = solicitudRepository.contarPorEstado(EstadoSolicitud.PENDIENTE);
		long fueraHoy = solicitudRepository.contarFueraHoy(LocalDate.now());
		return new ResumenSolicitudesDTO(pendientes, fueraHoy);
	}

	@Transactional(readOnly = true)
	public List<SolicitudAusenciaResponseDTO> listarPorEmpleado(Long idEmpleado) {
		return solicitudRepository.findByEmpleadoIdOrderByFechaInicioDesc(idEmpleado).stream()
				.map(this::convertir)
				.toList();
	}

	// Valida fechas y solapamientos antes de registrar la solicitud
	@Transactional
	public SolicitudAusenciaResponseDTO crear(SolicitudAusenciaRequestDTO peticion, Long idSolicitante) {
		Long idEmpleado = peticion.getIdEmpleado() != null ? peticion.getIdEmpleado() : idSolicitante;
		Empleado empleado = empleadoRepository.findById(idEmpleado)
				.orElseThrow(() -> new RecursoNoEncontradoException("Colaborador no encontrado"));

		if (peticion.getFechaFin().isBefore(peticion.getFechaInicio())) {
			throw new ReglaNegocioException("La fecha fin debe ser mayor o igual a la fecha inicio");
		}

		TipoSolicitud tipo = TipoSolicitud.valueOf(peticion.getTipo());
		int dias = (int) (ChronoUnit.DAYS.between(peticion.getFechaInicio(), peticion.getFechaFin()) + 1);
		if (dias <= 0) {
			throw new ReglaNegocioException("El periodo de la solicitud debe incluir al menos un día");
		}

		boolean existeSolapamiento = solicitudRepository.findByEmpleadoIdOrderByFechaInicioDesc(idEmpleado).stream()
				.filter(s -> s.getEstado() != EstadoSolicitud.RECHAZADA)
				.anyMatch(s -> !peticion.getFechaFin().isBefore(s.getFechaInicio())
						&& !peticion.getFechaInicio().isAfter(s.getFechaFin()));
		if (existeSolapamiento) {
			throw new ReglaNegocioException(
					"El colaborador ya tiene una solicitud pendiente o aprobada en el periodo indicado");
		}

		SolicitudAusencia solicitud = new SolicitudAusencia();
		solicitud.setEmpleado(empleado);
		solicitud.setTipo(tipo);
		solicitud.setFechaInicio(peticion.getFechaInicio());
		solicitud.setFechaFin(peticion.getFechaFin());
		solicitud.setDias(dias);
		solicitud.setMotivo(peticion.getMotivo());
		solicitud.setEstado(EstadoSolicitud.PENDIENTE);

		return convertir(solicitudRepository.save(solicitud));
	}

	// Solo aprueba si el saldo aún cubre los días solicitados
	@Transactional
	public SolicitudAusenciaResponseDTO aprobar(Long id, String observacion) {
		SolicitudAusencia solicitud = buscarSolicitud(id);
		if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
			throw new ReglaNegocioException("Solo se pueden aprobar solicitudes pendientes");
		}

		solicitud.setEstado(EstadoSolicitud.APROBADA);
		solicitud.setObservacionResolucion(observacion);
		return convertir(solicitudRepository.save(solicitud));
	}

	@Transactional
	public SolicitudAusenciaResponseDTO rechazar(Long id, String observacion) {
		SolicitudAusencia solicitud = buscarSolicitud(id);
		if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
			throw new ReglaNegocioException("Solo se pueden rechazar solicitudes pendientes");
		}
		solicitud.setEstado(EstadoSolicitud.RECHAZADA);
		solicitud.setObservacionResolucion(observacion);
		return convertir(solicitudRepository.save(solicitud));
	}

	private SolicitudAusencia buscarSolicitud(Long id) {
		return solicitudRepository.findById(id)
				.orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada con id " + id));
	}

	private String normalizar(String buscar) {
		return buscar == null || buscar.isBlank() ? null : buscar.trim();
	}

	private SolicitudAusenciaResponseDTO convertir(SolicitudAusencia solicitud) {
		Empleado empleado = solicitud.getEmpleado();
		String periodo = solicitud.getFechaInicio().equals(solicitud.getFechaFin())
				? formatearFecha(solicitud.getFechaInicio())
				: formatearFecha(solicitud.getFechaInicio()) + " - " + formatearFecha(solicitud.getFechaFin());

		return new SolicitudAusenciaResponseDTO(
				solicitud.getId(),
				empleado.getId(),
				empleado.obtenerNombreCompleto(),
				empleado.getCargo().getNombre(),
				empleado.getCargo().getDepartamento().getNombre(),
				solicitud.getTipo().name(),
				solicitud.getFechaInicio(),
				solicitud.getFechaFin(),
				periodo,
				solicitud.getDias(),
				solicitud.getMotivo(),
				solicitud.getEstado().name(),
				solicitud.getObservacionResolucion());
	}

	private String formatearFecha(LocalDate fecha) {
		return String.format("%02d %s %d", fecha.getDayOfMonth(),
				mesEnEspanol(fecha.getMonthValue()), fecha.getYear());
	}

	private String mesEnEspanol(int mes) {
		String[] meses = { "Ene", "Feb", "Mar", "Abr", "May", "Jun",
				"Jul", "Ago", "Set", "Oct", "Nov", "Dic" };
		return meses[mes - 1];
	}
}
