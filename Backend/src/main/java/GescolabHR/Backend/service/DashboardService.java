package GescolabHR.Backend.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import GescolabHR.Backend.dto.AsistenciaResponseDTO;
import GescolabHR.Backend.dto.DistribucionDepartamentoDTO;
import GescolabHR.Backend.dto.ResumenDashboardDTO;
import GescolabHR.Backend.dto.TendenciaSemanalDTO;
import GescolabHR.Backend.model.Asistencia;
import GescolabHR.Backend.model.Departamento;
import GescolabHR.Backend.model.EstadoAsistencia;
import GescolabHR.Backend.model.EstadoEmpleado;
import GescolabHR.Backend.model.EstadoSolicitud;
import GescolabHR.Backend.repository.AsistenciaRepository;
import GescolabHR.Backend.repository.CargoRepository;
import GescolabHR.Backend.repository.DepartamentoRepository;
import GescolabHR.Backend.repository.EmpleadoRepository;
import GescolabHR.Backend.repository.SolicitudAusenciaRepository;

// Consolida los indicadores y gráficos del panel ejecutivo
@Service
public class DashboardService {

	private static final String[] DIAS_SEMANA = { "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom" };

	private final EmpleadoRepository empleadoRepository;
	private final AsistenciaRepository asistenciaRepository;
	private final SolicitudAusenciaRepository solicitudRepository;
	private final DepartamentoRepository departamentoRepository;
	private final CargoRepository cargoRepository;

	public DashboardService(EmpleadoRepository empleadoRepository,
			AsistenciaRepository asistenciaRepository,
			SolicitudAusenciaRepository solicitudRepository,
			DepartamentoRepository departamentoRepository,
			CargoRepository cargoRepository) {
		this.empleadoRepository = empleadoRepository;
		this.asistenciaRepository = asistenciaRepository;
		this.solicitudRepository = solicitudRepository;
		this.departamentoRepository = departamentoRepository;
		this.cargoRepository = cargoRepository;
	}

	// Cuatro KPIs superiores del panel ejecutivo
	@Transactional(readOnly = true)
	public ResumenDashboardDTO obtenerResumen() {
		LocalDate hoy = LocalDate.now();
		long activos = empleadoRepository.contarPorEstado(EstadoEmpleado.ACTIVO);
		long asistencias = asistenciaRepository.contarPorFechaYEstado(hoy, EstadoAsistencia.PUNTUAL)
				+ asistenciaRepository.contarPorFechaYEstado(hoy, EstadoAsistencia.TARDANZA)
				+ asistenciaRepository.contarPorFechaYEstado(hoy, EstadoAsistencia.EN_CURSO)
				+ asistenciaRepository.contarPorFechaYEstado(hoy, EstadoAsistencia.JUSTIFICADA);
		long tardanzas = asistenciaRepository.contarPorFechaYEstado(hoy, EstadoAsistencia.TARDANZA);
		long pendientes = solicitudRepository.contarPorEstado(EstadoSolicitud.PENDIENTE);
		return new ResumenDashboardDTO(activos, asistencias, tardanzas, pendientes);
	}

	// Serie de lunes a viernes de la semana en curso para el gráfico de barras
	@Transactional(readOnly = true)
	public List<TendenciaSemanalDTO> obtenerTendenciaSemanal() {
		LocalDate hoy = LocalDate.now();
		LocalDate lunes = hoy.with(DayOfWeek.MONDAY);
		if (hoy.getDayOfWeek() == DayOfWeek.SUNDAY) {
			lunes = hoy.minusDays(6);
		}

		List<TendenciaSemanalDTO> puntos = new ArrayList<>();
		for (int i = 0; i < 5; i++) {
			LocalDate dia = lunes.plusDays(i);
			long puntuales = asistenciaRepository.contarPorFechaYEstado(dia, EstadoAsistencia.PUNTUAL);
			long tardanzas = asistenciaRepository.contarPorFechaYEstado(dia, EstadoAsistencia.TARDANZA);
			long justificaciones = asistenciaRepository.contarPorFechaYEstado(dia, EstadoAsistencia.JUSTIFICADA);
			puntos.add(new TendenciaSemanalDTO(DIAS_SEMANA[i], puntuales, tardanzas + justificaciones));
		}
		return puntos;
	}

	// Porcentaje de colaboradores por departamento para el panel lateral
	@Transactional(readOnly = true)
	public List<DistribucionDepartamentoDTO> obtenerDistribucionDepartamentos() {
		List<Departamento> departamentos = departamentoRepository.buscar(null);
		List<DistribucionDepartamentoDTO> distribucion = new ArrayList<>();
		long total = empleadoRepository.contarPorEstado(EstadoEmpleado.ACTIVO);

		for (Departamento departamento : departamentos) {
			long conteo = empleadoRepository.contarActivosPorDepartamento(departamento.getId());
			double porcentaje = total == 0 ? 0 : Math.round((conteo * 1000.0) / total) / 10.0;
			distribucion.add(new DistribucionDepartamentoDTO(departamento.getNombre(), conteo, porcentaje));
		}

		distribucion.sort((a, b) -> Long.compare(b.getTotalColaboradores(), a.getTotalColaboradores()));
		return distribucion;
	}

	// Últimas marcaciones del día para la tabla inferior del dashboard
	@Transactional(readOnly = true)
	public List<AsistenciaResponseDTO> obtenerUltimasMarcaciones() {
		List<Asistencia> marcaciones = asistenciaRepository
				.buscarRecientesPorFecha(LocalDate.now(), org.springframework.data.domain.PageRequest.of(0, 6));
		return marcaciones.stream()
				.map(this::convertir)
				.toList();
	}

	private AsistenciaResponseDTO convertir(Asistencia asistencia) {
		var empleado = asistencia.getEmpleado();
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
