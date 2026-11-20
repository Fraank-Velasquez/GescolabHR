package GescolabHR.Backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// Datos de entrada para registrar o actualizar un colaborador
@Getter
@Setter
public class EmpleadoRequestDTO {

	@NotBlank(message = "El DNI es obligatorio")
	@Pattern(regexp = "\\d{8}", message = "El DNI debe tener exactamente 8 dígitos numéricos")
	private String dni;

	@NotBlank(message = "Los nombres son obligatorios")
	@Size(min = 2, max = 80, message = "Los nombres deben tener entre 2 y 80 caracteres")
	private String nombres;

	@NotBlank(message = "Los apellidos son obligatorios")
	@Size(min = 2, max = 80, message = "Los apellidos deben tener entre 2 y 80 caracteres")
	private String apellidos;

	@NotBlank(message = "El correo es obligatorio")
	@Email(message = "Debe ingresar un correo válido")
	@Size(max = 120, message = "El correo no puede superar los 120 caracteres")
	private String correo;

	@NotNull(message = "El cargo es obligatorio")
	private Long idCargo;

	private Long idTurno;

	@NotNull(message = "La fecha de ingreso es obligatoria")
	private LocalDate fechaIngreso;

	@NotNull(message = "El estado es obligatorio")
	private String estado;
}
