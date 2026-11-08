import { invoke, isTauriAvailable } from "../tauri-helper.js";
import {
	buildInstallBeginArgs,
	buildInstallCompleteArgs,
	buildInstallCompleteExArgs,
	buildInstallFailureArgs,
} from "./install-protocol.js";

export async function installGhostFromMenuImpl(context: any) {
	if (!isTauriAvailable()) {
		return context.modalManager?.show("install-modal-content");
	}
	const gc = context.ghostController;
	try {
		await gc?.sendShioriEvent?.(
			"OnInstallBegin",
			buildInstallBeginArgs("install"),
		);

		const result: unknown = await invoke("pick_and_install_ghost_archive");
		if (!result) return;

		await context.ghostController.scanGhosts();
		await context.scanBalloons();

		const importedGhost = context.ghostController.ghosts.find(
			(ghost: unknown) => (ghost as any).name === (result as any).name,
		);
		if (importedGhost) {
			await gc?.sendShioriEvent?.(
				"OnInstallCompleteEx",
				buildInstallCompleteExArgs(
					"ghost",
					(result as any).name,
					(result as any).path || "",
				),
			);
			await gc?.sendShioriEvent?.(
				"OnInstallComplete",
				buildInstallCompleteArgs(
					"ghost",
					(result as any).name,
					(result as any).path || "",
				),
			);
			context.showBalloon?.(`ゴースト「${importedGhost.name}」を導入しました`);
			setTimeout(() => context.hideBalloon?.(), 2000);
			await context.ghostController?.selectGhost?.(importedGhost.name);
			return;
		}
		const importedBalloon = context.availableBalloons?.find(
			(balloon: unknown) =>
				(balloon as any).name === (result as any).name ||
				(balloon as any).dir_name === (result as any).name,
		);
		if (importedBalloon) {
			await gc?.sendShioriEvent?.(
				"OnInstallCompleteEx",
				buildInstallCompleteExArgs(
					"balloon",
					importedBalloon.name,
					importedBalloon.dir_name,
				),
			);
			await gc?.sendShioriEvent?.(
				"OnInstallComplete",
				buildInstallCompleteArgs("balloon", importedBalloon.name),
			);
			await context.setBalloonTheme(importedBalloon.dir_name);
			context.showBalloon(`バルーン「${importedBalloon.name}」を導入しました`);
			setTimeout(() => context.hideBalloon(), 2000);
			return;
		}

		await gc?.sendShioriEvent?.(
			"OnInstallComplete",
			buildInstallCompleteArgs("package", (result as any).name),
		);
	} catch (error) {
		console.error("メニューからのゴースト取り込みに失敗しました:", error);
		await gc?.sendShioriEvent?.(
			"OnInstallFailure",
			buildInstallFailureArgs(error),
		);
		context.modalManager?.showNotification(
			"ゴースト取り込み失敗",
			String(error),
			true,
		);
	}
}
