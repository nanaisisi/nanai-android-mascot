/**
 * @file tests.rs
 * @brief SurfaceDefinition ヒットテスト・有効アイコン矩形・ソート単体テスト
 */
use super::definition::SurfaceDefinition;
use super::elements::{ElementDef, SortKind, make_square_rect};
use crate::types::collision::{CollisionArea, CollisionShape};
use crate::types::draw::DrawMethod;

#[test]
fn test_surface_definition_methods() {
    let elem = ElementDef {
        id: 1,
        method: DrawMethod::Overlay,
        file: "face.png".into(),
        x: 0,
        y: 0,
        options: vec![],
    };
    let area = CollisionArea {
        id: Some(0),
        name: "Head".into(),
        shape: CollisionShape::Rect {
            x1: 0,
            y1: 0,
            x2: 100,
            y2: 100,
        },
    };

    let mut def = SurfaceDefinition::default();
    def.elements.push(elem);
    def.collisions.push(area);

    assert!(def.hit_test(50, 50).is_some());
    assert!(def.hit_test(200, 200).is_none());
    assert_eq!(def.element(1).unwrap().file, "face.png");
    assert!(def.element(99).is_none());

    assert_eq!(SortKind::parse("id"), SortKind::Id);
    assert_eq!(SortKind::parse("unique-junk"), SortKind::UniqueJunk);
    assert_eq!(SortKind::parse("u-scoped"), SortKind::UScoped);
    assert_eq!(SortKind::parse("other"), SortKind::Custom("other".into()));
}

#[test]
fn test_surface_definition_effective_icon_rect_and_sorting() {
    // 1. Explicit icon_rect
    let mut def = SurfaceDefinition {
        icon_rect: Some([10, 20, 110, 70]),
        ..Default::default()
    };
    let rect = def.effective_icon_rect().unwrap();
    assert_eq!(rect[2] - rect[0], rect[3] - rect[1]); // Square

    // 2. Fallback to "face" collision
    def.icon_rect = None;
    def.collisions.push(CollisionArea {
        id: Some(2),
        name: "face".into(),
        shape: CollisionShape::Rect {
            x1: 0,
            y1: 0,
            x2: 50,
            y2: 50,
        },
    });
    def.collisions.push(CollisionArea {
        id: Some(1),
        name: "head".into(),
        shape: CollisionShape::Rect {
            x1: 0,
            y1: 0,
            x2: 100,
            y2: 100,
        },
    });

    assert_eq!(def.effective_icon_rect().unwrap(), [0, 0, 50, 50]);

    // 3. hit_test_sorted: Ascend & Descend
    let res_asc = def
        .hit_test_sorted(25, 25, Some(&SortKind::Ascend))
        .unwrap();
    assert_eq!(res_asc.name, "head"); // ID 1

    let res_desc = def
        .hit_test_sorted(25, 25, Some(&SortKind::Descend))
        .unwrap();
    assert_eq!(res_desc.name, "face"); // ID 2

    let res_id = def.hit_test_sorted(25, 25, Some(&SortKind::Id)).unwrap();
    assert_eq!(res_id.name, "head"); // ID 1
}

#[test]
fn test_surface_definition_more_edge_cases() {
    let def = SurfaceDefinition::default();
    assert!(def.effective_icon_rect().is_none());

    let mut def2 = SurfaceDefinition::default();
    def2.collisions.push(CollisionArea {
        id: Some(1),
        name: "顔".into(),
        shape: CollisionShape::Rect {
            x1: 0,
            y1: 0,
            x2: 50,
            y2: 50,
        },
    });
    assert!(def2.effective_icon_rect().is_some());

    let mut def3 = SurfaceDefinition::default();
    def3.collisions.push(CollisionArea {
        id: Some(1),
        name: "頭".into(),
        shape: CollisionShape::Rect {
            x1: 0,
            y1: 0,
            x2: 50,
            y2: 50,
        },
    });
    assert!(def3.effective_icon_rect().is_some());

    let mut def4 = SurfaceDefinition::default();
    def4.collisions.push(CollisionArea {
        id: Some(1),
        name: "face".into(),
        shape: CollisionShape::Circle {
            cx: 0,
            cy: 0,
            r: 0.0,
        },
    });
    assert!(def4.effective_icon_rect().is_none());

    let square = make_square_rect(0, 0, 50, 50);
    assert_eq!(square, [0, 0, 50, 50]);

    let hit = def2.hit_test_sorted(25, 25, Some(&SortKind::None));
    assert!(hit.is_some());
}
