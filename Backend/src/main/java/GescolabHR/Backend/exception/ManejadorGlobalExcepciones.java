package GescolabHR.Backend.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.dao.DataIntegrityViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// Centraliza la respuesta de errores en español para todo el backend
@RestControllerAdvice
public class ManejadorGlobalExcepciones {
	private static final Logger LOGGER = LoggerFactory.getLogger(ManejadorGlobalExcepciones.class);

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, Object>> manejarValidacion(MethodArgumentNotValidException excepcion) {
		Map<String, String> errores = new LinkedHashMap<>();
		for (FieldError error : excepcion.getBindingResult().getFieldErrors()) {
			errores.putIfAbsent(error.getField(), error.getDefaultMessage());
		}
		return construir(HttpStatus.BAD_REQUEST, "Datos inválidos en la solicitud", errores);
	}

	@ExceptionHandler(RecursoDuplicadoException.class)
	public ResponseEntity<Map<String, Object>> manejarDuplicado(RecursoDuplicadoException excepcion) {
		return construir(HttpStatus.CONFLICT, excepcion.getMessage(), Map.of());
	}

	@ExceptionHandler(RecursoNoEncontradoException.class)
	public ResponseEntity<Map<String, Object>> manejarNoEncontrado(RecursoNoEncontradoException excepcion) {
		return construir(HttpStatus.NOT_FOUND, excepcion.getMessage(), Map.of());
	}

	@ExceptionHandler(ReglaNegocioException.class)
	public ResponseEntity<Map<String, Object>> manejarReglaNegocio(ReglaNegocioException excepcion) {
		return construir(HttpStatus.BAD_REQUEST, excepcion.getMessage(), Map.of());
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<Map<String, Object>> manejarIntegridad(DataIntegrityViolationException excepcion) {
		return construir(HttpStatus.CONFLICT,
				"No se puede eliminar el departamento porque todavía tiene registros vinculados",
				Map.of());
	}

	@ExceptionHandler(BadCredentialsException.class)
	public ResponseEntity<Map<String, Object>> manejarCredenciales(BadCredentialsException excepcion) {
		return construir(HttpStatus.UNAUTHORIZED, excepcion.getMessage(), Map.of());
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<Map<String, Object>> manejarAccesoDenegado(AccessDeniedException excepcion) {
		return construir(HttpStatus.FORBIDDEN, "No tiene permisos para realizar esta operación", Map.of());
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, Object>> manejarErrorGeneral(Exception excepcion) {
		LOGGER.error("Error no controlado procesando la solicitud", excepcion);
		return construir(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor", Map.of());
	}

	private ResponseEntity<Map<String, Object>> construir(HttpStatus estado, String mensaje, Map<String, String> errores) {
		Map<String, Object> cuerpo = new LinkedHashMap<>();
		cuerpo.put("timestamp", LocalDateTime.now().toString());
		cuerpo.put("estado", estado.value());
		cuerpo.put("mensaje", mensaje);
		cuerpo.put("errores", errores);
		return ResponseEntity.status(estado).body(cuerpo);
	}
}
