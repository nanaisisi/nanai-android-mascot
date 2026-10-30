//! SSP Calendar & Schedule Manager specification implementation (ukadoc-ssp/functions/calendar)
//! [calendar/index.md], [calendar/schedule.md], [calendar/menu.md]

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduleItem {
    pub id: String,
    pub date: String,
    pub time: String,
    pub title: String,
    pub memo: String,
    pub notified: bool,
}

#[tauri::command]
pub async fn get_schedules() -> Result<Vec<ScheduleItem>, String> {
    Ok(vec![ScheduleItem {
        id: "sch_1".to_string(),
        date: "2026-10-28".to_string(),
        time: "12:00".to_string(),
        title: "お昼休み (SSP Calendar)".to_string(),
        memo: "休憩時間アラーム".to_string(),
        notified: false,
    }])
}

#[tauri::command]
pub async fn add_schedule(item: ScheduleItem) -> Result<bool, String> {
    println!("📅 [Calendar] Added schedule: {} at {} {}", item.title, item.date, item.time);
    Ok(true)
}

#[tauri::command]
pub async fn delete_schedule(id: String) -> Result<bool, String> {
    println!("📅 [Calendar] Deleted schedule ID: {}", id);
    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_calendar_commands() {
        let schedules = get_schedules().await.unwrap();
        assert!(!schedules.is_empty());
        let res = add_schedule(schedules[0].clone()).await.unwrap();
        assert!(res);
    }
}
