//! インストールマニフェスト (`InstallManifest`) および同梱リソース設定 (`InstallResourceConfig`)

/// 同梱リソース設定（balloon, headline, plugin, shell, calendar.skin 等）
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub struct InstallResourceConfig {
    pub(crate) resource_type: String,
    pub(crate) target_directory: String,
    pub(crate) source_directory: String,
    pub(crate) refresh: bool,
    pub(crate) refresh_undelete_mask: Vec<String>,
}

#[allow(dead_code)]
impl InstallResourceConfig {
    pub fn resource_type(&self) -> &str {
        &self.resource_type
    }
    pub fn target_directory(&self) -> &str {
        &self.target_directory
    }
    pub fn source_directory(&self) -> &str {
        &self.source_directory
    }
    pub fn refresh(&self) -> bool {
        self.refresh
    }
    pub fn refresh_undelete_mask(&self) -> &[String] {
        &self.refresh_undelete_mask
    }

    pub fn new(
        resource_type: impl Into<String>,
        target_directory: impl Into<String>,
        source_directory: impl Into<String>,
        refresh: bool,
        refresh_undelete_mask: Vec<String>,
    ) -> Self {
        Self {
            resource_type: resource_type.into(),
            target_directory: target_directory.into(),
            source_directory: source_directory.into(),
            refresh,
            refresh_undelete_mask,
        }
    }
}

/// install.txt の解析結果モデル (Slot-15 Contract)
#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub struct InstallManifest {
    pub(crate) name: String,
    pub(crate) install_type: String,
    pub(crate) directory: Option<String>,
    pub(crate) charset: Option<String>,
    pub(crate) accept: Option<String>,
    pub(crate) bootghost: Option<String>,
    pub(crate) refresh: bool,
    pub(crate) refresh_undelete_mask: Vec<String>,
    pub(crate) notice: Option<String>,
    pub(crate) readme: Option<String>,
    pub(crate) execute: Option<String>,
    pub(crate) oninstall_script: Option<String>,
    pub(crate) onuninstall_script: Option<String>,
    pub(crate) bundled_resources: Vec<InstallResourceConfig>,
}

#[allow(dead_code)]
impl InstallManifest {
    pub fn name(&self) -> &str {
        &self.name
    }
    pub fn install_type(&self) -> &str {
        &self.install_type
    }
    pub fn directory(&self) -> Option<&str> {
        self.directory.as_deref()
    }
    pub fn charset(&self) -> Option<&str> {
        self.charset.as_deref()
    }
    pub fn accept(&self) -> Option<&str> {
        self.accept.as_deref()
    }
    pub fn bootghost(&self) -> Option<&str> {
        self.bootghost.as_deref()
    }
    pub fn refresh(&self) -> bool {
        self.refresh
    }
    pub fn refresh_undelete_mask(&self) -> &[String] {
        &self.refresh_undelete_mask
    }
    pub fn notice(&self) -> Option<&str> {
        self.notice.as_deref()
    }
    pub fn readme(&self) -> Option<&str> {
        self.readme.as_deref()
    }
    pub fn execute(&self) -> Option<&str> {
        self.execute.as_deref()
    }
    pub fn oninstall_script(&self) -> Option<&str> {
        self.oninstall_script.as_deref()
    }
    pub fn onuninstall_script(&self) -> Option<&str> {
        self.onuninstall_script.as_deref()
    }
    pub fn bundled_resources(&self) -> &[InstallResourceConfig] {
        &self.bundled_resources
    }

    /// インストール対象種別の正規化 ("ghost", "shell", "balloon" など小文字化)
    pub fn normalized_install_type(&self) -> String {
        self.install_type.trim().to_lowercase()
    }

    /// ターゲットディレクトリ名を取得（未指定時は name をフォールバック）
    pub fn effective_directory(&self) -> &str {
        self.directory.as_deref().unwrap_or(&self.name)
    }

    /// 特定ファイルが refreshundeletemask に合致して保護されるか判定
    pub fn is_refresh_protected(&self, filename: &str) -> bool {
        self.refresh_undelete_mask
            .iter()
            .any(|mask| mask.eq_ignore_ascii_case(filename))
    }

    /// accept 設定に基づき、現在稼働中/対象のゴーストにインストール受入可能か判定
    /// accept 未指定時は常に true
    pub fn is_acceptable_by(&self, ghost_name: &str) -> bool {
        let Some(accept_str) = &self.accept else {
            return true;
        };
        let target = ghost_name.trim();
        accept_str
            .split(',')
            .any(|item| item.trim().eq_ignore_ascii_case(target))
    }

    /// インストール拒否理由を評価 (UKADOC OnInstallRefuse 準拠)
    pub fn evaluate_refusal(&self, current_ghost_name: &str) -> Option<&'static str> {
        if self.name.trim().is_empty() {
            return Some("invalid name");
        }
        if !self.is_acceptable_by(current_ghost_name) {
            return Some("accept failed");
        }
        None
    }

    /// 同梱リソースを含めた同時インストール（複数リソース展開）かどうか判定
    pub fn is_multi_install(&self) -> bool {
        !self.bundled_resources.is_empty()
    }

    /// アーカイブ展開対象の全ターゲットディレクトリ名（主ディレクトリ + 同梱リソース）
    pub fn all_target_directories(&self) -> Vec<&str> {
        let mut dirs = Vec::new();
        let eff = self.effective_directory();
        if !eff.is_empty() {
            dirs.push(eff);
        }
        for res in &self.bundled_resources {
            if !res.target_directory.is_empty() && !dirs.contains(&res.target_directory.as_str()) {
                dirs.push(&res.target_directory);
            }
        }
        dirs
    }
}
