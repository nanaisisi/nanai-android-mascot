use super::commands::FmoEntry;
use super::types::FmoGhostStatus;
use crate::common::state::AppState;

#[test]
fn test_fmo_ghost_status_serialization() {
    let status = FmoGhostStatus {
        name: "Nanai".to_string(),
        keroname: "Kero".to_string(),
        surface0: 0,
        surface1: 10,
        balloon0: "".to_string(),
        balloon1: "".to_string(),
        kerohwnd: None,
        modulestate: Some("shiori:running,lifecycle:active".to_string()),
        path: "".to_string(),
        is_visible: true,
        lifecycle_state: "active".to_string(),
    };

    let json = serde_json::to_string(&status).unwrap();
    assert!(json.contains("\"lifecycle_state\":\"active\""));
    assert!(json.contains("\"is_visible\":true"));
}

#[tokio::test]
async fn test_fmo_update_balloon_and_surfaces() {
    let app_state = AppState::new();
    *app_state.current_ghost_name.lock() = Some("TestGhost".to_string());

    let entry = FmoEntry::new("0", "TestGhost")
        .with_balloons("Hello", "Hi")
        .with_surfaces(5, 15);
    assert_eq!(entry.balloon0(), "Hello");
    assert_eq!(entry.balloon1(), "Hi");
    assert_eq!(entry.sakura_surface(), 5);
    assert_eq!(entry.kero_surface(), 15);
}
