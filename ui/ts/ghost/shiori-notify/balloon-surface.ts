/**
 * @file shiori-notify/balloon-surface.ts
 * @brief バルーン/サーフィス/選択肢関連の通知
 */

export const shioriNotifyBalloonSurface = {
	/**
	 * サーフィス・バルーン状態通知 (UKADOC surface / balloon)
	 */
	async notifySurfaceBalloonEvent(
		this: any,
		event:
			| "OnSurfaceChange"
			| "OnOtherSurfaceChange"
			| "OnBalloonClose"
			| "OnBalloonBreak"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * 選択肢・アンカー拡張通知 (UKADOC choice)
	 */
	async notifyChoiceAnchorEx(
		this: any,
		event: "OnChoiceSelectEx" | "OnAnchorSelectEx" | string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * バルーン倍率変更通知 (OnBalloonScaling) を送信 (UKADOC準拠)
	 */
	async sendBalloonScalingNotify(
		this: any,
		afterX: number | string,
		beforeX: number | string,
		afterY: number | string = afterX,
		beforeY: number | string = beforeX,
	) {
		return await this.sendShioriNotify("OnBalloonScaling", [
			String(afterX),
			String(beforeX),
			String(afterY),
			String(beforeY),
		]);
	},

	/**
	 * バルーン閉じる通知 (OnBalloonClose) を送信 (UKADOC準拠)
	 * @param {string} [lastScript=""] 閉じる直前に表示されていたスクリプト
	 * @param {number|string} [scopeId=0] バルーンのスコープID
	 */
	async sendBalloonCloseNotify(
		this: any,
		lastScript: string = "",
		scopeId: number | string = 0,
	) {
		return await this.sendShioriNotify("OnBalloonClose", [
			lastScript,
			String(scopeId),
		]);
	},

	/**
	 * バルーンタイムアウト通知 (OnBalloonTimeout) を送信 (UKADOC準拠)
	 * Reference0: 直前スクリプト, Reference1: スコープID
	 * @param {string} [lastScript=""] タイムアウトした直前に表示されていたスクリプト
	 * @param {number|string} [scopeId=0] バルーンのスコープID
	 */
	async sendBalloonTimeoutNotify(
		this: any,
		lastScript: string = "",
		scopeId: number | string = 0,
	) {
		return await this.sendShioriNotify("OnBalloonTimeout", [
			lastScript,
			String(scopeId),
		]);
	},

	/**
	 * バルーン中断通知 (OnBalloonBreak) を送信 (UKADOC準拠)
	 * @param {string} [script=""] 中断の操作が起きたスクリプト
	 * @param {number|string} [scopeId=0] 中断の操作が起きたスコープ番号 (本体側0, 相方側1...)
	 * @param {number|string} [charPosition] 中断位置 (スクリプト先頭からの文字数)
	 */
	async sendBalloonBreakNotify(
		this: any,
		script: string = "",
		scopeId: number | string = 0,
		charPosition?: number | string,
	) {
		const refs = [script, String(scopeId)];
		if (charPosition !== undefined) {
			refs.push(String(charPosition));
		}
		return await this.sendShioriNotify("OnBalloonBreak", refs);
	},

	/**
	 * サーフェス変更通知 (OnSurfaceChange) を送信 (UKADOC 規格準拠)
	 * @param {number} scopeId 切り替わったウインドウ・キャラID (Sakura=0, Kero=1)
	 * @param {number|string} surface0 Sakura側の現在サーフィスID
	 * @param {number|string} surface1 Kero側の現在サーフィスID
	 * @param {number} [width=0] サーフィス横幅
	 * @param {number} [height=0] サーフィス高さ
	 */
	async notifySurfaceChange(
		this: any,
		scopeId: number,
		surface0: number | string = 0,
		surface1: number | string = 10,
		width: number = 0,
		height: number = 0,
	) {
		const ref2 = `${scopeId},${scopeId === 0 ? surface0 : surface1},${width},${height}`;
		return await this.sendShioriNotify("OnSurfaceChange", [
			String(surface0),
			String(surface1),
			ref2,
		]);
	},

	/**
	 * 他ゴーストのサーフェス変更通知 (OnOtherSurfaceChange) を送信 (UKADOC 規格準拠)
	 * @param {string} ghostName ゴースト名
	 * @param {string} sakuraName Sakura名
	 * @param {number} scopeId ウインドウID (0=Sakura, 1=Kero)
	 * @param {number|string} newSurface 新サーフィスID
	 * @param {number|string} oldSurface 旧サーフィスID
	 * @param {{ left: number, top: number, right: number, bottom: number }|string} [rect="0,0,0,0"]
	 */
	async notifyOtherSurfaceChange(
		this: any,
		ghostName: string,
		sakuraName: string,
		scopeId: number,
		newSurface: number | string,
		oldSurface: number | string,
		rect:
			| { left: number; top: number; right: number; bottom: number }
			| string = "0,0,0,0",
	) {
		const rectStr =
			typeof rect === "object"
				? `${rect.left},${rect.top},${rect.right},${rect.bottom}`
				: String(rect);
		return await this.sendShioriNotify("OnOtherSurfaceChange", [
			ghostName,
			sakuraName,
			String(scopeId),
			String(newSurface),
			String(oldSurface),
			rectStr,
		]);
	},

	/**
	 * 選択肢拡張通知 (OnChoiceSelectEx) を送信 (UKADOC 規格準拠)
	 * Reference0: ラベル(text), Reference1: ID, Reference2..: 拡張引数
	 */
	async sendChoiceSelectExNotify(
		this: any,
		id: string,
		text: string,
		args: string[] = [],
	) {
		return await this.sendShioriNotify("OnChoiceSelectEx", [text, id, ...args]);
	},

	/**
	 * アンカー拡張通知 (OnAnchorSelectEx) を送信 (UKADOC 規格準拠)
	 * Reference0: テキスト, Reference1: ID, Reference2..: 拡張引数
	 */
	async sendAnchorSelectExNotify(
		this: any,
		id: string,
		text: string,
		args: string[] = [],
	) {
		return await this.sendShioriNotify("OnAnchorSelectEx", [text, id, ...args]);
	},

	/**
	 * バルーン関連 SHIORI イベント通知 (UKADOC balloon spec)
	 */
	async sendBalloonClose(
		this: any,
		scopeId: number | string = 0,
		reason: string = "",
	) {
		return await this.sendShioriNotify("OnBalloonClose", [
			String(scopeId),
			reason,
		]);
	},

	async sendBalloonBreak(
		this: any,
		scopeId: number | string = 0,
		reason: string = "",
	) {
		return await this.sendShioriNotify("OnBalloonBreak", [
			String(scopeId),
			reason,
		]);
	},

	/**
	 * サーフィス関連 SHIORI イベント通知 (UKADOC surface spec)
	 */
	async sendSurfaceChange(
		this: any,
		scopeId: number | string = 0,
		surfaceId: number | string = 0,
	) {
		return await this.sendShioriNotify("OnSurfaceChange", [
			String(scopeId),
			String(surfaceId),
		]);
	},

	async sendOtherSurfaceChange(
		this: any,
		ghostName: string,
		scopeId: number | string = 0,
		surfaceId: number | string = 0,
	) {
		return await this.sendShioriNotify("OnOtherSurfaceChange", [
			ghostName,
			String(scopeId),
			String(surfaceId),
		]);
	},
};
