package GescolabHR.Backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// Datos de creación o edición de un cargo dentro de un departamento
@Getter
@Setter
public class CargoRequestDTO {

	@NotBlank(message = "El nombre del cargo es obligatorio")
	@Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
	private String nombre;

	@NotBlank(message = "El nivel es obligatorio")
	private String nivel;

	@NotNull(message = "El sueldo base es obligatorio")
	@Positive(message = "El sueldo base debe ser positivo")
	private BigDecimal sueldoBase;

	@NotNull(message = "Las plazas totales son obligatorias")
	@Positive(message = "Las plazas totales deben ser mayores a cero")
	private Integer plazasTotales;

	@PositiveOrZero(message = "Las plazas ocupadas no pueden ser negativas")
	private Integer plazasOcupadas = 0;

	private Boolean estado = true;

	private Long idDepartamento;
}
