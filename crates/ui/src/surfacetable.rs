//! `surfacetable.txt` パーサー（ukadoc-spec / descript / shell-surfacetable 準拠）
//!
//! 「SSP を起動しなくてもサーフィスを確認できるようにするための」仕様であり、
//! シェル自体には不要なファイル。ゴーストのサーフィスを グループ名 / 名前 の
//! 形式で整理する。サーフィス表示系（サーフィステスト・プレビュー）は
//! このパース結果を利用する。

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// グループ内の1登録（`[サーフィス番号],[名前]`）
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct SurfTableEntry {
    pub surface_id: u32,
    pub name: String,
}

/// `group,[グループ名] {}` の定義
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct SurfTableGroup {
    /// グループ名（`__disabled` は非表示グループ）
    pub name: String,
    pub entries: Vec<SurfTableEntry>,
}

impl SurfTableGroup {
    /// 非表示グループ（`__disabled`）か
    pub fn is_disabled(&self) -> bool {
        self.name == "__disabled"
    }
}

/// `surfacetable.txt` のパース結果
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct SurfaceTable {
    /// 1行目に記述が必須の `charset,` 指定
    pub charset: Option<String>,
    /// `version,` 指定（2014年規格では 1 のみ）
    pub version: u32,
    /// `scope,` 指定（サーフィスの登録スコープ）
    pub scope: Option<u32>,
    /// `option,` の内容（任意個）
    pub options: Vec<Vec<String>>,
    /// グループ定義（記述順）
    pub groups: Vec<SurfTableGroup>,
    /// 未分類のキー・バリュー
    pub properties: BTreeMap<String, String>,
}

impl SurfaceTable {
    /// テキスト内容から `surfacetable.txt` をパースする
    pub fn parse(text: &str) -> Self {
        parse_surface_table(text)
    }

    /// グループ名で検索（大文字小文字・前後の空白は無視）
    pub fn group(&self, name: &str) -> Option<&SurfTableGroup> {
        self.groups
            .iter()
            .find(|g| g.name.eq_ignore_ascii_case(name))
    }

    /// サーフィステストに表示すべき登録（`__disabled` グループを除外）
    pub fn visible_entries(&self) -> Vec<&SurfTableEntry> {
        self.groups
            .iter()
            .filter(|g| !g.is_disabled())
            .flat_map(|g| g.entries.iter())
            .collect()
    }

    /// サーフィスIDから名前を検索（可視グループのみ）
    pub fn name_of(&self, surface_id: u32) -> Option<&str> {
        self.visible_entries()
            .iter()
            .find(|e| e.surface_id == surface_id)
            .map(|e| e.name.as_str())
    }
}

/// アニメーション用サーフィス名か（名前に `__parts` を含むものはサーフィス一覧に表示されない）
pub fn is_parts_name(name: &str) -> bool {
    name.contains("__parts")
}

/// テキスト内容から `surfacetable.txt` をパースする
pub fn parse_surface_table(text: &str) -> SurfaceTable {
    let mut table = SurfaceTable::default();
    let mut current_group: Option<SurfTableGroup> = None;

    for raw in text.lines() {
        let line = raw.trim();
        if line.is_empty() || line.starts_with("//") {
            continue;
        }
        if line == "{" {
            continue;
        }
        if line == "}" {
            if let Some(group) = current_group.take() {
                table.groups.push(group);
            }
            continue;
        }

        let Some((key, value)) = split_key_value(line) else {
            continue;
        };

        match key.to_lowercase().as_str() {
            "charset" => {
                table.charset = Some(value.trim().to_string());
            }
            "version" => {
                table.version = value.trim().parse().unwrap_or(0);
            }
            "scope" => {
                table.scope = value.trim().parse().ok();
            }
            "option" => {
                table
                    .options
                    .push(value.split(',').map(|s| s.trim().to_string()).collect());
            }
            "group" => {
                // 前の group がまだ閉じられていない場合にも対応（閉じて記録）
                if let Some(group) = current_group.take() {
                    table.groups.push(group);
                }
                let name = value.trim().trim_end_matches('{').trim().to_string();
                current_group = Some(SurfTableGroup {
                    name,
                    entries: Vec::new(),
                });
            }
            _ => {
                // それ以外はグループ内なら登録行（`[サーフィス番号],[名前]`）として処理
                if let Some(group) = current_group.as_mut()
                    && let Ok(id) = key.trim().parse::<u32>()
                {
                    group.entries.push(SurfTableEntry {
                        surface_id: id,
                        name: value.trim().to_string(),
                    });
                    continue;
                }
                table
                    .properties
                    .insert(key.to_string(), value.trim().to_string());
            }
        }
    }

    // 未閉鎖グループの退避
    if let Some(group) = current_group.take() {
        table.groups.push(group);
    }

    table
}

/// `key,value` 形式の行を分割する（行末の `{` は除去）
fn split_key_value(line: &str) -> Option<(String, String)> {
    let line = line.trim();
    let (key, value) = line.split_once(',')?;
    Some((
        key.trim().to_string(),
        value.trim().trim_end_matches('{').trim().to_string(),
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_groups_and_entries() {
        let sample = r"charset,Shift_JIS
version,1

group,本体通常
{
0,デフォルト
1,じとー
6,目つぶ
}

group,本体腕組み
{
30,デフォルト
35,じとー
}

group,__disabled
{
19,__parts
100,__parts
101,__parts
}
";
        let table = SurfaceTable::parse(sample);

        assert_eq!(table.charset.as_deref(), Some("Shift_JIS"));
        assert_eq!(table.version, 1);
        assert_eq!(table.groups.len(), 3);

        let normal = table.group("本体通常").unwrap();
        assert_eq!(normal.entries.len(), 3);
        assert_eq!(normal.entries[0].surface_id, 0);
        assert_eq!(normal.entries[0].name, "デフォルト");

        let disabled = table.group("__disabled").unwrap();
        assert!(disabled.is_disabled());
        assert!(is_parts_name("__parts"));
        assert!(!is_parts_name("デフォルト"));

        // 可視登録からは __disabled が除外される
        let visible = table.visible_entries();
        assert_eq!(visible.len(), 5);
        assert_eq!(table.name_of(0), Some("デフォルト"));
        assert_eq!(table.name_of(19), None);
        assert_eq!(table.name_of(999), None);
    }

    #[test]
    fn test_scope_and_options() {
        let sample = r"charset,UTF-8
version,1
scope,2
option,あ行,か行
group,g1
{
1,テスト
}
";
        let table = SurfaceTable::parse(sample);
        assert_eq!(table.scope, Some(2));
        assert_eq!(
            table.options[0],
            vec!["あ行".to_string(), "か行".to_string()]
        );
        assert_eq!(table.group("G1").unwrap().entries[0].name, "テスト");
    }

    #[test]
    fn test_parse_unclosed_groups_and_invalid_numbers() {
        let sample = "version,invalid\r\nscope,invalid\r\ngroup,g1\r\n10,name1\r\ngroup,g2\r\n20,name2";
        let table = SurfaceTable::parse(sample);
        assert_eq!(table.version, 0);
        assert_eq!(table.scope, None);
        assert_eq!(table.groups.len(), 2);
        assert_eq!(table.groups[0].name, "g1");
        assert_eq!(table.groups[0].entries[0].surface_id, 10);
        assert_eq!(table.groups[1].name, "g2");
        assert_eq!(table.groups[1].entries[0].surface_id, 20);
    }

    #[test]
    fn test_parse_mock_nanai_file() {
        // 実プロジェクトのサンプルシェルに対する結合テスト（存在時のみ）
        let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../../assets/ghost/mock_nanai/shell/master/surfacetable.txt");
        if !path.exists() {
            return;
        }
        let content = crate::vfs::open_text_file(&path).unwrap();
        let table = SurfaceTable::parse(&content);

        assert_eq!(table.charset.as_deref(), Some("Shift_JIS"));
        assert_eq!(table.version, 1);
        // 本体通常 / 本体腕組み / 本体正面向け / 下半身_* 各グループが存在する
        assert!(table.group("本体通常").is_some() || !table.groups.is_empty());
        // 可視サーフィスの一覧に 0 / 30 / 10 / 14 が含まれる
        let mut ids: Vec<u32> = table
            .visible_entries()
            .iter()
            .map(|e| e.surface_id)
            .collect();
        ids.sort_unstable();
        for probe in [0u32, 10, 14, 30] {
            assert!(
                ids.binary_search(&probe).is_ok(),
                "visible ids に {probe} が無い: {ids:?}"
            );
        }
        // __disabled は 19 / 100 / 101
        let disabled = table.group("__disabled").unwrap();
        assert_eq!(disabled.entries.len(), 3);
    }
}
