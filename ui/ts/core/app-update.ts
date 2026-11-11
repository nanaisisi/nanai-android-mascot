import {
	buildUpdateArgs,
	createUpdateProgressHandler,
	parseErrorReason,
} from "./actions/update-protocol.js";
import { invoke, isTauriAvailable, listen } from "./tauri-helper.js";

interface GhostUpdateCheckResult {
	has_update: boolean;
	total_count: number;
	update_files: Array<{ path: string; [key: string]: unknown }>;
	message: string;
}

interface GhostUpdateExecutionResult {
	success: boolean;
	updated_files: string[];
	reason?: string;
}

/**
 * ネットワーク更新制御モジュール
 */
export const updateMethods = {
	async startNetworkUpdate(
		targetGhostName: string | null = null,
		options: { checkOnly?: boolean } = {},
	) {
		const app =
			this as unknown as import("../../main.js").NanaiAndroidMascotApp;
		const gc = app.ghostController;
		const checkOnly = options?.checkOnly === true;
		const ghostName =
			targetGhostName || gc.currentGhost?.name || "とらふぃっく☆とれいん";
		const ghostPath = gc.currentGhost?.path || "";
		let failedFile: string | null = null;

		console.log(`🌐 ネットワーク更新プロセス開始: ${ghostName}`);

		const execRes = (await gc.sendShioriEvent("OnUpdateProcessExec", [
			"manual",
		])) as { script?: string } | undefined;
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

		app.showBalloon?.("🌐 ネットワーク更新を確認中...");

		if (!isTauriAvailable()) {
			app.wait(1500);
			app.showBalloon?.(
				"⚠️ ブラウザ環境のためネットワーク更新はシミュレーションのみです",
			);
			await gc.sendShioriEvent("OnUpdateFailure", buildUpdateArgs("fileio"));
			app.sendUpdateResultSummary(ghostName, false, "fileio", null);
			return;
		}

		try {
			const checkResult = (await invoke("check_ghost_update", {
				ghostName,
				ghostPath,
			})) as GhostUpdateCheckResult;
			console.log("🔍 更新チェック結果:", checkResult);

			const fileNames = (checkResult.update_files || []).map((f) => f.path);

			if (checkOnly) {
				app.showBalloon?.(checkResult.message);
				await gc.sendShioriEvent(
					"OnUpdateCheckComplete",
					buildUpdateArgs(
						checkResult.has_update ? String(checkResult.total_count) : "none",
						fileNames.join(","),
					),
				);
				app.sendUpdateResultSummary(
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
				app.showBalloon?.("✨ 最新の状態です。更新ファイルはありません。");
				await gc.sendShioriEvent("OnUpdateComplete", buildUpdateArgs("none"));
				app.sendUpdateResultSummary(ghostName, true, 0, null);
				return;
			}

			const totalMinusOne = (checkResult.total_count - 1).toString();
			const fileListStr = fileNames.join(",");
			await gc.sendShioriEvent(
				"OnUpdateReady",
				buildUpdateArgs(totalMinusOne, fileListStr),
			);

			app.showBalloon?.(
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
				const updateResult = (await invoke("execute_ghost_update", {
					ghostName,
					ghostPath,
				})) as GhostUpdateExecutionResult;
				console.log("🚀 更新実行結果:", updateResult);

				if (updateResult.success) {
					console.log("🔄 更新成功。ゴーストとSHIORIを再読み込みします...");
					await gc.selectGhost?.(ghostName);

					const updatedFilesStr = (updateResult.updated_files || []).join(",");
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
					app.sendUpdateResultSummary(
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
					app.showBalloon?.(`❌ ネットワーク更新失敗: ${failureReason}`);
					app.sendUpdateResultSummary(
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
				app.showBalloon?.(`❌ 更新チェック失敗: ${reason}`);
				app.sendUpdateResultSummary(ghostName, false, reason, null, true);
				return;
			}

			await gc.sendShioriEvent("OnUpdateFailure", buildUpdateArgs(reason));
			app.sendUpdateResultSummary(ghostName, false, reason, failedFile);
			app.showBalloon?.(`❌ 更新処理中にエラーが発生しました: ${err}`);
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
		const app =
			this as unknown as import("../../main.js").NanaiAndroidMascotApp;
		const gc = app.ghostController;
		const sep = String.fromCharCode(1); // \1 (バイト値1)
		const parts = ["ghost", success ? "OK" : "NG", String(detail)];
		if (failedFile) parts.push(failedFile);
		const baseEvent = checkOnly ? "OnUpdateCheckResult" : "OnUpdateResult";

		const resEx = (await gc.sendShioriEvent(`${baseEvent}Ex`, [
			[ghostName, ...parts].join(sep),
		])) as { script?: string } | undefined;
		if (!resEx?.script?.trim()) {
			await gc.sendShioriEvent(baseEvent, [parts.join(sep)]);
		}
	},
};
