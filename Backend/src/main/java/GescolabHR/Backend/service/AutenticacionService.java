package GescolabHR.Backend.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

import GescolabHR.Backend.dto.LoginRequestDTO;
import GescolabHR.Backend.dto.LoginResponseDTO;
import GescolabHR.Backend.model.Empleado;
import GescolabHR.Backend.repository.EmpleadoRepository;
import GescolabHR.Backend.security.JwtUtil;

// Autentica al colaborador y emite el token JWT de sesión
@Service
public class AutenticacionService {

	private static final String TIPO_TOKEN = "Bearer";

	private final AuthenticationManager gestorAutenticacion;
	private final JwtUtil jwtUtil;
	private final EmpleadoRepository empleadoRepository;

	public AutenticacionService(AuthenticationManager gestorAutenticacion,
			JwtUtil jwtUtil,
			EmpleadoRepository empleadoRepository) {
		this.gestorAutenticacion = gestorAutenticacion;
		this.jwtUtil = jwtUtil;
		this.empleadoRepository = empleadoRepository;
	}

	// Valida credenciales y devuelve el token con rol e id del empleado
	public LoginResponseDTO iniciarSesion(LoginRequestDTO peticion) {
		Authentication autenticacion;
		try {
			autenticacion = gestorAutenticacion.authenticate(
					new UsernamePasswordAuthenticationToken(peticion.getCorreo(), peticion.getContrasena()));
		} catch (AuthenticationException e) {
			throw new org.springframework.security.authentication.BadCredentialsException(
					"Correo o contraseña incorrectos");
		}

		Empleado empleado = empleadoRepository.findByCorreo(peticion.getCorreo())
				.orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException(
						"Correo o contraseña incorrectos"));

		String token = jwtUtil.generarToken(empleado.getCorreo(), empleado.getRol().name(), empleado.getId());

		return new LoginResponseDTO(token, TIPO_TOKEN, empleado.getRol().name(),
				empleado.obtenerNombreCompleto(), empleado.getId());
	}
}
