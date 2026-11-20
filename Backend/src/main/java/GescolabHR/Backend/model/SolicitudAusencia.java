package GescolabHR.Backend.model;

import java.time.LocalDate;

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
import lombok.Getter;
import lombok.Setter;

// Solicitud de ausencia con tipo, periodo, motivo y flujo de aprobación
@Entity
@Table(name = "solicitudes_ausencia")
@Getter
@Setter
public class SolicitudAusencia {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "empleado_id", nullable = false)
	private Empleado empleado;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private TipoSolicitud tipo;

	@Column(nullable = false)
	private LocalDate fechaInicio;

	@Column(nullable = false)
	private LocalDate fechaFin;

	@Column(nullable = false)
	private Integer dias;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String motivo;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;

	@Column(columnDefinition = "TEXT")
	private String observacionResolucion;
}
