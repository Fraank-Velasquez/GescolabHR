package GescolabHR.Backend.security;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import GescolabHR.Backend.model.Empleado;
import GescolabHR.Backend.repository.EmpleadoRepository;

// Carga el usuario corporativo desde la base de datos para autenticarlo
@Service
public class UsuarioDetalladoService implements UserDetailsService {

	private final EmpleadoRepository empleadoRepository;

	public UsuarioDetalladoService(EmpleadoRepository empleadoRepository) {
		this.empleadoRepository = empleadoRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
		Empleado empleado = empleadoRepository.findByCorreo(correo)
				.orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + correo));

		return User.builder()
				.username(empleado.getCorreo())
				.password(empleado.getContrasena())
				.authorities(List.of(new SimpleGrantedAuthority(empleado.getRol().name())))
				.build();
	}
}
