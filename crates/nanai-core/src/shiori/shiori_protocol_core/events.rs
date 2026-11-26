//! SHIORI/3.0 イベント通知関連 Enum 定義

use serde::{Deserialize, Serialize};
use tsify::Tsify;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub enum UrlDropEvent {
    OnURLDropped,
    OnURLDropping,
    OnURLDragDropping,
    OnURLDropFailure,
    OnURLQuery,
    OnXUkagakaLinkOpen,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub enum FileDropEvent {
    OnFileDrop,
    OnFileDrop2,
    OnFileDropEx,
    OnFileDropped,
    OnFileDropping,
    OnDirectoryDrop,
    OnArchiveViewerOpen,
    OnMediaPlayerOpen,
    OnPictureViewerOpen,
    OnNarCreating,
    OnNarCreated,
    OnUpdatedataCreating,
    OnUpdatedataCreated,
    OnOtherObjectDropping,
    OnOtherObjectDropped,
    OnWallpaperChange,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub enum OverlapEvent {
    OnOffscreen,
    OnOtherOffscreen,
    OnOverlap,
    OnOtherOverlap,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub enum EventSendFailureEvent {
    OnNotifyOtherFailure,
    OnNotifyPluginFailure,
    OnRaiseOtherFailure,
    OnRaisePluginFailure,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub enum GamepadEvent {
    OnGamepadAxisMove,
    OnGamepadButtonDown,
    OnGamepadButtonUp,
    OnGamepadConnected,
    OnGamepadDisconnected,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub enum SelectRegionModeEvent {
    OnSelectModeBegin,
    OnSelectModeCancel,
    OnSelectModeComplete,
    OnSelectModeMouseDown,
    OnSelectModeMouseUp,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub enum SpeechEvent {
    OnSpeechSynthesisStatus,
    OnVoiceRecognitionStatus,
    OnVoiceRecognitionWord,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub enum OtherNotifyEvent {
    OnAITalk,
    OnCompressArchiveComplete,
    OnCompressArchiveFailure,
    OnEmbryoExist,
    OnExtractArchiveComplete,
    OnExtractArchiveFailure,
    OnInternalSaoriComplete,
    OnInternalSaoriFailure,
    OnLanguageChange,
    OnNekodorifExist,
    OnOtherGhostTalk,
    OnRecommendsiteChoice,
    OnSoundSpectrum,
    OnTextDrop,
    OnVideoPlayEx,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub enum VanishEvent {
    OnVanished,
    OnVanishSelecting,
    OnVanishSelected,
    OnVanishCancel,
    OnVanishButtonHold,
    OnOtherGhostVanished,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub enum BalloonSurfaceEvent {
    OnSurfaceChange,
    OnOtherSurfaceChange,
    OnBalloonClose,
    OnBalloonBreak,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub enum ChoiceAnchorEvent {
    OnChoiceSelectEx,
    OnAnchorSelectEx,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub enum OsEnvironmentEvent {
    OnDisplayChange,
    OnDisplayChangeEx,
    OnDisplayHandover,
    OnDisplayPowerStatus,
    OnDarkTheme,
    OnTabletMode,
    OnWindowModeChange,
    OnNetworkStatusChange,
    OnNetworkHeavy,
    OnCPULoadHigh,
    OnCPULoadLow,
    OnMemoryLoadHigh,
    OnMemoryLoadLow,
    OnRecycleBinEmpty,
    OnRecycleBinEmptyFromOther,
    OnRecycleBinStatusUpdate,
    OnOSUpdateInfo,
    OnDesktopWallpaperChange,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub enum TermsDialogEvent {
    OnGhostTermsAccept,
    OnGhostTermsDecline,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub enum HeadlineRssEvent {
    OnApplicationBoot,
    OnApplicationClose,
    OnApplicationExist,
    OnApplicationFileOpen,
    OnApplicationOperationFinish,
    OnApplicationVersion,
    OnWebsiteUpdateNotify,
    OnHeadlinesenseBegin,
    #[serde(rename = "OnHeadlinesense.OnFind")]
    OnHeadlinesenseOnFind,
    OnHeadlinesenseComplete,
    OnHeadlinesenseFailure,
    OnRSSBegin,
    OnRSSComplete,
    OnRSSFailure,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Tsify)]
pub enum GhostLifecycleEvent {
    OnGhostChanging,
    OnGhostChanged,
    OnGhostCalling,
    OnGhostCalled,
    OnGhostCallComplete,
    OnOtherGhostBooted,
    OnOtherGhostChanged,
    OnOtherGhostClosed,
    OnShellChanging,
    OnShellChanged,
    OnCloseAll,
    OnInitialize,
    OnDestroy,
    OnSysSuspend,
    OnSysResume,
    OnVirtualDesktopChanged,
    OnBasewareUpdating,
    OnBasewareUpdated,
    OnCacheSuspend,
    OnCacheRestore,
}
