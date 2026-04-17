use crate::widgets::Widget;
use std::fmt;

pub struct DashboardState {
    widgets: Vec<Box<dyn Widget>>,
    grid_columns: u32,
    grid_rows: u32,
    change_listeners: Vec<Box<dyn Fn(&DashboardState) + Send + Sync>>,
}

impl fmt::Debug for DashboardState {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("DashboardState")
            .field("widgets", &format!("{} widgets", self.widgets.len()))
            .field("grid_columns", &self.grid_columns)
            .field("grid_rows", &self.grid_rows)
            .field("change_listeners", &format!("{} listeners", self.change_listeners.len()))
            .finish()
    }
}

impl DashboardState {
    pub fn new(columns: u32, rows: u32) -> Self {
        Self {
            widgets: Vec::new(),
            grid_columns: columns,
            grid_rows: rows,
            change_listeners: Vec::new(),
        }
    }

    pub fn add_widget(&mut self, widget: Box<dyn Widget>) {
        self.widgets.push(widget);
        self.notify_change();
    }

    pub fn remove_widget(&mut self, id: &str) -> Option<Box<dyn Widget>> {
        if let Some(pos) = self.widgets.iter().position(|w| w.id() == id) {
            let widget = self.widgets.remove(pos);
            self.notify_change();
            Some(widget)
        } else {
            None
        }
    }

    pub fn get_widget(&self, id: &str) -> Option<&dyn Widget> {
        self.widgets.iter().find(|w| w.id() == id).map(|w| w.as_ref())
    }

    pub fn get_widget_mut(&mut self, id: &str) -> Option<&mut (dyn Widget + '_)> {
        for widget in &mut self.widgets {
            if widget.id() == id {
                return Some(widget.as_mut());
            }
        }
        None
    }

    pub fn widgets(&self) -> &[Box<dyn Widget>] {
        &self.widgets
    }

    pub fn grid_size(&self) -> (u32, u32) {
        (self.grid_columns, self.grid_rows)
    }

    pub fn on_change<F>(&mut self, listener: F)
    where
        F: Fn(&DashboardState) + Send + Sync + 'static,
    {
        self.change_listeners.push(Box::new(listener));
    }

    fn notify_change(&self) {
        for listener in &self.change_listeners {
            listener(self);
        }
    }
}