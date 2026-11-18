/**
 * SakuraScriptPlayer facade (powered by Pure Rust / WASM core SakuraPlayerEngine)
 */
import {
	emit,
	frontendLog,
	invoke,
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
	private scopeBalloonIds = new Map<number, number>();
	public app: any = null;

	private isBalloonContentBlank(
		htmlOrText: string,
		el?: HTMLElement | null,
	): boolean {
		const stripped = String(htmlOrText ?? "")
			.replace(/<[^>]*>/g, "")
			.replace(/\u00a0/g, " ")
			.trim();
		if (stripped.length > 0) return false;
		if (el && typeof el.querySelector === "function") {
			const interactive = el.querySelector(
				"button, a, img, input, textarea, select",
			);
			if (interactive) return false;
		}
		return true;
	}

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
		this.currentScope = 0;
		this.scopeBalloonIds.clear();
		this.clearAllBalloons();
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
				frontendLog(
					`💬 [SakuraScript Player] TextAppend: scope=${scope}, text=${text}`,
				);
				this.appendTextToBalloon(app, scope, text);
				break;
			}
			case "Clear": {
				const keepSettings = stepRes.data?.keep_settings ?? false;
				this.clearBalloon(app, scope, keepSettings);
				break;
			}
			case "Voice": {
				const path = stepRes.data?.path || "";
				if (path && app?.sakuraCommandHandler?.runCommand) {
					void app.sakuraCommandHandler.runCommand(["voice", path]);
				}
				break;
			}
			case "SurfaceChange": {
				const surfaceId = stepRes.data?.surface_id ?? 0;
				if (app?.ghostController?.updateSurface) {
					void app.ghostController.updateSurface(surfaceId, scope);
				}
				break;
			}
			case "BalloonChange": {
				const balloonId = stepRes.data?.balloon_id ?? 0;
				this.applyBalloonSurfaceChange(app, scope, balloonId);
				break;
			}
			case "ScopeChange": {
				this.currentScope = scope;
				if (scope >= 1) {
					void invoke("show_subchar_window", { scopeId: scope }).catch(
						() => {},
					);
				}
				break;
			}
			case "Choice": {
				const title = stepRes.data?.title || "";
				const id = stepRes.data?.id || "";
				this.addChoiceToBalloon(app, scope, title, id);
				break;
			}
			case "ChoiceWait": {
				// Pause auto-stepping until user choice input
				this.isLoopRunning = false;
				return;
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

	private getBalloonElements(app: any, scope: number) {
		const textEl =
			scope === 0
				? app?.elements?.balloonText || this.getDocElement("balloon-text")
				: scope === 1
					? app?.elements?.keroBalloonText ||
						this.getDocElement("kero-balloon-text")
					: this.getDocElement(`char-balloon-text-${scope}`) ||
						app?.elements?.balloonText ||
						this.getDocElement("balloon-text");
		const dispEl =
			scope === 0
				? app?.elements?.balloonDisplay || this.getDocElement("balloon-display")
				: scope === 1
					? app?.elements?.keroBalloonDisplay ||
						this.getDocElement("kero-balloon-display")
					: this.getDocElement(`char-balloon-display-${scope}`) ||
						app?.elements?.balloonDisplay ||
						this.getDocElement("balloon-display");
		const slotEl =
			scope === 0
				? app?.elements?.sakuraSlot || this.getDocElement("sakura-slot")
				: scope === 1
					? app?.elements?.keroSlot || this.getDocElement("kero-slot")
					: this.getDocElement(`char-slot-${scope}`);
		return { textEl, dispEl, slotEl };
	}

	private appendTextToBalloon(app: any, scope: number, text: string): void {
		const { textEl, dispEl, slotEl } = this.getBalloonElements(app, scope);

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

		const htmlContent = textEl
			? textEl.innerHTML || textEl.textContent || ""
			: text;
		const isBlank = this.isBalloonContentBlank(
			textEl ? htmlContent : text,
			textEl,
		);
		const theme = app?.currentBalloonTheme || "default";
		const targetScope = scope;

		if (isBlank) {
			if (dispEl?.style) {
				dispEl.style.display = "none";
			}
			void invoke("hide_balloon_window", {
				params: { scope_id: targetScope },
				scope_id: targetScope,
				scopeId: targetScope,
			}).catch(() => {});
			void emit(`update-balloon-content-${targetScope}`, {
				html: "",
				theme,
			});
			return;
		}

		if (dispEl?.style && isSinglePageUi()) {
			dispEl.style.display = "block";
		}

		frontendLog(
			`💬 [SakuraScript] スコープ別独立バルーン表示要求: scope=${targetScope}, textLength=${text.length}`,
		);
		void invoke("show_balloon_window", {
			params: {
				scopeId: targetScope,
				theme,
			},
			scope_id: targetScope,
			scopeId: targetScope,
			theme,
		}).catch((err) => {
			frontendLog(
				`❌ show_balloon_window failed for scope ${targetScope}: ${err}`,
				"error",
			);
		});
		void emit(`update-balloon-content-${targetScope}`, {
			html: htmlContent,
			theme,
			balloonId: this.scopeBalloonIds.get(targetScope) ?? null,
		});
	}

	private applyBalloonSurfaceChange(
		app: any,
		scope: number,
		balloonId: number,
	): void {
		if (balloonId === -1) {
			this.clearBalloon(app, scope);
			return;
		}
		this.scopeBalloonIds.set(scope, balloonId);
		const targetApp = app || this.getApp();
		const btm =
			targetApp?.balloonThemeManager ||
			(targetApp as unknown as { balloonTheme?: unknown })?.balloonTheme;
		const themeName = targetApp?.currentBalloonTheme || "default";
		const { dispEl } = this.getBalloonElements(targetApp, scope);

		if (
			btm &&
			typeof (btm as { loadSkinImages?: unknown }).loadSkinImages === "function"
		) {
			void Promise.resolve(
				(
					btm as {
						loadSkinImages: (
							theme: string,
							scope: number,
							side: string,
							balloonId: number,
						) => Promise<string | null>;
					}
				).loadSkinImages(themeName, scope, "auto", balloonId),
			)
				.then((bgImage) => {
					if (bgImage && isSinglePageUi()) {
						const cssUrl = `url("${bgImage}")`;
						if (dispEl?.style) {
							dispEl.style.setProperty?.("--balloon-bg-image", cssUrl);
							const inner =
								typeof dispEl.querySelector === "function"
									? (dispEl.querySelector(".balloon") as HTMLElement | null)
									: null;
							inner?.style?.setProperty?.("--balloon-bg-image", cssUrl);
						}
						if (typeof document !== "undefined" && document.documentElement) {
							document.documentElement.style?.setProperty?.(
								"--balloon-bg-image",
								cssUrl,
							);
						}
					}
				})
				.catch(() => {});
		}
		if (
			btm &&
			typeof (btm as { applyDescript?: unknown }).applyDescript === "function"
		) {
			void Promise.resolve(
				(
					btm as {
						applyDescript: (params: unknown) => Promise<unknown>;
					}
				).applyDescript({
					theme: themeName,
					scopeId: scope,
					balloonId,
				}),
			).catch(() => {});
		}

		void emit("balloon-state-changed", {
			scopeId: scope,
			balloonId,
			theme: themeName,
		});
	}

	public clearAllBalloons(app?: any): void {
		const targetApp = app || this.getApp();
		for (let s = 0; s < 8; s++) {
			this.clearBalloon(targetApp, s);
		}
	}

	private clearBalloon(app: any, scope: number, _keepSettings = false): void {
		const { textEl, dispEl } = this.getBalloonElements(app, scope);

		if (textEl) {
			textEl.innerHTML = "";
			textEl.textContent = "";
		}
		if (dispEl?.style) {
			dispEl.style.display = "none";
		}
		const targetScope = scope;
		void invoke("hide_balloon_window", {
			params: { scope_id: targetScope },
			scope_id: targetScope,
			scopeId: targetScope,
		}).catch(() => {});
		void emit(`update-balloon-content-${targetScope}`, {
			html: "",
			theme: app?.currentBalloonTheme || "default",
		});
	}

	private addChoiceToBalloon(
		app: any,
		scope: number,
		title: string,
		id: string,
	): void {
		const { textEl, dispEl } = this.getBalloonElements(app, scope);

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
				this.clearAllBalloons(app);
				if (app?.ghostController?.sendShioriEvent) {
					void app.ghostController.sendShioriEvent("OnChoiceSelect", [
						id,
						title,
					]);
				}
				if (!this.isLoopRunning && this.playerInstance) {
					this.isLoopRunning = true;
					this.scheduleNextStep(0);
				}
			});
			textEl.appendChild(btn);
		}

		if (dispEl?.style && isSinglePageUi()) {
			dispEl.style.display = "block";
		}

		const theme = app?.currentBalloonTheme || "default";
		const targetScope = scope;
		void emit(`update-balloon-content-${targetScope}`, {
			html: textEl ? textEl.innerHTML : "",
			theme,
			balloonId: this.scopeBalloonIds.get(targetScope) ?? null,
		});
	}

	private addAnchorToBalloon(
		app: any,
		scope: number,
		title: string,
		id: string,
	): void {
		const { textEl, dispEl } = this.getBalloonElements(app, scope);

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
				this.clearAllBalloons(app);
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

		const theme = app?.currentBalloonTheme || "default";
		const targetScope = scope;
		void emit(`update-balloon-content-${targetScope}`, {
			html: textEl ? textEl.innerHTML : "",
			theme,
			balloonId: this.scopeBalloonIds.get(targetScope) ?? null,
		});
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
			} else if (stepRes.action === "BalloonChange") {
				this.applyBalloonSurfaceChange(
					app,
					scope,
					stepRes.data?.balloon_id ?? 0,
				);
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
