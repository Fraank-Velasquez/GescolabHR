package GescolabHR.Backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// Datos de creación o edición de un departamento
@Getter
@Setter
public class DepartamentoRequestDTO {

	@NotBlank(message = "El código es obligatorio")
	@Size(max = 20, message = "El código no puede superar los 20 caracteres")
	private String codigo;

	@NotBlank(message = "El nombre es obligatorio")
	@Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
	private String nombre;

	private String descripcion;

	private String responsable;

	private Boolean estado = true;
}
