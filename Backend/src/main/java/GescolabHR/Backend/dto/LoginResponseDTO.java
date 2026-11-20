package GescolabHR.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Respuesta del login con el token JWT y los datos de sesión
@Getter
@Setter
@AllArgsConstructor
public class LoginResponseDTO {

	private String token;
	private String tipoToken;
	private String rol;
	private String nombreCompleto;
	private Long idEmpleado;
}
