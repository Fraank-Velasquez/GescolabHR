package GescolabHR.Backend.initialization;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import GescolabHR.Backend.model.Asistencia;
import GescolabHR.Backend.model.Cargo;
import GescolabHR.Backend.model.Departamento;
import GescolabHR.Backend.model.Empleado;
import GescolabHR.Backend.model.EstadoAsistencia;
import GescolabHR.Backend.model.EstadoEmpleado;
import GescolabHR.Backend.model.EstadoSolicitud;
import GescolabHR.Backend.model.MetodoMarcacion;
import GescolabHR.Backend.model.NivelCargo;
import GescolabHR.Backend.model.RolUsuario;
import GescolabHR.Backend.model.SolicitudAusencia;
import GescolabHR.Backend.model.Turno;
import GescolabHR.Backend.model.TipoSolicitud;
import GescolabHR.Backend.repository.AsistenciaRepository;
import GescolabHR.Backend.repository.CargoRepository;
import GescolabHR.Backend.repository.DepartamentoRepository;
import GescolabHR.Backend.repository.EmpleadoRepository;
import GescolabHR.Backend.repository.SolicitudAusenciaRepository;
import GescolabHR.Backend.repository.TurnoRepository;

// Siembra los datos visibles en las pantallas solo si la base está vacía
@Component
public class DatosInicialesInitializer implements CommandLineRunner {

	private final DepartamentoRepository departamentoRepository;
	private final CargoRepository cargoRepository;
	private final TurnoRepository turnoRepository;
	private final EmpleadoRepository empleadoRepository;
	private final AsistenciaRepository asistenciaRepository;
	private final SolicitudAusenciaRepository solicitudRepository;
	private final PasswordEncoder passwordEncoder;

	public DatosInicialesInitializer(DepartamentoRepository departamentoRepository,
			CargoRepository cargoRepository,
			TurnoRepository turnoRepository,
			EmpleadoRepository empleadoRepository,
			AsistenciaRepository asistenciaRepository,
			SolicitudAusenciaRepository solicitudRepository,
			PasswordEncoder passwordEncoder) {
		this.departamentoRepository = departamentoRepository;
		this.cargoRepository = cargoRepository;
		this.turnoRepository = turnoRepository;
		this.empleadoRepository = empleadoRepository;
		this.asistenciaRepository = asistenciaRepository;
		this.solicitudRepository = solicitudRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	@Transactional
	public void run(String... args) {
		solicitudRepository.deleteByMotivoStartingWith("Descanso vacacional aprobado N° ");

		if (empleadoRepository.count() > 0) {
			return;
		}

		List<Departamento> departamentos = crearDepartamentos();
		List<Turno> turnos = crearTurnos();
		crearCargos(departamentos);
		List<Empleado> empleados = crearEmpleados(turnos);
		crearAsistenciasEjemplo(empleados);
		crearSolicitudesEjemplo(empleados);
	}

	private List<Departamento> crearDepartamentos() {
		Departamento tecnologia = nuevoDepartamento("DEP-001", "Tecnología de la Información",
				"Desarrollo de software corporativo, arquitectura cloud, soporte e infraestructura tecnológica para todas las unidades de negocio.",
				"Carlos Mendoza (CTO)");
		Departamento operaciones = nuevoDepartamento("DEP-002", "Operaciones & Logística",
				"Cadena de suministro, distribución y operaciones logísticas de la empresa.",
				"Valeria Ramos (COO)");
		Departamento ventas = nuevoDepartamento("DEP-003", "Ventas & Comercial",
				"Gestión de cartera de clientes B2B y estrategia comercial corporativa.",
				"Andrés Silva");
		Departamento finanzas = nuevoDepartamento("DEP-004", "Finanzas & Contabilidad",
				"Contabilidad, tesorería y planeamiento financiero de la organización.",
				"Mariana Castillo (CFO)");
		Departamento recursosHumanos = nuevoDepartamento("DEP-005", "Recursos Humanos & Legal",
				"Selección, desarrollo de talento y cumplimiento normativo laboral.",
				"Diego Herrera");
		Departamento marketing = nuevoDepartamento("DEP-006", "Marketing & Producto",
				"Marca, producto digital y comunicación corporativa.",
				"Lucía Fernández");

		return departamentoRepository.saveAll(
				List.of(tecnologia, operaciones, ventas, finanzas, recursosHumanos, marketing));
	}

	private Departamento nuevoDepartamento(String codigo, String nombre, String descripcion, String responsable) {
		Departamento departamento = new Departamento();
		departamento.setCodigo(codigo);
		departamento.setNombre(nombre);
		departamento.setDescripcion(descripcion);
		departamento.setResponsable(responsable);
		departamento.setEstado(true);
		return departamento;
	}

	private List<Turno> crearTurnos() {
		Turno manana = new Turno();
		manana.setNombre("Turno Mañana");
		manana.setHoraEntrada(LocalTime.of(8, 0));
		manana.setHoraSalida(LocalTime.of(17, 0));
		manana.setHoraRefrigerio(LocalTime.of(13, 0));
		manana.setModalidad("Presencial");

		Turno tarde = new Turno();
		tarde.setNombre("Turno Tarde");
		tarde.setHoraEntrada(LocalTime.of(14, 0));
		tarde.setHoraSalida(LocalTime.of(23, 0));
		tarde.setHoraRefrigerio(LocalTime.of(18, 0));
		tarde.setModalidad("Presencial");

		return turnoRepository.saveAll(List.of(manana, tarde));
	}

	private void crearCargos(List<Departamento> departamentos) {
		Departamento tecnologia = departamentos.get(0);
		Departamento operaciones = departamentos.get(1);
		Departamento ventas = departamentos.get(2);
		Departamento finanzas = departamentos.get(3);
		Departamento recursosHumanos = departamentos.get(4);
		Departamento marketing = departamentos.get(5);

		cargoRepository.saveAll(List.of(
				nuevoCargo("Senior Backend Developer", NivelCargo.SENIOR, "9500.00", 14, 14, tecnologia),
				nuevoCargo("Lead Cloud Architect", NivelCargo.LEAD, "14000.00", 2, 2, tecnologia),
				nuevoCargo("Frontend Engineer", NivelCargo.SEMI_SENIOR, "6800.00", 15, 12, tecnologia),
				nuevoCargo("DevOps / SRE Specialist", NivelCargo.SENIOR, "9000.00", 6, 5, tecnologia),
				nuevoCargo("QA Automation Engineer", NivelCargo.MID, "5500.00", 6, 6, tecnologia),
				nuevoCargo("UI/UX Product Designer", NivelCargo.SENIOR, "7200.00", 4, 4, tecnologia),
				nuevoCargo("Helpdesk & Soporte TI", NivelCargo.JUNIOR, "3200.00", 3, 3, tecnologia),

				nuevoCargo("Líder de Logística", NivelCargo.LEAD, "10500.00", 3, 3, operaciones),
				nuevoCargo("Supervisor de Distribución", NivelCargo.SENIOR, "7200.00", 5, 4, operaciones),
				nuevoCargo("Analista de Operaciones", NivelCargo.MID, "5200.00", 8, 6, operaciones),
				nuevoCargo("Choificador", NivelCargo.JUNIOR, "3100.00", 12, 9, operaciones),
				nuevoCargo("Coordinador de Almacén", NivelCargo.SEMI_SENIOR, "6100.00", 4, 3, operaciones),

				nuevoCargo("Key Account Manager B2B", NivelCargo.SENIOR, "8800.00", 6, 5, ventas),
				nuevoCargo("Ejecutivo de Cuentas B2B", NivelCargo.MID, "5600.00", 10, 8, ventas),
				nuevoCargo("Especialista de Marketing Digital", NivelCargo.SEMI_SENIOR, "6200.00", 7, 5, ventas),
				nuevoCargo("Asistente Comercial", NivelCargo.JUNIOR, "3400.00", 6, 4, ventas),

				nuevoCargo("Analista Contable Senior", NivelCargo.SENIOR, "7800.00", 5, 4, finanzas),
				nuevoCargo("Tesorería y Pagos", NivelCargo.SEMI_SENIOR, "6300.00", 4, 3, finanzas),
				nuevoCargo("Analista de Presupuestos", NivelCargo.MID, "5700.00", 5, 4, finanzas),
				nuevoCargo("Auxiliar Contable", NivelCargo.JUNIOR, "3300.00", 4, 3, finanzas),

				nuevoCargo("Especialista de Selección", NivelCargo.MID, "5900.00", 4, 3, recursosHumanos),
				nuevoCargo("Analista de Recursos Humanos", NivelCargo.SEMI_SENIOR, "6400.00", 5, 4, recursosHumanos),
				nuevoCargo("Abogada Laboralista", NivelCargo.SENIOR, "9200.00", 2, 2, recursosHumanos),
				nuevoCargo("Practicante de RR.HH.", NivelCargo.JUNIOR, "1800.00", 3, 2, recursosHumanos),

				nuevoCargo("Product Designer Lead", NivelCargo.LEAD, "11000.00", 2, 2, marketing),
				nuevoCargo("Content Strategist", NivelCargo.MID, "5800.00", 3, 2, marketing),
				nuevoCargo("Diseñador Gráfico", NivelCargo.JUNIOR, "3900.00", 3, 2, marketing)));
	}

	private Cargo nuevoCargo(String nombre, NivelCargo nivel, String sueldo, int plazasTotales,
			int plazasOcupadas, Departamento departamento) {
		Cargo cargo = new Cargo();
		cargo.setNombre(nombre);
		cargo.setNivel(nivel);
		cargo.setSueldoBase(new BigDecimal(sueldo));
		cargo.setPlazasTotales(plazasTotales);
		cargo.setPlazasOcupadas(plazasOcupadas);
		cargo.setEstado(true);
		cargo.setDepartamento(departamento);
		return cargo;
	}

	private List<Empleado> crearEmpleados(List<Turno> turnos) {
		Turno manana = turnos.get(0);
		Cargo seniorBackend = buscarCargo("Senior Backend Developer");
		Cargo liderLogistica = buscarCargo("Líder de Logística");
		Cargo analistaContable = buscarCargo("Analista Contable Senior");
		Cargo keyAccount = buscarCargo("Key Account Manager B2B");
		Cargo especialistaSeleccion = buscarCargo("Especialista de Selección");
		Cargo productDesigner = buscarCargo("Product Designer Lead");
		Cargo supervisorDistribucion = buscarCargo("Supervisor de Distribución");

		Empleado admin = nuevoEmpleado("90000001", "Administración", "RR. HH.",
				"admin.rrhh@gescolab.corp", LocalDate.of(2019, 1, 2),
				EstadoEmpleado.ACTIVO, RolUsuario.ROLE_ADMIN_RRHH, buscarCargo("Analista de Recursos Humanos"), manana,
				"Admin123!");

		Empleado carlos = nuevoEmpleado("72849102", "Carlos Alberto", "Mendoza Paz",
				"carlos.mendoza@gescolab.corp", LocalDate.of(2021, 3, 15),
				EstadoEmpleado.ACTIVO, RolUsuario.ROLE_EMPLEADO, seniorBackend, manana, "Empleado123!");

		Empleado valeria = nuevoEmpleado("48190342", "Valeria", "Ramos Salazar",
				"valeria.ramos@gescolab.corp", LocalDate.of(2019, 7, 8),
				EstadoEmpleado.ACTIVO, RolUsuario.ROLE_EMPLEADO, liderLogistica, manana, "Empleado123!");

		Empleado andres = nuevoEmpleado("75319804", "Andrés", "Silva Paredes",
				"andres.silva@gescolab.corp", LocalDate.of(2023, 1, 3),
				EstadoEmpleado.ACTIVO, RolUsuario.ROLE_EMPLEADO, analistaContable, manana, "Empleado123!");

		Empleado mariana = nuevoEmpleado("70932145", "Mariana", "Castillo Vega",
				"mariana.castillo@gescolab.corp", LocalDate.of(2022, 5, 19),
				EstadoEmpleado.ACTIVO, RolUsuario.ROLE_EMPLEADO, keyAccount, manana, "Empleado123!");

		Empleado diego = nuevoEmpleado("61820491", "Diego", "Herrera Cáceres",
				"diego.herrera@gescolab.corp", LocalDate.of(2020, 2, 11),
				EstadoEmpleado.INACTIVO, RolUsuario.ROLE_EMPLEADO, especialistaSeleccion, manana, "Empleado123!");

		Empleado lucia = nuevoEmpleado("74129853", "Lucía", "Fernández Prado",
				"lucia.fernandez@gescolab.corp", LocalDate.of(2022, 10, 1),
				EstadoEmpleado.ACTIVO, RolUsuario.ROLE_EMPLEADO, productDesigner, manana, "Empleado123!");

		Empleado roberto = nuevoEmpleado("46981204", "Roberto", "Quispe Alarcón",
				"roberto.quispe@gescolab.corp", LocalDate.of(2021, 11, 14),
				EstadoEmpleado.ACTIVO, RolUsuario.ROLE_EMPLEADO, supervisorDistribucion, manana, "Empleado123!");

		return empleadoRepository.saveAll(
				List.of(admin, carlos, valeria, andres, mariana, diego, lucia, roberto));
	}

	private Empleado nuevoEmpleado(String dni, String nombres, String apellidos, String correo,
			LocalDate fechaIngreso, EstadoEmpleado estado, RolUsuario rol, Cargo cargo, Turno turno,
			String contrasena) {
		Empleado empleado = new Empleado();
		empleado.setDni(dni);
		empleado.setNombres(nombres);
		empleado.setApellidos(apellidos);
		empleado.setCorreo(correo);
		empleado.setFechaIngreso(fechaIngreso);
		empleado.setEstado(estado);
		empleado.setRol(rol);
		empleado.setCargo(cargo);
		empleado.setTurno(turno);
		empleado.setContrasena(passwordEncoder.encode(contrasena));
		return empleado;
	}

	// Reglas de asistencia de las tablas admin y del empleado Carlos
	private void crearAsistenciasEjemplo(List<Empleado> empleados) {
		LocalDate hoy = LocalDate.now();
		LocalDate ayer = hoy.minusDays(1);
		LocalDate haceDos = hoy.minusDays(2);

		registrarMarcacion(buscarPorCorreo(empleados, "carlos.mendoza@gescolab.corp"), hoy,
				LocalTime.of(7, 58), null, EstadoAsistencia.PUNTUAL, MetodoMarcacion.PORTAL_WEB);
		registrarMarcacion(buscarPorCorreo(empleados, "valeria.ramos@gescolab.corp"), hoy,
				LocalTime.of(9, 14), null, EstadoAsistencia.TARDANZA, MetodoMarcacion.PORTAL_WEB);
		registrarMarcacion(buscarPorCorreo(empleados, "andres.silva@gescolab.corp"), hoy,
				LocalTime.of(8, 45), LocalTime.of(17, 30), EstadoAsistencia.PUNTUAL, MetodoMarcacion.PORTAL_WEB);
		registrarMarcacion(buscarPorCorreo(empleados, "mariana.castillo@gescolab.corp"), hoy,
				LocalTime.of(9, 0), null, EstadoAsistencia.PUNTUAL, MetodoMarcacion.PORTAL_WEB);
		registrarMarcacion(buscarPorCorreo(empleados, "lucia.fernandez@gescolab.corp"), hoy,
				LocalTime.of(9, 18), null, EstadoAsistencia.TARDANZA, MetodoMarcacion.PORTAL_WEB);
		registrarMarcacion(buscarPorCorreo(empleados, "roberto.quispe@gescolab.corp"), hoy,
				null, null, EstadoAsistencia.AUSENTE, MetodoMarcacion.PORTAL_WEB);

		registrarMarcacion(buscarPorCorreo(empleados, "carlos.mendoza@gescolab.corp"), ayer,
				LocalTime.of(7, 55), LocalTime.of(17, 6), EstadoAsistencia.PUNTUAL, MetodoMarcacion.PORTAL_WEB);
		registrarMarcacion(buscarPorCorreo(empleados, "carlos.mendoza@gescolab.corp"), haceDos,
				LocalTime.of(8, 14), LocalTime.of(17, 22), EstadoAsistencia.TARDANZA, MetodoMarcacion.PORTAL_WEB);

		// Histórico de Carlos para los KPIs: 19 asistidos y 1 tardanza del mes
		LocalDate inicioMes = hoy.withDayOfMonth(1);
		for (int i = 1; i <= 19; i++) {
			LocalDate dia = inicioMes.plusDays(i - 1);
			if (dia.isAfter(hoy) || dia.getDayOfWeek().getValue() > 5) {
				continue;
			}
			if (asistenciaRepository.existsByEmpleadoIdAndFecha(
					buscarPorCorreo(empleados, "carlos.mendoza@gescolab.corp").getId(), dia)) {
				continue;
			}
			registrarMarcacion(buscarPorCorreo(empleados, "carlos.mendoza@gescolab.corp"), dia,
					LocalTime.of(7, 55 + (i % 5)), LocalTime.of(17, 5),
					EstadoAsistencia.PUNTUAL, MetodoMarcacion.PORTAL_WEB);
		}
	}

	private void registrarMarcacion(Empleado empleado, LocalDate fecha, LocalTime entrada, LocalTime salida,
			EstadoAsistencia estado, MetodoMarcacion metodo) {
		Asistencia asistencia = new Asistencia();
		asistencia.setEmpleado(empleado);
		asistencia.setFecha(fecha);
		asistencia.setHoraEntrada(entrada);
		asistencia.setHoraSalida(salida);
		asistencia.setEstado(estado);
		asistencia.setMetodo(metodo);
		asistencia.setAuditada(false);
		asistenciaRepository.save(asistencia);
	}

	// Las 5 solicitudes pendientes literales más histórico para los contadores
	private void crearSolicitudesEjemplo(List<Empleado> empleados) {
		Empleado carlos = buscarPorCorreo(empleados, "carlos.mendoza@gescolab.corp");
		Empleado valeria = buscarPorCorreo(empleados, "valeria.ramos@gescolab.corp");
		Empleado andres = buscarPorCorreo(empleados, "andres.silva@gescolab.corp");
		Empleado mariana = buscarPorCorreo(empleados, "mariana.castillo@gescolab.corp");
		Empleado diego = buscarPorCorreo(empleados, "diego.herrera@gescolab.corp");

		LocalDate anioPasado = LocalDate.now().minusYears(1);

		solicitudRepository.save(nuevaSolicitud(carlos, TipoSolicitud.VACACIONES,
				anioPasado.withMonth(11).withDayOfMonth(18),
				anioPasado.withMonth(11).withDayOfMonth(29),
				"Vacaciones ordinarias pendientes periodo 2023-2024 - Plan de reemplazo validado"));

		solicitudRepository.save(nuevaSolicitud(valeria, TipoSolicitud.DESCANSO_MEDICO,
				anioPasado.withMonth(11).withDayOfMonth(21),
				anioPasado.withMonth(11).withDayOfMonth(23),
				"Descanso médico ESSALUD - CITT N° 294819"));

		solicitudRepository.save(nuevaSolicitud(andres, TipoSolicitud.PERMISO_PERSONAL,
				anioPasado.withMonth(11).withDayOfMonth(22),
				anioPasado.withMonth(11).withDayOfMonth(22),
				"Trámites notariales y bancarios de vivienda - Compensará el sábado 30"));

		solicitudRepository.save(nuevaSolicitud(mariana, TipoSolicitud.VACACIONES,
				anioPasado.withMonth(12).withDayOfMonth(2),
				anioPasado.withMonth(12).withDayOfMonth(6),
				"Viaje familiar programado de fin de año - Visto bueno de Jefatura directa"));

		solicitudRepository.save(nuevaSolicitud(diego, TipoSolicitud.CAPACITACION,
				anioPasado.withMonth(11).withDayOfMonth(25),
				anioPasado.withMonth(11).withDayOfMonth(26),
				"Congreso Internacional de Gestión del Talento Humano 2024"));

		SolicitudAusencia aprobada = nuevaSolicitud(carlos, TipoSolicitud.VACACIONES,
				anioPasado.withMonth(12).withDayOfMonth(2),
				anioPasado.withMonth(12).withDayOfMonth(6),
				"Vacaciones aprobadas del periodo anterior");
		aprobada.setEstado(EstadoSolicitud.APROBADA);
		aprobada.setObservacionResolucion("Aprobado por RR.HH.");
		solicitudRepository.save(aprobada);

		for (int i = 1; i <= 4; i++) {
			SolicitudAusencia rechazada = nuevaSolicitud(valeria, TipoSolicitud.PERMISO_PERSONAL,
					anioPasado.withMonth(6).withDayOfMonth(i),
					anioPasado.withMonth(6).withDayOfMonth(i),
					"Solicitud fuera de política N° " + i);
			rechazada.setEstado(EstadoSolicitud.RECHAZADA);
			rechazada.setObservacionResolucion("Período sin cobertura del área");
			solicitudRepository.save(rechazada);
		}
	}

	private SolicitudAusencia nuevaSolicitud(Empleado empleado, TipoSolicitud tipo, LocalDate inicio,
			LocalDate fin, String motivo) {
		SolicitudAusencia solicitud = new SolicitudAusencia();
		solicitud.setEmpleado(empleado);
		solicitud.setTipo(tipo);
		solicitud.setFechaInicio(inicio);
		solicitud.setFechaFin(fin);
		solicitud.setDias((int) (ChronoUnit.DAYS.between(inicio, fin) + 1));
		solicitud.setMotivo(motivo);
		solicitud.setEstado(EstadoSolicitud.PENDIENTE);
		return solicitud;
	}

	private Cargo buscarCargo(String nombre) {
		return cargoRepository.findAll().stream()
				.filter(c -> c.getNombre().equals(nombre))
				.findFirst()
				.orElseThrow(() -> new IllegalStateException("Cargo sembrado no encontrado: " + nombre));
	}

	private Empleado buscarPorCorreo(List<Empleado> empleados, String correo) {
		return empleados.stream()
				.filter(e -> e.getCorreo().equals(correo))
				.findFirst()
				.orElseThrow(() -> new IllegalStateException("Empleado sembrado no encontrado: " + correo));
	}
}
