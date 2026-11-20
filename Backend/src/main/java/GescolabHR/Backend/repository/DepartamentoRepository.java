package GescolabHR.Backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import GescolabHR.Backend.model.Departamento;

public interface DepartamentoRepository extends JpaRepository<Departamento, Long> {

	Optional<Departamento> findByCodigo(String codigo);
	Optional<Departamento> findByNombreIgnoreCase(String nombre);

	// Filtra por nombre o código para el buscador maestro
	@Query("SELECT d FROM Departamento d WHERE (:buscar IS NULL OR LOWER(d.nombre) LIKE LOWER(CONCAT('%', CAST(:buscar AS text), '%')) OR LOWER(d.codigo) LIKE LOWER(CONCAT('%', CAST(:buscar AS text), '%')))")
	List<Departamento> buscar(@Param("buscar") String buscar);
}
