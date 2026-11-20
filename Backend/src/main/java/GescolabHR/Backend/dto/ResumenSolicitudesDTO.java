package GescolabHR.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Tarjetas métricas de la pantalla de vacaciones y permisos
@Getter
@Setter
@AllArgsConstructor
public class ResumenSolicitudesDTO {

	private long pendientes;
	private long fueraHoy;
}
