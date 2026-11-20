package GescolabHR.Backend.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import GescolabHR.Backend.dto.AsistenciaResponseDTO;
import GescolabHR.Backend.dto.JornadaActualDTO;
import GescolabHR.Backend.dto.JustificacionAsistenciaDTO;
import GescolabHR.Backend.dto.MarcacionManualDTO;
import GescolabHR.Backend.dto.ResumenAsistenciaEmpleadoDTO;
import GescolabHR.Backend.dto.ResumenAsistenciaGlobalDTO;
import GescolabHR.Backend.model.Asistencia;
import GescolabHR.Backend.model.Empleado;
import GescolabHR.Backend.model.EstadoAsistencia;
import GescolabHR.Backend.model.EstadoEmpleado;
import GescolabHR.Backend.model.MetodoMarcacion;
import GescolabHR.Backend.model.Turno;
import GescolabHR.Backend.exception.RecursoNoEncontradoException;
import GescolabHR.Backend.exception.ReglaNegocioException;
import GescolabHR.Backend.repository.AsistenciaRepository;
import GescolabHR.Backend.repository.EmpleadoRepository;

// Aplica las reglas de puntualidad, horas efectivas y auditoría de marcaciones
@Service
public class AsistenciaService {

	// Tolerancia en minutos antes de considerar tardanza
	private static final int TOLERANCIA_MINUTOS = 5;
	private static final LocalTime HORA_INICIO_JORNADA = LocalTime.of(8, 0);
	private static final LocalTime HORA_FIN_JORNADA = LocalTime.of(17, 0);
	private static final int MINUTOS_JORNADA = 480;

	private final AsistenciaRepository asistenciaRepository;
	private final EmpleadoRepository empleadoRepository;

	public AsistenciaService(AsistenciaRepository asistenciaRepository,
			EmpleadoRepository empleadoRepository) {
		this.asistenciaRepository = asistenciaRepository;
		this.empleadoRepository = empleadoRepository;
	}

	@Transactional(readOnly = true)
	public Page<AsistenciaResponseDTO> listar(LocalDate fecha, LocalDate fechaDesde, LocalDate fechaHasta, Long departamentoId, String estado,
			String buscar, Pageable pageable) {
		EstadoAsistencia estadoEnum = estado == null || estado.isBlank() ? null : EstadoAsistencia.valueOf(estado);
		Page<Asistencia> resultado;
		if (fecha != null) {
			resultado = asistenciaRepository.buscarPorFecha(fecha, departamentoId, estadoEnum, normalizar(buscar), pageable);
		} else if (fechaDesde != null && fechaHasta != null) {
			resultado = asistenciaRepository.buscarPorRango(fechaDesde, fechaHasta, departamentoId, estadoEnum, normalizar(buscar), pageable);
		} else {
			resultado = asistenciaRepository.findAll(pageable).map(a -> a);
		}
		return resultado.map(this::convertir);
	}

	@Transactional(readOnly = true)
	public ResumenAsistenciaGlobalDTO obtenerResumenGlobal(LocalDate fecha, LocalDate fechaDesde, LocalDate fechaHasta) {
		long puntuales;
		long tardanzas;
		long ausentes;
		if (fechaDesde != null && fechaHasta != null) {
			puntuales = asistenciaRepository.contarEntreFechas(fechaDesde, fechaHasta, EstadoAsistencia.PUNTUAL);
			tardanzas = asistenciaRepository.contarEntreFechas(fechaDesde, fechaHasta, EstadoAsistencia.TARDANZA);
			ausentes = asistenciaRepository.contarEntreFechas(fechaDesde, fechaHasta, EstadoAsistencia.AUSENTE);
		} else {
			puntuales = asistenciaRepository.contarPorFechaYEstado(fecha, EstadoAsistencia.PUNTUAL);
			tardanzas = asistenciaRepository.contarPorFechaYEstado(fecha, EstadoAsistencia.TARDANZA);
			ausentes = asistenciaRepository.contarPorFechaYEstado(fecha, EstadoAsistencia.AUSENTE);
		}
		long sinJustificar = tardanzas;

		long presentes = puntuales + tardanzas + ausentes;
		double porcentaje = presentes == 0 ? 0 : Math.round((puntuales * 1000.0) / presentes) / 10.0;

		return new ResumenAsistenciaGlobalDTO(puntuales, sinJustificar, ausentes,
				sinJustificar, porcentaje);
	}

	// Marca la entrada del día y clasifica PUNTUAL o TARDANZA según el turno
	@Transactional
	public AsistenciaResponseDTO marcarEntrada(Long idEmpleado, MetodoMarcacion metodo) {
		Empleado empleado = buscarEmpleado(idEmpleado);
		LocalDate hoy = LocalDate.now();

		if (asistenciaRepository.existsByEmpleadoIdAndFecha(idEmpleado, hoy)) {
			throw new ReglaNegocioException("Ya registró su entrada el día de hoy");
		}

		Asistencia asistencia = new Asistencia();
		asistencia.setEmpleado(empleado);
		asistencia.setFecha(hoy);
		asistencia.setHoraEntrada(LocalTime.now().withSecond(0).withNano(0));
		asistencia.setMetodo(MetodoMarcacion.PORTAL_WEB);
		asistencia.setEstado(clasificarEntrada(asistencia.getHoraEntrada(), empleado.getTurno()));

		return convertir(asistenciaRepository.save(asistencia));
	}

	// Registra la salida; impide salir sin haber marcado entrada antes
	@Transactional
	public AsistenciaResponseDTO marcarSalida(Long idEmpleado) {
		Empleado empleado = buscarEmpleado(idEmpleado);
		LocalDate hoy = LocalDate.now();

		Asistencia asistencia = asistenciaRepository.findByEmpleadoIdAndFecha(idEmpleado, hoy)
				.orElseThrow(() -> new ReglaNegocioException(
						"No puede registrar salida sin haber marcado la entrada"));

		if (asistencia.getHoraSalida() != null) {
			throw new ReglaNegocioException("Ya registró su salida el día de hoy");
		}

		asistencia.setHoraSalida(LocalTime.now().withSecond(0).withNano(0));

		if (asistencia.getEstado() == EstadoAsistencia.EN_CURSO) {
			asistencia.setEstado(EstadoAsistencia.PUNTUAL);
		}

		return convertir(asistenciaRepository.save(asistencia));
	}

	// Pausa de refrigerio sin cerrar la jornada
	@Transactional
	public AsistenciaResponseDTO registrarRefrigerio(Long idEmpleado) {
		Empleado empleado = buscarEmpleado(idEmpleado);
		LocalDate hoy = LocalDate.now();

		Asistencia asistencia = asistenciaRepository.findByEmpleadoIdAndFecha(idEmpleado, hoy)
				.orElseThrow(() -> new ReglaNegocioException(
						"Debe marcar la entrada antes de registrar un refrigerio"));

		if (asistencia.getHoraSalida() != null) {
			throw new ReglaNegocioException("La jornada del día ya fue cerrada");
		}

		return convertir(asistencia);
	}

	@Transactional(readOnly = true)
	public List<AsistenciaResponseDTO> listarPorEmpleado(Long idEmpleado, Integer anio, Integer mes, String estado) {
		EstadoAsistencia estadoEnum = estado == null || estado.isBlank() ? null : EstadoAsistencia.valueOf(estado);
		return asistenciaRepository.buscarPorEmpleado(idEmpleado, anio, mes, estadoEnum).stream()
				.map(this::convertir)
				.toList();
	}

	@Transactional(readOnly = true)
	public ResumenAsistenciaEmpleadoDTO obtenerResumenEmpleado(Long idEmpleado) {
		LocalDate hoy = LocalDate.now();
		int anio = hoy.getYear();
		int mes = hoy.getMonthValue();

		List<Asistencia> delMes = asistenciaRepository.buscarPorEmpleado(idEmpleado, anio, mes, null);
		long asistidos = delMes.stream().filter(a -> a.getHoraEntrada() != null).count();
		long puntuales = delMes.stream().filter(a -> a.getEstado() == EstadoAsistencia.PUNTUAL).count();
		long tardanzas = delMes.stream().filter(a -> a.getEstado() == EstadoAsistencia.TARDANZA).count();

		int diasLaborables = contarDiasLaborables(anio, mes);
		double porcentajeDias = diasLaborables == 0 ? 0 : Math.round((asistidos * 1000.0) / diasLaborables) / 10.0;
		double porcentajePuntualidad = asistidos == 0 ? 100 : Math.round((puntuales * 1000.0) / asistidos) / 10.0;

		long minutosTotales = delMes.stream()
				.filter(a -> a.getHoraEntrada() != null && a.getHoraSalida() != null)
				.mapToLong(a -> Duration.between(a.getHoraEntrada(), a.getHoraSalida()).toMinutes())
				.sum();
		double horas = Math.round((minutosTotales / 60.0) * 10.0) / 10.0;

		return new ResumenAsistenciaEmpleadoDTO(asistidos, porcentajeDias,
				horas + " horas", porcentajePuntualidad, tardanzas);
	}

	// Datos de la tarjeta hero: turno, progreso y última marcación del día
	@Transactional(readOnly = true)
	public JornadaActualDTO obtenerJornadaActual(Long idEmpleado) {
		Empleado empleado = buscarEmpleado(idEmpleado);
		Turno turno = empleado.getTurno();
		LocalTime ahora = LocalTime.now().withSecond(0).withNano(0);

		String nombreTurno = turno != null ? turno.getNombre() : "Turno Mañana";
		LocalTime entrada = turno != null ? turno.getHoraEntrada() : HORA_INICIO_JORNADA;
		LocalTime salida = turno != null ? turno.getHoraSalida() : HORA_FIN_JORNADA;
		LocalTime refrigerio = turno != null ? turno.getHoraRefrigerio() : LocalTime.of(13, 0);
		String modalidad = turno != null ? turno.getModalidad() : "Presencial";

		Asistencia asistenciaHoy = asistenciaRepository
				.findByEmpleadoIdAndFecha(idEmpleado, LocalDate.now()).orElse(null);

		String estadoMarcacion = "SIN_MARCACION";
		LocalTime horaMarcada = null;
		if (asistenciaHoy != null) {
			if (asistenciaHoy.getHoraSalida() != null) {
				estadoMarcacion = "JORNADA_CERRADA";
				horaMarcada = asistenciaHoy.getHoraSalida();
			} else if (asistenciaHoy.getHoraEntrada() != null) {
				estadoMarcacion = "ENTRADA_REGISTRADA";
				horaMarcada = asistenciaHoy.getHoraEntrada();
			}
		}

		int minutosTrabajados = 0;
		if (asistenciaHoy != null && asistenciaHoy.getHoraEntrada() != null) {
			LocalTime fin = asistenciaHoy.getHoraSalida() != null ? asistenciaHoy.getHoraSalida() : ahora;
			minutosTrabajados = (int) Math.max(0, Duration.between(asistenciaHoy.getHoraEntrada(), fin).toMinutes());
		}

		double porcentaje = Math.min(100, Math.round((minutosTrabajados * 1000.0) / MINUTOS_JORNADA) / 10.0);
		String progreso = String.format("%dh %02dm / %dh %02dm",
				minutosTrabajados / 60, minutosTrabajados % 60,
				MINUTOS_JORNADA / 60, MINUTOS_JORNADA % 60);

		return new JornadaActualDTO(nombreTurno, entrada, salida, refrigerio, modalidad,
				estadoMarcacion, horaMarcada, progreso, porcentaje, progreso);
	}

	@Transactional
	public AsistenciaResponseDTO registrarManual(MarcacionManualDTO peticion) {
		Empleado empleado = buscarEmpleado(peticion.getIdEmpleado());

		if (asistenciaRepository.existsByEmpleadoIdAndFecha(peticion.getIdEmpleado(), peticion.getFecha())) {
			throw new ReglaNegocioException(
					"Ya existe una marcación para este colaborador en la fecha indicada");
		}

		Asistencia asistencia = new Asistencia();
		asistencia.setEmpleado(empleado);
		asistencia.setFecha(peticion.getFecha());
		asistencia.setHoraEntrada(peticion.getHoraEntrada());
		asistencia.setHoraSalida(peticion.getHoraSalida());
		asistencia.setMetodo(MetodoMarcacion.PORTAL_WEB);

		if (peticion.getHoraEntrada() == null) {
			asistencia.setEstado(EstadoAsistencia.AUSENTE);
		} else {
			asistencia.setEstado(clasificarEntrada(peticion.getHoraEntrada(), empleado.getTurno()));
			if (peticion.getHoraSalida() == null) {
				asistencia.setEstado(EstadoAsistencia.EN_CURSO);
			}
		}

		return convertir(asistenciaRepository.save(asistencia));
	}

	// Justifica una tardanza o falta con el motivo del administrador
	@Transactional
	public AsistenciaResponseDTO justificar(Long id, JustificacionAsistenciaDTO peticion) {
		Asistencia asistencia = buscarAsistencia(id);
		if (asistencia.getEstado() != EstadoAsistencia.TARDANZA) {
			throw new ReglaNegocioException("Solo se pueden justificar marcaciones con estado de tardanza");
		}
		asistencia.setMotivoJustificacion(peticion.getMotivo());
		asistencia.setEstado(EstadoAsistencia.JUSTIFICADA);
		asistencia.setAuditada(true);
		return convertir(asistenciaRepository.save(asistencia));
	}

	@Transactional
	public AsistenciaResponseDTO justificarPropia(Long id, Long idEmpleado,
			JustificacionAsistenciaDTO peticion) {
		Asistencia asistencia = buscarAsistencia(id);
		if (!asistencia.getEmpleado().getId().equals(idEmpleado)) {
			throw new ReglaNegocioException("Solo puede justificar sus propias marcaciones");
		}
		if (asistencia.getEstado() != EstadoAsistencia.TARDANZA) {
			throw new ReglaNegocioException("Solo se pueden justificar marcaciones con estado de tardanza");
		}
		asistencia.setMotivoJustificacion(peticion.getMotivo());
		asistencia.setEstado(EstadoAsistencia.JUSTIFICADA);
		asistencia.setAuditada(false);
		return convertir(asistenciaRepository.save(asistencia));
	}

	@Transactional
	public AsistenciaResponseDTO auditar(Long id) {
		Asistencia asistencia = buscarAsistencia(id);
		asistencia.setAuditada(true);
		return convertir(asistenciaRepository.save(asistencia));
	}

	@Transactional
	public AsistenciaResponseDTO registrarFalta(Long id) {
		Asistencia asistencia = buscarAsistencia(id);
		if (asistencia.getEstado() != EstadoAsistencia.AUSENTE
				&& asistencia.getHoraEntrada() != null) {
			throw new ReglaNegocioException("Solo se puede registrar falta cuando no existe una marcación de entrada");
		}
		asistencia.setEstado(EstadoAsistencia.AUSENTE);
		asistencia.setHoraEntrada(null);
		asistencia.setHoraSalida(null);
		asistencia.setAuditada(true);
		return convertir(asistenciaRepository.save(asistencia));
	}

	// Decide PUNTUAL o TARDANZA comparando la hora contra el turno asignado
	private EstadoAsistencia clasificarEntrada(LocalTime horaEntrada, Turno turno) {
		LocalTime limite = (turno != null ? turno.getHoraEntrada() : HORA_INICIO_JORNADA)
				.plusMinutes(TOLERANCIA_MINUTOS);
		return horaEntrada.isAfter(limite) ? EstadoAsistencia.TARDANZA : EstadoAsistencia.PUNTUAL;
	}

	private int contarDiasLaborables(int anio, int mes) {
		YearMonth mesCompleto = YearMonth.of(anio, mes);
		int laborables = 0;
		for (int dia = 1; dia <= mesCompleto.lengthOfMonth(); dia++) {
			LocalDate fecha = mesCompleto.atDay(dia);
			if (fecha.getDayOfWeek().getValue() <= 5) {
				laborables++;
			}
		}
		return laborables;
	}

	private Empleado buscarEmpleado(Long id) {
		return empleadoRepository.findById(id)
				.orElseThrow(() -> new RecursoNoEncontradoException("Colaborador no encontrado con id " + id));
	}

	private Asistencia buscarAsistencia(Long id) {
		return asistenciaRepository.findById(id)
				.orElseThrow(() -> new RecursoNoEncontradoException("Marcación no encontrada con id " + id));
	}

	private String normalizar(String buscar) {
		return buscar == null || buscar.isBlank() ? null : buscar.trim();
	}

	private AsistenciaResponseDTO convertir(Asistencia asistencia) {
		Empleado empleado = asistencia.getEmpleado();
		return new AsistenciaResponseDTO(
				asistencia.getId(),
				empleado.getId(),
				empleado.obtenerNombreCompleto(),
				empleado.getCargo().getNombre(),
				empleado.getDni(),
				empleado.getCargo().getDepartamento().getNombre(),
				asistencia.getFecha(),
				asistencia.getHoraEntrada(),
				asistencia.getHoraSalida(),
				asistencia.calcularHorasEfectivas(),
				asistencia.getMetodo().name(),
				asistencia.getEstado().name(),
				asistencia.getMotivoJustificacion(),
				asistencia.getAuditada());
	}
}
