/**
 * @file shiori-notify/input-events.ts
 * @brief マウス・ドロップ・ゲームパッド・重なり等の入力/操作イベント通知
 */

export const shioriNotifyInputEvents = {

	/**
	 * URL ドロップイベント通知 (UKADOC url-drop)
	 */
	async notifyUrlDropEvent(
		this: unknown,
		event:
			| "OnURLDropped"
			| "OnURLDropping"
			| "OnURLDragDropping"
			| "OnURLDropFailure"
			| "OnURLQuery"
			| "OnXUkagakaLinkOpen"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * ファイルドロップイベント通知 (UKADOC file-drop)
	 */
	async notifyFileDropEvent(
		this: unknown,
		event:
			| "OnFileDrop"
			| "OnFileDrop2"
			| "OnFileDropEx"
			| "OnFileDropped"
			| "OnFileDropping"
			| "OnDirectoryDrop"
			| "OnArchiveViewerOpen"
			| "OnMediaPlayerOpen"
			| "OnPictureViewerOpen"
			| "OnNarCreating"
			| "OnNarCreated"
			| "OnUpdatedataCreating"
			| "OnUpdatedataCreated"
			| "OnOtherObjectDropping"
			| "OnOtherObjectDropped"
			| "OnWallpaperChange"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * 重なり・画面外判定通知 (UKADOC overlap)
	 */
	async notifyOverlapEvent(
		this: unknown,
		event:
			| "OnOffscreen"
			| "OnOtherOffscreen"
			| "OnOverlap"
			| "OnOtherOverlap"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * イベント送信・通知失敗イベント (UKADOC event-send-failure)
	 */
	async notifyEventSendFailure(
		this: unknown,
		event:
			| "OnNotifyOtherFailure"
			| "OnNotifyPluginFailure"
			| "OnRaiseOtherFailure"
			| "OnRaisePluginFailure"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * ゲームパッドイベント通知 (UKADOC gamepad)
	 */
	async notifyGamepadEvent(
		this: unknown,
		event:
			| "OnGamepadAxisMove"
			| "OnGamepadButtonDown"
			| "OnGamepadButtonUp"
			| "OnGamepadConnected"
			| "OnGamepadDisconnected"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * 矩形選択モードイベント通知 (UKADOC select-region-mode)
	 */
	async notifySelectRegionModeEvent(
		this: unknown,
		event:
			| "OnSelectModeBegin"
			| "OnSelectModeCancel"
			| "OnSelectModeComplete"
			| "OnSelectModeMouseDown"
			| "OnSelectModeMouseUp"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * 音声認識・合成イベント通知 (UKADOC speech)
	 */
	async notifySpeechEvent(
		this: unknown,
		event:
			| "OnSpeechSynthesisStatus"
			| "OnVoiceRecognitionStatus"
			| "OnVoiceRecognitionWord"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * その他の各種通知 (UKADOC other)
	 */
	async notifyOtherEvent(
		this: unknown,
		event:
			| "OnAITalk"
			| "OnCompressArchiveComplete"
			| "OnCompressArchiveFailure"
			| "OnEmbryoExist"
			| "OnExtractArchiveComplete"
			| "OnExtractArchiveFailure"
			| "OnInternalSaoriComplete"
			| "OnInternalSaoriFailure"
			| "OnLanguageChange"
			| "OnNekodorifExist"
			| "OnOtherGhostTalk"
			| "OnRecommendsiteChoice"
			| "OnSoundSpectrum"
			| "OnTextDrop"
			| "OnVideoPlayEx"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * マウス拡張イベント送信
	 */
	async notifyMouseEvent(
		this: unknown,
		eventName: string,
		args: Array<string | number>,
	) {
		return await this.sendShioriNotify(eventName, args);
	},

	/**
	 * 重なり・画面外通知 (UKADOC overlap spec)
	 */
	async sendOverlap(
		this: unknown,
		scope0: number | string,
		scope1: number | string,
		rect: string = "",
	) {
		return await this.sendShioriNotify("OnOverlap", [
			String(scope0),
			String(scope1),
			rect,
		]);
	},

	async sendOffscreen(
		this: unknown,
		scope: number | string,
		rect: string = "",
	) {
		return await this.sendShioriNotify("OnOffscreen", [String(scope), rect]);
	},

	async sendOtherOverlap(this: unknown, ghostName: string, rect: string = "") {
		return await this.sendShioriNotify("OnOtherOverlap", [ghostName, rect]);
	},

	async sendOtherOffscreen(
		this: unknown,
		ghostName: string,
		rect: string = "",
	) {
		return await this.sendShioriNotify("OnOtherOffscreen", [ghostName, rect]);
	},

	/**
	 * 外部通信イベント通知 (UKADOC other-communication spec)
	 */
	async notifyCommunicationEvent(
		this: unknown,
		event:
			| "OnExecuteFileWatchChange"
			| "OnExecuteFileWatchFailure"
			| "OnExecuteHTTPComplete"
			| "OnExecuteHTTPFailure"
			| "OnExecuteHTTPProgress"
			| "OnExecuteHTTPSSLInfo"
			| "OnExecuteHTTPStreaming"
			| "OnExecuteICalComplete"
			| "OnExecuteICalFailure"
			| "OnExecuteICalProgress"
			| "OnExecuteICal_SSLInfo"
			| "OnExecuteRSSComplete"
			| "OnExecuteRSSFailure"
			| "OnExecuteRSS_SSLInfo"
			| "OnExecuteScheduleComplete"
			| "OnExecuteScheduleFailure"
			| "OnExecuteScheduleGetComplete"
			| "OnExecuteWebSocketClose"
			| "OnExecuteWebSocketFailure"
			| "OnExecuteWebSocketOpen"
			| "OnExecuteWebSocketReceive"
			| "OnExecuteWebSocketReconnect"
			| "OnExecuteWebSocket_SSLInfo"
			| "OnNSLookupComplete"
			| "OnNSLookupFailure"
			| "OnPingComplete"
			| "OnPingProgress",
		references: (string | number)[] = [],
	) {
		return await this.sendShioriNotify(
			event,
			references.map((r) => String(r)),
		);
	},
};
