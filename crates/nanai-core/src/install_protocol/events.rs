//! SHIORI インストールイベント引数構築処理

use super::helpers::normalize_install_type;

/// OnInstallBegin SHIORI 引数生成
/// [Ref0] -> ["install"] または 指定識別子
pub fn build_install_begin_args(identifier: Option<&str>) -> [String; 1] {
    [identifier.unwrap_or("install").to_string()]
}

#[allow(non_camel_case_types)]
pub struct Build_install_complete_argsParams<'a> {
    pub(crate) install_type: &'a str,
    pub(crate) name: &'a str,
    pub(crate) extra: Option<&'a str>,
}

#[allow(dead_code)]
impl<'a> Build_install_complete_argsParams<'a> {
    pub fn install_type(&self) -> &'a str {
        self.install_type
    }
    pub fn name(&self) -> &'a str {
        self.name
    }
    pub fn extra(&self) -> Option<&'a str> {
        self.extra
    }
}

/// OnInstallComplete SHIORI 引数生成
/// [Ref0=種別, Ref1=名前, Ref2=追加情報(任意)]
pub fn build_install_complete_args(params: Build_install_complete_argsParams<'_>) -> [String; 3] {
    let install_type = params.install_type();
    let name = params.name();
    let extra = params.extra();
    [
        normalize_install_type(Some(install_type)),
        name.to_string(),
        extra.unwrap_or("").to_string(),
    ]
}

#[allow(non_camel_case_types)]
pub struct Build_install_complete_ex_argsParams<'a> {
    pub(crate) install_type: &'a str,
    pub(crate) name: &'a str,
    pub(crate) path_or_extra: Option<&'a str>,
    pub(crate) on_install_script: Option<&'a str>,
}

#[allow(dead_code)]
impl<'a> Build_install_complete_ex_argsParams<'a> {
    pub fn install_type(&self) -> &'a str {
        self.install_type
    }
    pub fn name(&self) -> &'a str {
        self.name
    }
    pub fn path_or_extra(&self) -> Option<&'a str> {
        self.path_or_extra
    }
    pub fn on_install_script(&self) -> Option<&'a str> {
        self.on_install_script
    }
}

/// OnInstallCompleteEx SHIORI 引数生成 (UKADOC拡張)
/// [Ref0=種別, Ref1=名前, Ref2=インストール先パス/情報, Ref3=実行スクリプト]
pub fn build_install_complete_ex_args(
    params: Build_install_complete_ex_argsParams<'_>,
) -> [String; 4] {
    let install_type = params.install_type();
    let name = params.name();
    let path_or_extra = params.path_or_extra();
    let on_install_script = params.on_install_script();
    [
        normalize_install_type(Some(install_type)),
        name.to_string(),
        path_or_extra.unwrap_or("").to_string(),
        on_install_script.unwrap_or("").to_string(),
    ]
}

/// OnInstallCompleteAll SHIORI 引数生成 (複数リソース一括展開完了時)
/// [Ref0=インストール件数, Ref1=インストール結果一覧 (種別\1名前)]
pub fn build_install_complete_all_args(installed_list: &[(String, String)]) -> [String; 2] {
    let count = installed_list.len().to_string();
    let sep = '\u{0001}'; // Byte1
    let list_str = installed_list
        .iter()
        .map(|(t, n)| format!("{}{}{}", normalize_install_type(Some(t)), sep, n))
        .collect::<Vec<_>>()
        .join("\n");
    [count, list_str]
}

/// OnInstallRefuse SHIORI 引数生成 (accept不一致や拒否条件合致時)
/// [Ref0=理由, Ref1=対象リソース/名前]
pub fn build_install_refuse_args(reason: Option<&str>, target: Option<&str>) -> [String; 2] {
    let safe_reason = match reason {
        Some(r) if !r.trim().is_empty() => r.trim(),
        _ => "refused",
    };
    [safe_reason.to_string(), target.unwrap_or("").to_string()]
}

#[allow(non_camel_case_types)]
pub struct Build_install_reroute_argsParams<'a> {
    pub(crate) target_ghost: &'a str,
    pub(crate) install_type: &'a str,
    pub(crate) name: &'a str,
}

#[allow(dead_code)]
impl<'a> Build_install_reroute_argsParams<'a> {
    pub fn target_ghost(&self) -> &'a str {
        self.target_ghost
    }
    pub fn install_type(&self) -> &'a str {
        self.install_type
    }
    pub fn name(&self) -> &'a str {
        self.name
    }
}

/// OnInstallReroute SHIORI 引数生成 (別ゴーストへの転送指定時)
/// [Ref0=転送先ゴースト名, Ref1=種別, Ref2=名前]
pub fn build_install_reroute_args(params: Build_install_reroute_argsParams<'_>) -> [String; 3] {
    let target_ghost = params.target_ghost();
    let install_type = params.install_type();
    let name = params.name();
    [
        target_ghost.to_string(),
        normalize_install_type(Some(install_type)),
        name.to_string(),
    ]
}
