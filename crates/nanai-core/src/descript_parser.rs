//! descript.txt (UKADOC / SSP 仕様準拠) 高速パーサー & プロパティ辞書エンジン

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tsify::Tsify;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct DescriptManifest {
    pub properties: BTreeMap<String, String>,
}

impl DescriptManifest {
    pub fn get(&self, key: &str) -> Option<&str> {
        self.properties.get(&key.to_lowercase()).map(|s| s.as_str())
    }

    /// ゴースト / シェル / バルーン等の名称 (`name`)
    pub fn name(&self) -> Option<&str> {
        self.get("name")
    }

    /// リソース種別 (`type`)
    pub fn resource_type(&self) -> Option<&str> {
        self.get("type")
    }

    /// SHIORI モジュール名 (`shiori`)
    pub fn shiori(&self) -> Option<&str> {
        self.get("shiori").or_else(|| self.get("shiori.dll"))
    }

    /// 作者名 (`craftman` または `author`)
    pub fn craftman(&self) -> Option<&str> {
        self.get("craftman").or_else(|| self.get("author"))
    }

    /// ホームページURL (`homeurl`)
    pub fn home_url(&self) -> Option<&str> {
        self.get("homeurl")
    }

    /// 文字コード設定 (`charset`)
    pub fn charset(&self) -> Option<&str> {
        self.get("charset")
    }

    /// 表示名 (`title`)
    pub fn title(&self) -> Option<&str> {
        self.get("title")
    }

    /// 桜側キャラクター名 (`sakura.name`)
    pub fn sakura_name(&self) -> Option<&str> {
        self.get("sakura.name")
    }

    /// ケロ側キャラクター名 (`kero.name`)
    pub fn kero_name(&self) -> Option<&str> {
        self.get("kero.name")
    }

    /// SHIORI バージョン (`shiori.version`)
    pub fn shiori_version(&self) -> Option<&str> {
        self.get("shiori.version")
    }

    /// アイコンファイル名 (`icon`)
    pub fn icon(&self) -> Option<&str> {
        self.get("icon")
    }

    /// リードミーファイル名 (`readme`)
    pub fn readme(&self) -> Option<&str> {
        self.get("readme")
    }

    /// インストール受け入れゴースト名一覧 (`install.accept`)
    pub fn accept_list(&self) -> Vec<String> {
        if let Some(val) = self.get("install.accept") {
            val.split(',')
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect()
        } else {
            Vec::new()
        }
    }

    /// Sakura側のデフォルト座標 (`sakura.defaultx`, `sakura.defaulty`)
    pub fn sakura_default_pos(&self) -> Option<(i32, i32)> {
        let x = self.get("sakura.defaultx").and_then(|v| v.parse::<i32>().ok());
        let y = self.get("sakura.defaulty").and_then(|v| v.parse::<i32>().ok());
        match (x, y) {
            (Some(px), Some(py)) => Some((px, py)),
            _ => None,
        }
    }

    /// Kero側のデフォルト座標 (`kero.defaultx`, `kero.defaulty`)
    pub fn kero_default_pos(&self) -> Option<(i32, i32)> {
        let x = self.get("kero.defaultx").and_then(|v| v.parse::<i32>().ok());
        let y = self.get("kero.defaulty").and_then(|v| v.parse::<i32>().ok());
        match (x, y) {
            (Some(px), Some(py)) => Some((px, py)),
            _ => None,
        }
    }

    /// メニュー背景画像ファイル名 (`menu.background.bitmap.filename` または `menu.background.bitmap`)
    pub fn menu_background_bitmap(&self) -> Option<&str> {
        self.get("menu.background.bitmap.filename")
            .or_else(|| self.get("menu.background.bitmap"))
    }

    /// バルーンフォント名 (`font.name`)
    pub fn font_name(&self) -> Option<&str> {
        self.get("font.name")
    }

    /// バルーンフォントサイズ (`font.height`)
    pub fn font_height(&self) -> Option<i32> {
        self.get("font.height").and_then(|v| v.parse::<i32>().ok())
    }

    /// バルーンフォントカラー (RGB) (`font.color.r`, `font.color.g`, `font.color.b`)
    pub fn font_color_rgb(&self) -> Option<(u8, u8, u8)> {
        let r = self.get("font.color.r").and_then(|v| v.parse::<u8>().ok());
        let g = self.get("font.color.g").and_then(|v| v.parse::<u8>().ok());
        let b = self.get("font.color.b").and_then(|v| v.parse::<u8>().ok());
        match (r, g, b) {
            (Some(vr), Some(vg), Some(vb)) => Some((vr, vg, vb)),
            _ => None,
        }
    }

    /// バルーン有効領域矩形 (`validrect.left`, `validrect.top`, `validrect.right`, `validrect.bottom`)
    pub fn valid_rect(&self) -> Option<(i32, i32, i32, i32)> {
        let l = self.get("validrect.left").and_then(|v| v.parse::<i32>().ok()).unwrap_or(0);
        let t = self.get("validrect.top").and_then(|v| v.parse::<i32>().ok()).unwrap_or(0);
        let r = self.get("validrect.right").and_then(|v| v.parse::<i32>().ok());
        let b = self.get("validrect.bottom").and_then(|v| v.parse::<i32>().ok());
        match (r, b) {
            (Some(vr), Some(vb)) => Some((l, t, vr, vb)),
            _ => None,
        }
    }

    /// バルーン原点座標 (`origin.x`, `origin.y`)
    pub fn origin_pos(&self) -> Option<(i32, i32)> {
        let x = self.get("origin.x").and_then(|v| v.parse::<i32>().ok());
        let y = self.get("origin.y").and_then(|v| v.parse::<i32>().ok());
        match (x, y) {
            (Some(px), Some(py)) => Some((px, py)),
            _ => None,
        }
    }

    /// バルーン折り返し幅 (`wordwrappoint.x`)
    pub fn word_wrap_point(&self) -> Option<i32> {
        self.get("wordwrappoint.x").and_then(|v| v.parse::<i32>().ok())
    }

    /// 作者URL (`craftmanurl`)
    pub fn craftman_url(&self) -> Option<&str> {
        self.get("craftmanurl")
    }

    /// 作者英語名 (`craftmanw`)
    pub fn craftman_w(&self) -> Option<&str> {
        self.get("craftmanw")
    }

    /// GitHubリポジトリ (`githubrepo`)
    pub fn github_repo(&self) -> Option<&str> {
        self.get("githubrepo")
    }

    /// Sakura側デフォルトサーフィスID (`sakura.seriko.defaultsurface`)
    pub fn sakura_default_surface(&self) -> Option<i32> {
        self.get("sakura.seriko.defaultsurface")
            .or_else(|| self.get("sakura.defaultsurface"))
            .and_then(|v| v.parse::<i32>().ok())
    }

    /// Kero側デフォルトサーフィスID (`kero.seriko.defaultsurface`)
    pub fn kero_default_surface(&self) -> Option<i32> {
        self.get("kero.seriko.defaultsurface")
            .or_else(|| self.get("kero.defaultsurface"))
            .and_then(|v| v.parse::<i32>().ok())
    }

    /// デスクトップ位置揃え設定 (`seriko.alignmenttodesktop`)
    pub fn alignment_to_desktop(&self) -> Option<&str> {
        self.get("seriko.alignmenttodesktop")
            .or_else(|| self.get("sakura.seriko.alignmenttodesktop"))
    }

    /// SSTP COMMUNICATE 許可判定 (`sstp.allowcommunicate`)
    pub fn is_sstp_communicate_allowed(&self) -> bool {
        self.get("sstp.allowcommunicate")
            .map(|v| v != "0" && v != "false")
            .unwrap_or(true)
    }
}

/// descript.txt テキスト文字列を構造化辞書へパース
pub fn parse_descript_text(content: &str) -> DescriptManifest {
    let mut properties = BTreeMap::new();

    for line in content.lines() {
        let line = line.trim();
        // コメント行 (#, //) または空行をスキップ
        if line.is_empty() || line.starts_with('#') || line.starts_with("//") {
            continue;
        }

        if let Some((key, val)) = line.split_once(',') {
            let k = key.trim().to_lowercase();
            let v = val.trim().to_string();
            properties.insert(k, v);
        } else if let Some((key, val)) = line.split_once('=') {
            let k = key.trim().to_lowercase();
            let v = val.trim().to_string();
            properties.insert(k, v);
        }
    }

    DescriptManifest { properties }
}

#[wasm_bindgen]
pub fn wasm_parse_descript(content: &str) -> Result<JsValue, JsValue> {
    let manifest = parse_descript_text(content);
    Ok(serde_wasm_bindgen::to_value(&manifest)?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_descript_text_basic() {
        let content = "type,ghost\nname,Emily\ncraftman,Nanai\nhomeurl,https://example.com\ncharset,Shift_JIS\n# comment\nshiori,yaya.dll\n";
        let manifest = parse_descript_text(content);

        assert_eq!(manifest.get("type"), Some("ghost"));
        assert_eq!(manifest.get("name"), Some("Emily"));
        assert_eq!(manifest.get("craftman"), Some("Nanai"));
        assert_eq!(manifest.get("shiori"), Some("yaya.dll"));

        // Helper methods compliance
        assert_eq!(manifest.resource_type(), Some("ghost"));
        assert_eq!(manifest.name(), Some("Emily"));
        assert_eq!(manifest.craftman(), Some("Nanai"));
        assert_eq!(manifest.shiori(), Some("yaya.dll"));
        assert_eq!(manifest.home_url(), Some("https://example.com"));
        assert_eq!(manifest.charset(), Some("Shift_JIS"));
    }

    #[test]
    fn test_parse_descript_text_equals() {
        let content = "charset=UTF-8\nmenu.background.bitmap=menu_bg.png\n";
        let manifest = parse_descript_text(content);

        assert_eq!(manifest.get("charset"), Some("UTF-8"));
        assert_eq!(manifest.get("menu.background.bitmap"), Some("menu_bg.png"));
    }

    #[test]
    fn test_parse_descript_ukadoc_official_properties() {
        let content = "title,Emily Ghost\nsakura.name,Sakura\nkero.name,Kero\nshiori.version,3.0\nicon,icon.ico\nreadme,readme.txt\ninstall.accept,GhostA, GhostB ,GhostC\ncraftmanurl,https://example.com/author\ncraftmanw,AuthorEn\ngithubrepo,user/repo\nsakura.seriko.defaultsurface,0\nkero.seriko.defaultsurface,10\nseriko.alignmenttodesktop,bottom\nsstp.allowcommunicate,1\n";
        let manifest = parse_descript_text(content);

        assert_eq!(manifest.title(), Some("Emily Ghost"));
        assert_eq!(manifest.sakura_name(), Some("Sakura"));
        assert_eq!(manifest.kero_name(), Some("Kero"));
        assert_eq!(manifest.shiori_version(), Some("3.0"));
        assert_eq!(manifest.icon(), Some("icon.ico"));
        assert_eq!(manifest.readme(), Some("readme.txt"));
        assert_eq!(
            manifest.accept_list(),
            vec!["GhostA".to_string(), "GhostB".to_string(), "GhostC".to_string()]
        );
        assert_eq!(manifest.craftman_url(), Some("https://example.com/author"));
        assert_eq!(manifest.craftman_w(), Some("AuthorEn"));
        assert_eq!(manifest.github_repo(), Some("user/repo"));
        assert_eq!(manifest.sakura_default_surface(), Some(0));
        assert_eq!(manifest.kero_default_surface(), Some(10));
        assert_eq!(manifest.alignment_to_desktop(), Some("bottom"));
        assert!(manifest.is_sstp_communicate_allowed());
    }

    #[test]
    fn test_parse_descript_shell_and_coordinates() {
        let content = "sakura.defaultx,100\nsakura.defaulty,200\nkero.defaultx,300\nkero.defaulty,400\nmenu.background.bitmap.filename,bg.png\n";
        let manifest = parse_descript_text(content);

        assert_eq!(manifest.sakura_default_pos(), Some((100, 200)));
        assert_eq!(manifest.kero_default_pos(), Some((300, 400)));
        assert_eq!(manifest.menu_background_bitmap(), Some("bg.png"));
    }

    #[test]
    fn test_parse_descript_balloon_detailed_properties() {
        let content = "font.name,Meiryo\nfont.height,14\nfont.color.r,255\nfont.color.g,128\nfont.color.b,64\nvalidrect.left,10\nvalidrect.top,20\nvalidrect.right,200\nvalidrect.bottom,150\norigin.x,5\norigin.y,10\nwordwrappoint.x,180\n";
        let manifest = parse_descript_text(content);

        assert_eq!(manifest.font_name(), Some("Meiryo"));
        assert_eq!(manifest.font_height(), Some(14));
        assert_eq!(manifest.font_color_rgb(), Some((255, 128, 64)));
        assert_eq!(manifest.valid_rect(), Some((10, 20, 200, 150)));
        assert_eq!(manifest.origin_pos(), Some((5, 10)));
        assert_eq!(manifest.word_wrap_point(), Some(180));
    }
}
