package GescolabHR.Backend.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Vista de un colaborador para el directorio y las tablas
@Getter
@Setter
@AllArgsConstructor
public class EmpleadoResponseDTO {

	private Long id;
	private String dni;
	private String nombres;
	private String apellidos;
	private String nombreCompleto;
	private String correo;
	private String departamento;
	private String cargo;
	private LocalDate fechaIngreso;
	private String estado;
	private String rol;
}
