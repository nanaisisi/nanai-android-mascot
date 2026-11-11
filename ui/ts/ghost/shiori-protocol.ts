/**
 * @file shiori-protocol.ts
 * @brief Nanai Android Mascot - SHIORI レスポンス変換ヘルパー
 */

export function statusCodeFromRust(
	status: string | Record<string, unknown> | undefined,
): number {
	const codes: Record<string, number> = {
		Ok: 200,
		NoContent: 204,
		NotEnough: 311,
		Advice: 312,
		BadRequest: 400,
		InternalServerError: 500,
	};
	if (typeof status === "object" && status !== null) {
		const [variant, val] = Object.entries(status)[0] ?? ["Ok", undefined];
		return typeof val === "number" ? val : (codes[variant] ?? 0);
	}
	return codes[status as string] ?? 0;
}

export function fromRustResponse(typed: Record<string, any> | null) {
	if (!typed || typeof typed !== "object") return null;

	const status = statusCodeFromRust(typed.status);
	const headers: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(typed)) {
		if (value == null) continue;
		if (Array.isArray(value)) {
			if (value.length > 0) headers[key.toLowerCase()] = value;
		} else if (typeof value !== "object") {
			headers[key.toLowerCase()] = String(value);
		} else {
			headers[key.toLowerCase()] = value;
		}
	}
	return {
		status,
		statusText: typed.statusText ?? "",
		value: typed.value ?? "",
		headers,
	};
}

/**
 * UKADOC SHIORI/3.0 標準イベント識別子群
 */
export const SHIORI_EVENTS = {
	// 起動・終了・切替ライフサイクル
	BOOT: "OnBoot",
	FIRST_BOOT: "OnFirstBoot",
	CLOSE: "OnClose",
	CLOSE_ALL: "OnCloseAll",
	INITIALIZE: "OnInitialize",
	DESTROY: "OnDestroy",
	GHOST_CHANGING: "OnGhostChanging",
	GHOST_CHANGED: "OnGhostChanged",
	GHOST_CALLING: "OnGhostCalling",
	GHOST_CALLED: "OnGhostCalled",
	GHOST_CALL_COMPLETE: "OnGhostCallComplete",
	OTHER_GHOST_BOOTED: "OnOtherGhostBooted",
	OTHER_GHOST_CHANGED: "OnOtherGhostChanged",
	OTHER_GHOST_CLOSED: "OnOtherGhostClosed",
	SHELL_CHANGING: "OnShellChanging",
	SHELL_CHANGED: "OnShellChanged",
	BALLOON_CHANGE: "OnBalloonChange",
	DRESSUP_CHANGED: "OnDressupChanged",
	FULLSCREEN_APP_MINIMIZE: "OnFullScreenAppMinimize",
	FULLSCREEN_APP_RESTORE: "OnFullScreenAppRestore",
	WINDOW_STATE_MINIMIZE: "OnWindowStateMinimize",
	WINDOW_STATE_RESTORE: "OnWindowStateRestore",
	SYS_SUSPEND: "OnSysSuspend",
	SYS_RESUME: "OnSysResume",
	VIRTUAL_DESKTOP_CHANGED: "OnVirtualDesktopChanged",
	BASEWARE_UPDATING: "OnBasewareUpdating",
	BASEWARE_UPDATED: "OnBasewareUpdated",
	CACHE_SUSPEND: "OnCacheSuspend",
	CACHE_RESTORE: "OnCacheRestore",

	// 消滅・アンインストール
	VANISHED: "OnVanished",
	VANISH_SELECTING: "OnVanishSelecting",
	VANISH_SELECTED: "OnVanishSelected",
	VANISH_CANCEL: "OnVanishCancel",
	VANISH_BUTTON_HOLD: "OnVanishButtonHold",
	OTHER_GHOST_VANISHED: "OnOtherGhostVanished",

	// URL・外部連携
	URL_DROPPED: "OnURLDropped",
	URL_DROPPING: "OnURLDropping",
	URL_DRAG_DROPPING: "OnURLDragDropping",
	URL_DROP_FAILURE: "OnURLDropFailure",
	URL_QUERY: "OnURLQuery",
	X_UKAGAKA_LINK_OPEN: "OnXUkagakaLinkOpen",

	// ファイルドロップ
	FILE_DROP: "OnFileDrop",
	FILE_DROP2: "OnFileDrop2",
	FILE_DROP_EX: "OnFileDropEx",
	FILE_DROPPED: "OnFileDropped",
	FILE_DROPPING: "OnFileDropping",
	DIRECTORY_DROP: "OnDirectoryDrop",
	ARCHIVE_VIEWER_OPEN: "OnArchiveViewerOpen",
	MEDIA_PLAYER_OPEN: "OnMediaPlayerOpen",
	PICTURE_VIEWER_OPEN: "OnPictureViewerOpen",
	NAR_CREATING: "OnNarCreating",
	NAR_CREATED: "OnNarCreated",
	UPDATEDATA_CREATING: "OnUpdatedataCreating",
	UPDATEDATA_CREATED: "OnUpdatedataCreated",
	OTHER_OBJECT_DROPPING: "OnOtherObjectDropping",
	OTHER_OBJECT_DROPPED: "OnOtherObjectDropped",
	WALLPAPER_CHANGE: "OnWallpaperChange",
	TEXT_DROP: "OnTextDrop",

	// OS・ハードウェア状態
	DISPLAY_CHANGE: "OnDisplayChange",
	DISPLAY_CHANGE_EX: "OnDisplayChangeEx",
	DISPLAY_HANDOVER: "OnDisplayHandover",
	DISPLAY_POWER_STATUS: "OnDisplayPowerStatus",
	DARK_THEME: "OnDarkTheme",
	TABLET_MODE: "OnTabletMode",
	WINDOW_MODE_CHANGE: "OnWindowModeChange",
	NETWORK_STATUS_CHANGE: "OnNetworkStatusChange",
	NETWORK_HEAVY: "OnNetworkHeavy",
	CPU_LOAD_HIGH: "OnCPULoadHigh",
	CPU_LOAD_LOW: "OnCPULoadLow",
	MEMORY_LOAD_HIGH: "OnMemoryLoadHigh",
	MEMORY_LOAD_LOW: "OnMemoryLoadLow",
	RECYCLE_BIN_EMPTY: "OnRecycleBinEmpty",
	RECYCLE_BIN_EMPTY_FROM_OTHER: "OnRecycleBinEmptyFromOther",
	RECYCLE_BIN_STATUS_UPDATE: "OnRecycleBinStatusUpdate",
	OS_UPDATE_INFO: "OnOSUpdateInfo",
	DESKTOP_WALLPAPER_CHANGE: "OnDesktopWallpaperChange",

	// サーフィス・バルーン
	SURFACE_CHANGE: "OnSurfaceChange",
	OTHER_SURFACE_CHANGE: "OnOtherSurfaceChange",
	SURFACE_RESTORE: "OnSurfaceRestore",
	BALLOON_CLOSE: "OnBalloonClose",
	BALLOON_BREAK: "OnBalloonBreak",
	BALLOON_TIMEOUT: "OnBalloonTimeout",

	// 選択肢・アンカー
	CHOICE_SELECT: "OnChoiceSelect",
	CHOICE_SELECT_EX: "OnChoiceSelectEx",
	CHOICE_ENTER: "OnChoiceEnter",
	CHOICE_HOVER: "OnChoiceHover",
	CHOICE_TIMEOUT: "OnChoiceTimeout",
	ANCHOR_SELECT: "OnAnchorSelect",
	ANCHOR_SELECT_EX: "OnAnchorSelectEx",
	ANCHOR_ENTER: "OnAnchorEnter",
	ANCHOR_HOVER: "OnAnchorHover",

	// ダイアログ・利用規約
	CONFIGURATION_DIALOG_HELP: "OnConfigurationDialogHelp",
	GHOST_TERMS_ACCEPT: "OnGhostTermsAccept",
	GHOST_TERMS_DECLINE: "OnGhostTermsDecline",
	SYSTEM_DIALOG: "OnSystemDialog",
	SYSTEM_DIALOG_CANCEL: "OnSystemDialogCancel",

	// イベント送信失敗通知
	NOTIFY_OTHER_FAILURE: "OnNotifyOtherFailure",
	NOTIFY_PLUGIN_FAILURE: "OnNotifyPluginFailure",
	RAISE_OTHER_FAILURE: "OnRaiseOtherFailure",
	RAISE_PLUGIN_FAILURE: "OnRaisePluginFailure",

	// ゲームパッド
	GAMEPAD_AXIS_MOVE: "OnGamepadAxisMove",
	GAMEPAD_BUTTON_DOWN: "OnGamepadButtonDown",
	GAMEPAD_BUTTON_UP: "OnGamepadButtonUp",
	GAMEPAD_CONNECTED: "OnGamepadConnected",
	GAMEPAD_DISCONNECTED: "OnGamepadDisconnected",

	// その他 (AIトーク・メディア・アーカイブ・状態)
	AI_TALK: "OnAITalk",
	BALLOON_SCALING: "OnBalloonScaling",
	SHELL_SCALING: "OnShellScaling",
	COMPRESS_ARCHIVE_COMPLETE: "OnCompressArchiveComplete",
	COMPRESS_ARCHIVE_FAILURE: "OnCompressArchiveFailure",
	EXTRACT_ARCHIVE_COMPLETE: "OnExtractArchiveComplete",
	EXTRACT_ARCHIVE_FAILURE: "OnExtractArchiveFailure",
	EMBRYO_EXIST: "OnEmbryoExist",
	NEKODORIF_EXIST: "OnNekodorifExist",
	INTERNAL_SAORI_COMPLETE: "OnInternalSaoriComplete",
	INTERNAL_SAORI_FAILURE: "OnInternalSaoriFailure",
	KEY_PRESS: "OnKeyPress",
	LANGUAGE_CHANGE: "OnLanguageChange",
	MUSIC_PLAY: "OnMusicPlay",
	MUSIC_PLAY_EX: "OnMusicPlayEx",
	OTHER_GHOST_TALK: "OnOtherGhostTalk",
	RECOMMENDSITE_CHOICE: "OnRecommendsiteChoice",
	RESET_WINDOW_POS: "OnResetWindowPos",
	SOUND_ERROR: "OnSoundError",
	SOUND_LOOP: "OnSoundLoop",
	SOUND_SPECTRUM: "OnSoundSpectrum",
	SOUND_STOP: "OnSoundStop",
	TRANSLATE: "OnTranslate",
	VIDEO_PLAY_EX: "OnVideoPlayEx",

	// 領域・重なり検知
	OFFSCREEN: "OnOffscreen",
	OTHER_OFFSCREEN: "OnOtherOffscreen",
	OVERLAP: "OnOverlap",
	OTHER_OVERLAP: "OnOtherOverlap",

	// 矩形選択モード
	SELECT_MODE_BEGIN: "OnSelectModeBegin",
	SELECT_MODE_CANCEL: "OnSelectModeCancel",
	SELECT_MODE_COMPLETE: "OnSelectModeComplete",
	SELECT_MODE_MOUSE_DOWN: "OnSelectModeMouseDown",
	SELECT_MODE_MOUSE_UP: "OnSelectModeMouseUp",

	// 音声認識・合成
	SPEECH_SYNTHESIS_STATUS: "OnSpeechSynthesisStatus",
	VOICE_RECOGNITION_STATUS: "OnVoiceRecognitionStatus",
	VOICE_RECOGNITION_WORD: "OnVoiceRecognitionWord",

	// 外部通信・ネットワーク連携 (other-communication)
	EXECUTE_FILE_WATCH_CHANGE: "OnExecuteFileWatchChange",
	EXECUTE_FILE_WATCH_FAILURE: "OnExecuteFileWatchFailure",
	EXECUTE_HTTP_COMPLETE: "OnExecuteHTTPComplete",
	EXECUTE_HTTP_FAILURE: "OnExecuteHTTPFailure",
	EXECUTE_HTTP_PROGRESS: "OnExecuteHTTPProgress",
	EXECUTE_HTTP_SSL_INFO: "OnExecuteHTTPSSLInfo",
	EXECUTE_HTTP_STREAMING: "OnExecuteHTTPStreaming",
	EXECUTE_ICAL_COMPLETE: "OnExecuteICalComplete",
	EXECUTE_ICAL_FAILURE: "OnExecuteICalFailure",
	EXECUTE_ICAL_PROGRESS: "OnExecuteICalProgress",
	EXECUTE_ICAL_SSL_INFO: "OnExecuteICal_SSLInfo",
	EXECUTE_RSS_COMPLETE: "OnExecuteRSSComplete",
	EXECUTE_RSS_FAILURE: "OnExecuteRSSFailure",
	EXECUTE_RSS_SSL_INFO: "OnExecuteRSS_SSLInfo",
	EXECUTE_SCHEDULE_COMPLETE: "OnExecuteScheduleComplete",
	EXECUTE_SCHEDULE_FAILURE: "OnExecuteScheduleFailure",
	EXECUTE_SCHEDULE_GET_COMPLETE: "OnExecuteScheduleGetComplete",
	EXECUTE_WEBSOCKET_CLOSE: "OnExecuteWebSocketClose",
	EXECUTE_WEBSOCKET_FAILURE: "OnExecuteWebSocketFailure",
	EXECUTE_WEBSOCKET_OPEN: "OnExecuteWebSocketOpen",
	EXECUTE_WEBSOCKET_RECEIVE: "OnExecuteWebSocketReceive",
	EXECUTE_WEBSOCKET_RECONNECT: "OnExecuteWebSocketReconnect",
	EXECUTE_WEBSOCKET_SSL_INFO: "OnExecuteWebSocket_SSLInfo",
	NS_LOOKUP_COMPLETE: "OnNSLookupComplete",
	NS_LOOKUP_FAILURE: "OnNSLookupFailure",
	PING_COMPLETE: "OnPingComplete",
	PING_PROGRESS: "OnPingProgress",
} as const;

export const ShioriProtocol = {
	statusCodeFromRust,
	fromRustResponse,
	SHIORI_EVENTS,
};
