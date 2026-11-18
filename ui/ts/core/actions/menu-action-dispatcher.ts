import { AppConfig } from "../config.js";
import { invoke, isTauriAvailable } from "../tauri-helper.js";
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
		clickType?: "single" | "double",
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
	clientX?: number;
	clientY?: number;
	rect?: unknown;
	clickType?: "single" | "double";
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
		const p =
			payload && typeof payload === "object"
				? (payload as NamedPayload)
				: undefined;
		const scopeId = p?.scope ?? 0;
		return context.onGhostClick?.(
			p?.clientX,
			p?.clientY,
			p?.rect,
			scopeId,
			p?.clickType,
		);
	}

	// バルーン専用ネイティブコンテキストメニューアクション
	if (action === "balloon-none") {
		return;
	}
	if (action === "balloon-leftclick") {
		const scopeId =
			payload && typeof payload === "object" && "scope" in payload
				? ((payload as NamedPayload).scope ?? 0)
				: 0;
		const sp = (context.sakuraPlayer ||
			(context.app as { sakuraPlayer?: unknown })?.sakuraPlayer) as
			| { isPlaying?: boolean; processStep: () => void }
			| undefined;
		if (sp?.isPlaying) {
			sp.processStep();
		} else {
			context.onGhostClick?.(undefined, undefined, undefined, scopeId);
		}
		return;
	}
	if (action === "balloon-break" || action === "break") {
		const scopeId =
			payload && typeof payload === "object" && "scope" in payload
				? ((payload as NamedPayload).scope ?? 0)
				: 0;
		const sp = (context.sakuraPlayer ||
			(context.app as { sakuraPlayer?: unknown })?.sakuraPlayer) as
			| { stop: () => void }
			| undefined;
		if (sp?.stop) {
			sp.stop();
		}
		return context.hideBalloon?.(scopeId, "break");
	}
	if (action === "balloon-flip" || action === "balloon-side-switch") {
		const scopeId =
			payload && typeof payload === "object" && "scope" in payload
				? ((payload as NamedPayload).scope ?? 0)
				: 0;
		const btm = (context.balloonThemeManager ||
			(context.app as { balloonThemeManager?: unknown })
				?.balloonThemeManager) as
			| { toggleBalloonSide?: (scopeId: number) => void }
			| undefined;
		if (btm?.toggleBalloonSide) {
			btm.toggleBalloonSide(scopeId);
		} else if (typeof context.toggleBalloonSide === "function") {
			(context.toggleBalloonSide as (scopeId: number) => void)(scopeId);
		}
		return;
	}
	if (action === "balloon-reset-pos") {
		return handleMenuActionImpl(context, "reset-balloon-position", payload);
	}
	if (action === "balloon-move-ghost") {
		const scopeId =
			payload && typeof payload === "object" && "scope" in payload
				? ((payload as NamedPayload).scope ?? 0)
				: 0;
		if (isTauriAvailable()) {
			void invoke("show_subchar_window", { scopeId }).catch(() => {});
		}
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

	// 設定サブメニュー本物仕様アクション
	if (action === "settings-main" || action === "settings-dialog") {
		context.modalManager?.show?.("settings-modal-content");
		return;
	}
	if (action === "settings-ghost") {
		context.modalManager?.show?.("settings-modal-content");
		return;
	}
	if (action === "window-mode-all" || action === "window-mode-per-ghost") {
		if (context.app?.settings) {
			(context.app.settings as Record<string, unknown>).windowModePerGhost =
				action === "window-mode-per-ghost";
		}
		return;
	}
	if (action === "toggle-proxy") {
		if (context.app?.settings) {
			const s = context.app.settings as Record<string, unknown>;
			s.enableProxy = !s.enableProxy;
		}
		return;
	}
	if (action === "charset-settings") {
		context.modalManager?.show?.("settings-modal-content");
		return;
	}
	if (action === "talk-interval-ghost-choice") {
		if (context.app?.settings) {
			const s = context.app.settings as Record<string, unknown>;
			s.talkIntervalGhostChoice = !s.talkIntervalGhostChoice;
		}
		return;
	}
	if (action === "legacy-spec-support") {
		if (context.app?.settings) {
			const s = context.app.settings as Record<string, unknown>;
			s.legacySpecSupport = !s.legacySpecSupport;
		}
		return;
	}
	if (action === "script-log" || action === "show-script-log") {
		if (isTauriAvailable()) {
			void invoke("show_ssp_log_window").catch(() => {});
		} else {
			context.modalManager?.show?.("plugins-modal-content");
		}
		return;
	}
	if (action === "dev-palette" || action === "show-dev-palette") {
		context.modalManager?.show?.("settings-modal-content");
		return;
	}

	// 本物仕様開発パレットアクション
	if (action === "open-script-input" || action === "script-input") {
		context.modalManager?.show?.("plugins-modal-content");
		return;
	}
	if (action === "open-surface-test" || action === "surface-test") {
		context.modalManager?.show?.("settings-modal-content");
		return;
	}
	if (action === "show-error-log" || action === "error-log") {
		if (isTauriAvailable()) {
			void invoke("show_ssp_log_window").catch(() => {});
		} else {
			context.modalManager?.show?.("plugins-modal-content");
		}
		return;
	}
	if (action === "seriko-inspector") {
		context.modalManager?.show?.("plugins-modal-content");
		return;
	}
	if (action === "open-exec") {
		return handleMenuActionImpl(context, "open-folder", payload);
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
		return gc?.selectGhost?.(currentName);
	}
	if (action === "reset-shell-position" || action === "resetwindowpos") {
		context.interactionManager?.resetShellPositions?.();
		if (typeof document !== "undefined") {
			const targets = document.querySelectorAll(
				".ghost-display, .character-slot, .ghost-character, .character-placeholder",
			);
			targets.forEach((el) => {
				const hEl = el as HTMLElement;
				if (hEl?.style) {
					hEl.style.left = "";
					hEl.style.top = "";
					hEl.style.transform = "";
					hEl.style.margin = "";
				}
				hEl.classList.remove("is-docked-left", "is-docked-right");
			});
		}
		if (isTauriAvailable()) {
			void invoke("set_character_scale", { scale: 1.0 }).catch(() => {});
			void invoke("reset_character_positions").catch(() => {});
		}
		return;
	}
	if (action === "reset-balloon-position" || action === "resetballoonpos") {
		context.interactionManager?.resetBalloonPositions?.();
		if (typeof document !== "undefined") {
			const balloons = document.querySelectorAll(".balloon-display");
			balloons.forEach((el) => {
				const bEl = el as HTMLElement;
				if (bEl?.style) {
					bEl.style.left = "";
					bEl.style.top = "";
					bEl.style.transform = "";
				}
			});
		}
		if (isTauriAvailable()) {
			void invoke("reset_balloon_positions").catch(() => {});
			void invoke("set_balloon_offset", { scopeId: 0, x: 0, y: 0 }).catch(
				() => {},
			);
			void invoke("set_balloon_offset", { scopeId: 1, x: 0, y: 0 }).catch(
				() => {},
			);
		}
		return;
	}
	if (action === "close-balloon") {
		return context.hideBalloon?.();
	}
	if (action === "keep-temporary-ghost") {
		if (gc?.currentGhost?.isTemporary) {
			gc.currentGhost.isTemporary = false;
			gc.sendShioriEvent?.("OnBoot");
		}
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
