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
<<<<<<< HEAD
		const gc = (this as unknown).ghostController;
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const gc = (this as any).ghostController;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		const checkOnly = options?.checkOnly === true;
		const ghostName =
			targetGhostName || gc.currentGhost?.name || "とらふぃっく☆とれいん";
		const ghostPath = gc.currentGhost?.path || "";
		let failedFile: string | null = null;

		console.log(`🌐 ネットワーク更新プロセス開始: ${ghostName}`);

<<<<<<< HEAD
		const execRes: unknown = await gc.sendShioriEvent("OnUpdateProcessExec", [
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const execRes: any = await gc.sendShioriEvent("OnUpdateProcessExec", [
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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

<<<<<<< HEAD
		(this as unknown).showBalloon?.("🌐 ネットワーク更新を確認中...");

		if (!isTauriAvailable()) {
			await (this as unknown).wait(1500);
			(this as unknown).showBalloon?.(
				"⚠️ ブラウザ環境のためネットワーク更新はシミュレーションのみです",
			);
			await gc.sendShioriEvent("OnUpdateFailure", buildUpdateArgs("fileio"));
			await (this as unknown).sendUpdateResultSummary(
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).showBalloon?.("🌐 ネットワーク更新を確認中...");

		if (!isTauriAvailable()) {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			await (this as any).wait(1500);
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon?.(
				"⚠️ ブラウザ環境のためネットワーク更新はシミュレーションのみです",
			);
			await gc.sendShioriEvent("OnUpdateFailure", buildUpdateArgs("fileio"));
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			await (this as any).sendUpdateResultSummary(
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
				ghostName,
				false,
				"fileio",
				null,
			);
			return;
		}

		try {
<<<<<<< HEAD
			const checkResult: unknown = await invoke("check_ghost_update", {
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const checkResult: any = await invoke("check_ghost_update", {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
				ghostName,
				ghostPath,
			});
			console.log("🔍 更新チェック結果:", checkResult);

<<<<<<< HEAD
			const fileNames = checkResult.update_files.map((f: unknown) => f.path);

			if (checkOnly) {
				(this as unknown).showBalloon?.(checkResult.message);
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const fileNames = checkResult.update_files.map((f: any) => f.path);

			if (checkOnly) {
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).showBalloon?.(checkResult.message);
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
				await gc.sendShioriEvent(
					"OnUpdateCheckComplete",
					buildUpdateArgs(
						checkResult.has_update ? String(checkResult.total_count) : "none",
						fileNames.join(","),
					),
				);
<<<<<<< HEAD
				await (this as unknown).sendUpdateResultSummary(
=======
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				await (this as any).sendUpdateResultSummary(
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
				(this as unknown).showBalloon?.(
					"✨ 最新の状態です。更新ファイルはありません。",
				);
				await gc.sendShioriEvent("OnUpdateComplete", buildUpdateArgs("none"));
				await (this as unknown).sendUpdateResultSummary(
					ghostName,
					true,
					0,
					null,
				);
=======
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).showBalloon?.(
					"✨ 最新の状態です。更新ファイルはありません。",
				);
				await gc.sendShioriEvent("OnUpdateComplete", buildUpdateArgs("none"));
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				await (this as any).sendUpdateResultSummary(ghostName, true, 0, null);
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
				return;
			}

			const totalMinusOne = (checkResult.total_count - 1).toString();
			const fileListStr = fileNames.join(",");
			await gc.sendShioriEvent(
				"OnUpdateReady",
				buildUpdateArgs(totalMinusOne, fileListStr),
			);

<<<<<<< HEAD
			(this as unknown).showBalloon?.(
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon?.(
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
				const updateResult: unknown = await invoke("execute_ghost_update", {
=======
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				const updateResult: any = await invoke("execute_ghost_update", {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
					await (this as unknown).sendUpdateResultSummary(
=======
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					await (this as any).sendUpdateResultSummary(
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
					(this as unknown).showBalloon?.(
						`❌ ネットワーク更新失敗: ${failureReason}`,
					);
					await (this as unknown).sendUpdateResultSummary(
=======
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					(this as any).showBalloon?.(
						`❌ ネットワーク更新失敗: ${failureReason}`,
					);
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					await (this as any).sendUpdateResultSummary(
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
				(this as unknown).showBalloon?.(`❌ 更新チェック失敗: ${reason}`);
				await (this as unknown).sendUpdateResultSummary(
=======
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).showBalloon?.(`❌ 更新チェック失敗: ${reason}`);
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				await (this as any).sendUpdateResultSummary(
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
					ghostName,
					false,
					reason,
					null,
					true,
				);
				return;
			}

			await gc.sendShioriEvent("OnUpdateFailure", buildUpdateArgs(reason));
<<<<<<< HEAD
			await (this as unknown).sendUpdateResultSummary(
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			await (this as any).sendUpdateResultSummary(
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
				ghostName,
				false,
				reason,
				failedFile,
			);
<<<<<<< HEAD
			(this as unknown).showBalloon?.(
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).showBalloon?.(
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
		const gc = (this as unknown).ghostController;
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const gc = (this as any).ghostController;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		const sep = String.fromCharCode(1); // \1 (バイト値1)
		const parts = ["ghost", success ? "OK" : "NG", String(detail)];
		if (failedFile) parts.push(failedFile);
		const baseEvent = checkOnly ? "OnUpdateCheckResult" : "OnUpdateResult";

<<<<<<< HEAD
		const resEx: unknown = await gc.sendShioriEvent(`${baseEvent}Ex`, [
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const resEx: any = await gc.sendShioriEvent(`${baseEvent}Ex`, [
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
			[ghostName, ...parts].join(sep),
		]);
		if (!resEx?.script?.trim()) {
			await gc.sendShioriEvent(baseEvent, [parts.join(sep)]);
		}
	},
};
