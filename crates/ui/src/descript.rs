use std::collections::HashMap;

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
}
