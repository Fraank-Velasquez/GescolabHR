package GescolabHR.Backend.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import GescolabHR.Backend.dto.DetalleDepartamentoDTO;
import GescolabHR.Backend.dto.DepartamentoRequestDTO;
import GescolabHR.Backend.dto.DepartamentoResponseDTO;
import GescolabHR.Backend.model.Departamento;
import GescolabHR.Backend.exception.RecursoDuplicadoException;
import GescolabHR.Backend.exception.RecursoNoEncontradoException;
import GescolabHR.Backend.exception.ReglaNegocioException;
import GescolabHR.Backend.repository.CargoRepository;
import GescolabHR.Backend.repository.DepartamentoRepository;
import GescolabHR.Backend.repository.EmpleadoRepository;

// Gestiona el maestro-detalle de departamentos y sus métricas
@Service
public class DepartamentoService {

	private final DepartamentoRepository departamentoRepository;
	private final CargoRepository cargoRepository;
	private final EmpleadoRepository empleadoRepository;

	public DepartamentoService(DepartamentoRepository departamentoRepository,
			CargoRepository cargoRepository,
			EmpleadoRepository empleadoRepository) {
		this.departamentoRepository = departamentoRepository;
		this.cargoRepository = cargoRepository;
		this.empleadoRepository = empleadoRepository;
	}

	@Transactional(readOnly = true)
	public List<DepartamentoResponseDTO> listar(String buscar) {
		return departamentoRepository.buscar(normalizar(buscar)).stream()
				.filter(Departamento::getEstado)
				.map(this::convertir)
				.toList();
	}

	@Transactional(readOnly = true)
	public DetalleDepartamentoDTO obtenerDetalle(Long id) {
		Departamento departamento = buscarDepartamento(id);
		BigDecimal masaSalarial = cargoRepository.sumarMasaSalarial(id);
		return new DetalleDepartamentoDTO(
				departamento.getId(),
				departamento.getCodigo(),
				departamento.getNombre(),
				departamento.getDescripcion(),
				departamento.getResponsable(),
				empleadoRepository.contarActivosPorDepartamento(id),
				cargoRepository.contarCargosActivos(id),
				masaSalarial);
	}

	@Transactional
	public DepartamentoResponseDTO crear(DepartamentoRequestDTO peticion) {
		if (departamentoRepository.findByCodigo(peticion.getCodigo()).isPresent()) {
			throw new RecursoDuplicadoException("El código " + peticion.getCodigo() + " ya está registrado");
		}
		if (departamentoRepository.buscar(peticion.getNombre()).stream()
				.anyMatch(d -> d.getNombre().equalsIgnoreCase(peticion.getNombre()))) {
			throw new RecursoDuplicadoException("Ya existe un departamento con ese nombre");
		}

		Departamento departamento = new Departamento();
		aplicarDatos(departamento, peticion);
		return convertir(departamentoRepository.save(departamento));
	}

	@Transactional
	public DepartamentoResponseDTO actualizar(Long id, DepartamentoRequestDTO peticion) {
		Departamento departamento = buscarDepartamento(id);

		departamentoRepository.findByCodigo(peticion.getCodigo())
				.filter(existente -> !existente.getId().equals(id))
				.ifPresent(existente -> {
					throw new RecursoDuplicadoException("El código " + peticion.getCodigo() + " ya está registrado");
				});
		departamentoRepository.findByNombreIgnoreCase(peticion.getNombre().trim())
				.filter(existente -> !existente.getId().equals(id))
				.ifPresent(existente -> {
					throw new RecursoDuplicadoException("Ya existe un departamento con ese nombre");
				});

		aplicarDatos(departamento, peticion);
		return convertir(departamentoRepository.save(departamento));
	}

	@Transactional
	public void eliminar(Long id) {
		Departamento departamento = buscarDepartamento(id);
		departamento.setEstado(false);
		departamentoRepository.save(departamento);
	}

	private void aplicarDatos(Departamento departamento, DepartamentoRequestDTO peticion) {
		departamento.setCodigo(peticion.getCodigo());
		departamento.setNombre(peticion.getNombre());
		departamento.setDescripcion(peticion.getDescripcion());
		departamento.setResponsable(peticion.getResponsable());
		departamento.setEstado(peticion.getEstado() == null || peticion.getEstado());
	}

	private Departamento buscarDepartamento(Long id) {
		return departamentoRepository.findById(id)
				.orElseThrow(() -> new RecursoNoEncontradoException("Departamento no encontrado con id " + id));
	}

	private String normalizar(String buscar) {
		return buscar == null || buscar.isBlank() ? null : buscar.trim();
	}

	private DepartamentoResponseDTO convertir(Departamento departamento) {
		return new DepartamentoResponseDTO(
				departamento.getId(),
				departamento.getCodigo(),
				departamento.getNombre(),
				departamento.getDescripcion(),
				departamento.getResponsable(),
				departamento.getEstado(),
				empleadoRepository.contarActivosPorDepartamento(departamento.getId()),
				cargoRepository.contarCargosActivos(departamento.getId()));
	}
}
