package GescolabHR.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// KPIs del directorio de colaboradores
@Getter
@Setter
@AllArgsConstructor
public class ResumenEmpleadosDTO {

	private long totalActivos;
	private long totalInactivos;
	private String porcentajeInactivos;
}
