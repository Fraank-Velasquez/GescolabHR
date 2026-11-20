package GescolabHR.Backend.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import GescolabHR.Backend.dto.EmpleadoRequestDTO;
import GescolabHR.Backend.dto.EmpleadoResponseDTO;
import GescolabHR.Backend.dto.ResumenEmpleadosDTO;
import GescolabHR.Backend.model.Cargo;
import GescolabHR.Backend.model.Empleado;
import GescolabHR.Backend.model.EstadoEmpleado;
import GescolabHR.Backend.model.RolUsuario;
import GescolabHR.Backend.model.Turno;
import GescolabHR.Backend.exception.RecursoDuplicadoException;
import GescolabHR.Backend.exception.RecursoNoEncontradoException;
import GescolabHR.Backend.repository.CargoRepository;
import GescolabHR.Backend.repository.EmpleadoRepository;
import GescolabHR.Backend.repository.TurnoRepository;

// Centraliza el CRUD del directorio de colaboradores con validaciones únicas
@Service
public class EmpleadoService {

	private final EmpleadoRepository empleadoRepository;
	private final CargoRepository cargoRepository;
	private final TurnoRepository turnoRepository;

	public EmpleadoService(EmpleadoRepository empleadoRepository,
			CargoRepository cargoRepository,
			TurnoRepository turnoRepository) {
		this.empleadoRepository = empleadoRepository;
		this.cargoRepository = cargoRepository;
		this.turnoRepository = turnoRepository;
	}

	@Transactional(readOnly = true)
	public Page<EmpleadoResponseDTO> listar(String buscar, Long departamentoId, String estado, Pageable pageable) {
		EstadoEmpleado estadoEnum = estado == null || estado.isBlank() ? null : EstadoEmpleado.valueOf(estado);
		return empleadoRepository.buscar(normalizar(buscar), departamentoId, estadoEnum, pageable)
				.map(this::convertir);
	}

	@Transactional(readOnly = true)
	public EmpleadoResponseDTO obtenerPorId(Long id) {
		return convertir(buscarEmpleado(id));
	}

	@Transactional(readOnly = true)
	public ResumenEmpleadosDTO obtenerResumen() {
		long activos = empleadoRepository.contarPorEstado(EstadoEmpleado.ACTIVO);
		long inactivos = empleadoRepository.contarPorEstado(EstadoEmpleado.INACTIVO);
		long licencia = empleadoRepository.contarPorEstado(EstadoEmpleado.EN_LICENCIA);
		double total = activos + inactivos + licencia;
		double porcentaje = total == 0 ? 0 : Math.round((inactivos * 1000.0) / total) / 10.0;
		return new ResumenEmpleadosDTO(activos, inactivos, porcentaje + "%");
	}

	// Valida unicidad de DNI y correo antes de crear el registro
	@Transactional
	public EmpleadoResponseDTO crear(EmpleadoRequestDTO peticion) {
		if (empleadoRepository.existsByDni(peticion.getDni())) {
			throw new RecursoDuplicadoException("El DNI " + peticion.getDni() + " ya está registrado");
		}
		if (empleadoRepository.existsByCorreo(peticion.getCorreo())) {
			throw new RecursoDuplicadoException("El correo " + peticion.getCorreo() + " ya está registrado");
		}

		Empleado empleado = new Empleado();
		aplicarDatos(empleado, peticion);
		empleado.setContrasena(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder()
				.encode("Empleado123!"));
		empleado.setRol(RolUsuario.ROLE_EMPLEADO);

		return convertir(empleadoRepository.save(empleado));
	}

	@Transactional
	public EmpleadoResponseDTO actualizar(Long id, EmpleadoRequestDTO peticion) {
		Empleado empleado = buscarEmpleado(id);

		if (empleadoRepository.existsByDni(peticion.getDni())
				&& !empleado.getDni().equals(peticion.getDni())) {
			throw new RecursoDuplicadoException("El DNI " + peticion.getDni() + " ya está registrado");
		}
		if (empleadoRepository.existsByCorreo(peticion.getCorreo())
				&& !empleado.getCorreo().equals(peticion.getCorreo())) {
			throw new RecursoDuplicadoException("El correo " + peticion.getCorreo() + " ya está registrado");
		}

		aplicarDatos(empleado, peticion);
		return convertir(empleadoRepository.save(empleado));
	}

	// Baja lógica: el colaborador pasa a INACTIVO sin perder historial
	@Transactional
	public void darDeBaja(Long id) {
		Empleado empleado = buscarEmpleado(id);
		empleado.setEstado(EstadoEmpleado.INACTIVO);
		empleadoRepository.save(empleado);
	}

	private void aplicarDatos(Empleado empleado, EmpleadoRequestDTO peticion) {
		Cargo cargo = cargoRepository.findById(peticion.getIdCargo())
				.orElseThrow(() -> new RecursoNoEncontradoException("El cargo indicado no existe"));

		empleado.setDni(peticion.getDni());
		empleado.setNombres(peticion.getNombres());
		empleado.setApellidos(peticion.getApellidos());
		empleado.setCorreo(peticion.getCorreo());
		empleado.setFechaIngreso(peticion.getFechaIngreso());
		empleado.setEstado(EstadoEmpleado.valueOf(peticion.getEstado()));
		empleado.setCargo(cargo);

		if (peticion.getIdTurno() != null) {
			Turno turno = turnoRepository.findById(peticion.getIdTurno())
					.orElseThrow(() -> new RecursoNoEncontradoException("El turno indicado no existe"));
			empleado.setTurno(turno);
		}
	}

	private Empleado buscarEmpleado(Long id) {
		return empleadoRepository.findById(id)
				.orElseThrow(() -> new RecursoNoEncontradoException("Colaborador no encontrado con id " + id));
	}

	private String normalizar(String buscar) {
		return buscar == null || buscar.isBlank() ? null : buscar.trim();
	}

	private EmpleadoResponseDTO convertir(Empleado empleado) {
		return new EmpleadoResponseDTO(
				empleado.getId(),
				empleado.getDni(),
				empleado.getNombres(),
				empleado.getApellidos(),
				empleado.obtenerNombreCompleto(),
				empleado.getCorreo(),
				empleado.getCargo().getDepartamento().getNombre(),
				empleado.getCargo().getNombre(),
				empleado.getFechaIngreso(),
				empleado.getEstado().name(),
				empleado.getRol().name());
	}
}
