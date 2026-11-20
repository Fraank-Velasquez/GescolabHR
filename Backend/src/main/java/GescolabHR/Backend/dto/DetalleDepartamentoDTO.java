package GescolabHR.Backend.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Métricas del panel de detalle de un departamento
@Getter
@Setter
@AllArgsConstructor
public class DetalleDepartamentoDTO {

	private Long id;
	private String codigo;
	private String nombre;
	private String descripcion;
	private String responsable;
	private long totalColaboradores;
	private long totalCargos;
	private BigDecimal masaSalarial;
}
