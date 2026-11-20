package GescolabHR.Backend.exception;

// Se lanza al detectar datos únicos duplicados como DNI o correo corporativo
public class RecursoDuplicadoException extends RuntimeException {

	public RecursoDuplicadoException(String mensaje) {
		super(mensaje);
	}
}
