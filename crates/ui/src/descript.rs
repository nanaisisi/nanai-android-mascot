use std::collections::{BTreeMap, HashMap};

/// シェル descript の `[target].defaultx/y/left/top`（基準位置）#[derive(Debug, Clone, Default)]
pub struct CharDefaults {
    pub x: Option<i32>,
    pub y: Option<i32>,
    pub left: Option<i32>,
    pub top: Option<i32>,
}

/// `[target].bindoption.group`（着せ替え選択の挙動設定）
#[derive(Debug, Clone, Default)]
pub struct BindOptionGroup {
    /// メニューに表示するカテゴリ名
    pub category: String,
    /// `mustselect` / `multiple` 等
    pub options: Vec<String>,
}

#[derive(Debug, Clone, Default)]
/// `[target].bindgroup[N]` の着せ替えパーツ定義
pub struct BindGroup {
    /// 対応する SHEIKO アニメーションID（着せ替え番号）
    pub number: u32,
    /// メニューに表示するカテゴリ名（`bindgroup[N].name` 第1パラメータ）
    pub category: String,
    /// パーツ名（`bindgroup[N].name` 第2パラメータ）
    pub part: String,
    /// サムネイル画像ファイル名（省略可）
    pub thumbnail: Option<String>,
    /// `bindgroup[N].default,1` 設定（初期装着）
    pub default: bool,
    /// `bindgroup[N].addid` 追加装着アニメーションID列
    pub add_ids: Vec<u32>,
}

/// カンマ区切りの数値リスト（範囲対応 `0-9` 含む）をパースする
fn expand_ids(value: &str) -> Vec<u32> {
    let mut out = Vec::new();
    for part in value.split(',') {
        let part = part.trim().trim_start_matches('[').trim_end_matches(']');
        if let Some((start, end)) = part.split_once('-')
            && let (Ok(s), Ok(e)) = (start.trim().parse::<u32>(), end.trim().parse::<u32>())
            && s <= e
        {
            out.extend(s..=e);
            continue;
        }
        if let Ok(n) = part.parse::<u32>() {
            out.push(n);
        }
    }
    out
}

/// `descript.txt` のパース結果を保持する構造体
#[derive(Debug, Clone, Default)]
pub struct Descript {
    pub properties: HashMap<String, String>,
}

impl Descript {
    /// テキスト内容から `descript.txt` をパース
    pub fn parse(content: &str) -> Self {
        let mut properties = HashMap::new();
        for line in content.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() || trimmed.starts_with('#') || trimmed.starts_with("//") {
                continue;
            }
            if let Some((k, v)) = trimmed.split_once(',') {
                properties.insert(k.trim().to_lowercase(), v.trim().to_string());
            }
        }
        Self { properties }
    }

    /// キーに対応する値を取得（大文字小文字無視）
    pub fn get(&self, key: &str) -> Option<&String> {
        self.properties.get(&key.to_lowercase())
    }

    /// ゴースト/シェル名（`name` キー）
    pub fn name(&self) -> Option<&String> {
        self.get("name")
    }

    /// キャラクター本体名（`kero.name` または `sakura.name`）
    pub fn sakura_name(&self) -> Option<&String> {
        self.get("sakura.name")
    }
    /// 相方名（`kero.name`）
    pub fn kero_name(&self) -> Option<&String> {
        self.get("kero.name")
    }

    /// ネットワーク更新URL（`homeurl` キー）
    pub fn homeurl(&self) -> Option<&String> {
        self.get("homeurl")
    }

    /// バルーン用原点座標 (origin.x, origin.y)
    pub fn origin(&self) -> (Option<i32>, Option<i32>) {
        let x = self.get("origin.x").and_then(|v| v.parse().ok());
        let y = self.get("origin.y").and_then(|v| v.parse().ok());
        (x, y)
    }

    /// バルーン有効テキスト領域 (validrect.left, top, right, bottom)
    pub fn validrect(&self) -> (Option<i32>, Option<i32>, Option<i32>, Option<i32>) {
        let l = self.get("validrect.left").and_then(|v| v.parse().ok());
        let t = self.get("validrect.top").and_then(|v| v.parse().ok());
        let r = self.get("validrect.right").and_then(|v| v.parse().ok());
        let b = self.get("validrect.bottom").and_then(|v| v.parse().ok());
        (l, t, r, b)
    }

    /// バルーンフォント色 (`font.color.r,g,b` または `font.color`)
    pub fn font_color(&self) -> Option<&String> {
        self.get("font.color")
    }

    /// トレイ/アプリアイコン画像パス (`icon` キー)
    pub fn icon(&self) -> Option<&String> {
        self.get("icon")
    }

    /// 作者/作者Web (`craftman` / `craftmanw` キー)
    pub fn craftmanw(&self) -> Option<&String> {
        self.get("craftmanw").or_else(|| self.get("craftman"))
    }

    /// 作者Webページ (`craftmanurl` キー)
    pub fn craftmanurl(&self) -> Option<&String> {
        self.get("craftmanurl")
    }

    /// ウィンドウ種別 (`type` キー: ghost / shell / balloon / headline / plugin)
    pub fn type_(&self) -> Option<&String> {
        self.get("type")
    }

    /// さくら（本体）の正式名とサブ表示名（`sakura.name`, `sakura.name2`）
    pub fn sakura_names(&self) -> (Option<&String>, Option<&String>) {
        (self.get("sakura.name"), self.get("sakura.name2"))
    }

    /// `[target].defaultx`, `defaulty`, `defaultleft`, `defaulttop`（sakura/kero/charN）
    pub fn char_defaults(&self, target: &str) -> CharDefaults {
        CharDefaults {
            x: self.get(&format!("{target}.defaultx")).and_then(|v| v.parse().ok()),
            y: self.get(&format!("{target}.defaulty")).and_then(|v| v.parse().ok()),
            left: self.get(&format!("{target}.defaultleft")).and_then(|v| v.parse().ok()),
            top: self.get(&format!("{target}.defaulttop")).and_then(|v| v.parse().ok()),
        }
    }

    /// `[target].bindoption.group,[カテゴリ名],[オプション...]`（着せ替えグループ設定）
    pub fn bindoption_group(&self, target: &str) -> Option<BindOptionGroup> {
        let value = self.get(&format!("{target}.bindoption.group"))?;
        let mut parts = value.split(',').map(str::trim);
        let Some(category) = parts.next() else {
            return None;
        };
        let options: Vec<String> = parts.map(str::to_string).collect();
        Some(BindOptionGroup {
            category: category.to_string(),
            options,
        })
    }

    /// `[target].bindgroup[N].name/default/addid`（着せ替えパーツ定義）をパースする
    pub fn bind_groups(&self, target: &str) -> Vec<BindGroup> {
        let prefix = format!("{target}.bindgroup");
        let mut groups: BTreeMap<u32, BindGroup> = BTreeMap::new();
        for (key, value) in &self.properties {
            let Some(rest) = key.strip_prefix(&prefix) else {
                continue;
            };
            let mut splits = rest.splitn(2, '.');
            let Some(number) = splits.next().and_then(|n| n.parse::<u32>().ok()) else {
                continue;
            };
            let field = splits.next().unwrap_or("name");
            if number == 0 {
                continue;
            }
            let entry = groups.entry(number).or_insert_with(|| BindGroup {
                number,
                ..BindGroup::default()
            });
            match field {
                "name" => {
                    let mut parts = value.splitn(3, ',').map(str::trim);
                    entry.category = parts.next().unwrap_or("").to_string();
                    entry.part = parts.next().unwrap_or("").to_string();
                    entry.thumbnail = parts
                        .next()
                        .filter(|s| !s.is_empty())
                        .map(str::to_string);
                }
                "default" => {
                    entry.default = value.trim() == "1";
                }
                "addid" => {
                    entry.add_ids = expand_ids(value);
                }
                _ => {}
            }
        }
        groups.into_values().collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_descript_shell_extensions() {
        let sample = "type,shell\r\ncraftmanurl,https://example.ukagaka\r\n\
            sakura.defaultx,120\r\nsakura.defaulty,240\r\n\
            sakura.bindoption.group,服,multiple\r\n\
            sakura.bindgroup100.name,服,和服,thumb.png\r\n\
            sakura.bindgroup100.default,1\r\n\
            sakura.bindgroup100.addid,101,102\r\n\
            kero.bindgroup200.name,帽子,ヘッドドレス\r\n";
        let desc = Descript::parse(sample);

        assert_eq!(desc.type_().map(|s| s.as_str()), Some("shell"));
        assert_eq!(
            desc.craftmanurl().map(|s| s.as_str()),
            Some("https://example.ukagaka")
        );
        let defaults = desc.char_defaults("sakura");
        assert_eq!(defaults.x, Some(120));
        assert_eq!(defaults.y, Some(240));

        let option = desc.bindoption_group("sakura").unwrap();
        assert_eq!(option.category, "服");
        assert_eq!(option.options, vec!["multiple".to_string()]);

        let sakura_groups = desc.bind_groups("sakura");
        assert_eq!(sakura_groups.len(), 1);
        let g = &sakura_groups[0];
        assert_eq!(g.number, 100);
        assert_eq!(g.category, "服");
        assert_eq!(g.part, "和服");
        assert_eq!(g.thumbnail.as_deref(), Some("thumb.png"));
        assert!(g.default);
        assert_eq!(g.add_ids, [101u32, 102]);

        let kero_groups = desc.bind_groups("kero");
        assert_eq!(kero_groups.len(), 1);
        assert_eq!(kero_groups[0].part, "ヘッドドレス");
    }

    #[test]
    fn test_expand_ids_ranges() {
        assert_eq!(expand_ids("0-2,9"), vec![0, 1, 2, 9]);
        assert!(expand_ids("abc").is_empty());
    }
}


