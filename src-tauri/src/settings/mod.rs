use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::path::PathBuf;
use std::fs;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub provider_id: String,
    pub redmine_url: String, // Kept for compatibility, though currently URL isn't explicitly in the UI snippet, maybe assumed or hardcoded
    pub redmine_api_key: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            provider_id: "easy-redmine".into(),
            redmine_url: "https://your-redmine.com".into(),
            redmine_api_key: "".into(),
        }
    }
}

pub struct AppState {
    pub settings: Mutex<AppSettings>,
}

impl AppState {
    pub fn new() -> Self {
        let initial_settings = load_config_file().unwrap_or_default();
        Self {
            settings: Mutex::new(initial_settings),
        }
    }
}

pub fn get_config_path() -> PathBuf {
    let appdata = std::env::var("APPDATA").unwrap_or_else(|_| ".".into());
    let mut path = PathBuf::from(appdata);
    path.push("RelayNexus");
    path.push("config.json");
    path
}

pub fn load_config_file() -> Result<AppSettings, String> {
    let path = get_config_path();
    if !path.exists() {
        return Ok(AppSettings::default());
    }
    
    let contents = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read config file: {}", e))?;
    
    let settings: AppSettings = serde_json::from_str(&contents)
        .map_err(|e| format!("Failed to parse config file: {}", e))?;
        
    Ok(settings)
}

pub fn save_config_file(settings: &AppSettings) -> Result<(), String> {
    let path = get_config_path();
    
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create config directory: {}", e))?;
    }
    
    let json = serde_json::to_string_pretty(settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
        
    fs::write(&path, json)
        .map_err(|e| format!("Failed to write config file: {}", e))?;
        
    Ok(())
}
