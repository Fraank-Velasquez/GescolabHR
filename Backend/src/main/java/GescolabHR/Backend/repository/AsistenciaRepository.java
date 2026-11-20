package GescolabHR.Backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import GescolabHR.Backend.model.Asistencia;
import GescolabHR.Backend.model.Empleado;
import GescolabHR.Backend.model.EstadoAsistencia;
import GescolabHR.Backend.model.EstadoEmpleado;

public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {

	Optional<Asistencia> findByEmpleadoIdAndFecha(Long empleadoId, LocalDate fecha);

	boolean existsByEmpleadoIdAndFecha(Long empleadoId, LocalDate fecha);

	// Marcaciones del día con filtros opcionales para la vista global
	@Query("""
			SELECT a FROM Asistencia a
			LEFT JOIN a.empleado e
			LEFT JOIN e.cargo c
			LEFT JOIN c.departamento d
			WHERE (:fecha IS NULL OR a.fecha = :fecha)
			AND (:fechaDesde IS NULL OR a.fecha >= :fechaDesde)
			AND (:fechaHasta IS NULL OR a.fecha <= :fechaHasta)
			AND (:departamentoId IS NULL OR d.id = :departamentoId)
			AND (:estado IS NULL OR a.estado = :estado)
			AND (:buscar IS NULL
				OR LOWER(e.nombres) LIKE LOWER(CONCAT('%', CAST(:buscar AS text), '%'))
				OR LOWER(e.apellidos) LIKE LOWER(CONCAT('%', CAST(:buscar AS text), '%'))
				OR LOWER(e.dni) LIKE LOWER(CONCAT('%', CAST(:buscar AS text), '%')))
			ORDER BY a.fecha DESC, a.horaEntrada DESC
			""")
	Page<Asistencia> buscar(@Param("fecha") LocalDate fecha,
			@Param("fechaDesde") LocalDate fechaDesde,
			@Param("fechaHasta") LocalDate fechaHasta,
			@Param("departamentoId") Long departamentoId,
			@Param("estado") EstadoAsistencia estado,
			@Param("buscar") String buscar,
			Pageable pageable);

	@Query("""
			SELECT a FROM Asistencia a
			LEFT JOIN a.empleado e
			LEFT JOIN e.cargo c
			LEFT JOIN c.departamento d
			WHERE a.fecha = :fecha
			AND (:departamentoId IS NULL OR d.id = :departamentoId)
			AND (:estado IS NULL OR a.estado = :estado)
			AND (:buscar IS NULL
				OR LOWER(e.nombres) LIKE LOWER(CONCAT('%', CAST(:buscar AS text), '%'))
				OR LOWER(e.apellidos) LIKE LOWER(CONCAT('%', CAST(:buscar AS text), '%'))
				OR LOWER(e.dni) LIKE LOWER(CONCAT('%', CAST(:buscar AS text), '%')))
			ORDER BY a.fecha DESC, a.horaEntrada DESC
			""")
	Page<Asistencia> buscarPorFecha(@Param("fecha") LocalDate fecha,
			@Param("departamentoId") Long departamentoId,
			@Param("estado") EstadoAsistencia estado,
			@Param("buscar") String buscar,
			Pageable pageable);

	@Query("""
			SELECT a FROM Asistencia a
			LEFT JOIN a.empleado e
			LEFT JOIN e.cargo c
			LEFT JOIN c.departamento d
			WHERE a.fecha >= :fechaDesde
			AND a.fecha <= :fechaHasta
			AND (:departamentoId IS NULL OR d.id = :departamentoId)
			AND (:estado IS NULL OR a.estado = :estado)
			AND (:buscar IS NULL
				OR LOWER(e.nombres) LIKE LOWER(CONCAT('%', CAST(:buscar AS text), '%'))
				OR LOWER(e.apellidos) LIKE LOWER(CONCAT('%', CAST(:buscar AS text), '%'))
				OR LOWER(e.dni) LIKE LOWER(CONCAT('%', CAST(:buscar AS text), '%')))
			ORDER BY a.fecha DESC, a.horaEntrada DESC
			""")
	Page<Asistencia> buscarPorRango(@Param("fechaDesde") LocalDate fechaDesde,
			@Param("fechaHasta") LocalDate fechaHasta,
			@Param("departamentoId") Long departamentoId,
			@Param("estado") EstadoAsistencia estado,
			@Param("buscar") String buscar,
			Pageable pageable);

	// Marcaciones propias del colaborador filtradas por mes y estado
	@Query("""
			SELECT a FROM Asistencia a
			WHERE a.empleado.id = :empleadoId
			AND (:anio IS NULL OR YEAR(a.fecha) = :anio)
			AND (:mes IS NULL OR MONTH(a.fecha) = :mes)
			AND (:estado IS NULL OR a.estado = :estado)
			ORDER BY a.fecha DESC
			""")
	List<Asistencia> buscarPorEmpleado(@Param("empleadoId") Long empleadoId,
			@Param("anio") Integer anio,
			@Param("mes") Integer mes,
			@Param("estado") EstadoAsistencia estado);

	@Query("SELECT COUNT(a) FROM Asistencia a WHERE a.fecha = :fecha AND a.estado = :estado")
	long contarPorFechaYEstado(@Param("fecha") LocalDate fecha, @Param("estado") EstadoAsistencia estado);

	@Query("SELECT COUNT(a) FROM Asistencia a WHERE a.fecha = :fecha")
	long contarPorFecha(@Param("fecha") LocalDate fecha);

	// Activos que no tienen marcación en la fecha indicada
	@Query("SELECT e FROM Empleado e WHERE e.estado = :estado AND NOT EXISTS (SELECT a FROM Asistencia a WHERE a.empleado = e AND a.fecha = :fecha)")
	List<Empleado> buscarAusentes(@Param("fecha") LocalDate fecha, @Param("estado") EstadoEmpleado estado);

	// Total de marcaciones PUNTUAL de una semana para el gráfico del dashboard
	@Query("SELECT COUNT(a) FROM Asistencia a WHERE a.fecha BETWEEN :desde AND :hasta AND a.estado = :estado")
	long contarEntreFechas(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta, @Param("estado") EstadoAsistencia estado);

	// Marcaciones recientes para la tabla del panel ejecutivo
	@Query("SELECT a FROM Asistencia a JOIN FETCH a.empleado e ORDER BY a.fecha DESC, a.horaEntrada DESC")
	List<Asistencia> buscarRecientes(Pageable pageable);

	@Query("SELECT a FROM Asistencia a JOIN FETCH a.empleado e WHERE a.fecha = :fecha ORDER BY a.horaEntrada DESC")
	List<Asistencia> buscarRecientesPorFecha(@Param("fecha") LocalDate fecha, Pageable pageable);
}
