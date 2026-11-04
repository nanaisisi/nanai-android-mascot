use super::SurfacesTxt;
use crate::surfaces::types::HitTestResult;

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
        use crate::surfaces::types::{
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
            interval: Some(crate::surfaces::types::Interval::Bind),
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
}
