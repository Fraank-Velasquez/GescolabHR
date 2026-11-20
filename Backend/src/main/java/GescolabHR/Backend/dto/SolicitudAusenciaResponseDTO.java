package GescolabHR.Backend.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Solicitud con los datos de la tabla de vacaciones y permisos
@Getter
@Setter
@AllArgsConstructor
public class SolicitudAusenciaResponseDTO {

	private Long id;
	private Long idEmpleado;
	private String nombreColaborador;
	private String cargo;
	private String departamento;
	private String tipo;
	private LocalDate fechaInicio;
	private LocalDate fechaFin;
	private String periodo;
	private Integer dias;
	private String motivo;
	private String estado;
	private String observacionResolucion;
}
