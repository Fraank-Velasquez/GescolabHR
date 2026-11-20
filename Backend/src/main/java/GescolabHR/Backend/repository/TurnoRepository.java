package GescolabHR.Backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import GescolabHR.Backend.model.Turno;

public interface TurnoRepository extends JpaRepository<Turno, Long> {

	Optional<Turno> findByNombre(String nombre);
}
