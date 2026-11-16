/**
 * SakuraScriptPlayer facade (powered by Pure Rust / WASM core SakuraPlayerEngine)
 */
import {
	emit,
	invoke,
	isNativeMultiWindow,
	isSinglePageUi,
} from "../core/tauri-helper.js";
import {
	createSakuraPlayerWasm,
	freeSakuraPlayerWasm,
	stepSakuraPlayerWasm,
} from "../core/wasm/wasm-sakura.js";

export interface StepOutputData {
	action: string;
	data?: {
		scope?: number;
		text?: string;
		surface_id?: number;
		balloon_id?: number;
		animation_id?: number;
		title?: string;
		id?: string;
		duration_ms?: number;
		command?: string;
		args?: string[];
	};
}

export class SakuraScriptPlayer {
	private playerInstance: unknown = null;
	private currentScript = "";
	public lastScript = "";
	public timeCritical = false;
	public currentScope = 0;
	private timerId: ReturnType<typeof setTimeout> | null = null;
	private isLoopRunning = false;
	public app: any = null;

	public get isPlaying(): boolean {
		return this.playerInstance !== null || this.isLoopRunning;
	}

	constructor(script = "", app?: any) {
		this.app = app;
		if (script) {
			this.loadScript(script);
		}
	}

	public loadScript(script: string): void {
		this.stop();
		this.currentScript = script;
		this.lastScript = script;
		this.playerInstance = createSakuraPlayerWasm(script);
	}

	public play(script?: string): void {
		if (script) {
			this.loadScript(script);
		} else if (!this.playerInstance && this.currentScript) {
			this.playerInstance = createSakuraPlayerWasm(this.currentScript);
		}

		if (this.playerInstance) {
			this.startLoop();
		}
	}

	private getApp(): any {
		if (this.app) return this.app;
		const g = globalThis as any;
		if (g.mascotApp) return g.mascotApp;
		if (typeof window !== "undefined" && (window as any).app) {
			return (window as any).app;
		}
		return null;
	}

	private startLoop(): void {
		if (this.isLoopRunning) return;
		this.isLoopRunning = true;
		this.scheduleNextStep(0);
	}

	private scheduleNextStep(delayMs: number): void {
		if (!this.isLoopRunning) return;
		if (this.timerId) {
			clearTimeout(this.timerId);
		}
		this.timerId = setTimeout(
			() => {
				this.timerId = null;
				this.processStep();
			},
			Math.max(delayMs, 10),
		);
	}

	public processStep(): void {
		if (!this.playerInstance) {
			this.stop();
			return;
		}

		const stepRes = stepSakuraPlayerWasm(
			this.playerInstance,
		) as StepOutputData | null;
		if (
			!stepRes?.action ||
			stepRes.action === "Halt" ||
			stepRes.action === "None"
		) {
			this.stop();
			return;
		}

		let nextDelayMs = 30;

		const scope = stepRes.data?.scope ?? this.currentScope;
		this.currentScope = scope;
		const app = this.getApp();

		switch (stepRes.action) {
			case "TextAppend": {
				const text = stepRes.data?.text || "";
				this.appendTextToBalloon(app, scope, text);
				break;
			}
			case "Clear": {
				this.clearBalloon(app, scope);
				break;
			}
			case "SurfaceChange": {
				const surfaceId = stepRes.data?.surface_id ?? 0;
				if (app?.ghostController?.updateSurface) {
					void app.ghostController.updateSurface(surfaceId, scope);
				}
				break;
			}
			case "ScopeChange": {
				this.currentScope = scope;
				break;
			}
			case "Choice": {
				const title = stepRes.data?.title || "";
				const id = stepRes.data?.id || "";
				this.addChoiceToBalloon(app, scope, title, id);
				break;
			}
			case "Anchor": {
				const title = stepRes.data?.text || "";
				const id = stepRes.data?.id || "";
				this.addAnchorToBalloon(app, scope, title, id);
				break;
			}
			case "Wait": {
				nextDelayMs = stepRes.data?.duration_ms ?? 100;
				break;
			}
			case "Command": {
				const cmd = stepRes.data?.command;
				const args = stepRes.data?.args || [];
				if (cmd && app?.sakuraCommandHandler?.runCommand) {
					void app.sakuraCommandHandler.runCommand([cmd, ...args]);
				}
				break;
			}
			default:
				break;
		}

		if (this.isLoopRunning && this.playerInstance) {
			this.scheduleNextStep(nextDelayMs);
		}
	}

	private getDocElement(id: string): HTMLElement | null {
		if (
			typeof document !== "undefined" &&
			typeof document.getElementById === "function"
		) {
			return document.getElementById(id);
		}
		return null;
	}

	private appendTextToBalloon(app: any, scope: number, text: string): void {
		const isKero = scope === 1;
		const textEl = isKero
			? app?.elements?.keroBalloonText ||
				this.getDocElement("kero-balloon-text")
			: app?.elements?.balloonText || this.getDocElement("balloon-text");
		const dispEl = isKero
			? app?.elements?.keroBalloonDisplay ||
				this.getDocElement("kero-balloon-display")
			: app?.elements?.balloonDisplay || this.getDocElement("balloon-display");
		const slotEl = isKero
			? app?.elements?.keroSlot || this.getDocElement("kero-slot")
			: app?.elements?.sakuraSlot || this.getDocElement("sakura-slot");

		if (slotEl?.style && slotEl.style.display === "none") {
			slotEl.style.display = "block";
		}

		if (textEl) {
			if (textEl.appendChild) {
				const textNode =
					typeof document !== "undefined" &&
					typeof document.createTextNode === "function"
						? document.createTextNode(text)
						: null;
				if (textNode) {
					textEl.appendChild(textNode);
				} else {
					textEl.textContent = (textEl.textContent || "") + text;
				}
			} else {
				textEl.textContent = (textEl.textContent || "") + text;
			}
		}

		if (dispEl?.style && isSinglePageUi()) {
			dispEl.style.display = "block";
		}

		if (isNativeMultiWindow()) {
			const theme = app?.currentBalloonTheme || "default";
			console.log(
				`💬 [SakuraScript] ネイティブマルチウィンドウ向けバルーン表示要求: scope=${scope}, text=${text}`,
			);
			void invoke("show_balloon_window", { scope_id: scope, theme }).catch(
				(err) => {
					console.error("❌ show_balloon_window failed:", err);
				},
			);
			const htmlContent = textEl ? textEl.innerHTML : text;
			void emit(`update-balloon-content-${scope}`, {
				html: htmlContent,
				theme,
			});
		}
	}

	private clearBalloon(app: any, scope: number): void {
		const isKero = scope === 1;
		const textEl = isKero
			? app?.elements?.keroBalloonText ||
				this.getDocElement("kero-balloon-text")
			: app?.elements?.balloonText || this.getDocElement("balloon-text");
		const dispEl = isKero
			? app?.elements?.keroBalloonDisplay ||
				this.getDocElement("kero-balloon-display")
			: app?.elements?.balloonDisplay || this.getDocElement("balloon-display");

		if (textEl) {
			textEl.innerHTML = "";
			textEl.textContent = "";
		}
		if (dispEl?.style && isSinglePageUi()) {
			dispEl.style.display = "none";
		}
		if (isNativeMultiWindow()) {
			void emit(`update-balloon-content-${scope}`, {
				html: "",
				theme: app?.currentBalloonTheme || "default",
			});
		}
	}

	private addChoiceToBalloon(
		app: any,
		scope: number,
		title: string,
		id: string,
	): void {
		const isKero = scope === 1;
		const textEl = isKero
			? app?.elements?.keroBalloonText ||
				this.getDocElement("kero-balloon-text")
			: app?.elements?.balloonText || this.getDocElement("balloon-text");
		const dispEl = isKero
			? app?.elements?.keroBalloonDisplay ||
				this.getDocElement("kero-balloon-display")
			: app?.elements?.balloonDisplay || this.getDocElement("balloon-display");

		if (
			textEl &&
			typeof document !== "undefined" &&
			typeof document.createElement === "function"
		) {
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = "balloon-choice-btn";
			btn.dataset.id = id;
			btn.textContent = title;
			btn.addEventListener("click", () => {
				if (app?.ghostController?.sendShioriEvent) {
					void app.ghostController.sendShioriEvent("OnChoiceSelect", [
						id,
						title,
					]);
				}
			});
			textEl.appendChild(btn);
		}

		if (dispEl?.style && isSinglePageUi()) {
			dispEl.style.display = "block";
		}
	}

	private addAnchorToBalloon(
		app: any,
		scope: number,
		title: string,
		id: string,
	): void {
		const isKero = scope === 1;
		const textEl = isKero
			? app?.elements?.keroBalloonText ||
				this.getDocElement("kero-balloon-text")
			: app?.elements?.balloonText || this.getDocElement("balloon-text");
		const dispEl = isKero
			? app?.elements?.keroBalloonDisplay ||
				this.getDocElement("kero-balloon-display")
			: app?.elements?.balloonDisplay || this.getDocElement("balloon-display");

		if (
			textEl &&
			typeof document !== "undefined" &&
			typeof document.createElement === "function"
		) {
			const a = document.createElement("a");
			a.className = "balloon-anchor";
			a.dataset.id = id;
			a.textContent = title;
			a.addEventListener("click", (e) => {
				e.preventDefault();
				if (app?.ghostController?.sendShioriEvent) {
					void app.ghostController.sendShioriEvent("OnAnchorSelect", [
						id,
						title,
					]);
				}
			});
			textEl.appendChild(a);
		}

		if (dispEl?.style && isSinglePageUi()) {
			dispEl.style.display = "block";
		}
	}

	public step(): unknown | null {
		if (!this.playerInstance) return null;
		return stepSakuraPlayerWasm(this.playerInstance);
	}

	public skip(): void {
		while (this.isLoopRunning && this.playerInstance) {
			const stepRes = stepSakuraPlayerWasm(
				this.playerInstance,
			) as StepOutputData | null;
			if (
				!stepRes?.action ||
				stepRes.action === "Halt" ||
				stepRes.action === "None"
			) {
				break;
			}
			const scope = stepRes.data?.scope ?? this.currentScope;
			this.currentScope = scope;
			const app = this.getApp();

			if (stepRes.action === "TextAppend") {
				this.appendTextToBalloon(app, scope, stepRes.data?.text || "");
			} else if (stepRes.action === "Clear") {
				this.clearBalloon(app, scope);
			} else if (stepRes.action === "SurfaceChange") {
				if (app?.ghostController?.updateSurface) {
					void app.ghostController.updateSurface(
						stepRes.data?.surface_id ?? 0,
						scope,
					);
				}
			} else if (stepRes.action === "Choice") {
				this.addChoiceToBalloon(
					app,
					scope,
					stepRes.data?.title || "",
					stepRes.data?.id || "",
				);
			} else if (stepRes.action === "Anchor") {
				this.addAnchorToBalloon(
					app,
					scope,
					stepRes.data?.text || "",
					stepRes.data?.id || "",
				);
			}
		}
		this.stop();
	}

	public stop(): void {
		this.isLoopRunning = false;
		if (this.timerId) {
			clearTimeout(this.timerId);
			this.timerId = null;
		}
		if (this.playerInstance) {
			freeSakuraPlayerWasm(this.playerInstance);
			this.playerInstance = null;
		}
	}

	public pause(): void {
		this.isLoopRunning = false;
		if (this.timerId) {
			clearTimeout(this.timerId);
			this.timerId = null;
		}
	}

	public resume(): void {
		if (this.playerInstance && !this.isLoopRunning) {
			this.startLoop();
		}
	}

	public reset(): void {
		this.stop();
		if (this.currentScript) {
			this.play();
		}
	}
}
