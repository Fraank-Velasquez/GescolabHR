package GescolabHR.Backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// Datos de creación o edición de un departamento
@Getter
@Setter
public class DepartamentoRequestDTO {

	@NotBlank(message = "El código es obligatorio")
	@Size(max = 7, message = "El código no puede superar los 7 caracteres")
	@Pattern(regexp = "^[a-zA-Z0-9]+$", message = "El código solo puede contener letras y números")
	private String codigo;

	@NotBlank(message = "El nombre es obligatorio")
	@Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
	@Pattern(regexp = "^[\\p{L}]+(?: +[\\p{L}]+)*$", message = "El nombre solo puede contener letras y espacios")
	private String nombre;

	@Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
	private String descripcion;

	@Size(max = 100, message = "El responsable no puede superar los 100 caracteres")
	@Pattern(regexp = "^[\\p{L} .()'-]+$", message = "El responsable solo puede contener texto")
	private String responsable;

	private Boolean estado = true;
}
