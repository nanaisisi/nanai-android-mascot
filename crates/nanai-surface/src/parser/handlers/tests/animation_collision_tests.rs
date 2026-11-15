use super::super::*;
use crate::types::SurfacesTxt;

#[test]
fn test_apply_handlers() {
    let mut txt = SurfacesTxt::default();
    apply_point(Apply_pointParams {
        txt: &mut txt,
        ids: &[0],
        field: "centerx",
        value: "150",
    });
    apply_point(Apply_pointParams {
        txt: &mut txt,
        ids: &[0],
        field: "centery",
        value: "160",
    });
    apply_point(Apply_pointParams {
        txt: &mut txt,
        ids: &[0],
        field: "basepos.x",
        value: "10",
    });
    apply_point(Apply_pointParams {
        txt: &mut txt,
        ids: &[0],
        field: "basepos.y",
        value: "20",
    });
    apply_point(Apply_pointParams {
        txt: &mut txt,
        ids: &[0],
        field: "kinoko.centerx",
        value: "30",
    });
    apply_point(Apply_pointParams {
        txt: &mut txt,
        ids: &[0],
        field: "kinoko.centery",
        value: "40",
    });
    apply_point(Apply_pointParams {
        txt: &mut txt,
        ids: &[0],
        field: "unknown",
        value: "0",
    });
    assert_eq!(txt.surfaces.get(&0).unwrap().points.center_x, Some(150));

    apply_element(Apply_elementParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "element0",
        value: "overlay,base.png,0,0",
    });
    apply_element(Apply_elementParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "element1",
        value: "short",
    });
    assert_eq!(txt.surfaces.get(&0).unwrap().elements.len(), 1);

    apply_collision(Apply_collisionParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "collision0",
        value: "0,0,50,50,Face",
    });
    apply_collision(Apply_collisionParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "collision",
        value: "1,0,0,50,50,Head",
    });
    apply_collision(Apply_collisionParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "collision2",
        value: "short",
    });
    apply_collision(Apply_collisionParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "collision2",
        value: "x,0,50,50,Face",
    });
    apply_collision(Apply_collisionParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "collision2",
        value: "0,y,50,50,Face",
    });
    apply_collision(Apply_collisionParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "collision2",
        value: "0,0,x,50,Face",
    });
    apply_collision(Apply_collisionParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "collision2",
        value: "0,0,50,y,Face",
    });
    assert_eq!(txt.surfaces.get(&0).unwrap().collisions.len(), 2);

    apply_collisionex(Apply_collisionexParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "collisionex0",
        value: "short",
    });
    apply_collisionex(Apply_collisionexParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "collisionex0",
        value: "Face,circle,10,10,5,8",
    });
    apply_collisionex(Apply_collisionexParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "collisionex1",
        value: "Box,unknown,0,0,10,10",
    });
    apply_collisionex(Apply_collisionexParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "collisionex2",
        value: "Poly,unknown,0,0,10,10,20,20",
    });
    apply_collisionex(Apply_collisionexParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "collisionex3",
        value: "Bad,unknown,0,0",
    });

    apply_animation_line(Apply_animation_lineParams {
        txt: &mut txt,
        ids: &[0],
        rest: "no_dot",
        value: "sometimes",
    });
    apply_animation_line(Apply_animation_lineParams {
        txt: &mut txt,
        ids: &[0],
        rest: "abc.interval",
        value: "sometimes",
    });
    apply_animation_line(Apply_animation_lineParams {
        txt: &mut txt,
        ids: &[0],
        rest: "0.interval",
        value: "sometimes",
    });
    apply_animation_line(Apply_animation_lineParams {
        txt: &mut txt,
        ids: &[0],
        rest: "0.name",
        value: "blink",
    });
    apply_animation_line(Apply_animation_lineParams {
        txt: &mut txt,
        ids: &[0],
        rest: "0.option",
        value: "exclusive",
    });
    apply_animation_line(Apply_animation_lineParams {
        txt: &mut txt,
        ids: &[0],
        rest: "0.pattern0",
        value: "overlay,6,85-120,0,0,opt1",
    });
    apply_animation_line(Apply_animation_lineParams {
        txt: &mut txt,
        ids: &[0],
        rest: "0.pattern",
        value: "overlay,6,120-85,0,0",
    });
    apply_animation_line(Apply_animation_lineParams {
        txt: &mut txt,
        ids: &[0],
        rest: "0.pattern2",
        value: "overlay,6,50,0,0",
    });
    apply_animation_line(Apply_animation_lineParams {
        txt: &mut txt,
        ids: &[0],
        rest: "0.pattern3",
        value: "overlay,6,invalid,0,0",
    });
    apply_animation_line(Apply_animation_lineParams {
        txt: &mut txt,
        ids: &[0],
        rest: "0.unknown",
        value: "val",
    });
    assert!(txt.surfaces.get(&0).unwrap().animations.contains_key(&0));
}

#[test]
fn test_apply_collisionex_shapes() {
    let mut txt = SurfacesTxt::default();
    apply_collisionex(Apply_collisionexParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "collision0",
        value: "Head, rect, 0, 0, 50, 50",
    });
    apply_collisionex(Apply_collisionexParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "collision1",
        value: "Body, polygon, 0, 0, 10, 10, 20, 20",
    });
    apply_collisionex(Apply_collisionexParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "collision2",
        value: "C1, circle, 10, 10, 5",
    });
    apply_collisionex(Apply_collisionexParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "collision3",
        value: "C2, circle, 10, 10, 5, 5",
    });
    apply_collisionex(Apply_collisionexParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "collision4",
        value: "E1, ellipse, 10, 10, 5, 8",
    });
    apply_collisionex(Apply_collisionexParams {
        txt: &mut txt,
        ids: &[0],
        id_part: "collision5",
        value: "F1, unknown, 0, 0, 10, 10, 20, 20",
    });
    assert_eq!(txt.surfaces.get(&0).unwrap().collisions.len(), 6);
}

#[test]
fn test_apply_animation_fields() {
    let mut txt = SurfacesTxt::default();
    apply_animation_line(Apply_animation_lineParams {
        txt: &mut txt,
        ids: &[0],
        rest: "0.name",
        value: "BlinkAnimation",
    });
    apply_animation_line(Apply_animation_lineParams {
        txt: &mut txt,
        ids: &[0],
        rest: "0.option",
        value: "async",
    });
    apply_animation_line(Apply_animation_lineParams {
        txt: &mut txt,
        ids: &[0],
        rest: "0.pattern",
        value: "overlay,6,85,0,0",
    });
    apply_animation_line(Apply_animation_lineParams {
        txt: &mut txt,
        ids: &[0],
        rest: "0.pattern1",
        value: "overlay,-1,85-120,0,0",
    });
    assert!(txt.surfaces.get(&0).unwrap().animations.contains_key(&0));
}
