use std::collections::HashMap;
// Widget import will be used later

#[derive(Debug, Clone)]
pub struct WidgetMetadata {
    pub name: String,
    pub widget_type: String,
    pub description: String,
    pub min_width: u32,
    pub min_height: u32,
    pub max_width: Option<u32>,
    pub max_height: Option<u32>,
}

#[derive(Debug)]
pub struct WidgetRegistry {
    widgets: HashMap<String, WidgetMetadata>,
}

impl Default for WidgetRegistry {
    fn default() -> Self {
        Self::new()
    }
}

impl WidgetRegistry {
    pub fn new() -> Self {
        Self {
            widgets: HashMap::new(),
        }
    }

    pub fn register(&mut self, metadata: WidgetMetadata) -> Result<(), String> {
        if self.widgets.contains_key(&metadata.name) {
            return Err(format!("Widget '{}' already exists", metadata.name));
        }

        // Validate metadata
        if metadata.min_width == 0 || metadata.min_height == 0 {
            return Err("Minimum dimensions must be greater than 0".to_string());
        }

        self.widgets.insert(metadata.name.clone(), metadata);
        Ok(())
    }

    pub fn get(&self, name: &str) -> Option<&WidgetMetadata> {
        self.widgets.get(name)
    }

    pub fn list(&self) -> Vec<&WidgetMetadata> {
        self.widgets.values().collect()
    }
}