pub mod settings;
pub mod tickets;
pub mod llm;
pub mod execution;

use settings::AppState;
use execution::execute_approved_command;

#[tauri::command]
fn update_settings(state: tauri::State<AppState>, redmine_url: String, redmine_api_key: String) -> Result<(), String> {
    let mut settings = state.settings.lock().map_err(|_| "Failed to lock settings")?;
    settings.redmine_url = redmine_url;
    settings.redmine_api_key = redmine_api_key;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(AppState::new())
    .invoke_handler(tauri::generate_handler![update_settings, execute_approved_command])
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
