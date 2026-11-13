use super::SurfacesTxt;

impl SurfacesTxt {
    /// スコープ、イベント種別、当たり判定名に応じたカーソル設定を検索
    pub fn get_cursor(&self, scope: &str, event: &str, collision_name: &str) -> Option<&str> {
        let list = self
            .cursors
            .get(scope)
            .or_else(|| {
                if scope == "0" || scope.eq_ignore_ascii_case("sakura") {
                    self.cursors.get("sakura")
                } else if scope == "1" || scope.eq_ignore_ascii_case("kero") {
                    self.cursors.get("kero")
                } else {
                    None
                }
            })
            .or_else(|| self.cursors.get("*"))?;

        list.iter()
            .rev()
            .find(|c| {
                c.event.eq_ignore_ascii_case(event)
                    && c.collision.eq_ignore_ascii_case(collision_name)
            })
            .map(|c| c.cursor.as_str())
    }

    /// スコープおよび当たり判定名に応じたツールチップ本文を検索
    pub fn get_tooltip(&self, scope: &str, collision_name: &str) -> Option<&str> {
        let map = self
            .tooltips
            .get(scope)
            .or_else(|| {
                if scope == "0" || scope.eq_ignore_ascii_case("sakura") {
                    self.tooltips.get("sakura")
                } else if scope == "1" || scope.eq_ignore_ascii_case("kero") {
                    self.tooltips.get("kero")
                } else {
                    None
                }
            })
            .or_else(|| self.tooltips.get("*"))?;

        for (k, v) in map {
            if k.eq_ignore_ascii_case(collision_name) {
                return Some(v.as_str());
            }
        }
        None
    }
}
