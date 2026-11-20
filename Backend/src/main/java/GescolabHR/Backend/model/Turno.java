package GescolabHR.Backend.model;

import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// Horario laboral definido que usan los colaboradores para marcar asistencia
@Entity
@Table(name = "turnos")
@Getter
@Setter
public class Turno {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 50)
	private String nombre;

	@Column(nullable = false)
	private LocalTime horaEntrada;

	@Column(nullable = false)
	private LocalTime horaSalida;

	private LocalTime horaRefrigerio;

	@Column(length = 30)
	private String modalidad = "Presencial";
}
