//! 個別ファイルのアップデートエントリモデル (`UpdateEntry`)

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub struct UpdateEntry {
    pub(crate) path: String,
    pub(crate) md5: String,
    pub(crate) size: Option<u64>,
    #[serde(default)]
    pub(crate) is_delete: bool,
    #[serde(default)]
    pub(crate) is_ignore: bool,
    #[serde(default)]
    pub(crate) is_readonly: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(crate) date: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub(crate) flags: Vec<String>,
}

#[allow(dead_code)]
impl UpdateEntry {
    pub fn path(&self) -> &str {
        &self.path
    }
    pub fn md5(&self) -> &str {
        &self.md5
    }
    pub fn size(&self) -> Option<u64> {
        self.size
    }
    pub fn is_delete_flag(&self) -> bool {
        self.is_delete
    }
    pub fn is_ignore_flag(&self) -> bool {
        self.is_ignore
    }
    pub fn is_readonly_flag(&self) -> bool {
        self.is_readonly
    }
    pub fn date(&self) -> Option<&str> {
        self.date.as_deref()
    }
    pub fn flags(&self) -> &[String] {
        &self.flags
    }

    /// 削除対象 (`delete` フラグ指定) かどうか判定
    pub fn is_delete(&self) -> bool {
        self.flags.iter().any(|f| f.eq_ignore_ascii_case("delete"))
    }

    /// 更新除外対象 (`ignore` フラグ指定) かどうか判定
    pub fn is_ignore(&self) -> bool {
        self.flags.iter().any(|f| f.eq_ignore_ascii_case("ignore"))
    }

    /// 読取専用 (`readonly` フラグ指定) かどうか判定
    pub fn is_readonly(&self) -> bool {
        self.flags
            .iter()
            .any(|f| f.eq_ignore_ascii_case("readonly"))
    }
}
