package GescolabHR.Backend.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import GescolabHR.Backend.model.Cargo;

public interface CargoRepository extends JpaRepository<Cargo, Long> {

	List<Cargo> findByDepartamentoIdOrderByNombreAsc(Long departamentoId);
	Optional<Cargo> findByDepartamentoIdAndNombreIgnoreCase(Long departamentoId, String nombre);

	// Suma de sueldos de los cargos activos de un departamento
	@Query("SELECT COALESCE(SUM(c.sueldoBase * c.plazasOcupadas), 0) FROM Cargo c WHERE c.departamento.id = :departamentoId AND c.estado = true")
	BigDecimal sumarMasaSalarial(@Param("departamentoId") Long departamentoId);

	@Query("SELECT COUNT(c) FROM Cargo c WHERE c.departamento.id = :departamentoId AND c.estado = true")
	long contarCargosActivos(@Param("departamentoId") Long departamentoId);
}
