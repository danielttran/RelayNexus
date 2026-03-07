use serde::Serialize;
use tauri::{AppHandle, Emitter};
use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;

#[derive(Clone, Serialize)]
pub struct PendingExecution {
    pub command: String,
}

#[derive(Clone, Serialize)]
pub struct CommandOutput {
    pub text: String,
    pub is_error: bool,
}

#[tauri::command]
pub async fn execute_approved_command(app: AppHandle, command: String) -> Result<String, String> {
    let mut child = if cfg!(target_os = "windows") {
        Command::new("cmd")
            .args(["/C", &command])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to spawn command: {}", e))?
    } else {
        Command::new("sh")
            .arg("-c")
            .arg(&command)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to spawn command: {}", e))?
    };

    let stdout = child.stdout.take().expect("Failed to open stdout");
    let stderr = child.stderr.take().expect("Failed to open stderr");
    
    let app_clone_out = app.clone();
    let _stdout_handler = tokio::spawn(async move {
        let mut reader = BufReader::new(stdout).lines();
        while let Ok(Some(line)) = reader.next_line().await {
            let _ = app_clone_out.emit("command-output", CommandOutput { text: line, is_error: false });
        }
    });

    let app_clone_err = app.clone();
    let _stderr_handler = tokio::spawn(async move {
        let mut reader = BufReader::new(stderr).lines();
        while let Ok(Some(line)) = reader.next_line().await {
            let _ = app_clone_err.emit("command-output", CommandOutput { text: line, is_error: true });
        }
    });

    let status = child.wait().await.map_err(|e| e.to_string())?;

    if status.success() {
        Ok("Execution completed successfully".into())
    } else {
        Err(format!("Command exited with status: {}", status))
    }
}
