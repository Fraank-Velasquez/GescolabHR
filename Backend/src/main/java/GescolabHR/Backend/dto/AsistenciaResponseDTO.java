package GescolabHR.Backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Registro de asistencia con los datos visibles en las tablas
@Getter
@Setter
@AllArgsConstructor
public class AsistenciaResponseDTO {

	private Long id;
	private Long idEmpleado;
	private String nombreColaborador;
	private String cargo;
	private String dni;
	private String departamento;
	private LocalDate fecha;
	private LocalTime horaEntrada;
	private LocalTime horaSalida;
	private String horasEfectivas;
	private String metodo;
	private String estado;
	private String motivoJustificacion;
	private Boolean auditada;
}
