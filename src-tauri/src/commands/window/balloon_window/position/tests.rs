#[cfg(test)]
mod tests {
    use super::super::geometry::*;
    use super::super::types::*;

    #[test]
    fn default_offset_flips_scope_zero_within_work_area_and_scales_hidpi() {
        assert_eq!(
            compute_default_balloon_offset(0, 100, 200, 280, Some(0), Some(1920), 1.0),
            (180, -20)
        );
        // 右側タスクバーで work_w=1840 の場合もオーバーフローを検知して左側反転
        assert_eq!(
            compute_default_balloon_offset(0, 1400, 200, 280, Some(0), Some(1840), 1.0),
            (-270, -20)
        );
        assert_eq!(
            compute_default_balloon_offset(0, 1640, 200, 280, Some(0), Some(1920), 1.0),
            (-270, -20)
        );
        assert_eq!(
            compute_default_balloon_offset(1, 1400, 200, 280, Some(0), Some(1920), 1.0),
            (-260, -20)
        );

        // HiDPI 2.0x スケーリング
        assert_eq!(
            compute_default_balloon_offset(0, 200, 400, 560, Some(0), Some(3840), 2.0),
            (360, -40)
        );
        assert_eq!(
            compute_default_balloon_offset(0, 3280, 400, 560, Some(0), Some(3840), 2.0),
            (-540, -40)
        );
        assert_eq!(
            compute_default_balloon_offset(1, 200, 400, 560, Some(0), Some(3840), 2.0),
            (-520, -40)
        );
    }

    #[test]
    fn clamp_physical_position_y_only_keeps_x_unrestricted_and_clamps_y_to_work_area() {
        // 通常高さ: Yのみ [0, 1040 - 200 = 840] にクランプ、Xは左右画面外でも維持
        assert_eq!(
            clamp_physical_position_y_only(1700, 950, 200, 0, 1040),
            (1700, 840)
        );
        assert_eq!(
            clamp_physical_position_y_only(-250, -30, 200, 0, 1040),
            (-250, 0)
        );
        assert_eq!(
            clamp_physical_position_y_only(2500, 500, 200, 0, 1040),
            (2500, 500)
        );

        // 非ゼロ work_area.position (上部タスクバー work_y=40, work_h=1000)
        assert_eq!(
            clamp_physical_position_y_only(-120, 10, 200, 40, 1000),
            (-120, 40)
        );
        assert_eq!(
            clamp_physical_position_y_only(-120, 900, 200, 40, 1000),
            (-120, 840)
        );

        // 縦長ウィンドウ (height >= work_height) は work_top に固定、Xは無制限
        assert_eq!(
            clamp_physical_position_y_only(-100, 150, 1200, 40, 1000),
            (-100, 40)
        );
        assert_eq!(
            clamp_physical_position_y_only(2200, 80, 1000, 40, 1000),
            (2200, 40)
        );
    }

    #[test]
    fn save_offset_helper_enforces_vertical_work_area_and_unrestricted_x() {
        // HiDPI 1.5x (物理 work_area: y=60, h=1560 -> work_bottom=1620)
        let work = PhysicalWorkArea::from_rects(0, 60, 2880, 1560, 0, 0, 2880, 1620, 1.5);

        // ドラッグ終了時にタスクバー下端を超えていた場合、YのみクランプされX(-400)と移動先座標が返る
        let (offset_bottom, moved_bottom) =
            compute_saved_offset_and_clamped_y(100, 800, -400, 1400, 300, Some(&work));
        // max_y = 60 + 1560 - 300 = 1320 -> offset = (-400 - 100, 1320 - 800) = (-500, 520)
        assert_eq!(offset_bottom, (-500, 520));
        assert_eq!(moved_bottom, Some((-400, 1320)));

        // 上端より上にドラッグした場合、work_top (60) にクランプ
        let (offset_top, moved_top) =
            compute_saved_offset_and_clamped_y(500, 300, 3100, 10, 300, Some(&work));
        assert_eq!(offset_top, (2600, -290));
        assert_eq!(moved_top, Some((3100, 60)));

        // 範囲内なら移動不要
        let (offset_ok, moved_ok) =
            compute_saved_offset_and_clamped_y(500, 300, -100, 400, 300, Some(&work));
        assert_eq!(offset_ok, (-600, 100));
        assert_eq!(moved_ok, None);
    }

    #[test]
    fn multi_monitor_selection_picks_target_monitor_even_with_unrestricted_x() {
        let m1 = PhysicalWorkArea::from_rects(0, 0, 1920, 1040, 0, 0, 1920, 1080, 1.0);
        let m2 = PhysicalWorkArea::from_rects(1920, 60, 2880, 1560, 1920, 0, 2880, 1620, 1.5);
        let areas = vec![m1, m2];

        assert_eq!(
            select_best_physical_monitor_index(&areas, -200, 500),
            Some(0)
        );
        assert_eq!(
            select_best_physical_monitor_index(&areas, 2100, 20),
            Some(1)
        );
        assert_eq!(
            select_best_physical_monitor_index(&areas, 5000, 500),
            Some(1)
        );
    }
}
