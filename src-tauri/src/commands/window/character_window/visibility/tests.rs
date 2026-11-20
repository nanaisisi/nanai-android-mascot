#[cfg(test)]
mod tests {
    use super::super::geometry::*;
    use super::super::types::*;

    #[test]
    fn work_area_to_logical_handles_taskbar_and_hidpi_scale() {
        assert_eq!(
            work_area_to_logical(0, 0, 1920, 1032, 1.0),
            (1.0, 0.0, 0.0, 1920.0, 1032.0)
        );
        assert_eq!(
            work_area_to_logical(90, 60, 2790, 1560, 1.5),
            (1.5, 60.0, 40.0, 1860.0, 1040.0)
        );
        assert_eq!(
            work_area_to_logical(0, 0, 1280, 720, 0.0),
            (1.0, 0.0, 0.0, 1280.0, 720.0)
        );
        assert_eq!(
            work_area_to_logical(0, 0, 1280, 720, f64::NAN),
            (1.0, 0.0, 0.0, 1280.0, 720.0)
        );
    }

    #[test]
    fn default_character_position_uses_work_area_bottom_right() {
        // 1920x1080 with 48px bottom taskbar -> work_area height = 1032
        assert_eq!(
            compute_default_character_position(0, 200.0, 360.0, 0.0, 0.0, 1920.0, 1032.0),
            (1640.0, 672.0)
        );
        // Subchar (scope 1) placed to the left of main character
        assert_eq!(
            compute_default_character_position(1, 200.0, 360.0, 0.0, 0.0, 1920.0, 1032.0),
            (1180.0, 672.0)
        );
        // Top/left taskbar work_area offset (60, 40) with HiDPI logical size
        assert_eq!(
            compute_default_character_position(0, 200.0, 360.0, 60.0, 40.0, 1860.0, 1040.0),
            (1640.0, 720.0)
        );
        // Oversized window stays anchored to work_area origin for initial unset default
        assert_eq!(
            compute_default_character_position(2, 500.0, 800.0, 60.0, 40.0, 400.0, 600.0),
            (60.0, 40.0)
        );
    }

    #[test]
    fn params_preserve_unclamped_offscreen_coordinates() {
        let p = ShowCharacterWindowParams::new(0, Some(-450.0), Some(-220.0), Some(200.0), None);
        assert_eq!(p.scope_id(), 0);
        assert_eq!(p.x(), Some(-450.0));
        assert_eq!(p.y(), Some(-220.0));
        assert_eq!(p.width(), Some(200.0));
        assert_eq!(p.height(), None);

        let parsed: ShowSubcharWindowParams = serde_json::from_str(
            r#"{"scopeId": 2, "x": 3840.0, "y": 2160.0, "width": 160.0, "height": 300.0}"#,
        )
        .expect("deserialize ShowSubcharWindowParams");
        assert_eq!(parsed.scope_id(), 2);
        assert_eq!(parsed.x(), Some(3840.0));
        assert_eq!(parsed.y(), Some(2160.0));
    }
}
