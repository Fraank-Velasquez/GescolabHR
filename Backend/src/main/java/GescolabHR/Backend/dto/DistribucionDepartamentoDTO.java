package GescolabHR.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Distribución de colaboradores por departamento para el panel lateral
@Getter
@Setter
@AllArgsConstructor
public class DistribucionDepartamentoDTO {

	private String nombre;
	private long totalColaboradores;
	private double porcentaje;
}
