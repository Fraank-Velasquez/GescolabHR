package GescolabHR.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// KPIs de asistencia de la vista global del administrador
@Getter
@Setter
@AllArgsConstructor
public class ResumenAsistenciaGlobalDTO {

	private long puntuales;
	private long tardanzas;
	private long ausentes;
	private long tardanzasSinJustificar;
	private double porcentajePuntuales;
}
