//! descript.txt プロパティマニフェストモデル定義

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tsify::Tsify;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub struct DescriptManifest {
    pub(crate) properties: BTreeMap<String, String>,
}

impl DescriptManifest {
    pub fn properties(&self) -> &BTreeMap<String, String> {
        &self.properties
    }

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
        let x = self
            .get("sakura.defaultx")
            .and_then(|v| v.parse::<i32>().ok());
        let y = self
            .get("sakura.defaulty")
            .and_then(|v| v.parse::<i32>().ok());
        match (x, y) {
            (Some(px), Some(py)) => Some((px, py)),
            _ => None,
        }
    }

    /// Kero側のデフォルト座標 (`kero.defaultx`, `kero.defaulty`)
    pub fn kero_default_pos(&self) -> Option<(i32, i32)> {
        let x = self
            .get("kero.defaultx")
            .and_then(|v| v.parse::<i32>().ok());
        let y = self
            .get("kero.defaulty")
            .and_then(|v| v.parse::<i32>().ok());
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
        let l = self
            .get("validrect.left")
            .and_then(|v| v.parse::<i32>().ok())
            .unwrap_or(0);
        let t = self
            .get("validrect.top")
            .and_then(|v| v.parse::<i32>().ok())
            .unwrap_or(0);
        let r = self
            .get("validrect.right")
            .and_then(|v| v.parse::<i32>().ok());
        let b = self
            .get("validrect.bottom")
            .and_then(|v| v.parse::<i32>().ok());
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
        self.get("wordwrappoint.x")
            .and_then(|v| v.parse::<i32>().ok())
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

    /// デスクトップ位置揃え設定 (`seriko.alignmenttodesktop`, `sakura.seriko.alignmenttodesktop`, `kero.seriko.alignmenttodesktop`)
    pub fn alignment_to_desktop(&self) -> Option<&str> {
        self.get("seriko.alignmenttodesktop")
            .or_else(|| self.get("sakura.seriko.alignmenttodesktop"))
            .or_else(|| self.get("kero.seriko.alignmenttodesktop"))
    }

    /// Kero側デスクトップ位置揃え設定 (`kero.seriko.alignmenttodesktop`)
    pub fn kero_alignment_to_desktop(&self) -> Option<&str> {
        self.get("kero.seriko.alignmenttodesktop")
    }

    /// [seriko.defaultsurfacedirectoryname,ディレクトリ名]: デフォルトサーフィスディレクトリ名
    pub fn default_surface_directory_name(&self) -> Option<&str> {
        self.get("seriko.defaultsurfacedirectoryname")
    }

    /// SSTP COMMUNICATE 許可判定 (`sstp.allowcommunicate`)
    pub fn is_sstp_communicate_allowed(&self) -> bool {
        self.get("sstp.allowcommunicate")
            .map(|v| v != "0" && v != "false")
            .unwrap_or(true)
    }

    /// [char*.name,名前]: キャラクター別名前
    pub fn char_name(&self, index: u32) -> Option<&str> {
        let key = format!("char{}.name", index);
        self.get(&key)
    }

    /// [char*.seriko.defaultsurface,数値], [char*.balloon.defaultsurface,数値]: キャラクター別デフォルトサーフィスID
    pub fn char_default_surface(&self, index: u32) -> Option<i32> {
        let key1 = format!("char{}.seriko.defaultsurface", index);
        let key2 = format!("char{}.defaultsurface", index);
        self.get(&key1)
            .or_else(|| self.get(&key2))
            .and_then(|v| v.parse::<i32>().ok())
    }

    /// [char*.defaultx,X座標], [char*.defaulty,Y座標], [char*.defaultleft,X座標], [char*.defaulttop,Y座標]: キャラクター別デフォルト座標
    pub fn char_default_pos(&self, index: u32) -> Option<(i32, i32)> {
        let x_key1 = format!("char{}.defaultx", index);
        let x_key2 = format!("char{}.defaultleft", index);
        let y_key1 = format!("char{}.defaulty", index);
        let y_key2 = format!("char{}.defaulttop", index);
        let x = self.get(&x_key1).or_else(|| self.get(&x_key2)).and_then(|v| v.parse::<i32>().ok())?;
        let y = self.get(&y_key1).or_else(|| self.get(&y_key2)).and_then(|v| v.parse::<i32>().ok())?;
        Some((x, y))
    }

    /// [char*.seriko.alignmenttodesktop,位置情報]: キャラクター別デスクトップ位置揃え設定
    pub fn char_alignment_to_desktop(&self, index: u32) -> Option<&str> {
        let key = format!("char{}.seriko.alignmenttodesktop", index);
        self.get(&key)
    }

    /// [don't need onmousemove,数値]: `don't need onmousemove` 判定
    pub fn dont_need_onmousemove(&self) -> bool {
        self.get("don't need onmousemove")
            .map(|v| v == "1" || v.eq_ignore_ascii_case("true"))
            .unwrap_or(false)
    }

    /// [don't need bind,数値]: `don't need bind` 判定
    pub fn dont_need_bind(&self) -> bool {
        self.get("don't need bind")
            .map(|v| v == "1" || v.eq_ignore_ascii_case("true"))
            .unwrap_or(false)
    }

    /// [don't need seriko talk,数値]: `don't need seriko talk` 判定
    pub fn dont_need_seriko_talk(&self) -> bool {
        self.get("don't need seriko talk")
            .map(|v| v == "1" || v.eq_ignore_ascii_case("true"))
            .unwrap_or(false)
    }

    /// [name.allowoverride,数値]: シェル名オーバーライド許可判定 (既定値 1)
    pub fn is_name_allow_override(&self) -> bool {
        self.get("name.allowoverride")
            .map(|v| v != "0" && v != "false")
            .unwrap_or(true)
    }
}
