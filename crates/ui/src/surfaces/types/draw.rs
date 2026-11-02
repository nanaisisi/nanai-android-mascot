//! 描画メソッド・アニメーションインターバルの型

use serde::{Deserialize, Serialize};

/// `element[N]` / `animation[N].pattern[K]` の第1パラメータ（描画メソッド）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum DrawMethod {
    /// `base`：下地として描画する
    Base,
    /// `overlay`：現在の絵の上に重ねる
    Overlay,
    /// `overlayfast`（`fast`）: 下の同一領域を消して重ねる
    OverlayFast,
    /// `interpolate`：下の絵と同一色の部分を透過して重ねる
    Interpolate,
    /// `replace`：既存要素を差し替える
    Replace,
    /// `add`：着せ替え用パーツの追加（overlay 相当）
    Add,
    /// `bind`：着せ替えパーツのトグル
    Bind,
    /// `asis`：透過処理を行わずそのまま描画
    AsIs,
    /// `auto`：画像フォーマットに応じて自動判定
    Auto,
    /// `move`：表示位置の移動
    Move,
    /// `insert`：アニメーションパターン挿入
    Insert,
    /// `blend-xxx`：各種アルファブレンド合成（例: `blend-multiply`）
    Blend(String),
    /// その他の拡張メソッド（`start` / `stop` / `import` 等）
    Custom(String),
}

impl DrawMethod {
    /// 文字列から描画メソッドを構築する（大文字小文字は無視）
    pub fn parse(method: &str) -> Self {
        let m = method.trim().to_lowercase();
        match m.as_str() {
            "base" => Self::Base,
            "overlay" => Self::Overlay,
            "overlayfast" | "fast" | "overlay-fast" => Self::OverlayFast,
            "interpolate" => Self::Interpolate,
            "replace" => Self::Replace,
            "add" => Self::Add,
            "bind" => Self::Bind,
            "asis" => Self::AsIs,
            "auto" => Self::Auto,
            "move" => Self::Move,
            "insert" => Self::Insert,
            s if s.starts_with("blend-") => Self::Blend(s.trim_start_matches("blend-").to_string()),
            other => Self::Custom(other.to_string()),
        }
    }
}

/// `animation[N].interval` の種別（ukadoc: h-animationinterval 系）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Interval {
    /// `always`：常時ループ
    Always,
    /// `sometimes`：短い乱数周期で発火（約数秒に1回程度）
    Sometimes,
    /// `rarely`：まれに発火（より長い乱数周期）
    Rarely,
    /// `random,N`：約N秒に1回の割合で発火
    Random(u32),
    /// `periodic,N`：一定周期（Nミリ秒）ごとに発火
    Periodic(u32),
    /// `runonce`：サーフィス切替時に必ず1回だけ実行
    RunOnce,
    /// `never`：自動発火しない（SHIORI からの強制実行用）
    Never,
    /// `bind`：着せ替えパーツ装着時に発火
    Bind,
    /// `talk`：発話中ループ
    Talk,
    /// `starttalk`：発話開始時に1回
    StartTalk,
    /// `endtalk`：発話終了時に1回
    EndTalk,
    /// `\e`（yen-e）：さくらスクリプト `\e` 到達時に強制実行
    YenE,
    /// その他の拡張種別
    Custom(String),
}

impl Interval {
    /// `random,3` / `periodic,1000` のような値を解析する（大文字小文字は無視）
    pub fn parse(value: &str) -> Self {
        let v = value.trim();
        let lower = v.to_lowercase();
        let (head, param) = if let Some((h, p)) = lower.split_once(',') {
            (h.trim(), Some(p.trim().to_string()))
        } else {
            (lower.as_str(), None)
        };
        match head {
            "always" => Self::Always,
            "sometimes" => Self::Sometimes,
            "rarely" => Self::Rarely,
            "never" => Self::Never,
            "runonce" => Self::RunOnce,
            "bind" => Self::Bind,
            "talk" => Self::Talk,
            "starttalk" => Self::StartTalk,
            "endtalk" => Self::EndTalk,
            "\\e" | "/e" => Self::YenE,
            "random" => Self::Random(param.and_then(|p| p.parse().ok()).unwrap_or(10)),
            "periodic" => Self::Periodic(param.and_then(|p| p.parse().ok()).unwrap_or(1000)),
            other => Self::Custom(other.to_string()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_draw_method_parse_standard_variants() {
        assert_eq!(DrawMethod::parse("base"), DrawMethod::Base);
        assert_eq!(DrawMethod::parse("overlay"), DrawMethod::Overlay);
        assert_eq!(DrawMethod::parse("overlayfast"), DrawMethod::OverlayFast);
        assert_eq!(DrawMethod::parse("fast"), DrawMethod::OverlayFast);
        assert_eq!(DrawMethod::parse("overlay-fast"), DrawMethod::OverlayFast);
        assert_eq!(DrawMethod::parse("interpolate"), DrawMethod::Interpolate);
        assert_eq!(DrawMethod::parse("replace"), DrawMethod::Replace);
        assert_eq!(DrawMethod::parse("add"), DrawMethod::Add);
        assert_eq!(DrawMethod::parse("bind"), DrawMethod::Bind);
        assert_eq!(DrawMethod::parse("asis"), DrawMethod::AsIs);
        assert_eq!(DrawMethod::parse("auto"), DrawMethod::Auto);
        assert_eq!(DrawMethod::parse("move"), DrawMethod::Move);
        assert_eq!(DrawMethod::parse("insert"), DrawMethod::Insert);
    }

    #[test]
    fn test_draw_method_parse_blend_modes() {
        assert_eq!(
            DrawMethod::parse("blend-multiply"),
            DrawMethod::Blend("multiply".to_string())
        );
        assert_eq!(
            DrawMethod::parse("blend-add"),
            DrawMethod::Blend("add".to_string())
        );
        assert_eq!(
            DrawMethod::parse("blend-screen"),
            DrawMethod::Blend("screen".to_string())
        );
        assert_eq!(
            DrawMethod::parse("blend-overlay"),
            DrawMethod::Blend("overlay".to_string())
        );
        assert_eq!(
            DrawMethod::parse("blend-"),
            DrawMethod::Blend("".to_string())
        );
    }

    #[test]
    fn test_draw_method_parse_custom_and_fallback() {
        assert_eq!(
            DrawMethod::parse("start"),
            DrawMethod::Custom("start".to_string())
        );
        assert_eq!(
            DrawMethod::parse("stop"),
            DrawMethod::Custom("stop".to_string())
        );
        assert_eq!(
            DrawMethod::parse("random_unknown"),
            DrawMethod::Custom("random_unknown".to_string())
        );
        assert_eq!(DrawMethod::parse(""), DrawMethod::Custom("".to_string()));
        assert_eq!(DrawMethod::parse("   "), DrawMethod::Custom("".to_string()));
    }

    #[test]
    fn test_draw_method_parse_case_insensitivity_and_whitespace() {
        assert_eq!(DrawMethod::parse("BASE"), DrawMethod::Base);
        assert_eq!(DrawMethod::parse("OverLay"), DrawMethod::Overlay);
        assert_eq!(DrawMethod::parse("FAST"), DrawMethod::OverlayFast);
        assert_eq!(DrawMethod::parse("OVERLAY-FAST"), DrawMethod::OverlayFast);
        assert_eq!(DrawMethod::parse("INTERPOLATE"), DrawMethod::Interpolate);
        assert_eq!(DrawMethod::parse("REPLACE"), DrawMethod::Replace);
        assert_eq!(DrawMethod::parse("ADD"), DrawMethod::Add);
        assert_eq!(DrawMethod::parse("BIND"), DrawMethod::Bind);
        assert_eq!(DrawMethod::parse("ASIS"), DrawMethod::AsIs);
        assert_eq!(DrawMethod::parse("AUTO"), DrawMethod::Auto);
        assert_eq!(DrawMethod::parse("MOVE"), DrawMethod::Move);
        assert_eq!(DrawMethod::parse("INSERT"), DrawMethod::Insert);
        assert_eq!(
            DrawMethod::parse("BLEND-MULTIPLY"),
            DrawMethod::Blend("multiply".to_string())
        );
        assert_eq!(DrawMethod::parse("  base  "), DrawMethod::Base);
        assert_eq!(DrawMethod::parse("\toverlay\n"), DrawMethod::Overlay);
        assert_eq!(
            DrawMethod::parse("  blend-dodge  "),
            DrawMethod::Blend("dodge".to_string())
        );
        assert_eq!(
            DrawMethod::parse("  CUSTOM_NAME  "),
            DrawMethod::Custom("custom_name".to_string())
        );
    }

    #[test]
    fn test_interval_parse_all_cases() {
        assert_eq!(Interval::parse("always"), Interval::Always);
        assert_eq!(Interval::parse("sometimes"), Interval::Sometimes);
        assert_eq!(Interval::parse("rarely"), Interval::Rarely);
        assert_eq!(Interval::parse("never"), Interval::Never);
        assert_eq!(Interval::parse("runonce"), Interval::RunOnce);
        assert_eq!(Interval::parse("bind"), Interval::Bind);
        assert_eq!(Interval::parse("talk"), Interval::Talk);
        assert_eq!(Interval::parse("starttalk"), Interval::StartTalk);
        assert_eq!(Interval::parse("endtalk"), Interval::EndTalk);
        assert_eq!(Interval::parse(r"\e"), Interval::YenE);
        assert_eq!(Interval::parse("/e"), Interval::YenE);
        assert_eq!(Interval::parse("random,5"), Interval::Random(5));
        assert_eq!(Interval::parse("random"), Interval::Random(10));
        assert_eq!(Interval::parse("random,invalid"), Interval::Random(10));
        assert_eq!(Interval::parse("periodic,200"), Interval::Periodic(200));
        assert_eq!(Interval::parse("periodic"), Interval::Periodic(1000));
        assert_eq!(Interval::parse("periodic,bad"), Interval::Periodic(1000));
        assert_eq!(
            Interval::parse("unknown"),
            Interval::Custom("unknown".to_string())
        );
    }
}
