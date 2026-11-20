package GescolabHR.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Departamento con sus contadores para el maestro de la pantalla
@Getter
@Setter
@AllArgsConstructor
public class DepartamentoResponseDTO {

	private Long id;
	private String codigo;
	private String nombre;
	private String descripcion;
	private String responsable;
	private Boolean estado;
	private long totalColaboradores;
	private long totalCargos;
}
