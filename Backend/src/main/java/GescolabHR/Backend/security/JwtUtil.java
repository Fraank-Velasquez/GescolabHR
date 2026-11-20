package GescolabHR.Backend.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

// Genera y valida los tokens JWT firmados con la clave del sistema
@Component
public class JwtUtil {

	@Value("${app.jwt.clave-secreta}")
	private String claveSecreta;

	@Value("${app.jwt.expiracion-ms}")
	private long expiracionMs;

	// Crea un token con el correo, el rol y el id del empleado como claims
	public String generarToken(String correo, String rol, Long idEmpleado) {
		return Jwts.builder()
				.subject(correo)
				.claim("rol", rol)
				.claim("idEmpleado", idEmpleado)
				.issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + expiracionMs))
				.signWith(obtenerLlave())
				.compact();
	}

	// Extrae el correo almacenado en el token ya validado
	public String obtenerCorreoDesdeToken(String token) {
		return obtenerClaims(token).getSubject();
	}

	// Extrae el rol del colaborador para el control de acceso
	public String obtenerRolDesdeToken(String token) {
		return obtenerClaims(token).get("rol", String.class);
	}

	// Extrae el identificador del empleado para filtrar datos propios
	public Long obtenerIdEmpleadoDesdeToken(String token) {
		return obtenerClaims(token).get("idEmpleado", Long.class);
	}

	// Valida firma y vigencia del token
	public boolean esTokenValido(String token) {
		try {
			obtenerClaims(token);
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	private Claims obtenerClaims(String token) {
		return Jwts.parser()
				.verifyWith(obtenerLlave())
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

	private SecretKey obtenerLlave() {
		return Keys.hmacShaKeyFor(claveSecreta.getBytes());
	}
}
