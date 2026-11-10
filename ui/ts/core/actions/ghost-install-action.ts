import { invoke, isTauriAvailable } from "../tauri-helper.js";
import {
	buildInstallBeginArgs,
	buildInstallCompleteArgs,
	buildInstallCompleteExArgs,
	buildInstallFailureArgs,
} from "./install-protocol.js";

export interface GhostArchiveInstallResult {
	name?: string;
	path?: string;
	[key: string]: unknown;
}

export interface GhostItem {
	name: string;
	path?: string;
	[key: string]: unknown;
}

export interface BalloonItem {
	name: string;
	dir_name: string;
	[key: string]: unknown;
}

export interface GhostInstallContext {
	ghostController: {
		ghosts: GhostItem[];
		scanGhosts: () => Promise<unknown>;
		selectGhost?: (name: string) => Promise<unknown>;
		sendShioriEvent?: (event: string, args?: unknown[]) => Promise<unknown>;
	};
	availableBalloons?: BalloonItem[];
	scanBalloons: () => Promise<unknown>;
	setBalloonTheme: (theme: string) => Promise<unknown> | unknown;
	showBalloon?: (message: string) => unknown;
	hideBalloon?: () => unknown;
	modalManager?: {
		show: (contentId: string) => unknown;
		showNotification: (
			title: string,
			message: string,
			isError?: boolean,
		) => unknown;
	};
}

export async function installGhostFromMenuImpl(context: GhostInstallContext) {
	if (!isTauriAvailable()) {
		return context.modalManager?.show("install-modal-content");
	}
	const gc = context.ghostController;
	try {
		await gc?.sendShioriEvent?.(
			"OnInstallBegin",
			buildInstallBeginArgs("install"),
		);

		const result =
			(await invoke<GhostArchiveInstallResult>(
				"pick_and_install_ghost_archive",
			)) ?? null;
		if (!result) return;

		await context.ghostController.scanGhosts();
		await context.scanBalloons();

		const resultName = result.name || "";
		const resultPath = result.path || "";

		const importedGhost = context.ghostController.ghosts.find(
			(ghost) => ghost.name === resultName,
		);
		if (importedGhost) {
			await gc?.sendShioriEvent?.(
				"OnInstallCompleteEx",
				buildInstallCompleteExArgs("ghost", resultName, resultPath),
			);
			await gc?.sendShioriEvent?.(
				"OnInstallComplete",
				buildInstallCompleteArgs("ghost", resultName, resultPath),
			);
			context.showBalloon?.(`ゴースト「${importedGhost.name}」を導入しました`);
			setTimeout(() => context.hideBalloon?.(), 2000);
			await context.ghostController?.selectGhost?.(importedGhost.name);
			return;
		}
		const importedBalloon = context.availableBalloons?.find(
			(balloon) =>
				balloon.name === resultName || balloon.dir_name === resultName,
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
			context.showBalloon?.(
				`バルーン「${importedBalloon.name}」を導入しました`,
			);
			setTimeout(() => context.hideBalloon?.(), 2000);
			return;
		}

		await gc?.sendShioriEvent?.(
			"OnInstallComplete",
			buildInstallCompleteArgs("package", resultName),
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
