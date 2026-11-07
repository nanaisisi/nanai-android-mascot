use super::SurfacesTxt;
use crate::surfaces::types::SurfaceDefinition;

impl SurfacesTxt {
    /// エイリアス名に対応するサーフィス番号列を取得
    pub fn alias_numbers(&self, name: &str) -> Option<&Vec<u32>> {
        for (key, list) in &self.aliases {
            if key.eq_ignore_ascii_case(name) {
                return Some(list);
            }
        }
        None
    }

    /// 相方（kero / char1）のエイリアス名に対応するサーフィス番号列を取得
    pub fn kero_alias_numbers(&self, name: &str) -> Option<&Vec<u32>> {
        for (key, list) in &self.kero_aliases {
            if key.eq_ignore_ascii_case(name) {
                return Some(list);
            }
        }
        None
    }

    /// エイリアス名から最初の有効なサーフィス定義を解決する
    pub fn resolve_alias(&self, name: &str) -> Option<&SurfaceDefinition> {
        let list = self.alias_numbers(name)?;
        list.iter().find_map(|n| self.surfaces.get(n))
    }

    /// 相方（kero / char1）のエイリアス名から最初の有効なサーフィス定義を解決する
    pub fn resolve_kero_alias(&self, name: &str) -> Option<&SurfaceDefinition> {
        let list = self.kero_alias_numbers(name)?;
        list.iter().find_map(|n| self.surfaces.get(n))
    }

    /// `name,` 定義名から該当するサーフィス（番号と定義）を検索する
    pub fn find_by_name(&self, name: &str) -> Option<(u32, &SurfaceDefinition)> {
        for (&id, def) in &self.surfaces {
            if let Some(def_name) = &def.name
                && def_name.eq_ignore_ascii_case(name)
            {
                return Some((id, def));
            }
        }
        None
    }

    /// 名前（`name,` 定義）またはエイリアス名からサーフィスを解決する
    pub fn resolve_name_or_alias(&self, name_or_alias: &str) -> Option<(u32, &SurfaceDefinition)> {
        if let Some((id, def)) = self.find_by_name(name_or_alias) {
            return Some((id, def));
        }
        if let Some(list) = self.alias_numbers(name_or_alias) {
            for &id in list {
                if let Some(def) = self.surfaces.get(&id) {
                    return Some((id, def));
                }
            }
        }
        None
    }

    /// 相方（kero / char1）の名前またはエイリアス名からサーフィスを解決する
    pub fn resolve_kero_name_or_alias(
        &self,
        name_or_alias: &str,
    ) -> Option<(u32, &SurfaceDefinition)> {
        if let Some(list) = self.kero_alias_numbers(name_or_alias) {
            for &id in list {
                if let Some(def) = self.surfaces.get(&id) {
                    return Some((id, def));
                }
            }
        }
        self.find_by_name(name_or_alias)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_resolve_alias_none() {
        let txt = SurfacesTxt::default();
        assert!(txt.resolve_alias("nonexistent").is_none());
        assert!(txt.resolve_kero_alias("nonexistent").is_none());
    }

    #[test]
    fn test_alias_resolution_edge_cases() {
        let mut txt = SurfacesTxt::default();
        txt.aliases.insert("smile".to_string(), vec![10, 20]);
        assert!(txt.resolve_alias("smile").is_none());

        txt.surfaces.insert(20, SurfaceDefinition::default());
        assert!(txt.resolve_alias("smile").is_some());

        let def = SurfaceDefinition {
            name: Some("Blink".to_string()),
            ..Default::default()
        };
        txt.surfaces.insert(0, def);
        assert!(txt.resolve_name_or_alias("Blink").is_some());
        assert!(txt.resolve_name_or_alias("smile").is_some());
        assert!(txt.resolve_name_or_alias("nonexistent").is_none());

        txt.kero_aliases.insert("ksmile".to_string(), vec![30]);
        assert!(txt.resolve_kero_alias("ksmile").is_none());
        txt.surfaces.insert(30, SurfaceDefinition::default());
        assert!(txt.resolve_kero_alias("ksmile").is_some());

        assert!(txt.resolve_kero_name_or_alias("Blink").is_some());
        assert!(txt.resolve_kero_name_or_alias("ksmile").is_some());
        assert!(txt.resolve_kero_name_or_alias("nonexistent").is_none());
    }
}
