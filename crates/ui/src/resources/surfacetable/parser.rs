use super::types::{SurfTableEntry, SurfTableGroup, SurfaceTable};

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
