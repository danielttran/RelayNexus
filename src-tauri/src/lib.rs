pub mod settings;
pub mod tickets;
pub mod llm;
pub mod execution;

use settings::{AppState, AppSettings, save_config_file, get_config_path};
use execution::execute_approved_command;

#[tauri::command]
fn get_config_path_str() -> String {
    get_config_path().to_string_lossy().to_string()
}

#[tauri::command]
fn load_settings(state: tauri::State<AppState>) -> Result<AppSettings, String> {
    let settings = state.settings.lock().map_err(|_| "Failed to lock settings")?;
    Ok(settings.clone())
}

#[tauri::command]
fn save_settings(
    state: tauri::State<AppState>, 
    provider_id: String, 
    redmine_url: String, 
    redmine_api_key: String
) -> Result<(), String> {
    let mut settings = state.settings.lock().map_err(|_| "Failed to lock settings")?;
    settings.provider_id = provider_id;
    settings.redmine_url = redmine_url;
    settings.redmine_api_key = redmine_api_key;
    
    // Persist to disk
    save_config_file(&settings)?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(AppState::new())
    .invoke_handler(tauri::generate_handler![
        load_settings, 
        save_settings, 
        execute_approved_command,
        get_config_path_str
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
