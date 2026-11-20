package GescolabHR.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// KPIs personales de asistencia del colaborador en el periodo actual
@Getter
@Setter
@AllArgsConstructor
public class ResumenAsistenciaEmpleadoDTO {

	private long diasAsistidos;
	private double porcentajeDias;
	private String horasAcumuladas;
	private double porcentajePuntualidad;
	private long tardanzas;
}
