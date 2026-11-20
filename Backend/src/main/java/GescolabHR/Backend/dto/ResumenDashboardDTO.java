package GescolabHR.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Cuatro indicadores principales del panel ejecutivo
@Getter
@Setter
@AllArgsConstructor
public class ResumenDashboardDTO {

	private long totalEmpleadosActivos;
	private long asistenciasHoy;
	private long tardanzasDelDia;
	private long solicitudesPendientes;
}
