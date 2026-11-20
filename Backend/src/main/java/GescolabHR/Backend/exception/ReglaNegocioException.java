package GescolabHR.Backend.exception;

// Encapsula las reglas de negocio que impiden completar una operación
public class ReglaNegocioException extends RuntimeException {

	public ReglaNegocioException(String mensaje) {
		super(mensaje);
	}
}
