package GescolabHR.Backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import GescolabHR.Backend.dto.AsistenciaResponseDTO;
import GescolabHR.Backend.dto.DistribucionDepartamentoDTO;
import GescolabHR.Backend.dto.ResumenDashboardDTO;
import GescolabHR.Backend.dto.TendenciaSemanalDTO;
import GescolabHR.Backend.service.DashboardService;

// Reúne los indicadores y gráficos del panel ejecutivo de RR.HH.
@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasRole('ADMIN_RRHH')")
public class DashboardController {

	private final DashboardService dashboardService;

	public DashboardController(DashboardService dashboardService) {
		this.dashboardService = dashboardService;
	}

	@GetMapping("/resumen")
	public ResponseEntity<ResumenDashboardDTO> obtenerResumen() {
		return ResponseEntity.ok(dashboardService.obtenerResumen());
	}

	@GetMapping("/tendencia-semanal")
	public ResponseEntity<List<TendenciaSemanalDTO>> obtenerTendenciaSemanal() {
		return ResponseEntity.ok(dashboardService.obtenerTendenciaSemanal());
	}

	@GetMapping("/distribucion-departamentos")
	public ResponseEntity<List<DistribucionDepartamentoDTO>> obtenerDistribucion() {
		return ResponseEntity.ok(dashboardService.obtenerDistribucionDepartamentos());
	}

	@GetMapping("/ultimas-marcaciones")
	public ResponseEntity<List<AsistenciaResponseDTO>> obtenerUltimasMarcaciones() {
		return ResponseEntity.ok(dashboardService.obtenerUltimasMarcaciones());
	}
}
