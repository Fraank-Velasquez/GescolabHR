package GescolabHR.Backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import GescolabHR.Backend.model.Empleado;
import GescolabHR.Backend.model.EstadoEmpleado;

public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {

	Optional<Empleado> findByDni(String dni);

	Optional<Empleado> findByCorreo(String correo);

	boolean existsByDni(String dni);

	boolean existsByCorreo(String correo);

	// Directorio con búsqueda por texto y filtros de departamento y estado
	@Query("""
			SELECT e FROM Empleado e
			LEFT JOIN e.cargo c
			LEFT JOIN c.departamento d
			WHERE (:buscar IS NULL
				OR LOWER(e.dni) LIKE LOWER(CONCAT('%', CAST(:buscar AS text), '%'))
				OR LOWER(e.nombres) LIKE LOWER(CONCAT('%', CAST(:buscar AS text), '%'))
				OR LOWER(e.apellidos) LIKE LOWER(CONCAT('%', CAST(:buscar AS text), '%'))
				OR LOWER(e.correo) LIKE LOWER(CONCAT('%', CAST(:buscar AS text), '%')))
			AND (:departamentoId IS NULL OR d.id = :departamentoId)
			AND (:estado IS NULL OR e.estado = :estado)
			""")
	Page<Empleado> buscar(@Param("buscar") String buscar,
			@Param("departamentoId") Long departamentoId,
			@Param("estado") EstadoEmpleado estado,
			Pageable pageable);

	@Query("SELECT COUNT(e) FROM Empleado e WHERE e.estado = :estado")
	long contarPorEstado(@Param("estado") EstadoEmpleado estado);

	// Colaboradores activos de un departamento para las métricas maestro-detalle
	@Query("SELECT COUNT(e) FROM Empleado e WHERE e.cargo.departamento.id = :departamentoId AND e.estado = GescolabHR.Backend.model.EstadoEmpleado.ACTIVO")
	long contarActivosPorDepartamento(@Param("departamentoId") Long departamentoId);

	boolean existsByCargoDepartamentoId(Long departamentoId);

	List<Empleado> findByEstado(EstadoEmpleado estado);
}
