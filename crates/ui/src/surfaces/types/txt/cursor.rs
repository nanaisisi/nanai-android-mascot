use serde::{Deserialize, Serialize};

/// `*.cursor` ブロック内の1登録（イベント種別、対象当たり判定名、カーソル指定）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CursorDefinition {
    /// イベント種別（mouseup, mousedown, mouserightdown, mousewheel, mousehover）
    pub event: String,
    /// 当たり判定ID/名称（Head, Bust等）
    pub collision: String,
    /// システムカーソル名（`system:hand`, `system:finger` 等）または画像ファイルパス
    pub cursor: String,
}
