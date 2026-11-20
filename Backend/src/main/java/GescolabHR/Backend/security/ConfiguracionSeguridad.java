package GescolabHR.Backend.security;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

// Configura la cadena de seguridad stateless con JWT y CORS para React
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class ConfiguracionSeguridad {

	private final FiltroAutenticacionJwt filtroAutenticacionJwt;
	private final UsuarioDetalladoService usuarioDetalladoService;

	public ConfiguracionSeguridad(FiltroAutenticacionJwt filtroAutenticacionJwt,
			UsuarioDetalladoService usuarioDetalladoService) {
		this.filtroAutenticacionJwt = filtroAutenticacionJwt;
		this.usuarioDetalladoService = usuarioDetalladoService;
	}

	@Bean
	public SecurityFilterChain cadenaFiltrosSeguridad(HttpSecurity http) throws Exception {
		http
				.csrf(AbstractHttpConfigurer::disable)
				.cors(cors -> cors.configurationSource(fuenteConfiguracionCors()))
				.sessionManagement(sesion -> sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/api/autenticacion/**").permitAll()
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.anyRequest().authenticated())
				.authenticationProvider(proveedorAutenticacion())
				.addFilterBefore(filtroAutenticacionJwt, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	// Permite las peticiones del frontend en modo desarrollo
	@Bean
	public CorsConfigurationSource fuenteConfiguracionCors() {
		CorsConfiguration configuracion = new CorsConfiguration();
		configuracion.setAllowedOrigins(List.of("http://localhost:5173"));
		configuracion.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
		configuracion.setAllowedHeaders(List.of("*"));
		configuracion.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource fuente = new UrlBasedCorsConfigurationSource();
		fuente.registerCorsConfiguration("/**", configuracion);
		return fuente;
	}

	@Bean
	public AuthenticationProvider proveedorAutenticacion() {
		DaoAuthenticationProvider proveedor = new DaoAuthenticationProvider(usuarioDetalladoService);
		proveedor.setPasswordEncoder(passwordEncoder());
		return proveedor;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public AuthenticationManager gestorAutenticacion(AuthenticationConfiguration configuracion) throws Exception {
		return configuracion.getAuthenticationManager();
	}
}
