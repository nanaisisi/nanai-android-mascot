use super::SurfacesTxt;
use crate::types::HitTestResult;

impl SurfacesTxt {
    /// 当たり判定のヒットテスト（`collision.sort` 設定を適用）
    pub fn hit_test(&self, surface_id: u32, x: i32, y: i32) -> Option<HitTestResult> {
        let def = self.surface(surface_id)?;
        def.hit_test_sorted(x, y, self.collision_sort.as_ref())
    }

    /// バインド（着せ替えパーツ）のアニメーション当たり判定も含めてヒットテストを行う
    pub fn hit_test_with_binds(
        &self,
        surface_id: u32,
        x: i32,
        y: i32,
        binds: &[u32],
    ) -> Option<HitTestResult> {
        let def = self.surface(surface_id)?;

        // バインドされたアニメーションの当たり判定を手前に判定
        for &bind_id in binds {
            if let Some(anim) = def.animations.get(&bind_id) {
                for area in anim.collisions.iter().rev() {
                    if area.contains(x, y) {
                        return Some(HitTestResult::new(area, x, y));
                    }
                }
            }
        }

        // ベースサーフィスの当たり判定
        self.hit_test(surface_id, x, y)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hit_test_none() {
        let txt = SurfacesTxt::default();
        assert!(txt.hit_test(999, 0, 0).is_none());
        assert!(txt.hit_test_with_binds(999, 0, 0, &[]).is_none());
    }

    #[test]
    fn test_hit_test_with_binds_comprehensive() {
        use crate::types::{
            CollisionArea, CollisionShape, SerikoAnimation, SurfaceDefinition,
        };

        let mut txt = SurfacesTxt::default();
        let mut def = SurfaceDefinition::default();

        def.collisions.push(CollisionArea {
            id: Some(0),
            name: "BaseArea".into(),
            shape: CollisionShape::Rect {
                x1: 0,
                y1: 0,
                x2: 50,
                y2: 50,
            },
        });

        let anim = SerikoAnimation {
            id: 10,
            name: None,
            interval: Some(crate::types::Interval::Bind),
            options: vec![],
            collisions: vec![CollisionArea {
                id: Some(1),
                name: "BindArea".into(),
                shape: CollisionShape::Rect {
                    x1: 10,
                    y1: 10,
                    x2: 30,
                    y2: 30,
                },
            }],
            patterns: vec![],
        };
        def.animations.insert(10, anim);
        txt.surfaces.insert(0, def);

        let hit_bind = txt.hit_test_with_binds(0, 20, 20, &[10]);
        assert!(hit_bind.is_some());
        assert_eq!(hit_bind.unwrap().name, "BindArea");

        let hit_base = txt.hit_test_with_binds(0, 5, 5, &[10]);
        assert!(hit_base.is_some());
        assert_eq!(hit_base.unwrap().name, "BaseArea");

        let hit_missing_bind = txt.hit_test_with_binds(0, 5, 5, &[999]);
        assert!(hit_missing_bind.is_some());

        let direct_hit = txt.hit_test(0, 5, 5);
        assert!(direct_hit.is_some());
    }

    #[test]
    fn test_hit_test_shapes_and_polygons() {
        use crate::types::{CollisionArea, CollisionShape, SurfaceDefinition};

        let mut txt = SurfacesTxt::default();
        let mut def = SurfaceDefinition::default();

        // Polygon (triangle (0,0), (50, 0), (0, 50))
        def.collisions.push(CollisionArea {
            id: Some(1),
            name: "Triangle".into(),
            shape: CollisionShape::Polygon {
                vertices: vec![(0, 0), (50, 0), (0, 50)],
            },
        });

        // Circle at (100, 100) with r=20
        def.collisions.push(CollisionArea {
            id: Some(2),
            name: "CircleArea".into(),
            shape: CollisionShape::Circle {
                cx: 100,
                cy: 100,
                r: 20.0,
            },
        });

        // Ellipse at (200, 200) with rx=30, ry=15
        def.collisions.push(CollisionArea {
            id: Some(3),
            name: "EllipseArea".into(),
            shape: CollisionShape::Ellipse {
                cx: 200,
                cy: 200,
                rx: 30.0,
                ry: 15.0,
            },
        });

        txt.surfaces.insert(0, def);

        // Inside triangle
        let hit_tri = txt.hit_test(0, 10, 10);
        assert!(hit_tri.is_some());
        assert_eq!(hit_tri.unwrap().name, "Triangle");

        // Outside triangle (e.g. 40, 40)
        let miss_tri = txt.hit_test(0, 40, 40);
        assert!(miss_tri.is_none());

        // Inside circle
        let hit_cir = txt.hit_test(0, 105, 105);
        assert!(hit_cir.is_some());
        assert_eq!(hit_cir.unwrap().name, "CircleArea");

        // Outside circle
        let miss_cir = txt.hit_test(0, 130, 130);
        assert!(miss_cir.is_none());

        // Inside ellipse
        let hit_ell = txt.hit_test(0, 215, 205);
        assert!(hit_ell.is_some());
        assert_eq!(hit_ell.unwrap().name, "EllipseArea");

        // Outside ellipse
        let miss_ell = txt.hit_test(0, 235, 215);
        assert!(miss_ell.is_none());
    }
}
