import { invoke, isTauriAvailable } from "./tauri-helper.js";

/**
 * ネットワーク更新制御モジュール
 * UKADOC (SSP仕様) 準拠:
 * 1. OnUpdateProcessExec (スクリプト返答があればカスタマイズ)
 * 2. OnUpdateBegin
 * 3. check_ghost_update -> 更新ファイル確認
 *    - 更新なし: OnUpdateComplete (Reference0: "none")
 *    - 更新あり: OnUpdateReady (Reference0: ファイル総数-1, Reference1: ファイル名リスト)
 * 4. 各ファイル取得:
 *    - OnUpdate.OnDownloadBegin
 *    - OnUpdate.OnMD5CompareBegin
 *    - OnUpdate.OnMD5CompareComplete / OnMD5CompareFailure
 * 5. 全ファイル取得・置き換え後、ゴースト再ロード -> OnUpdateComplete (Reference0: "changed")
 * 失敗時は随時 OnUpdateFailure (Reference0: failure_reason)
 */
export const updateMethods = {
	/**
	 * ネットワーク更新を開始
	 * @this {import('../../main.js').NanaiAndroidMascotApp}
	 * @param {string} [targetGhostName]
	 */
	async startNetworkUpdate(targetGhostName = null) {
		const gc = this.ghostController;
		const ghostName =
			targetGhostName || gc.currentGhost?.name || "とらふぃっく☆とれいん";
		const ghostPath = gc.currentGhost?.path || "";

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
		await gc.sendShioriEvent("OnUpdateBegin", [
			ghostName,
			ghostPath,
			"",
			"ghost",
			"manual",
		]);

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
			return;
		}

		try {
			// 3. 更新ファイル有無チェック
			const checkResult = await invoke("check_ghost_update", { ghostName });
			console.log("🔍 更新チェック結果:", checkResult);

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
				return;
			}

			// 4. OnUpdateReady
			const totalMinusOne = (checkResult.total_count - 1).toString();
			const fileListStr = checkResult.update_files.map((f) => f.path).join(",");
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

			// 5. 更新実行
			const updateResult = await invoke("execute_ghost_update", { ghostName });
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
				this.showBalloon?.("🎉 ネットワーク更新が完了しました！");
			} else {
				const failureReason = updateResult.reason || "unknown";
				await gc.sendShioriEvent("OnUpdateFailure", [
					failureReason,
					"",
					"",
					"ghost",
					"manual",
				]);
				this.showBalloon?.(`❌ ネットワーク更新失敗: ${failureReason}`);
			}
		} catch (err) {
			console.error("ネットワーク更新エラー:", err);
			const errMsg = String(err);
			const reason = errMsg.includes("404")
				? "404"
				: errMsg.includes("timeout")
					? "timeout"
					: "fileio";
			await gc.sendShioriEvent("OnUpdateFailure", [
				reason,
				"",
				"",
				"ghost",
				"manual",
			]);
			this.showBalloon?.(`❌ 更新処理中にエラーが発生しました: ${err}`);
		}
	},

	wait(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	},
};
