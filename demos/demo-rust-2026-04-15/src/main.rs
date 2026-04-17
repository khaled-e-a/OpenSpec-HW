use eframe::egui;
use dashboard_grid::grid::{GridPosition, GridSize, GridRenderer};

fn main() -> eframe::Result {
    let options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_inner_size([800.0, 600.0])
            .with_title("Dashboard Grid Demo"),
        ..Default::default()
    };

    eframe::run_native(
        "Dashboard Grid Demo",
        options,
        Box::new(|_cc| Ok(Box::new(DashboardApp::new()))),
    )
}

struct DashboardApp {
    grid_renderer: GridRenderer,
    mouse_pos: egui::Pos2,
    show_grid: bool,
}

impl DashboardApp {
    fn new() -> Self {
        Self {
            grid_renderer: GridRenderer::new(50.0, 12, 8),
            mouse_pos: egui::Pos2::default(),
            show_grid: true,
        }
    }
}

impl eframe::App for DashboardApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        egui::CentralPanel::default().show(ctx, |ui| {
            // Title
            ui.heading("Dashboard Grid System Demo");
            ui.separator();

            // Controls
            ui.horizontal(|ui| {
                ui.checkbox(&mut self.show_grid, "Show Grid");
                if ui.button("Reset View").clicked() {
                    self.mouse_pos = egui::Pos2::default();
                }
            });
            ui.separator();

            // Get mouse position
            if let Some(pointer) = ui.ctx().pointer_latest_pos() {
                self.mouse_pos = pointer;
            }

            // Grid area
            let available_rect = ui.available_rect_before_wrap();
            let (response, painter) = ui.allocate_painter(available_rect.size(), egui::Sense::hover());

            // Draw background
            painter.rect_filled(response.rect, 0.0, egui::Color32::from_gray(240));

            // Draw grid
            if self.show_grid {
                self.grid_renderer.render(&painter, response.rect);
            }

            // Show mouse position and snapped position
            ui.separator();
            ui.label(format!("Mouse Position: ({:.1}, {:.1})", self.mouse_pos.x, self.mouse_pos.y));

            let snapped = self.grid_renderer.snap_to_grid(self.mouse_pos);
            ui.label(format!("Snapped Position: Row {}, Column {}", snapped.row, snapped.column));

            let cell_rect = self.grid_renderer.cell_rect(snapped);
            ui.label(format!("Cell Rectangle: Top-Left ({:.1}, {:.1})", cell_rect.left(), cell_rect.top()));

            // Highlight current cell
            if response.hovered() {
                painter.rect_filled(cell_rect, 0.0, egui::Color32::from_rgba_premultiplied(0, 100, 255, 50));
                painter.rect_stroke(cell_rect, 0.0, egui::Stroke::new(2.0, egui::Color32::BLUE), egui::StrokeKind::Inside);
            }

            // Instructions
            ui.separator();
            ui.label("Move your mouse over the grid to see snapping in action!");
            ui.label("The blue highlight shows which grid cell your mouse is in.");
        });
    }
}