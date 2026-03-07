use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub redmine_url: String,
    pub redmine_api_key: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            redmine_url: "".into(),
            redmine_api_key: "".into(),
        }
    }
}

pub struct AppState {
    pub settings: Mutex<AppSettings>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            settings: Mutex::new(AppSettings::default()),
        }
    }
}
