package GescolabHR.Backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// Solicitud de vacaciones, permiso o licencia enviada por un colaborador
@Getter
@Setter
public class SolicitudAusenciaRequestDTO {

	@NotNull(message = "El tipo de solicitud es obligatorio")
	private String tipo;

	@NotNull(message = "La fecha de inicio es obligatoria")
	private LocalDate fechaInicio;

	@NotNull(message = "La fecha de fin es obligatoria")
	private LocalDate fechaFin;

	@NotNull(message = "El motivo es obligatorio")
	@Size(min = 5, max = 500, message = "El motivo debe tener entre 5 y 500 caracteres")
	private String motivo;

	private Long idEmpleado;
}
