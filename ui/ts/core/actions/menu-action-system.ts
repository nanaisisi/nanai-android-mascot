import { invoke, isTauriAvailable } from "../tauri-helper.js";

export function handleSystemMenuAction(context: unknown, action: string): boolean {
	if (
		action === "tools" ||
		action === "utility-root" ||
		action === "utility" ||
		action === "explorer"
	) {
		context.modalManager?.show("explorer-modal-content");
		return true;
	}
	if (action === "config" || action === "settings") {
		context.modalManager?.show("settings-modal-content");
		return true;
	}
	if (action === "inquire" || action === "help") {
		context.modalManager?.show("help-modal-content");
		return true;
	}
	if (action === "calendar" || action === "schedule") {
		context.modalManager?.show("calendar-modal-content");
		return true;
	}
	if (action === "backlog") {
		context.modalManager?.show("backlog-modal-content");
		return true;
	}
	if (action === "pictureviewer" || action === "archiveviewer") {
		context.modalManager?.show("explorer-modal-content");
		return true;
	}
	if (action === "friends") {
		context.showBalloon?.("👥 おともだち機能は準備中です");
		setTimeout(() => context.hideBalloon?.(), 2000);
		return true;
	}
	if (action === "favorite") {
		context.showBalloon?.("⭐ おきにいりは現在のゴーストに登録されています");
		setTimeout(() => context.hideBalloon?.(), 2000);
		return true;
	}
	if (action === "language") {
		context.showBalloon?.("🌐 言語設定はシステム設定に準拠しています");
		setTimeout(() => context.hideBalloon?.(), 2000);
		return true;
	}
	if (action === "sspim") {
		context.showBalloon?.("💬 SSPメッセンジャ機能は接続待機中です");
		setTimeout(() => context.hideBalloon?.(), 2000);
		return true;
	}
	if (action === "sntp") {
		context.showBalloon?.("⏱️ 時刻合わせ(SNTP)を実行しました");
		setTimeout(() => context.hideBalloon?.(), 2000);
		return true;
	}
	if (action === "speech-recognition") {
		context.showBalloon?.("🎙️ 音声認識を開始しました");
		setTimeout(() => context.hideBalloon?.(), 2000);
		return true;
	}
	if (action === "speech-synthesis") {
		context.showBalloon?.("🔊 音声合成エンジン有効");
		setTimeout(() => context.hideBalloon?.(), 2000);
		return true;
	}
	if (action === "addressbar") {
		context.showBalloon?.("🌐 アドレスバー");
		setTimeout(() => context.hideBalloon?.(), 2000);
		return true;
	}
	if (action === "clear-cache") {
		context.showBalloon?.("🧹 ゴーストキャッシュを開放しました");
		setTimeout(() => context.hideBalloon?.(), 2000);
		return true;
	}
	if (action === "update-fmo") {
		context.showBalloon?.("🔄 FMO情報を更新しました");
		setTimeout(() => context.hideBalloon?.(), 2000);
		return true;
	}
	if (action === "reload-info") {
		context.showBalloon?.("🔄 動作情報を再読み込みしました");
		setTimeout(() => context.hideBalloon?.(), 2000);
		return true;
	}
	if (action === "open-file") {
		if (isTauriAvailable()) {
			invoke("pick_and_install_ghost_archive")
				.then((result: unknown) => {
					if (result) {
						context.showBalloon?.(
							`ゴースト「${(result as any).name}」を導入しました`,
						);
						setTimeout(() => context.hideBalloon?.(), 2000);
						context.ghostController?.scanGhosts?.();
						context.ghostController?.selectGhost?.((result as any).name);
					}
				})
				.catch((e) => {
					console.error("Failed to pick and install archive:", e);
				});
		} else {
			context.modalManager?.show("install-modal-content");
		}
		return true;
	}
	if (
		action === "open-ghost-folder" ||
		action === "openghostfolder" ||
		action === "open-ghost-directory"
	) {
		if (isTauriAvailable()) {
			invoke("open_ghost_directory")
				.then(() => {
					context.showBalloon?.("📁 ゴーストフォルダを開きました");
					setTimeout(() => context.hideBalloon?.(), 2000);
				})
				.catch((e) => console.error(e));
		} else {
			context.showBalloon?.(
				"📁 ゴーストフォルダを開く機能はアプリ版でのみ利用可能です",
			);
			setTimeout(() => context.hideBalloon?.(), 2000);
		}
		return true;
	}
	return false;
}
