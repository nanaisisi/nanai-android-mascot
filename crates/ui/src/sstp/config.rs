use crate::sstp::message::{SstpRequest, SstpResponse};
use crate::sstp::types::SstpMethod;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// ゴースト側 descript.txt 由来の SSTP 制御設定 (UKADOC descript.txt 規格準拠)
/// [sstp.allowcommunicate], [sstp.allowunspecifiedsend], [sstp.alwaystranslate]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SstpGhostConfig {
    /// sstp.allowcommunicate: 0 で COMMUNICATE を受けない。デフォルトは 1
    #[serde(default = "default_allow_communicate")]
    pub(crate) allow_communicate: bool,
    /// sstp.allowunspecifiedsend: 0 でゴーストを指名しない SSTP を受けない。デフォルトは 1
    #[serde(default = "default_allow_unspecified_send")]
    pub(crate) allow_unspecified_send: bool,
    /// sstp.alwaystranslate: 1 で SSTP オプションにかかわらず常時 OnTranslate を実行。デフォルトは 0
    #[serde(default = "default_always_translate")]
    pub(crate) always_translate: bool,
}

#[allow(dead_code)]
impl SstpGhostConfig {
    // Add getter methods
    pub fn allow_communicate(&self) -> bool {
        self.allow_communicate
    }
    pub fn allow_unspecified_send(&self) -> bool {
        self.allow_unspecified_send
    }
    pub fn always_translate(&self) -> bool {
        self.always_translate
    }
}

fn default_allow_communicate() -> bool {
    true
}

fn default_allow_unspecified_send() -> bool {
    true
}

fn default_always_translate() -> bool {
    false
}

impl Default for SstpGhostConfig {
    fn default() -> Self {
        Self {
            allow_communicate: default_allow_communicate(),
            allow_unspecified_send: default_allow_unspecified_send(),
            always_translate: default_always_translate(),
        }
    }
}

impl SstpGhostConfig {
    /// descript.txt のキーマップから SSTP 設定をパース
    pub fn from_descript_map(map: &HashMap<String, String>) -> Self {
        let allow_communicate = map
            .get("sstp.allowcommunicate")
            .map(|v| v.trim() != "0")
            .unwrap_or(true);

        let allow_unspecified_send = map
            .get("sstp.allowunspecifiedsend")
            .map(|v| v.trim() != "0")
            .unwrap_or(true);

        let always_translate = map
            .get("sstp.alwaystranslate")
            .map(|v| v.trim() == "1")
            .unwrap_or(false);

        Self {
            allow_communicate,
            allow_unspecified_send,
            always_translate,
        }
    }

    /// リクエストの受入判定（拒否理由があれば Refuse / BadRequest 等の SstpResponse を返す）
    #[allow(clippy::result_large_err)]
    pub fn validate_request(&self, req: &SstpRequest) -> Result<(), SstpResponse> {
        // [sstp.allowcommunicate]: COMMUNICATE メソッドの拒否判定
        if req.method == SstpMethod::Communicate && !self.allow_communicate {
            return Err(
                SstpResponse::refuse().with_error_description("COMMUNICATE disabled by ghost")
            );
        }

        // [sstp.allowunspecifiedsend]: ゴーストを指名しない SEND メソッドの拒否判定
        if req.method == SstpMethod::Send && !self.allow_unspecified_send {
            let is_specified = req.receiver_ghost_name.is_some()
                || req.receiver_ghost_hwnd.is_some()
                || !req.if_ghosts.is_empty();
            if !is_specified {
                return Err(SstpResponse::refuse()
                    .with_error_description("Unspecified SEND disabled by ghost"));
            }
        }

        Ok(())
    }

    /// [sstp.alwaystranslate]: notranslate オプション指定を上書きして翻訳を強制するか判定
    pub fn should_translate(&self, req: &SstpRequest) -> bool {
        if self.always_translate {
            true
        } else {
            !req.is_notranslate()
        }
    }
}

/// SSTP EXECUTE コマンドのディスパッチ処理ヘルパー
#[derive(Debug, Clone, Default)]
pub struct SstpGhostContext {
    pub(crate) name: String,
    pub(crate) sakura_name: String,
    pub(crate) kero_name: String,
    pub(crate) shell_name: String,
    pub(crate) balloon_name: String,
    pub(crate) version: String,
    pub(crate) short_version: String,
    pub(crate) status: String,
    pub(crate) fmo_text: String,
    pub(crate) installed_ghosts: Vec<String>,
    pub(crate) installed_shells: Vec<String>,
    pub(crate) installed_balloons: Vec<String>,
    pub(crate) installed_headlines: Vec<String>,
    pub(crate) installed_plugins: Vec<String>,
    pub(crate) properties: HashMap<String, String>,
    pub(crate) cookies: HashMap<String, HashMap<String, String>>,
    pub(crate) sender: String,
    pub(crate) sstp_config: SstpGhostConfig,
    /// 呼び出し元のセキュリティレベル ("local" / "external")
    pub(crate) security_level: Option<String>,
    /// リクエストに付随する References (Reference0〜)
    pub(crate) references: HashMap<String, String>,
}

#[allow(dead_code)]
impl SstpGhostContext {
    // Add getter methods
    pub fn name(&self) -> &str {
        &self.name
    }
    pub fn sakura_name(&self) -> &str {
        &self.sakura_name
    }
    pub fn kero_name(&self) -> &str {
        &self.kero_name
    }
    pub fn shell_name(&self) -> &str {
        &self.shell_name
    }
    pub fn balloon_name(&self) -> &str {
        &self.balloon_name
    }
    pub fn version(&self) -> &str {
        &self.version
    }
    pub fn short_version(&self) -> &str {
        &self.short_version
    }
    pub fn status(&self) -> &str {
        &self.status
    }
    pub fn fmo_text(&self) -> &str {
        &self.fmo_text
    }
    pub fn installed_ghosts(&self) -> &[String] {
        &self.installed_ghosts
    }
    pub fn installed_shells(&self) -> &[String] {
        &self.installed_shells
    }
    pub fn installed_balloons(&self) -> &[String] {
        &self.installed_balloons
    }
    pub fn installed_headlines(&self) -> &[String] {
        &self.installed_headlines
    }
    pub fn installed_plugins(&self) -> &[String] {
        &self.installed_plugins
    }
    pub fn properties(&self) -> &HashMap<String, String> {
        &self.properties
    }
    pub fn cookies(&self) -> &HashMap<String, HashMap<String, String>> {
        &self.cookies
    }
    pub fn sender(&self) -> &str {
        &self.sender
    }
    pub fn sstp_config(&self) -> &SstpGhostConfig {
        &self.sstp_config
    }
    pub fn security_level(&self) -> Option<&str> {
        self.security_level.as_deref()
    }
    pub fn references(&self) -> &HashMap<String, String> {
        &self.references
    }

    pub fn set_security_level(&mut self, level: Option<String>) {
        self.security_level = level;
    }
    pub fn set_fmo_text(&mut self, text: impl Into<String>) {
        self.fmo_text = text.into();
    }

    pub fn new(
        name: impl Into<String>,
        sender: impl Into<String>,
        config: SstpGhostConfig,
    ) -> Self {
        let n = name.into();
        let mut properties = HashMap::new();
        properties.insert("ghostlist.count".to_string(), "1".to_string());
        properties.insert("currentghost.name".to_string(), n.clone());
        properties.insert(
            "baseware.name".to_string(),
            "Nanai Android Mascot".to_string(),
        );
        properties.insert("baseware.version".to_string(), "1.0.0".to_string());

        Self {
            name: n.clone(),
            sakura_name: n.clone(),
            kero_name: "Kero".to_string(),
            shell_name: "master".to_string(),
            balloon_name: "standard".to_string(),
            version: "Nanai 0.1.0".to_string(),
            short_version: "0.1.0".to_string(),
            status: String::new(),
            fmo_text: String::new(),
            installed_ghosts: vec![n],
            installed_shells: vec!["master".to_string()],
            installed_balloons: vec!["standard".to_string()],
            installed_headlines: Vec::new(),
            installed_plugins: Vec::new(),
            properties,
            cookies: HashMap::new(),
            sender: sender.into(),
            sstp_config: config,
            security_level: None,
            references: HashMap::new(),
        }
    }

    pub fn with_names(
        mut self,
        name: impl Into<String>,
        sakura: impl Into<String>,
        kero: impl Into<String>,
    ) -> Self {
        self.name = name.into();
        self.sakura_name = sakura.into();
        self.kero_name = kero.into();
        self
    }
    pub fn with_shells(mut self, shells: Vec<String>) -> Self {
        self.installed_shells = shells;
        self
    }
    pub fn with_balloons(mut self, balloons: Vec<String>) -> Self {
        self.installed_balloons = balloons;
        self
    }
    pub fn with_headlines(mut self, headlines: Vec<String>) -> Self {
        self.installed_headlines = headlines;
        self
    }
    pub fn with_plugins(mut self, plugins: Vec<String>) -> Self {
        self.installed_plugins = plugins;
        self
    }
    pub fn with_properties(mut self, properties: HashMap<String, String>) -> Self {
        self.properties = properties;
        self
    }
    pub fn with_cookies(mut self, cookies: HashMap<String, HashMap<String, String>>) -> Self {
        self.cookies = cookies;
        self
    }
    pub fn with_status(mut self, status: impl Into<String>) -> Self {
        self.status = status.into();
        self
    }
    pub fn with_fmo_text(mut self, fmo_text: impl Into<String>) -> Self {
        self.fmo_text = fmo_text.into();
        self
    }
    pub fn with_security_level(mut self, level: Option<String>) -> Self {
        self.security_level = level;
        self
    }
    pub fn with_references(mut self, references: HashMap<String, String>) -> Self {
        self.references = references;
        self
    }
}
