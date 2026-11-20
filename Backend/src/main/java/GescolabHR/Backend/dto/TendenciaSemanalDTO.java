package GescolabHR.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Punto del gráfico de tendencia semanal de asistencia
@Getter
@Setter
@AllArgsConstructor
public class TendenciaSemanalDTO {

	private String dia;
	private long puntuales;
	private long incidencias;
}
