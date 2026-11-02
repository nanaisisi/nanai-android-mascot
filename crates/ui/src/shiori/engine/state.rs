//! SHIORI エンジンのライフサイクル状態 (Slot-02 Cycle 3: モバイル・省電力最適化)

/// SHIORI エンジンのライフサイクル状態 (Slot-02 Cycle 3: モバイル・省電力最適化)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum ShioriLifecycleState {
    /// 未初期化・アンロード状態
    #[default]
    Unloaded,
    /// アクティブ・稼働中状態
    Active,
    /// バックグラウンド一時停止・省電力待機状態
    Suspended,
    /// 破棄済み状態
    Destroyed,
}

/// UKADOC SHIORI/3.0 `capability` Notify イベント用リファレンス一覧を生成
///
/// SSP/UKADOC spec `list/shiori-event/notify/capability.md` 準拠:
/// request.(ヘッダ小文字), response.(ヘッダ小文字) を Reference0..N に設定する
pub fn build_standard_capability_references() -> Vec<String> {
    vec![
        // Request ヘッダ対応状況
        "request.sender".to_string(),
        "request.sendertype".to_string(),
        "request.securitylevel".to_string(),
        "request.securityorigin".to_string(),
        "request.status".to_string(),
        "request.baseid".to_string(),
        "request.x-sstp-passthru".to_string(),
        // Response ヘッダ対応状況
        "response.value".to_string(),
        "response.valuenotify".to_string(),
        "response.marker".to_string(),
        "response.markersend".to_string(),
        "response.balloonoffset".to_string(),
        "response.age".to_string(),
        "response.errorlevel".to_string(),
        "response.errordescription".to_string(),
        "response.x-sstp-passthru".to_string(),
    ]
}
