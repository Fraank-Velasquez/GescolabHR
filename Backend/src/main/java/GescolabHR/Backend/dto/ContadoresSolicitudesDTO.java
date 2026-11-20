package GescolabHR.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Contadores de las pestañas de la pantalla de solicitudes
@Getter
@Setter
@AllArgsConstructor
public class ContadoresSolicitudesDTO {

	private long pendientes;
	private long aprobadas;
	private long rechazadas;
	private long historial;
}
