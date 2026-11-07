import {
	buildUpdateArgs,
	createUpdateProgressHandler,
	parseErrorReason,
} from "./actions/update-protocol.js";
import { invoke, isTauriAvailable, listen } from "./tauri-helper.js";

/**
 * ネットワーク更新制御モジュール
 */
export const updateMethods = {
	async startNetworkUpdate(
		targetGhostName: string | null = null,
		options: { checkOnly?: boolean } = {},
	) {
		const gc = (this as any).ghostController;
		const checkOnly = options?.checkOnly === true;
		const ghostName =
			targetGhostName || gc.currentGhost?.name || "とらふぃっく☆とれいん";
		const ghostPath = gc.currentGhost?.path || "";
		let failedFile: string | null = null;

		console.log(`🌐 ネットワーク更新プロセス開始: ${ghostName}`);

		const execRes: any = await gc.sendShioriEvent("OnUpdateProcessExec", [
			"manual",
		]);
		if (execRes?.script?.trim()) {
			console.log(
				"OnUpdateProcessExec でスクリプトが返されたため標準処理を委譲",
			);
			return;
		}

		if (!checkOnly) {
			await gc.sendShioriEvent(
				"OnUpdateBegin",
				buildUpdateArgs(ghostName, ghostPath),
			);
		}

		(this as any).showBalloon?.("🌐 ネットワーク更新を確認中...");

		if (!isTauriAvailable()) {
			await (this as any).wait(1500);
			(this as any).showBalloon?.(
				"⚠️ ブラウザ環境のためネットワーク更新はシミュレーションのみです",
			);
			await gc.sendShioriEvent("OnUpdateFailure", buildUpdateArgs("fileio"));
			await (this as any).sendUpdateResultSummary(
				ghostName,
				false,
				"fileio",
				null,
			);
			return;
		}

		try {
			const checkResult: any = await invoke("check_ghost_update", {
				ghostName,
				ghostPath,
			});
			console.log("🔍 更新チェック結果:", checkResult);

			const fileNames = checkResult.update_files.map((f: any) => f.path);

			if (checkOnly) {
				(this as any).showBalloon?.(checkResult.message);
				await gc.sendShioriEvent(
					"OnUpdateCheckComplete",
					buildUpdateArgs(
						checkResult.has_update ? String(checkResult.total_count) : "none",
						fileNames.join(","),
					),
				);
				await (this as any).sendUpdateResultSummary(
					ghostName,
					true,
					checkResult.has_update ? checkResult.total_count : 0,
					null,
					true,
				);
				return;
			}

			if (!checkResult.has_update || checkResult.update_files.length === 0) {
				console.log("✨ 更新ファイルなし (none)");
				(this as any).showBalloon?.(
					"✨ 最新の状態です。更新ファイルはありません。",
				);
				await gc.sendShioriEvent("OnUpdateComplete", buildUpdateArgs("none"));
				await (this as any).sendUpdateResultSummary(ghostName, true, 0, null);
				return;
			}

			const totalMinusOne = (checkResult.total_count - 1).toString();
			const fileListStr = fileNames.join(",");
			await gc.sendShioriEvent(
				"OnUpdateReady",
				buildUpdateArgs(totalMinusOne, fileListStr),
			);

			(this as any).showBalloon?.(
				`📥 更新ファイル ${checkResult.total_count} 件をダウンロード中...`,
			);

			const progressHandler = createUpdateProgressHandler(gc, (fp) => {
				failedFile = fp;
			});

			let unlisten: (() => void) | null = null;
			try {
				unlisten = await listen("update-progress", progressHandler);
			} catch (_) {
				// 進捗リスナーの登録失敗時は無効化して続行
			}

			try {
				const updateResult: any = await invoke("execute_ghost_update", {
					ghostName,
					ghostPath,
				});
				console.log("🚀 更新実行結果:", updateResult);

				if (updateResult.success) {
					console.log("🔄 更新成功。ゴーストとSHIORIを再読み込みします...");
					gc.selectGhost(ghostName);

					const updatedFilesStr = updateResult.updated_files.join(",");
					await gc.sendShioriEvent(
						"OnUpdateComplete",
						buildUpdateArgs(updateResult.reason || "changed", updatedFilesStr),
					);
					if (updateResult.updated_files?.length > 0) {
						await gc.sendShioriEvent("OnUpdateResultExplorer", [
							"changed",
							updatedFilesStr,
							"ghost",
							ghostName,
						]);
					}
					await (this as any).sendUpdateResultSummary(
						ghostName,
						true,
						updateResult.updated_files.length,
						null,
					);
				} else {
					const failureReason = updateResult.reason || "unknown";
					await gc.sendShioriEvent(
						"OnUpdateFailure",
						buildUpdateArgs(
							failureReason,
							updateResult.updated_files?.join(",") ?? "",
						),
					);
					(this as any).showBalloon?.(
						`❌ ネットワーク更新失敗: ${failureReason}`,
					);
					await (this as any).sendUpdateResultSummary(
						ghostName,
						false,
						failureReason,
						failedFile,
					);
				}
			} finally {
				if (typeof unlisten === "function") {
					try {
						await unlisten();
					} catch (_) {
						// イベントリスナーの解除エラーは安全に無視
					}
				}
			}
		} catch (err) {
			console.error("ネットワーク更新エラー:", err);
			const reason = parseErrorReason(err);

			if (checkOnly) {
				await gc.sendShioriEvent(
					"OnUpdateCheckFailure",
					buildUpdateArgs(reason),
				);
				(this as any).showBalloon?.(`❌ 更新チェック失敗: ${reason}`);
				await (this as any).sendUpdateResultSummary(
					ghostName,
					false,
					reason,
					null,
					true,
				);
				return;
			}

			await gc.sendShioriEvent("OnUpdateFailure", buildUpdateArgs(reason));
			await (this as any).sendUpdateResultSummary(
				ghostName,
				false,
				reason,
				failedFile,
			);
			(this as any).showBalloon?.(
				`❌ 更新処理中にエラーが発生しました: ${err}`,
			);
		}
	},

	wait(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	},

	async sendUpdateResultSummary(
		ghostName: string,
		success: boolean,
		detail: number | string,
		failedFile: string | null,
		checkOnly: boolean = false,
	) {
		const gc = (this as any).ghostController;
		const sep = String.fromCharCode(1); // \1 (バイト値1)
		const parts = ["ghost", success ? "OK" : "NG", String(detail)];
		if (failedFile) parts.push(failedFile);
		const baseEvent = checkOnly ? "OnUpdateCheckResult" : "OnUpdateResult";

		const resEx: any = await gc.sendShioriEvent(`${baseEvent}Ex`, [
			[ghostName, ...parts].join(sep),
		]);
		if (!resEx?.script?.trim()) {
			await gc.sendShioriEvent(baseEvent, [parts.join(sep)]);
		}
	},
};
