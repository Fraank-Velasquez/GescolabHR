package GescolabHR.Backend.dto;

import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Horario del turno del colaborador mostrado en la tarjeta de marcación
@Getter
@Setter
@AllArgsConstructor
public class JornadaActualDTO {

	private String nombreTurno;
	private LocalTime horaEntrada;
	private LocalTime horaSalida;
	private LocalTime horaRefrigerio;
	private String modalidad;
	private String estadoMarcacion;
	private LocalTime horaMarcada;
	private String progreso;
	private double porcentajeProgreso;
	private String horasAcumuladasHoy;
}
