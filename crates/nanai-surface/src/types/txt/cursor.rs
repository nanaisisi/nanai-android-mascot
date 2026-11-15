use serde::{Deserialize, Serialize};

/// `*.cursor` ブロック内の1登録（イベント種別、対象当たり判定名、カーソル指定）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CursorDefinition {
    pub(crate) event: String,
    pub(crate) collision: String,
    pub(crate) cursor: String,
}

#[allow(dead_code)]
impl CursorDefinition {
    // Add getter methods
    pub fn event(&self) -> &str {
        &self.event
    }
    pub fn collision(&self) -> &str {
        &self.collision
    }
    pub fn cursor(&self) -> &str {
        &self.cursor
    }

    pub fn new(
        event: impl Into<String>,
        collision: impl Into<String>,
        cursor: impl Into<String>,
    ) -> Self {
        Self {
            event: event.into(),
            collision: collision.into(),
            cursor: cursor.into(),
        }
    }
}
