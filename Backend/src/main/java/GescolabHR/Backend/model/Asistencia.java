package GescolabHR.Backend.model;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

// Registro diario de entrada y salida de un colaborador
@Entity
@Table(name = "asistencias", uniqueConstraints = @UniqueConstraint(columnNames = { "empleado_id", "fecha" }))
@Getter
@Setter
public class Asistencia {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "empleado_id", nullable = false)
	private Empleado empleado;

	@Column(nullable = false)
	private LocalDate fecha;

	private LocalTime horaEntrada;

	private LocalTime horaSalida;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private EstadoAsistencia estado;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private MetodoMarcacion metodo = MetodoMarcacion.PORTAL_WEB;

	@Column(columnDefinition = "TEXT")
	private String motivoJustificacion;

	@Column(nullable = false)
	private Boolean auditada = false;

	// Calcula las horas trabajadas entre entrada y salida en formato "8h 04m"
	public String calcularHorasEfectivas() {
		if (horaEntrada == null || horaSalida == null) {
			return "0h 00m";
		}
		Duration duracion = Duration.between(horaEntrada, horaSalida);
		return String.format("%dh %02dm", duracion.toHours(), duracion.toMinutesPart());
	}

	// Devuelve la marca de tiempo combinada para comparar contra el turno
	public LocalDateTime obtenerMomentoEntrada() {
		return LocalDateTime.of(fecha, horaEntrada);
	}
}
