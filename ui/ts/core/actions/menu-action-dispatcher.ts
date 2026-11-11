import { AppConfig } from "../config.js";
import { invoke, isTauriAvailable } from "../tauri-helper.js";
import { THEME_LABELS } from "./balloon-theme-constants.js";
import { handleSystemMenuAction } from "./menu-action-system.js";

/** SHIORIイベントへ単純転送するアクション */
const SHIORI_ACTIONS: Record<string, [string, string[]?]> = {
	recommend: ["OnChoiceSelect", ["recommendlink"]],
	portal: ["OnChoiceSelect", ["portal"]],
	update: ["OnUpdate"],
	headline: ["OnHeadline"],
};

export interface MenuActionContext {
	ghostController?: {
		currentGhost?: { name?: string; isTemporary?: boolean };
		sendShioriEvent?: (event: string, args?: unknown[]) => Promise<unknown>;
		selectGhost?: (name: string) => Promise<unknown>;
		selectShell?: (name: string) => Promise<unknown>;
		scanGhosts?: () => Promise<unknown>;
	};
	onGhostClick?: (
		arg0?: unknown,
		arg1?: unknown,
		arg2?: unknown,
		scopeId?: number,
	) => unknown;
	startNetworkUpdate?: (
		target?: string | null,
		options?: { checkOnly?: boolean },
	) => unknown;
	showGhostInformation?: () => unknown;
	handleMenuAction?: (action: string) => unknown;
	showBalloon?: (message: string) => unknown;
	hideBalloon?: () => unknown;
	elements?: {
		ghostDisplay?: HTMLElement | null;
		[key: string]: HTMLElement | null | undefined;
	};
	interactionManager?: {
		balloonOffsetX: number;
		balloonOffsetY: number;
		[key: string]: unknown;
	};
	checkEmail?: () => unknown;
	syncMenuGhosts?: () => unknown;
	uninstallCurrentGhost?: () => unknown;
	installGhostFromMenu?: () => unknown;
	cycleBalloonTheme?: () => unknown;
	setBalloonTheme?: (theme: string) => unknown;
	availableBalloons?: Array<{
		name?: string;
		dir_name?: string;
		[key: string]: unknown;
	}>;
	applyShellScaleAction?: (action: string) => unknown;
	applyBalloonScaleAction?: (action: string) => unknown;
	closeApp?: () => unknown;
	minimizeApp?: () => unknown;
	callGhost?: (name: string) => unknown;
	handleDressupToggle?: (payload: unknown) => unknown;
	modalManager?: {
		show: (contentId: string) => unknown;
		hide: () => unknown;
	};
	[key: string]: unknown;
}

interface NamedPayload {
	name?: string;
	ghostName?: string;
	shellName?: string;
	scope?: number;
	[key: string]: unknown;
}

export function handleMenuActionImpl(
	context: MenuActionContext,
	action: string,
	payload: unknown = null,
) {
	if (!action) return;
	const gc = context.ghostController;

	if (action === "talk") {
		const scopeId =
			payload && typeof payload === "object" && "scope" in payload
				? ((payload as NamedPayload).scope ?? 0)
				: 0;
		return context.onGhostClick?.(undefined, undefined, undefined, scopeId);
	}

	if (action === "hide-character" || action === "close-character") {
		const scopeId =
			payload && typeof payload === "object" && "scope" in payload
				? ((payload as NamedPayload).scope ?? 1)
				: 1;
		if (isTauriAvailable()) {
			void invoke("hide_subchar_window", { scopeId }).catch(() => {});
		}
		return;
	}

	if (action === "update") {
		return context.startNetworkUpdate?.();
	}

	if (action === "updatecheck") {
		return context.startNetworkUpdate?.(null, { checkOnly: true });
	}

	if (action === "ghost-info") {
		return context.showGhostInformation?.();
	}

	if (action === "headlines" || action === "headline") {
		gc?.sendShioriEvent?.("OnHeadline");
		return;
	}

	if (handleSystemMenuAction(context, action)) {
		return;
	}

	if (action === "open-folder") {
		return context.handleMenuAction?.("open-ghost-folder");
	}

	if (action === "reload-ghost") {
		const currentName =
			gc?.currentGhost?.name || AppConfig.paths.fallbackGhostName;
		return gc?.selectGhost?.(currentName)?.then(() => {
			context.showBalloon?.("🔄 ゴーストを再読み込みしました");
			setTimeout(() => context.hideBalloon?.(), 2000);
		});
	}
	if (action === "reset-shell-position" || action === "resetwindowpos") {
		if (context.elements?.ghostDisplay) {
			context.elements.ghostDisplay.style.left = "";
			context.elements.ghostDisplay.style.top = "";
			context.elements.ghostDisplay.style.transform = "";
			context.elements.ghostDisplay.classList.remove(
				"is-docked-left",
				"is-docked-right",
			);
		}
		if (isTauriAvailable()) {
			invoke("set_character_scale", { scale: 1.0 }).catch(() => {});
		}
		context.showBalloon?.("📍 シェル位置・倍率を初期リセットしました");
		setTimeout(() => context.hideBalloon?.(), 2000);
		return;
	}
	if (action === "reset-balloon-position" || action === "resetballoonpos") {
		if (context.interactionManager) {
			context.interactionManager.balloonOffsetX = 0;
			context.interactionManager.balloonOffsetY = 0;
		}
		if (typeof localStorage !== "undefined") {
			try {
				localStorage.removeItem("nanai_balloon_offset");
			} catch (_e) {
				// Fallback if localStorage access fails
			}
		}
		if (isTauriAvailable()) {
			invoke("set_balloon_offset", { scopeId: 0, x: 0, y: 0 }).catch(() => {});
			invoke("set_balloon_offset", { scopeId: 1, x: 0, y: 0 }).catch(() => {});
		}
		context.showBalloon?.("📍 バルーン位置を初期リセットしました");
		setTimeout(() => context.hideBalloon?.(), 2000);
		return;
	}
	if (action === "close-balloon") {
		return context.hideBalloon?.();
	}
	if (action === "keep-temporary-ghost") {
		if (gc?.currentGhost?.isTemporary) {
			gc.currentGhost.isTemporary = false;
			context.showBalloon?.(
				"📌 一時起動ゴーストを通常起動状態として保持しました",
			);
			gc.sendShioriEvent?.("OnBoot");
		} else {
			context.showBalloon?.("⚠️ 一時起動中のゴーストではありません");
		}
		setTimeout(() => context.hideBalloon?.(), 2000);
		return;
	}

	if (action === "biff" || action === "mail") {
		return context.checkEmail?.();
	}

	if (SHIORI_ACTIONS[action]) {
		const [eventName, eventArgs] = SHIORI_ACTIONS[action];
		gc?.sendShioriEvent?.(eventName, eventArgs);
		return;
	}

	if (action === "scan") {
		return gc?.scanGhosts?.()?.then(() => {
			context.syncMenuGhosts?.();
			context.showBalloon?.("🔄 ゴーストフォルダを再スキャンしました");
			setTimeout(() => context.hideBalloon?.(), 2000);
		});
	}
	if (
		action === "uninstall-ghost" ||
		action === "uninstall" ||
		action === "uninstallghost" ||
		action === "delete-ghost"
	) {
		return context.uninstallCurrentGhost?.();
	}
	if (
		action === "install" ||
		action === "install-ghost" ||
		action === "installghost" ||
		action === "add-ghost"
	) {
		return context.installGhostFromMenu?.();
	}
	if (action === "balloon" || action === "balloon-cycle")
		return context.cycleBalloonTheme?.();
	if (action.startsWith("balloon-theme-")) {
		const theme = action.replace("balloon-theme-", "");
		context.setBalloonTheme?.(theme);
		let label = (THEME_LABELS as Record<string, string>)[theme] || theme;
		if (context.availableBalloons) {
			const bInfo = context.availableBalloons.find((b) => b.dir_name === theme);
			if (bInfo) label = bInfo.name || label;
		}
		context.showBalloon?.(`バルーンスキンを「${label}」に変更しました`);
		setTimeout(() => context.hideBalloon?.(), 2000);
		return;
	}
	if (action.startsWith("scale-"))
		return context.applyShellScaleAction?.(action);
	if (action.startsWith("balloon-scale-"))
		return context.applyBalloonScaleAction?.(action);
	if (action === "shell-scale-other" || action === "balloon-scale-other") {
		const typeLabel = action.startsWith("balloon-")
			? "バルーン倍率"
			: "シェル倍率";
		context.modalManager?.show("scale-other-modal-content");
		setTimeout(() => {
			const titleEl = document.getElementById("scale-other-title");
			if (titleEl) titleEl.textContent = typeLabel;
			const labelEl = document.getElementById("scale-other-label");
			if (labelEl) labelEl.textContent = `${typeLabel}:`;
			const okBtn = document.getElementById("scale-other-ok-btn");
			const cancelBtn = document.getElementById("scale-other-cancel-btn");
			const xInput = document.getElementById(
				"scale-x-input",
			) as HTMLInputElement;
			const yInput = document.getElementById(
				"scale-y-input",
			) as HTMLInputElement;
			const xyLock = document.getElementById(
				"scale-xy-lock",
			) as HTMLInputElement;

			okBtn?.addEventListener(
				"click",
				() => {
					const val = xInput?.value || "100";
					if (action.startsWith("balloon-")) {
						context.applyBalloonScaleAction?.(`balloon-scale-${val}`);
					} else {
						context.applyShellScaleAction?.(`scale-${val}`);
					}
					context.modalManager?.hide();
				},
				{ once: true },
			);

			cancelBtn?.addEventListener(
				"click",
				() => {
					context.modalManager?.hide();
				},
				{ once: true },
			);

			if (xInput && yInput && xyLock) {
				xInput.addEventListener("input", () => {
					if (xyLock.checked) {
						yInput.value = xInput.value;
					}
				});
				yInput.addEventListener("input", () => {
					if (xyLock.checked) {
						xInput.value = yInput.value;
					}
				});
			}
		}, 50);
		return;
	}
	if (action === "close" || action === "exit") return context.closeApp?.();
	if (action === "close-all" || action === "exit-all")
		return context.closeApp?.();
	if (action === "close-menu") return;
	if (action === "minimize") return context.minimizeApp?.();
	if ((action === "switch-to-ghost" || action === "switch-ghost") && payload) {
		const ghostName =
			typeof payload === "string"
				? payload
				: (payload as NamedPayload).name || (payload as NamedPayload).ghostName;
		if (ghostName) return gc?.selectGhost?.(ghostName);
	}
	if (action === "call-ghost" && payload) {
		const ghostName =
			typeof payload === "string"
				? payload
				: (payload as NamedPayload).name || (payload as NamedPayload).ghostName;
		if (ghostName) return context.callGhost?.(ghostName);
	}
	if (action === "recent-ghost" && payload) {
		const ghostName =
			typeof payload === "string"
				? payload
				: (payload as NamedPayload).name || (payload as NamedPayload).ghostName;
		if (ghostName) return gc?.selectGhost?.(ghostName);
	}
	if ((action === "switch-to-shell" || action === "switch-shell") && payload) {
		const shellName =
			typeof payload === "string"
				? payload
				: (payload as NamedPayload).name || (payload as NamedPayload).shellName;
		if (shellName) return gc?.selectShell?.(shellName);
	}
	if (action === "dressup-toggle" && payload) {
		return context.handleDressupToggle?.(payload);
	}

	const modalKey = action === "ghost-switch" ? "ghost" : action;
	context.modalManager?.show(`${modalKey}-modal-content`);
}
