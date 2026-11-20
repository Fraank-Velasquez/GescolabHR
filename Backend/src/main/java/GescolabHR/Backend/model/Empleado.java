package GescolabHR.Backend.model;

import java.time.LocalDate;

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

// Colaborador con identidad, credenciales de acceso y asignación de cargo
@Entity
@Table(name = "empleados")
@Getter
@Setter
public class Empleado {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 8)
	private String dni;

	@Column(nullable = false, length = 80)
	private String nombres;

	@Column(nullable = false, length = 80)
	private String apellidos;

	@Column(nullable = false, unique = true, length = 120)
	private String correo;

	@Column(name = "contrasena", nullable = false)
	private String contrasena;

	@Column(nullable = false)
	private LocalDate fechaIngreso;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private EstadoEmpleado estado = EstadoEmpleado.ACTIVO;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private RolUsuario rol = RolUsuario.ROLE_EMPLEADO;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "cargo_id", nullable = false)
	private Cargo cargo;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "turno_id")
	private Turno turno;

	// Nombre completo calculado para listados y respuestas
	public String obtenerNombreCompleto() {
		return nombres + " " + apellidos;
	}
}
