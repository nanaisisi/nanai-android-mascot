//! `surface[N]` ブロック内の個別キー処理（collision / element / animation / point）モジュール

pub mod utils;
pub mod collision;
pub mod element;
pub mod animation;
pub mod point;

pub use utils::expand_range;
pub(crate) use utils::{parse_balloon_offset_key, first_i32};
pub(crate) use collision::{apply_collision, apply_collisionex};
pub(crate) use element::apply_element;
pub(crate) use animation::apply_animation_line;
pub(crate) use point::apply_point;

#[cfg(test)]
mod tests {
    use super::*;
    use crate::surfaces::types::SurfacesTxt;

    #[test]
    fn test_expand_range() {
        assert_eq!(expand_range("0-2, ,5"), vec![0, 1, 2, 5]);
        assert_eq!(expand_range("[10-12]"), vec![10, 11, 12]);
        assert_eq!(expand_range("invalid"), Vec::<u32>::new());
    }

    #[test]
    fn test_split_id_suffix() {
        assert_eq!(utils::split_id_suffix("test100"), ("test", Some(100)));
        assert_eq!(utils::split_id_suffix("noint"), ("noint", None));
    }

    #[test]
    fn test_first_i32() {
        assert_eq!(first_i32(" 42 , 100 "), Some(42));
        assert_eq!(first_i32("abc"), None);
    }

    #[test]
    fn test_parse_balloon_offset_key() {
        assert_eq!(parse_balloon_offset_key("balloon.offset.x"), Some(("*".to_string(), 'x')));
        assert_eq!(parse_balloon_offset_key("sakura.balloon.offset.y"), Some(("sakura".to_string(), 'y')));
        assert_eq!(parse_balloon_offset_key("balloon.offset"), None);
        assert_eq!(parse_balloon_offset_key("sakura.balloon.offset"), None);
        assert_eq!(parse_balloon_offset_key(".balloon.offset.x"), None);
        assert_eq!(parse_balloon_offset_key("invalid"), None);
    }

    #[test]
    fn test_apply_handlers() {
        let mut txt = SurfacesTxt::default();
        apply_point(&mut txt, &[0], "centerx", "150");
        apply_point(&mut txt, &[0], "centery", "160");
        apply_point(&mut txt, &[0], "basepos.x", "10");
        apply_point(&mut txt, &[0], "basepos.y", "20");
        apply_point(&mut txt, &[0], "kinoko.centerx", "30");
        apply_point(&mut txt, &[0], "kinoko.centery", "40");
        apply_point(&mut txt, &[0], "unknown", "0");
        assert_eq!(txt.surfaces.get(&0).unwrap().points.center_x, Some(150));

        apply_element(&mut txt, &[0], "element0", "overlay,base.png,0,0");
        apply_element(&mut txt, &[0], "element1", "short");
        assert_eq!(txt.surfaces.get(&0).unwrap().elements.len(), 1);

        apply_collision(&mut txt, &[0], "collision0", "0,0,50,50,Face");
        apply_collision(&mut txt, &[0], "collision", "1,0,0,50,50,Head");
        apply_collision(&mut txt, &[0], "collision2", "short");
        apply_collision(&mut txt, &[0], "collision2", "x,0,50,50,Face");
        apply_collision(&mut txt, &[0], "collision2", "0,y,50,50,Face");
        apply_collision(&mut txt, &[0], "collision2", "0,0,x,50,Face");
        apply_collision(&mut txt, &[0], "collision2", "0,0,50,y,Face");
        assert_eq!(txt.surfaces.get(&0).unwrap().collisions.len(), 2);

        apply_collisionex(&mut txt, &[0], "collisionex0", "short");
        apply_collisionex(&mut txt, &[0], "collisionex0", "Face,circle,10,10,5,8");
        apply_collisionex(&mut txt, &[0], "collisionex1", "Box,unknown,0,0,10,10");
        apply_collisionex(&mut txt, &[0], "collisionex2", "Poly,unknown,0,0,10,10,20,20");
        apply_collisionex(&mut txt, &[0], "collisionex3", "Bad,unknown,0,0");

        apply_animation_line(&mut txt, &[0], "no_dot", "sometimes");
        apply_animation_line(&mut txt, &[0], "abc.interval", "sometimes");
        apply_animation_line(&mut txt, &[0], "0.interval", "sometimes");
        apply_animation_line(&mut txt, &[0], "0.name", "blink");
        apply_animation_line(&mut txt, &[0], "0.option", "exclusive");
        apply_animation_line(&mut txt, &[0], "0.pattern0", "overlay,6,85-120,0,0,opt1");
        apply_animation_line(&mut txt, &[0], "0.pattern", "overlay,6,120-85,0,0");
        apply_animation_line(&mut txt, &[0], "0.pattern2", "overlay,6,50,0,0");
        apply_animation_line(&mut txt, &[0], "0.pattern3", "overlay,6,invalid,0,0");
        apply_animation_line(&mut txt, &[0], "0.unknown", "val");
        assert!(txt.surfaces.get(&0).unwrap().animations.contains_key(&0));
    }

    #[test]
    fn test_apply_collisionex_shapes() {
        let mut txt = SurfacesTxt::default();
        apply_collisionex(&mut txt, &[0], "collision0", "Head, rect, 0, 0, 50, 50");
        apply_collisionex(&mut txt, &[0], "collision1", "Body, polygon, 0, 0, 10, 10, 20, 20");
        apply_collisionex(&mut txt, &[0], "collision2", "C1, circle, 10, 10, 5");
        apply_collisionex(&mut txt, &[0], "collision3", "C2, circle, 10, 10, 5, 5");
        apply_collisionex(&mut txt, &[0], "collision4", "E1, ellipse, 10, 10, 5, 8");
        apply_collisionex(&mut txt, &[0], "collision5", "F1, unknown, 0, 0, 10, 10, 20, 20");
        assert_eq!(txt.surfaces.get(&0).unwrap().collisions.len(), 6);
    }

    #[test]
    fn test_apply_animation_fields() {
        let mut txt = SurfacesTxt::default();
        apply_animation_line(&mut txt, &[0], "0.name", "BlinkAnimation");
        apply_animation_line(&mut txt, &[0], "0.option", "async");
        apply_animation_line(&mut txt, &[0], "0.pattern", "overlay,6,85,0,0");
        apply_animation_line(&mut txt, &[0], "0.pattern1", "overlay,-1,85-120,0,0");
        assert!(txt.surfaces.get(&0).unwrap().animations.contains_key(&0));
    }

    #[test]
    fn test_apply_point_all_fields() {
        let mut txt = SurfacesTxt::default();
        for field in ["centerx", "centery", "basepos.x", "basepos.y", "kinoko.centerx", "kinoko.centery", "unknown"] {
            apply_point(&mut txt, &[0], field, "100");
        }
        let points = &txt.surfaces.get(&0).unwrap().points;
        assert_eq!(points.center_x, Some(100));
        assert_eq!(points.center_y, Some(100));
        assert_eq!(points.basepos_x, Some(100));
        assert_eq!(points.basepos_y, Some(100));
        assert_eq!(points.kinoko_center_x, Some(100));
        assert_eq!(points.kinoko_center_y, Some(100));
    }
}
