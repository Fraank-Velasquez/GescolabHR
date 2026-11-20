package GescolabHR.Backend.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Fila de la tabla de cargos en el detalle del departamento
@Getter
@Setter
@AllArgsConstructor
public class CargoResponseDTO {

	private Long id;
	private String nombre;
	private String nivel;
	private BigDecimal sueldoBase;
	private Integer plazasTotales;
	private Integer plazasOcupadas;
	private String estado;
	private Long idDepartamento;
}
