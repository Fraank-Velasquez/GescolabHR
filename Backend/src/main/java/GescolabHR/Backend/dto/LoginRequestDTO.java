package GescolabHR.Backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// Credenciales recibidas desde el formulario de inicio de sesión
@Getter
@Setter
public class LoginRequestDTO {

	@NotBlank(message = "El correo es obligatorio")
	@Email(message = "Debe ingresar un correo válido")
	private String correo;

	@NotBlank(message = "La contraseña es obligatoria")
	private String contrasena;
}
