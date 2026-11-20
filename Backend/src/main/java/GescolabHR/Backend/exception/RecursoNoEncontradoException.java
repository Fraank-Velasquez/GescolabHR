package GescolabHR.Backend.exception;

// Se lanza cuando un recurso solicitado por su identificador no existe
public class RecursoNoEncontradoException extends RuntimeException {

	public RecursoNoEncontradoException(String mensaje) {
		super(mensaje);
	}
}
