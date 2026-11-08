use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

use crate::surfaces::types::CursorDefinition;
use crate::surfaces::types::surface::{SortKind, SurfaceDefinition};

/// `surfaces.txt` のパース結果
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct SurfacesTxt {
    /// `charset,` 指定（例: Shift_JIS）
    pub charset: Option<String>,
    /// `descript` ブロック内の `version,` 指定（0: 旧形式 / 1: 新形式・推奨）
    pub version: u32,
    /// `descript` ブロック内の `maxwidth,`
    pub maxwidth: Option<i32>,
    pub animation_sort: Option<SortKind>,
    pub collision_sort: Option<SortKind>,
    /// サーフィス番号 → 定義
    pub surfaces: BTreeMap<u32, SurfaceDefinition>,
    /// `surface.alias` ブロックの エイリアス名 → サーフィス番号列
    pub aliases: BTreeMap<String, Vec<u32>>,
    /// `kero.surface.alias` / `char1.surface.alias` ブロックのエイリアス名 → 番号列
    #[serde(default)]
    pub kero_aliases: BTreeMap<String, Vec<u32>>,
    /// `*.cursor` ブロック定義（スコープ名 -> カーソル定義列）
    #[serde(default)]
    pub cursors: BTreeMap<String, Vec<CursorDefinition>>,
    /// `*.tooltips` ブロック定義（スコープ名 -> (当たり判定名 -> ツールチップ本文)）
    #[serde(default)]
    pub tooltips: BTreeMap<String, BTreeMap<String, String>>,
    /// ルート（ブロック外）の未分類キー・バリュー
    pub properties: BTreeMap<String, String>,
}

impl SurfacesTxt {
    /// テキスト内容から `surfaces.txt` をパースする
    pub fn parse(text: &str) -> Self {
        crate::surfaces::parser::parse_surfaces_txt(text)
    }

    /// サーフィス番号に対応する定義を取得
    pub fn surface(&self, number: u32) -> Option<&SurfaceDefinition> {
        self.surfaces.get(&number)
    }

    /// 定義済みの全サーフィスID（昇順）を取得する (`currentghost.seriko.surfacelist.defined`)
    pub fn defined_surface_ids(&self) -> Vec<u32> {
        self.surfaces.keys().copied().collect()
    }

    /// 定義済みおよびエイリアスを含むすべての利用可能サーフィスID（昇順・重複なし）を取得する (`currentghost.seriko.surfacelist.all`)
    pub fn all_surface_ids(&self) -> Vec<u32> {
        let mut set = std::collections::BTreeSet::new();
        set.extend(self.surfaces.keys().copied());
        for list in self.aliases.values() {
            set.extend(list.iter().copied());
        }
        for list in self.kero_aliases.values() {
            set.extend(list.iter().copied());
        }
        set.into_iter().collect()
    }

    /// `surfaces2.txt` 等の上位定義でマージ（上書き・追記）する
    pub fn merge(&mut self, other: SurfacesTxt) {
        if other.charset.is_some() {
            self.charset = other.charset;
        }
        if other.version > 0 {
            self.version = other.version;
        }
        if other.maxwidth.is_some() {
            self.maxwidth = other.maxwidth;
        }
        if other.animation_sort.is_some() {
            self.animation_sort = other.animation_sort;
        }
        if other.collision_sort.is_some() {
            self.collision_sort = other.collision_sort;
        }

        for (k, v) in other.properties {
            self.properties.insert(k, v);
        }

        for (alias, list) in other.aliases {
            self.aliases.insert(alias, list);
        }

        for (alias, list) in other.kero_aliases {
            self.kero_aliases.insert(alias, list);
        }

        for (scope, cursor_list) in other.cursors {
            self.cursors.entry(scope).or_default().extend(cursor_list);
        }

        for (scope, tooltip_map) in other.tooltips {
            let cur_scope = self.tooltips.entry(scope).or_default();
            for (col, text) in tooltip_map {
                cur_scope.insert(col, text);
            }
        }

        for (num, other_def) in other.surfaces {
            use std::collections::btree_map::Entry;
            match self.surfaces.entry(num) {
                Entry::Vacant(v) => {
                    v.insert(other_def);
                }
                Entry::Occupied(mut occ) => {
                    let cur = occ.get_mut();
                    if other_def.name.is_some() {
                        cur.name = other_def.name;
                    }
                    if other_def.points.center_x.is_some() {
                        cur.points.center_x = other_def.points.center_x;
                    }
                    if other_def.points.center_y.is_some() {
                        cur.points.center_y = other_def.points.center_y;
                    }
                    if other_def.points.basepos_x.is_some() {
                        cur.points.basepos_x = other_def.points.basepos_x;
                    }
                    if other_def.points.basepos_y.is_some() {
                        cur.points.basepos_y = other_def.points.basepos_y;
                    }
                    if other_def.points.kinoko_center_x.is_some() {
                        cur.points.kinoko_center_x = other_def.points.kinoko_center_x;
                    }
                    if other_def.points.kinoko_center_y.is_some() {
                        cur.points.kinoko_center_y = other_def.points.kinoko_center_y;
                    }

                    for (k, v) in other_def.balloon_offsets {
                        cur.balloon_offsets.insert(k, v);
                    }
                    for (k, v) in other_def.properties {
                        cur.properties.insert(k, v);
                    }
                    for (id, other_anim) in other_def.animations {
                        match cur.animations.entry(id) {
                            Entry::Vacant(v) => {
                                v.insert(other_anim);
                            }
                            Entry::Occupied(mut occ_anim) => {
                                let a = occ_anim.get_mut();
                                if other_anim.interval.is_some() {
                                    a.interval = other_anim.interval;
                                }
                                if other_anim.name.is_some() {
                                    a.name = other_anim.name;
                                }
                                a.patterns.extend(other_anim.patterns);
                                a.collisions.extend(other_anim.collisions);
                                a.options.extend(other_anim.options);
                            }
                        }
                    }
                    cur.elements.extend(other_def.elements);
                    cur.collisions.extend(other_def.collisions);
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::surfaces::types::{Interval, SerikoAnimation};

    #[test]
    fn test_surfaces_txt_merge_comprehensive() {
        let mut base = SurfacesTxt::default();
        base.surfaces.insert(0, SurfaceDefinition::default());

        let mut other = SurfacesTxt {
            charset: Some("UTF-8".into()),
            version: 1,
            maxwidth: Some(800),
            animation_sort: Some(SortKind::Id),
            collision_sort: Some(SortKind::Ascend),
            ..Default::default()
        };

        let mut other_def = SurfaceDefinition {
            name: Some("SurfaceZero".into()),
            ..Default::default()
        };
        other_def.points.center_x = Some(10);
        other_def.points.center_y = Some(20);
        other_def.points.basepos_x = Some(30);
        other_def.points.basepos_y = Some(40);
        other_def.points.kinoko_center_x = Some(50);
        other_def.points.kinoko_center_y = Some(60);

        let anim = SerikoAnimation {
            id: 0,
            name: Some("Anim0".into()),
            interval: Some(Interval::Always),
            options: vec![],
            collisions: vec![],
            patterns: vec![],
        };
        other_def.animations.insert(0, anim.clone());
        other.surfaces.insert(0, other_def);

        let other_def1 = SurfaceDefinition::default();
        other.surfaces.insert(1, other_def1);

        base.merge(other);
        assert_eq!(base.version, 1);
        assert_eq!(base.maxwidth, Some(800));
        assert_eq!(base.animation_sort, Some(SortKind::Id));
        assert_eq!(base.collision_sort, Some(SortKind::Ascend));
        assert!(base.surface(0).unwrap().name.is_some());
        assert!(base.surface(1).is_some());

        // Surface ID enumeration queries
        assert_eq!(base.defined_surface_ids(), vec![0, 1]);
        assert_eq!(base.all_surface_ids(), vec![0, 1]);

        base.aliases.insert("extra".into(), vec![2, 5]);
        base.kero_aliases.insert("kextra".into(), vec![5, 10]);
        assert_eq!(base.defined_surface_ids(), vec![0, 1]);
        assert_eq!(base.all_surface_ids(), vec![0, 1, 2, 5, 10]);
    }
}
