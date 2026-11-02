#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub struct UpdateEntry {
    pub path: String,
    pub md5: String,
    pub size: Option<u64>,
    #[serde(default)]
    pub is_delete: bool,
    #[serde(default)]
    pub is_ignore: bool,
    #[serde(default)]
    pub is_readonly: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub date: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub flags: Vec<String>,
}

impl UpdateEntry {
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

/// ネットワーク更新パッケージ定義 (Slot-15 Contract)
#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub struct UpdatePackage {
    pub entries: Vec<UpdateEntry>,
}

impl UpdatePackage {
    pub fn from_definition(content: &str) -> Self {
        Self {
            entries: parse_update_definition(content),
        }
    }

    /// 更新対象（非delete、非ignore）の有効なエントリ一覧を取得
    pub fn active_downloads(&self) -> Vec<&UpdateEntry> {
        self.entries
            .iter()
            .filter(|e| !e.is_delete && !e.is_ignore)
            .collect()
    }

    /// 削除対象 (`delete` フラグ指定) のエントリ一覧を取得
    pub fn deletions(&self) -> Vec<&UpdateEntry> {
        self.entries.iter().filter(|e| e.is_delete).collect()
    }

    /// 総ダウンロード予定サイズ (サイズが指定されているエントリの合算)
    pub fn total_download_size(&self) -> u64 {
        self.active_downloads().iter().filter_map(|e| e.size).sum()
    }
}

/// 同梱リソース設定（balloon, headline, plugin, shell, calendar.skin 等）
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub struct InstallResourceConfig {
    pub resource_type: String,
    pub target_directory: String,
    pub source_directory: String,
    pub refresh: bool,
    pub refresh_undelete_mask: Vec<String>,
}

/// install.txt の解析結果モデル (Slot-15 Contract)
#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize, PartialEq, Eq)]
pub struct InstallManifest {
    pub name: String,
    pub install_type: String,
    pub directory: Option<String>,
    pub charset: Option<String>,
    pub accept: Option<String>,
    pub bootghost: Option<String>,
    pub refresh: bool,
    pub refresh_undelete_mask: Vec<String>,
    pub bundled_resources: Vec<InstallResourceConfig>,
}

impl InstallManifest {
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
}

/// NAR/ZIP アーカイブ インストーラ抽象インターフェース (Slot-15 Contract)
pub trait InstallerEngine {
    /// アーカイブ内の install.txt をパースして InstallManifest を生成
    fn parse_install_manifest(&self, content: &str) -> InstallManifest;

    /// 指定ディレクトリ内の refresh 処理対象ファイルをフィルタ（保護マスク判定）
    fn filter_refresh_deletions<'a>(
        &self,
        files: &'a [String],
        manifest: &InstallManifest,
    ) -> Vec<&'a String> {
        if !manifest.refresh {
            return Vec::new();
        }
        files
            .iter()
            .filter(|f| {
                let fname = std::path::Path::new(f)
                    .file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or(f);
                !manifest.is_refresh_protected(fname)
            })
            .collect()
    }
}

/// 標準の InstallerEngine 実装
#[derive(Debug, Clone, Copy, Default)]
pub struct StandardInstallerEngine;

impl InstallerEngine for StandardInstallerEngine {
    fn parse_install_manifest(&self, content: &str) -> InstallManifest {
        parse_install_manifest(content)
    }
}

/// install.txt の内容をパースして InstallManifest を構築
pub fn parse_install_manifest(content: &str) -> InstallManifest {
    use std::collections::HashMap;

    let mut map: HashMap<String, String> = HashMap::new();
    for line in content.lines() {
        let trimmed = line.trim().trim_start_matches('\u{feff}');
        if trimmed.is_empty() || trimmed.starts_with("//") || trimmed.starts_with('#') {
            continue;
        }
        if let Some((key, val)) = trimmed.split_once(',').or_else(|| trimmed.split_once(':')) {
            let k = key.trim().to_lowercase();
            let v = val.trim().trim_end_matches(',').trim().to_string();
            if !k.is_empty() && !v.is_empty() {
                map.insert(k, v);
            }
        }
    }

    let name = map.get("name").cloned().unwrap_or_default();
    let install_type = map
        .get("type")
        .cloned()
        .unwrap_or_else(|| "ghost".to_string());
    let directory = map.get("directory").cloned();
    let charset = map.get("charset").cloned();
    let accept = map.get("accept").cloned();
    let bootghost = map.get("bootghost").cloned();

    let refresh = map.get("refresh").is_some_and(|v| v.trim() == "1");
    let refresh_undelete_mask: Vec<String> = map
        .get("refreshundeletemask")
        .map(|v| {
            v.split(':')
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect()
        })
        .unwrap_or_default();

    // 同梱リソース (無印および 0, 1, 2...)
    let supported_types = [
        "balloon",
        "headline",
        "plugin",
        "shell",
        "calendar.skin",
        "calendar.plugin",
    ];

    let mut bundled_resources = Vec::new();

    for &r_type in &supported_types {
        // 1. 無印 (例: balloon.directory)
        let unnumbered_dir_key = format!("{r_type}.directory");
        if let Some(target_dir) = map.get(&unnumbered_dir_key) {
            let src_key = format!("{r_type}.source.directory");
            let src_dir = map.get(&src_key).unwrap_or(target_dir).clone();
            let r_refresh = map
                .get(&format!("{r_type}.refresh"))
                .is_some_and(|v| v.trim() == "1");
            let r_mask: Vec<String> = map
                .get(&format!("{r_type}.refreshundeletemask"))
                .map(|v| {
                    v.split(':')
                        .map(|s| s.trim().to_string())
                        .filter(|s| !s.is_empty())
                        .collect()
                })
                .unwrap_or_default();

            bundled_resources.push(InstallResourceConfig {
                resource_type: r_type.to_string(),
                target_directory: target_dir.clone(),
                source_directory: src_dir,
                refresh: r_refresh,
                refresh_undelete_mask: r_mask,
            });
        }

        // 2. 0, 1, 2... の連番探索（欠番が出た時点で打ち切り）
        let mut idx = 0;
        loop {
            let indexed_dir_key = format!("{r_type}{idx}.directory");
            if let Some(target_dir) = map.get(&indexed_dir_key) {
                let src_key = format!("{r_type}{idx}.source.directory");
                let src_dir = map.get(&src_key).unwrap_or(target_dir).clone();
                let r_refresh = map
                    .get(&format!("{r_type}{idx}.refresh"))
                    .is_some_and(|v| v.trim() == "1");
                let r_mask: Vec<String> = map
                    .get(&format!("{r_type}{idx}.refreshundeletemask"))
                    .map(|v| {
                        v.split(':')
                            .map(|s| s.trim().to_string())
                            .filter(|s| !s.is_empty())
                            .collect()
                    })
                    .unwrap_or_default();

                bundled_resources.push(InstallResourceConfig {
                    resource_type: r_type.to_string(),
                    target_directory: target_dir.clone(),
                    source_directory: src_dir,
                    refresh: r_refresh,
                    refresh_undelete_mask: r_mask,
                });
                idx += 1;
            } else {
                break;
            }
        }
    }

    InstallManifest {
        name,
        install_type,
        directory,
        charset,
        accept,
        bootghost,
        refresh,
        refresh_undelete_mask,
        bundled_resources,
    }
}

/// updates2.dau または updates.txt の内容をパース
pub fn parse_update_definition(content: &str) -> Vec<UpdateEntry> {
    let mut entries = Vec::new();
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        // updates.txt の場合: "file," プレフィックス
        let data_part = if let Some(stripped) = trimmed.strip_prefix("file,") {
            stripped
        } else if trimmed.starts_with("charset,") {
            continue;
        } else {
            trimmed
        };

        // 区切り文字: \x01 (Byte 1) または カンマフォールバック
        let parts: Vec<&str> = if data_part.contains('\x01') {
            data_part.split('\x01').collect()
        } else {
            data_part.split(',').collect()
        };

        let rel_path = parts[0].trim().replace('\\', "/");
        if rel_path.is_empty() {
            continue;
        }

        let md5_hash = if parts.len() > 1 {
            parts[1].trim().to_lowercase()
        } else {
            String::new()
        };

        // [相対パス,ignore], [補足]: updates_def.txt / updates2.dau における相対パス指定、ignore, readonly, delete, size, date パラメータパース
        let mut is_delete = false;
        let mut is_ignore = false;
        let mut is_readonly = false;
        let mut option_flags = Vec::new();
        let mut size = None;
        let mut date = None;

        for &extra in parts.iter().skip(2) {
            let extra_trimmed = extra.trim();
            if extra_trimmed.is_empty() {
                continue;
            }
            if let Some(s) = extra_trimmed.strip_prefix("size=") {
                if let Ok(val) = s.parse::<u64>() {
                    size = Some(val);
                }
            } else if let Some(d) = extra_trimmed.strip_prefix("date=") {
                date = Some(d.to_string());
            } else if extra_trimmed.starts_with("charset=") {
                continue;
            } else if extra_trimmed.eq_ignore_ascii_case("delete") {
                is_delete = true;
                option_flags.push("delete".to_string());
            } else if extra_trimmed.eq_ignore_ascii_case("ignore") {
                is_ignore = true;
                option_flags.push("ignore".to_string());
            } else if extra_trimmed.eq_ignore_ascii_case("readonly") {
                is_readonly = true;
                option_flags.push("readonly".to_string());
            }
        }

        entries.push(UpdateEntry {
            path: rel_path,
            md5: md5_hash,
            size,
            is_delete,
            is_ignore,
            is_readonly,
            date,
            flags: option_flags,
        });
    }
    entries
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_updates2_dau_byte1_delimited() {
        let content = "ghost\\master\\descript.txt\x011A2B3C4D5E6F7890ABCDEF1234567890\x01size=1024\x01date=2024-01-15T12:34:56\x01charset=Shift_JIS\x01\r\n\
                       ghost\\master\\shiori.dll\x01FEDCBA09876543210987654321ABCDEF\r\n";
        let entries = parse_update_definition(content);
        assert_eq!(entries.len(), 2);

        assert_eq!(entries[0].path, "ghost/master/descript.txt");
        assert_eq!(entries[0].md5, "1a2b3c4d5e6f7890abcdef1234567890");
        assert_eq!(entries[0].size, Some(1024));
        assert_eq!(entries[0].date, Some("2024-01-15T12:34:56".to_string()));
        assert!(!entries[0].is_delete);
        assert!(!entries[0].is_ignore);
        assert!(!entries[0].is_readonly);
        assert!(entries[0].flags.is_empty());

        assert_eq!(entries[1].path, "ghost/master/shiori.dll");
        assert_eq!(entries[1].md5, "fedcba09876543210987654321abcdef");
        assert_eq!(entries[1].size, None);
        assert_eq!(entries[1].date, None);
        assert!(entries[1].flags.is_empty());
    }

    #[test]
    fn test_parse_updates_txt_comma_delimited() {
        let content = "charset,UTF-8\r\n\
                       file,ghost/master/descript.txt,1a2b3c4d5e6f7890abcdef1234567890,size=2048,date=2025-02-01\r\n\
                       file,ghost\\master\\readme.txt,ABCDEF1234567890ABCDEF1234567890,readonly\r\n";
        let entries = parse_update_definition(content);
        assert_eq!(entries.len(), 2);

        assert_eq!(entries[0].path, "ghost/master/descript.txt");
        assert_eq!(entries[0].md5, "1a2b3c4d5e6f7890abcdef1234567890");
        assert_eq!(entries[0].size, Some(2048));
        assert_eq!(entries[0].date, Some("2025-02-01".to_string()));
        assert!(!entries[0].is_readonly);
        assert!(entries[0].flags.is_empty());

        assert_eq!(entries[1].path, "ghost/master/readme.txt");
        assert_eq!(entries[1].md5, "abcdef1234567890abcdef1234567890");
        assert_eq!(entries[1].size, None);
        assert_eq!(entries[1].date, None);
        assert!(entries[1].is_readonly);
        assert_eq!(entries[1].flags, vec!["readonly"]);
    }

    #[test]
    fn test_parse_update_definition_edge_cases() {
        // Empty and blank lines
        let content = "\r\n  \r\n\t\r\n";
        let entries = parse_update_definition(content);
        assert!(entries.is_empty());

        // Line with charset only
        let content = "charset,Shift_JIS\r\n";
        let entries = parse_update_definition(content);
        assert!(entries.is_empty());

        // File entry without MD5
        let content = "file,ghost/master/descript.txt\r\n";
        let entries = parse_update_definition(content);
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].path, "ghost/master/descript.txt");
        assert_eq!(entries[0].md5, "");
        assert_eq!(entries[0].size, None);
        assert_eq!(entries[0].date, None);

        // Entry with empty path after trimming
        let content = "file,,1a2b3c4d5e6f7890abcdef1234567890\r\n";
        let entries = parse_update_definition(content);
        assert!(entries.is_empty());

        // Extra unknown key-value pairs along with size, date and option flags (ignore, readonly, delete)
        let content = "shell/default/surface0.png\x0100112233445566778899aabbccddeeff\x01foo=bar\x01size=512\x01date=2026-10-31\x01ignore\x01readonly\x01delete\x01baz=qux\r\n";
        let entries = parse_update_definition(content);
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].path, "shell/default/surface0.png");
        assert_eq!(entries[0].md5, "00112233445566778899aabbccddeeff");
        assert_eq!(entries[0].size, Some(512));
        assert!(entries[0].is_ignore);
        assert!(entries[0].is_readonly);
        assert!(entries[0].is_delete);
        assert_eq!(entries[0].date, Some("2026-10-31".to_string()));
        assert_eq!(entries[0].flags, vec!["ignore", "readonly", "delete"]);
        assert!(entries[0].is_ignore());
        assert!(entries[0].is_readonly());
        assert!(entries[0].is_delete());
    }

    #[test]
    fn test_update_package_methods() {
        let content = "file,ghost/master/aya.dll,11223344556677889900aabbccddeeff,size=1000\r\n\
                       file,ghost/master/old.txt,11223344556677889900aabbccddeeff,delete\r\n\
                       file,ghost/master/skip.png,11223344556677889900aabbccddeeff,ignore,size=500\r\n\
                       file,ghost/master/readme.txt,11223344556677889900aabbccddeeff,size=200\r\n";
        let pkg = UpdatePackage::from_definition(content);
        assert_eq!(pkg.entries.len(), 4);

        let active = pkg.active_downloads();
        assert_eq!(active.len(), 2);
        assert_eq!(active[0].path, "ghost/master/aya.dll");
        assert_eq!(active[1].path, "ghost/master/readme.txt");

        let deletions = pkg.deletions();
        assert_eq!(deletions.len(), 1);
        assert_eq!(deletions[0].path, "ghost/master/old.txt");

        assert_eq!(pkg.total_download_size(), 1200);
    }

    #[test]
    fn test_installer_engine_and_manifest_parsing() {
        let install_txt = "\
charset,UTF-8\r\n\
type,package\r\n\
name,MySpecialPackage\r\n\
directory,special_ghost\r\n\
accept,Nanai,Mini\r\n\
bootghost,special_ghost\r\n\
refresh,1\r\n\
refreshundeletemask,save.dat:user.ini\r\n\
balloon.directory,my_balloon\r\n\
balloon.refresh,1\r\n\
balloon.refreshundeletemask,balloon_pref.txt\r\n\
shell0.directory,my_shell\r\n\
shell0.source.directory,custom_shell\r\n";

        let engine = StandardInstallerEngine;
        let manifest = engine.parse_install_manifest(install_txt);

        assert_eq!(manifest.name, "MySpecialPackage");
        assert_eq!(manifest.install_type, "package");
        assert_eq!(manifest.directory.as_deref(), Some("special_ghost"));
        assert_eq!(manifest.effective_directory(), "special_ghost");
        assert_eq!(manifest.charset.as_deref(), Some("UTF-8"));
        assert_eq!(manifest.accept.as_deref(), Some("Nanai,Mini"));
        assert_eq!(manifest.bootghost.as_deref(), Some("special_ghost"));
        assert!(manifest.refresh);
        assert_eq!(manifest.refresh_undelete_mask, vec!["save.dat", "user.ini"]);

        assert!(manifest.is_refresh_protected("save.dat"));
        assert!(manifest.is_refresh_protected("SAVE.DAT"));
        assert!(manifest.is_refresh_protected("user.ini"));
        assert!(!manifest.is_refresh_protected("ghost.dll"));

        assert_eq!(manifest.bundled_resources.len(), 2);
        assert_eq!(manifest.bundled_resources[0].resource_type, "balloon");
        assert_eq!(manifest.bundled_resources[0].target_directory, "my_balloon");
        assert!(manifest.bundled_resources[0].refresh);
        assert_eq!(
            manifest.bundled_resources[0].refresh_undelete_mask,
            vec!["balloon_pref.txt"]
        );

        assert_eq!(manifest.bundled_resources[1].resource_type, "shell");
        assert_eq!(manifest.bundled_resources[1].target_directory, "my_shell");
        assert_eq!(
            manifest.bundled_resources[1].source_directory,
            "custom_shell"
        );
        assert!(!manifest.bundled_resources[1].refresh);

        let files = vec![
            "ghost/master/ghost.dll".to_string(),
            "ghost/master/save.dat".to_string(),
            "readme.txt".to_string(),
        ];
        let to_delete = engine.filter_refresh_deletions(&files, &manifest);
        assert_eq!(to_delete.len(), 2);
        assert_eq!(to_delete[0], "ghost/master/ghost.dll");
        assert_eq!(to_delete[1], "readme.txt");
    }
}
