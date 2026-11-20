package GescolabHR.Backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

// Marcación manual registrada por un administrador
@Getter
@Setter
public class MarcacionManualDTO {

	@NotNull(message = "El colaborador es obligatorio")
	private Long idEmpleado;

	@NotNull(message = "La fecha es obligatoria")
	private LocalDate fecha;

	private LocalTime horaEntrada;

	private LocalTime horaSalida;

	private String metodo;
}
