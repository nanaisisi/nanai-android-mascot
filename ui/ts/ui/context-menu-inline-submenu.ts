import type { SubmenuSyncStatePatch } from "./context-menu-sync.js";
import type { MenuDispatcher } from "./menu-dispatcher.js";
import type {
	BalloonMenuItem,
	DressupMenuPayload,
	RecentGhostInput,
} from "./renderers/menu-balloon-dressup-renderer.js";
import type {
	MenuGhostInput,
	MenuShellInput,
} from "./renderers/menu-ghost-shell-renderer.js";
import {
	type PluginMenuItem,
	renderSubmenuContent,
} from "./submenu-renderer.js";

/**
 * Android / SinglePageUi 向けの既存 SSP メニュー横展開サブメニューコントローラ
 */
export class InlineSubmenuController {
	private readonly dispatcher: Pick<MenuDispatcher, "dispatchAction">;
	private cachedGhosts: MenuGhostInput[] = [];
	private currentGhostName: string | null = null;
	private cachedShells: MenuShellInput[] = [];
	private currentShellName: string | null = null;
	private cachedDressup: DressupMenuPayload | null = null;
	private dressupScope = 0;
	private cachedBalloons: BalloonMenuItem[] = [];
	private currentBalloonTheme: string | null = null;
	private cachedRecentGhosts: RecentGhostInput[] = [];
	private cachedPlugins: PluginMenuItem[] = [];
	private activeType: string | null = null;
	private activeTrigger: Element | null = null;

	constructor(dispatcher: Pick<MenuDispatcher, "dispatchAction">) {
		this.dispatcher = dispatcher;
	}

	isOpen(): boolean {
		return this.activeType !== null;
	}

	getActiveType(): string | null {
		return this.activeType;
	}

	updateData(patch: SubmenuSyncStatePatch): void {
		if (patch.ghosts !== undefined) {
			this.cachedGhosts = patch.ghosts;
		}
		if (patch.currentGhostName !== undefined) {
			this.currentGhostName = patch.currentGhostName;
		}
		if (patch.shells !== undefined) {
			this.cachedShells = patch.shells;
		}
		if (patch.currentShellName !== undefined) {
			this.currentShellName = patch.currentShellName;
		}
		if (patch.dressup !== undefined) {
			this.cachedDressup = patch.dressup;
		}
		if (patch.dressupScope !== undefined) {
			this.dressupScope = patch.dressupScope;
		}
		if (patch.balloons !== undefined) {
			this.cachedBalloons = patch.balloons;
		}
		if (patch.currentBalloonTheme !== undefined) {
			this.currentBalloonTheme = patch.currentBalloonTheme;
		}
		if (patch.recentGhosts !== undefined) {
			this.cachedRecentGhosts = patch.recentGhosts;
		}
		if (patch.plugins !== undefined) {
			this.cachedPlugins = patch.plugins;
		}

		if (this.activeType && this.activeTrigger) {
			const panelEl = document.getElementById("inline-submenu-panel");
			if (panelEl) {
				this.renderInto(this.activeType, panelEl);
				this.positionPanel(panelEl, this.activeTrigger);
			}
		}
	}

	toggle(menuType: string, triggerBtn: Element): boolean {
		if (this.activeType === menuType) {
			this.close(false);
			return false;
		}
		return this.open(menuType, triggerBtn);
	}

	open(menuType: string, triggerBtn: Element): boolean {
		const panelEl = document.getElementById("inline-submenu-panel");
		if (!panelEl) {
			return false;
		}

		if (this.activeTrigger && this.activeTrigger !== triggerBtn) {
			this.activeTrigger.setAttribute?.("aria-expanded", "false");
		}
		this.activeType = menuType;
		this.activeTrigger = triggerBtn;
		triggerBtn.setAttribute?.("aria-expanded", "true");

		panelEl.hidden = false;
		document.body?.classList?.add?.("is-submenu-open");

		this.renderInto(menuType, panelEl);
		panelEl.setAttribute?.("aria-busy", "false");
		this.positionPanel(panelEl, triggerBtn);

		if (
			(menuType === "ghost" || menuType === "call-ghost") &&
			this.cachedGhosts.length === 0
		) {
			void this.dispatcher.dispatchAction("request-sync");
		}

		if (typeof panelEl.scrollTop === "number") {
			panelEl.scrollTop = 0;
		}

		return true;
	}

	close(restoreFocus = true): boolean {
		if (!this.activeType) {
			return false;
		}

		const prevTrigger = this.activeTrigger as
			| (Element & { focus?: (opts?: FocusOptions) => void })
			| null;
		prevTrigger?.setAttribute?.("aria-expanded", "false");

		const panelEl = document.getElementById("inline-submenu-panel");
		if (panelEl) {
			panelEl.hidden = true;
			panelEl.setAttribute?.("aria-busy", "true");
		}
		document.body?.classList?.remove?.("is-submenu-open");

		this.activeType = null;
		this.activeTrigger = null;

		if (restoreFocus) {
			prevTrigger?.focus?.({ preventScroll: true });
		}

		return true;
	}

	private positionPanel(panelEl: HTMLElement, triggerBtn: Element): void {
		if (!panelEl.style) return;
		const containerRect = document
			.querySelector(".menu-container")
			?.getBoundingClientRect?.();
		const sidebarRect = document
			.querySelector(".menu-sidebar")
			?.getBoundingClientRect?.();
		const triggerRect = triggerBtn.getBoundingClientRect?.();
		const panelRect = panelEl.getBoundingClientRect?.();

		const viewportW = globalThis.innerWidth || 460;
		const viewportH = globalThis.innerHeight || 580;
		const subW =
			panelRect && panelRect.width > 0 ? Math.ceil(panelRect.width) : 180;
		const subH =
			panelRect && panelRect.height > 0 ? Math.ceil(panelRect.height) : 240;

		const containerLeft = containerRect?.left ?? 0;
		const sidebarLeft =
			sidebarRect && sidebarRect.width > 0 ? sidebarRect.left : containerLeft;
		const menuLeft = Math.min(sidebarLeft, containerLeft);
		const menuRight =
			containerRect && containerRect.right > 0
				? containerRect.right
				: viewportW;

		const posX =
			viewportW - menuRight >= subW + 4
				? menuRight + 2
				: Math.max(2, menuLeft - subW - 2);
		const rawTop = triggerRect?.top ?? 0;
		const posY = Math.max(
			2,
			Math.min(rawTop, Math.max(2, viewportH - subH - 2)),
		);

		panelEl.style.left = `${Math.round(posX)}px`;
		panelEl.style.top = `${Math.round(posY)}px`;
	}

	private renderInto(menuType: string, panelEl: HTMLElement): void {
		renderSubmenuContent({
			currentSubmenuType: menuType,
			cachedGhosts: this.cachedGhosts,
			currentGhostName: this.currentGhostName,
			cachedShells: this.cachedShells,
			currentShellName: this.currentShellName,
			cachedDressup: this.cachedDressup,
			dressupScope: this.dressupScope,
			cachedBalloons: this.cachedBalloons,
			currentBalloonTheme: this.currentBalloonTheme,
			cachedRecentGhosts: this.cachedRecentGhosts,
			cachedPlugins: this.cachedPlugins,
			container: panelEl,
			dispatchSubmenuAction: (action, payload) => {
				this.close(false);
				void this.dispatcher.dispatchAction(action, payload);
			},
		});
	}
}
