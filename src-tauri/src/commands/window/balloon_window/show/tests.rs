#[cfg(test)]
mod tests {
    use super::super::geometry::*;
    use super::super::handlers::*;

    #[test]
    fn resize_params_deserialize_camel_snake_and_defaults() {
        let camel: ResizeBalloonWindowParams =
            serde_json::from_str(r#"{"scopeId": 2, "width": 360.0, "height": 240.0}"#).unwrap();
        assert_eq!(camel.scope_id(), 2);
        assert_eq!(camel.width(), 360.0);
        assert_eq!(camel.height(), 240.0);

        let snake: ResizeBalloonWindowParams =
            serde_json::from_str(r#"{"scope_id": 1, "width": 320.0, "height": 210.0}"#).unwrap();
        assert_eq!(snake.scope_id(), 1);
        assert_eq!(snake.width(), 320.0);
        assert_eq!(snake.height(), 210.0);

        let empty: ResizeBalloonWindowParams = serde_json::from_str(r#"{}"#).unwrap();
        assert_eq!(empty.scope_id(), 0);
        assert_eq!(empty.width(), 280.0);
        assert_eq!(empty.height(), 200.0);
    }

    #[test]
    fn resolve_resize_args_supports_nested_flat_and_fallbacks() {
        let nested: ResizeBalloonWindowParams =
            serde_json::from_str(r#"{"scopeId": 1, "width": 410.0, "height": 290.0}"#).unwrap();
        assert_eq!(
            resolve_resize_balloon_args(Some(nested), Some(9), Some(8), Some(100.0), Some(100.0)),
            (1, 410.0, 290.0)
        );

        assert_eq!(
            resolve_resize_balloon_args(None, None, Some(2), Some(380.0), Some(260.0)),
            (2, 380.0, 260.0)
        );

        assert_eq!(
            resolve_resize_balloon_args(None, Some(3), None, Some(300.0), Some(220.0)),
            (3, 300.0, 220.0)
        );

        let partial: ResizeBalloonWindowParams =
            serde_json::from_str(r#"{"width": 350.0}"#).unwrap();
        assert_eq!(
            resolve_resize_balloon_args(Some(partial), None, Some(1), Some(999.0), Some(250.0)),
            (1, 350.0, 250.0)
        );

        assert_eq!(
            resolve_resize_balloon_args(None, None, None, None, None),
            (0, 0.0, 0.0)
        );
    }

    #[test]
    fn hide_params_and_scope_resolution_support_all_forms() {
        let camel: HideBalloonWindowParams = serde_json::from_str(r#"{"scopeId": 2}"#).unwrap();
        assert_eq!(camel.scope_id(), 2);
        assert_eq!(
            resolve_hide_balloon_scope(Some(camel), Some(9), Some(8), Some(7)),
            2
        );

        let snake: HideBalloonWindowParams = serde_json::from_str(r#"{"scope_id": 1}"#).unwrap();
        assert_eq!(resolve_hide_balloon_scope(Some(snake), None, None, None), 1);

        assert_eq!(resolve_hide_balloon_scope(None, Some(3), None, None), 3);
        assert_eq!(resolve_hide_balloon_scope(None, None, Some(4), None), 4);
        assert_eq!(resolve_hide_balloon_scope(None, None, None, Some(5)), 5);
        assert_eq!(resolve_hide_balloon_scope(None, None, None, None), 0);
    }

    #[test]
    fn show_params_and_clamping_support_all_forms() {
        let camel: ShowBalloonWindowParams = serde_json::from_str(
            r#"{"scopeId": 2, "theme": "ivory", "x": 100.0, "y": 50.0, "width": 320.0, "height": 220.0}"#,
        )
        .unwrap();
        assert_eq!(
            resolve_show_balloon_args(Some(camel), Some(9), Some(8), None, None, None, None, None),
            (
                2,
                Some("ivory".to_string()),
                Some(100.0),
                Some(50.0),
                Some(320.0),
                Some(220.0)
            )
        );

        let snake: ShowBalloonWindowParams =
            serde_json::from_str(r#"{"scope_id": 1, "theme": "nam"}"#).unwrap();
        assert_eq!(
            resolve_show_balloon_args(
                Some(snake),
                None,
                None,
                None,
                Some(10.0),
                Some(20.0),
                None,
                None
            ),
            (
                1,
                Some("nam".to_string()),
                Some(10.0),
                Some(20.0),
                None,
                None
            )
        );

        let empty = ShowBalloonWindowParams::default();
        assert_eq!(
            resolve_show_balloon_args(
                Some(empty),
                Some(3),
                None,
                Some("dark".to_string()),
                None,
                None,
                Some(300.0),
                Some(180.0)
            ),
            (
                3,
                Some("dark".to_string()),
                None,
                None,
                Some(300.0),
                Some(180.0)
            )
        );

        // 1. 通常高さでのYクランプ（タスクバー除外 work_area のみ）とX軸無制限の確認
        assert_eq!(
            clamp_logical_position_y_only(1800.0, 950.0, 200.0, 0.0, 1040.0),
            (1800.0, 840.0)
        );
        assert_eq!(
            clamp_logical_position_y_only(2500.0, 500.0, 200.0, 0.0, 1040.0),
            (2500.0, 500.0)
        );
        assert_eq!(
            clamp_logical_position_y_only(-500.0, -40.0, 200.0, 0.0, 1040.0),
            (-500.0, 0.0)
        );

        // 2. 非ゼロ work_area.position (例: 上部タスクバー work_y=40) と縦長ウィンドウ (height >= work_height)
        assert_eq!(
            clamp_logical_position_y_only(-300.0, 10.0, 200.0, 40.0, 1000.0),
            (-300.0, 40.0)
        );
        assert_eq!(
            clamp_logical_position_y_only(-300.0, 900.0, 200.0, 40.0, 1000.0),
            (-300.0, 840.0)
        );
        assert_eq!(
            clamp_logical_position_y_only(3000.0, 200.0, 1200.0, 40.0, 1000.0),
            (3000.0, 40.0)
        );
        assert_eq!(
            clamp_logical_position_y_only(100.0, 50.0, 1000.0, 40.0, 1000.0),
            (100.0, 40.0)
        );
    }

    #[test]
    fn hidpi_work_area_and_monitor_selection_cover_unrestricted_x_and_multi_monitor() {
        // HiDPI 1.5x (物理 work_area: x=1920, y=60, w=2880, h=1560 -> 論理: x=1280, y=40, w=1920, h=1040)
        let hidpi =
            LogicalWorkArea::from_physical_rects(1920, 60, 2880, 1560, 1920, 0, 2880, 1620, 1.5);
        assert_eq!(hidpi.x, 1280.0);
        assert_eq!(hidpi.y, 40.0);
        assert_eq!(hidpi.width, 1920.0);
        assert_eq!(hidpi.height, 1040.0);
        assert_eq!(hidpi.scale_factor, 1.5);

        // 下部クランプ: work_bottom(1080) - height(200) = 880; 左端はみ出しX(-150)は維持
        assert_eq!(
            clamp_logical_position_y_only(-150.0, 920.0, 200.0, hidpi.y, hidpi.height),
            (-150.0, 880.0)
        );
        assert!(needs_vertical_clamp(920.0, 200.0, hidpi.y, hidpi.height));
        assert!(!needs_vertical_clamp(500.0, 200.0, hidpi.y, hidpi.height));

        // 不正 scale_factor のフォールバック
        let invalid_scale =
            LogicalWorkArea::from_physical_rects(0, 40, 1920, 1040, 0, 0, 1920, 1080, 0.0);
        assert_eq!(invalid_scale.scale_factor, 1.0);
        assert_eq!(invalid_scale.y, 40.0);

        // マルチモニター選択: Xが画面外でも最寄りモニターを選択し、上下位置にも対応
        let monitors = vec![(0.0, 0.0, 1920.0, 1080.0), (1920.0, 100.0, 1920.0, 900.0)];
        assert_eq!(select_best_rect_index(&monitors, -200.0, 500.0), Some(0));
        assert_eq!(select_best_rect_index(&monitors, 2100.0, 50.0), Some(1));
        assert_eq!(select_best_rect_index(&monitors, 4000.0, 500.0), Some(1));

        // デフォルト位置: scope 0 はワークスペース右端あふれで左反転、scope 1 は左側配置（X無制限）
        assert_eq!(
            compute_default_logical_balloon_pos(0, 1600.0, 600.0, 200.0, 280.0, 0.0, 1840.0),
            (1330.0, 580.0)
        );
        assert_eq!(
            compute_default_logical_balloon_pos(1, 0.0, 600.0, 200.0, 280.0, 0.0, 1840.0),
            (-260.0, 580.0)
        );
    }
}
