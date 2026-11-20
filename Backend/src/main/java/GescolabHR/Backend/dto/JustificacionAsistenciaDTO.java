package GescolabHR.Backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// Justificación aplicada a una marcación con tardanza o falta
@Getter
@Setter
public class JustificacionAsistenciaDTO {

	@NotBlank(message = "El motivo es obligatorio")
	@Size(min = 5, max = 500, message = "El motivo debe tener entre 5 y 500 caracteres")
	private String motivo;
}
