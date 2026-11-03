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
}
