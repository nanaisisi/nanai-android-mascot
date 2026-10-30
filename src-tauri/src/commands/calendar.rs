//! SSP Calendar & Schedule Manager specification implementation (ukadoc-ssp/functions/calendar)
//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md], [\![open,calendar]], [\![execute,schedule-add]]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{Emitter, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduleItem {
    pub id: String,
    pub date: String,
    pub time: String,
    pub title: String,
    pub memo: String,
    pub notified: bool,
}

fn get_schedules_file_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    fs::create_dir_all(&app_data_dir).map_err(|e| e.to_string())?;
    Ok(app_data_dir.join("schedules.json"))
}

#[tauri::command]
pub async fn get_schedules(app_handle: tauri::AppHandle) -> Result<Vec<ScheduleItem>, String> {
    let path = get_schedules_file_path(&app_handle)?;
    if !path.exists() {
        return Ok(Vec::new());
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let items: Vec<ScheduleItem> = serde_json::from_str(&content).unwrap_or_default();
    Ok(items)
}

#[tauri::command]
pub async fn add_schedule(
    item: ScheduleItem,
    app_handle: tauri::AppHandle,
) -> Result<bool, String> {
    let mut items = get_schedules(app_handle.clone()).await.unwrap_or_default();
    items.retain(|i| i.id != item.id);
    items.push(item);
    let path = get_schedules_file_path(&app_handle)?;
    let json = serde_json::to_string_pretty(&items).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(true)
}

#[tauri::command]
pub async fn delete_schedule(id: String, app_handle: tauri::AppHandle) -> Result<bool, String> {
    let mut items = get_schedules(app_handle.clone()).await.unwrap_or_default();
    items.retain(|i| i.id != id);
    let path = get_schedules_file_path(&app_handle)?;
    let json = serde_json::to_string_pretty(&items).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(true)
}

#[tauri::command]
pub async fn trigger_calendar_event(
    event_id: String,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    println!(
        "📅 [Calendar Event] Triggering calendar event: {}",
        event_id
    );
    app_handle
        .emit("calendar-event-triggered", &event_id)
        .map_err(|e| e.to_string())?;
    Ok(format!("Triggered {}", event_id))
}
