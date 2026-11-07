//! 描画メソッドの型

use super::interval::parse_id_list_inner;
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
    /// `scaling`：表示倍率の動的変更 (scale_x, scale_y)
    Scaling,
    /// `insert`：アニメーションパターン挿入
    Insert,
    /// `start`：指定IDのアニメーションを開始
    Start(Option<u32>),
    /// `stop`：指定IDのアニメーションを停止
    Stop(Option<u32>),
    /// `alternativestart`：指定ID群の中からランダムに1つ開始
    AlternativeStart(Vec<u32>),
    /// `alternativestop`：指定ID群の中からランダムに1つ停止
    AlternativeStop(Vec<u32>),
    /// `parallelstart`：指定ID群のすべてのアニメーションを開始
    ParallelStart(Vec<u32>),
    /// `parallelstop`：指定ID群のすべてのアニメーションを停止
    ParallelStop(Vec<u32>),
    /// `reduce`：ベースレイヤと新規レイヤの不透明度（アルファ）を乗算合成
    Reduce,
    /// `blend-xxx`：各種アルファブレンド合成（例: `blend-multiply`）
    Blend(String),
    /// その他の拡張メソッド（`import` 等）
    Custom(String),
}

impl DrawMethod {
    /// 文字列から描画メソッドを構築する（大文字小文字は無視）
    pub fn parse(method: &str) -> Self {
        let m = method.trim();
        let lower = m.to_lowercase();
        match lower.as_str() {
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
            "scaling" => Self::Scaling,
            "insert" => Self::Insert,
            "reduce" => Self::Reduce,
            "overlaymultiply" => Self::Blend("multiply-fast".to_string()),
            "overlayscreen" => Self::Blend("screen-fast".to_string()),
            s if s.starts_with("blend-") => Self::Blend(s.trim_start_matches("blend-").to_string()),
            s if s.starts_with("start") => {
                let rest = s.trim_start_matches("start").trim();
                let ids = parse_id_list_inner(rest);
                Self::Start(ids.first().copied())
            }
            s if s.starts_with("stop") => {
                let rest = s.trim_start_matches("stop").trim();
                let ids = parse_id_list_inner(rest);
                Self::Stop(ids.first().copied())
            }
            s if s.starts_with("alternativestart") => {
                let rest = s.trim_start_matches("alternativestart").trim();
                Self::AlternativeStart(parse_id_list_inner(rest))
            }
            s if s.starts_with("alternativestop") => {
                let rest = s.trim_start_matches("alternativestop").trim();
                Self::AlternativeStop(parse_id_list_inner(rest))
            }
            s if s.starts_with("parallelstart") => {
                let rest = s.trim_start_matches("parallelstart").trim();
                Self::ParallelStart(parse_id_list_inner(rest))
            }
            s if s.starts_with("parallelstop") => {
                let rest = s.trim_start_matches("parallelstop").trim();
                Self::ParallelStop(parse_id_list_inner(rest))
            }
            other => Self::Custom(other.to_string()),
        }
    }
}
