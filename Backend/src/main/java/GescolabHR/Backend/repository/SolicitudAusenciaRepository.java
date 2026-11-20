package GescolabHR.Backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import GescolabHR.Backend.model.EstadoSolicitud;
import GescolabHR.Backend.model.SolicitudAusencia;
import GescolabHR.Backend.model.TipoSolicitud;

public interface SolicitudAusenciaRepository extends JpaRepository<SolicitudAusencia, Long> {

	// Solicitudes con filtros de estado, tipo, departamento y búsqueda
	@Query("""
			SELECT s FROM SolicitudAusencia s
			LEFT JOIN s.empleado e
			LEFT JOIN e.cargo c
			LEFT JOIN c.departamento d
			WHERE (:estado IS NULL OR s.estado = :estado)
			AND (:tipo IS NULL OR s.tipo = :tipo)
			AND (:departamentoId IS NULL OR d.id = :departamentoId)
			AND (:buscar IS NULL
				OR LOWER(e.nombres) LIKE LOWER(CONCAT('%', CAST(:buscar AS text), '%'))
				OR LOWER(e.apellidos) LIKE LOWER(CONCAT('%', CAST(:buscar AS text), '%')))
			ORDER BY s.fechaInicio DESC
			""")
	Page<SolicitudAusencia> buscar(@Param("estado") EstadoSolicitud estado,
			@Param("tipo") TipoSolicitud tipo,
			@Param("departamentoId") Long departamentoId,
			@Param("buscar") String buscar,
			Pageable pageable);

	// Contadores de cada pestaña de la pantalla de vacaciones
	@Query("SELECT COUNT(s) FROM SolicitudAusencia s WHERE s.estado = :estado")
	long contarPorEstado(@Param("estado") EstadoSolicitud estado);

	@Query("SELECT COUNT(s) FROM SolicitudAusencia s")
	long contarTodas();

	// Colaboradores con ausencia aprobada que incluye la fecha de hoy
	@Query("SELECT COUNT(DISTINCT s.empleado) FROM SolicitudAusencia s WHERE s.estado = GescolabHR.Backend.model.EstadoSolicitud.APROBADA AND :hoy BETWEEN s.fechaInicio AND s.fechaFin")
	long contarFueraHoy(@Param("hoy") LocalDate hoy);

	@Query("SELECT COALESCE(SUM(s.dias), 0) FROM SolicitudAusencia s WHERE s.estado = GescolabHR.Backend.model.EstadoSolicitud.APROBADA AND YEAR(s.fechaInicio) = :anio AND MONTH(s.fechaInicio) = :mes")
	int sumarDiasAprobadosMes(@Param("anio") Integer anio, @Param("mes") Integer mes);

	List<SolicitudAusencia> findByEmpleadoIdOrderByFechaInicioDesc(Long empleadoId);

	long deleteByMotivoStartingWith(String motivo);
}
