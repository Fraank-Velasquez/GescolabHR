package GescolabHR.Backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import GescolabHR.Backend.dto.CargoRequestDTO;
import GescolabHR.Backend.dto.CargoResponseDTO;
import GescolabHR.Backend.model.Cargo;
import GescolabHR.Backend.model.Departamento;
import GescolabHR.Backend.model.NivelCargo;
import GescolabHR.Backend.exception.RecursoNoEncontradoException;
import GescolabHR.Backend.exception.RecursoDuplicadoException;
import GescolabHR.Backend.exception.ReglaNegocioException;
import GescolabHR.Backend.repository.CargoRepository;
import GescolabHR.Backend.repository.DepartamentoRepository;
import GescolabHR.Backend.repository.EmpleadoRepository;

// Administra los cargos y valida que las plazas no se superen
@Service
public class CargoService {

	private final CargoRepository cargoRepository;
	private final DepartamentoRepository departamentoRepository;
	private final EmpleadoRepository empleadoRepository;

	public CargoService(CargoRepository cargoRepository,
			DepartamentoRepository departamentoRepository,
			EmpleadoRepository empleadoRepository) {
		this.cargoRepository = cargoRepository;
		this.departamentoRepository = departamentoRepository;
		this.empleadoRepository = empleadoRepository;
	}

	@Transactional(readOnly = true)
	public List<CargoResponseDTO> listarPorDepartamento(Long departamentoId) {
		return cargoRepository.findByDepartamentoIdOrderByNombreAsc(departamentoId).stream()
				.map(this::convertir)
				.toList();
	}

	@Transactional
	public CargoResponseDTO crear(CargoRequestDTO peticion) {
		Departamento departamento = departamentoRepository.findById(peticion.getIdDepartamento())
				.orElseThrow(() -> new RecursoNoEncontradoException("El departamento indicado no existe"));
		validarNombreDuplicado(peticion.getNombre(), departamento.getId(), null);

		Cargo cargo = new Cargo();
		aplicarDatos(cargo, peticion, departamento);
		validarPlazas(cargo);
		return convertir(cargoRepository.save(cargo));
	}

	@Transactional
	public CargoResponseDTO actualizar(Long id, CargoRequestDTO peticion) {
		Cargo cargo = buscarCargo(id);

		if (peticion.getIdDepartamento() != null) {
			Departamento departamento = departamentoRepository.findById(peticion.getIdDepartamento())
					.orElseThrow(() -> new RecursoNoEncontradoException("El departamento indicado no existe"));
			cargo.setDepartamento(departamento);
		}
		validarNombreDuplicado(peticion.getNombre(), cargo.getDepartamento().getId(), id);

		aplicarDatos(cargo, peticion, cargo.getDepartamento());
		validarPlazas(cargo);
		return convertir(cargoRepository.save(cargo));
	}

	// Impide editar un cargo que aún tiene colaboradores asignados
	@Transactional
	public void eliminar(Long id) {
		Cargo cargo = buscarCargo(id);
		if (empleadoRepository.contarActivosPorDepartamento(cargo.getDepartamento().getId()) > 0
				&& cargo.getPlazasOcupadas() > 0) {
			throw new ReglaNegocioException("No se puede eliminar un cargo con plazas ocupadas");
		}
		cargoRepository.deleteById(id);
	}

	private void validarPlazas(Cargo cargo) {
		if (cargo.getPlazasOcupadas() > cargo.getPlazasTotales()) {
			throw new ReglaNegocioException("Las plazas ocupadas no pueden superar las plazas totales");
		}
	}

	private void validarNombreDuplicado(String nombre, Long departamentoId, Long cargoId) {
		cargoRepository.findByDepartamentoIdAndNombreIgnoreCase(departamentoId, nombre.trim())
				.filter(existente -> cargoId == null || !existente.getId().equals(cargoId))
				.ifPresent(existente -> {
					throw new RecursoDuplicadoException("Ya existe un cargo con ese nombre en este departamento");
				});
	}

	private void aplicarDatos(Cargo cargo, CargoRequestDTO peticion, Departamento departamento) {
		cargo.setNombre(peticion.getNombre());
		cargo.setNivel(NivelCargo.valueOf(peticion.getNivel()));
		cargo.setSueldoBase(peticion.getSueldoBase());
		cargo.setPlazasTotales(peticion.getPlazasTotales());
		cargo.setPlazasOcupadas(peticion.getPlazasOcupadas() == null ? 0 : peticion.getPlazasOcupadas());
		cargo.setEstado(peticion.getEstado() == null || peticion.getEstado());
		cargo.setDepartamento(departamento);
	}

	private Cargo buscarCargo(Long id) {
		return cargoRepository.findById(id)
				.orElseThrow(() -> new RecursoNoEncontradoException("Cargo no encontrado con id " + id));
	}

	private CargoResponseDTO convertir(Cargo cargo) {
		return new CargoResponseDTO(
				cargo.getId(),
				cargo.getNombre(),
				cargo.getNivel().name(),
				cargo.getSueldoBase(),
				cargo.getPlazasTotales(),
				cargo.getPlazasOcupadas(),
				cargo.getEstado() ? "ACTIVO" : "INACTIVO",
				cargo.getDepartamento().getId());
	}
}
