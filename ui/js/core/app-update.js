import { invoke, isTauriAvailable, listen } from "./tauri-helper.js";

/**
 * ネットワーク更新制御モジュール
 * UKADOC (SSP仕様) 準拠:
 * 1. OnUpdateProcessExec (スクリプト返答があればカスタマイズ)
 * 2. OnUpdateBegin
 * 3. check_ghost_update -> 更新ファイル確認
 *    - 更新なし: OnUpdateComplete (Reference0: "none")
 *    - 更新あり: OnUpdateReady (Reference0: ファイル総数-1, Reference1: ファイル名リスト)
 *    - チェックのみ実行時: OnUpdateCheckComplete / OnUpdateCheckFailure
 * 4. 各ファイル取得 (execute_ghost_update の update-progress 通知から中継):
 *    - OnUpdate.OnDownloadBegin
 *    - OnUpdate.OnMD5CompareBegin
 *    - OnUpdate.OnMD5CompareComplete / OnUpdate.OnMD5CompareFailure
 * 5. 全ファイル取得・置き換え後、ゴースト再ロード -> OnUpdateComplete (Reference0: "changed")
 * 失敗時は随時 OnUpdateFailure (Reference0: failure_reason)
 * 6. 全更新終了後: OnUpdateResultEx -> (スクリプト未返答なら) OnUpdateResult
 *    (種別)[\1](OK|NG)[\1](件数|理由), チェックのみ実行時は OnUpdateCheckResult(Ex)
 */
export const updateMethods = {
	/**
	 * ネットワーク更新を開始
	 * @this {import('../../main.js').NanaiAndroidMascotApp}
	 * @param {string|null} [targetGhostName]
	 * @param {{ checkOnly?: boolean }} [options] - 更新チェックのみ行う場合 true
	 */
	async startNetworkUpdate(targetGhostName = null, options = {}) {
		const gc = this.ghostController;
		const checkOnly = options?.checkOnly === true;
		const ghostName =
			targetGhostName || gc.currentGhost?.name || "とらふぃっく☆とれいん";
		const ghostPath = gc.currentGhost?.path || "";
		let failedFile = null;

		console.log(`🌐 ネットワーク更新プロセス開始: ${ghostName}`);

		// 1. OnUpdateProcessExec 送信
		const execRes = await gc.sendShioriEvent("OnUpdateProcessExec", ["manual"]);
		if (execRes?.script?.trim()) {
			console.log(
				"OnUpdateProcessExec でスクリプトが返されたため標準処理を委譲",
			);
			return;
		}

		// 2. OnUpdateBegin 送信 (Ref0: ゴースト名, Ref1: パス, Ref3: "ghost", Ref4: "manual")
		//    ※チェックのみ実行時は OnUpdateBegin/OnUpdateReady 以降を発生させない (UKADOC準拠)
		if (!checkOnly) {
			await gc.sendShioriEvent("OnUpdateBegin", [
				ghostName,
				ghostPath,
				"",
				"ghost",
				"manual",
			]);
		}

		this.showBalloon?.("🌐 ネットワーク更新を確認中...");

		if (!isTauriAvailable()) {
			await this.wait(1500);
			this.showBalloon?.(
				"⚠️ ブラウザ環境のためネットワーク更新はシミュレーションのみです",
			);
			await gc.sendShioriEvent("OnUpdateFailure", [
				"fileio",
				"",
				"",
				"ghost",
				"manual",
			]);
			await this.sendUpdateResultSummary(ghostName, false, "fileio", null);
			return;
		}

		try {
			// 3. 更新ファイル有無チェック
			const checkResult = await invoke("check_ghost_update", {
				ghostName,
				ghostPath,
			});
			console.log("🔍 更新チェック結果:", checkResult);

			const fileNames = checkResult.update_files.map((f) => f.path);

			if (checkOnly) {
				// チェックのみ実行: OnUpdateCheckComplete (Ref0: 総数 または "none")
				this.showBalloon?.(checkResult.message);
				await gc.sendShioriEvent("OnUpdateCheckComplete", [
					checkResult.has_update ? String(checkResult.total_count) : "none",
					fileNames.join(","),
					"",
					"ghost",
					"manual",
				]);
				await this.sendUpdateResultSummary(
					ghostName,
					true,
					checkResult.has_update ? checkResult.total_count : 0,
					null,
					true,
				);
				return;
			}

			if (!checkResult.has_update || checkResult.update_files.length === 0) {
				// 更新なし
				console.log("✨ 更新ファイルなし (none)");
				this.showBalloon?.("✨ 最新の状態です。更新ファイルはありません。");
				await gc.sendShioriEvent("OnUpdateComplete", [
					"none",
					"",
					"",
					"ghost",
					"manual",
				]);
				await this.sendUpdateResultSummary(ghostName, true, 0, null);
				return;
			}

			// 4. OnUpdateReady
			const totalMinusOne = (checkResult.total_count - 1).toString();
			const fileListStr = fileNames.join(",");
			await gc.sendShioriEvent("OnUpdateReady", [
				totalMinusOne,
				fileListStr,
				"",
				"ghost",
				"manual",
			]);

			this.showBalloon?.(
				`📥 更新ファイル ${checkResult.total_count} 件をダウンロード中...`,
			);

			// 4.5 ファイル単位の進捗通知 (Rust execute_ghost_update の update-progress)
			const progressHandler = (event) => {
				const { phase, path: filePath } = event.payload || {};
				if (!filePath) return;
				// UKADOC 準拠のイベント名へ中継
				if (phase === "download-begin") {
					gc.sendShioriEvent("OnUpdate.OnDownloadBegin", [
						filePath,
						"",
						"",
						"ghost",
						"manual",
					]).catch?.(() => {});
				} else if (phase === "md5-begin") {
					gc.sendShioriEvent("OnUpdate.OnMD5CompareBegin", [
						filePath,
						"",
						"",
						"ghost",
						"manual",
					]).catch?.(() => {});
				} else if (phase === "md5-complete") {
					gc.sendShioriEvent("OnUpdate.OnMD5CompareComplete", [
						filePath,
						"",
						"",
						"ghost",
						"manual",
					]).catch?.(() => {});
				} else if (phase === "md5-failed") {
					gc.sendShioriEvent("OnUpdate.OnMD5CompareFailure", [
						filePath,
						"",
						"",
						"ghost",
						"manual",
					]).catch?.(() => {});
					failedFile = filePath;
				}
			};
			const unlisten = isTauriAvailable()
				? await listen("update-progress", progressHandler)
				: null;

			try {
				// 5. 更新実行
				const updateResult = await invoke("execute_ghost_update", {
					ghostName,
					ghostPath,
				});
				console.log("🚀 更新実行結果:", updateResult);

				if (updateResult.success) {
					// ゴーストとSHIORIを再ロード
					console.log("🔄 更新成功。ゴーストとSHIORIを再読み込みします...");
					gc.selectGhost(ghostName);

					const updatedFilesStr = updateResult.updated_files.join(",");
					await gc.sendShioriEvent("OnUpdateComplete", [
						updateResult.reason || "changed",
						updatedFilesStr,
						"",
						"ghost",
						"manual",
					]);
					// OnUpdateResultExplorer 送信 (UKADOC準拠: 更新詳細・差分リスト通知)
					if (updateResult.updated_files?.length > 0) {
						await gc.sendShioriEvent("OnUpdateResultExplorer", [
							"changed",
							updatedFilesStr,
							"ghost",
							ghostName,
						]);
					}
					await this.sendUpdateResultSummary(
						ghostName,
						true,
						updateResult.updated_files.length,
						null,
					);
				} else {
					const failureReason = updateResult.reason || "unknown";
					await gc.sendShioriEvent("OnUpdateFailure", [
						failureReason,
						updateResult.updated_files?.join(",") ?? "",
						"",
						"ghost",
						"manual",
					]);
					this.showBalloon?.(`❌ ネットワーク更新失敗: ${failureReason}`);
					await this.sendUpdateResultSummary(
						ghostName,
						false,
						failureReason,
						failedFile,
					);
				}
			} finally {
				unlisten?.();
			}
		} catch (err) {
			console.error("ネットワーク更新エラー:", err);
			const errMsg = String(err);
			const reason = errMsg.includes("404")
				? "404"
				: errMsg.includes("timeout")
					? "timeout"
					: "fileio";

			if (checkOnly) {
				// チェックのみ実行: OnUpdateCheckFailure (Ref0: 失敗理由)
				await gc.sendShioriEvent("OnUpdateCheckFailure", [
					reason,
					"",
					"",
					"ghost",
					"manual",
				]);
				this.showBalloon?.(`❌ 更新チェック失敗: ${reason}`);
				await this.sendUpdateResultSummary(
					ghostName,
					false,
					reason,
					null,
					true,
				);
				return;
			}

			await gc.sendShioriEvent("OnUpdateFailure", [
				reason,
				"",
				"",
				"ghost",
				"manual",
			]);
			await this.sendUpdateResultSummary(ghostName, false, reason, failedFile);
			this.showBalloon?.(`❌ 更新処理中にエラーが発生しました: ${err}`);
		}
	},

	wait(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	},

	/**
	 * 更新結果の一括通知 (UKADOC準拠)
	 * OnUpdateResultEx (または OnUpdateCheckResultEx) を送信し、
	 * スクリプトが返されなかった場合のみ OnUpdateResult (同 Check 版) を送信する。
	 * 各 Reference には (Ex無: 種別, Ex有: 対象名)[\1]種別[\1]OK|NG[\1]件数または理由[\1]失敗ファイル 形式の文字列を格納
	 * ※失敗ファイルが特定できない場合は [\1] 区切りの第5要素を省略
	 * @this {import('../../main.js').NanaiAndroidMascotApp}
	 * @param {string} ghostName 更新対象 (ゴースト名)
	 * @param {boolean} success 成功有無
	 * @param {number|string} detail 成功時は更新ファイル数 (更新なし=none の場合は 0)、失敗時は失敗理由
	 * @param {string|null} failedFile 失敗原因ファイル名 (不明なら null)
	 * @param {boolean} [checkOnly] 更新チェックのみ実行時 true
	 */
	async sendUpdateResultSummary(
		ghostName,
		success,
		detail,
		failedFile,
		checkOnly = false,
	) {
		const gc = this.ghostController;
		const sep = String.fromCharCode(1); // \1 (バイト値1)
		const parts = ["ghost", success ? "OK" : "NG", String(detail)];
		if (failedFile) parts.push(failedFile);
		const baseEvent = checkOnly ? "OnUpdateCheckResult" : "OnUpdateResult";

		const resEx = await gc.sendShioriEvent(`${baseEvent}Ex`, [
			[ghostName, ...parts].join(sep),
		]);
		if (!resEx?.script?.trim()) {
			await gc.sendShioriEvent(baseEvent, [parts.join(sep)]);
		}
	},
};
