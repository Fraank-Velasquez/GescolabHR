package GescolabHR.Backend.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// Posición o puesto dentro de un departamento con sueldo y plazas
@Entity
@Table(name = "cargos")
@Getter
@Setter
public class Cargo {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 100)
	private String nombre;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private NivelCargo nivel;

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal sueldoBase;

	@Column(nullable = false)
	private Integer plazasTotales;

	@Column(nullable = false)
	private Integer plazasOcupadas = 0;

	@Column(nullable = false)
	private Boolean estado = true;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "departamento_id", nullable = false)
	private Departamento departamento;
}
