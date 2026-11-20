package GescolabHR.Backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// Unidad organizativa principal con código único y responsable asignado
@Entity
@Table(name = "departamentos")
@Getter
@Setter
public class Departamento {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 7)
	private String codigo;

	@Column(nullable = false, length = 100)
	private String nombre;

	@Column(columnDefinition = "TEXT")
	private String descripcion;

	@Column(length = 100)
	private String responsable;

	@Column(nullable = false)
	private Boolean estado = true;
}
