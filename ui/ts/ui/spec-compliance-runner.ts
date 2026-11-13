import {
	applyAssetProperties,
	verifyRecommendedGhost,
} from "../core/actions/balloon-descript/assets.js";
import { applyFontProperties } from "../core/actions/balloon-descript/font.js";
import { applyPositionProperties } from "../core/actions/balloon-descript/layout/position.js";
import { applyValidRectProperties } from "../core/actions/balloon-descript/layout/rect.js";
import { applyLayoutProperties } from "../core/actions/balloon-descript/layout.js";
import { mouseMethods } from "../core/events/mouse.js";
import { tokenizeScopeSurfaceTag } from "../ghost/parser/tag/scope-surface.js";
import { tokenizeDisplayTag } from "../ghost/parser/tag-tokenizer.js";
import { surfaceCollisionMethods } from "../surface/surface-collision.js";
import {
	createColorDialogForm,
	createTermsDialogForm,
	type ModalDialogContext,
} from "./renderers/modal-dialog-ui.js";

export interface UiComplianceProbeResult {
	id: string;
	category: string;
	specName: string;
	usagePath: string;
	passed: boolean;
	actualSummary: string;
	manualCheckHint: string;
}

export interface UiComplianceSuiteReport {
	total: number;
	passed: number;
	failed: number;
	passRate: number;
	results: UiComplianceProbeResult[];
	timestamp: string;
}

interface VirtualStyle {
	setProperty(name: string, value: string): void;
	getPropertyValue(name: string): string;
	removeProperty(name: string): string;
	padding?: string;
	transform?: string;
	transformOrigin?: string;
	maxWidth?: string;
	maxHeight?: string;
}

interface VirtualNode {
	tagName: string;
	className: string;
	type: string;
	value: string;
	textContent: string;
	style: VirtualStyle;
	children: VirtualNode[];
	parentNode: VirtualNode | null;
	appendChild(child: VirtualNode): VirtualNode;
	remove(): void;
	addEventListener(type: string, cb: (ev: VirtualEvent) => unknown): void;
	click(): void;
}

interface VirtualEvent {
	target: VirtualNode;
	stopPropagation(): void;
	preventDefault(): void;
}

function createVirtualStyle(): VirtualStyle {
	const vars = new Map<string, string>();
	return {
		setProperty(name: string, value: string) {
			vars.set(name, String(value));
		},
		getPropertyValue(name: string) {
			return vars.get(name) ?? "";
		},
		removeProperty(name: string) {
			const prev = vars.get(name) ?? "";
			vars.delete(name);
			return prev;
		},
	};
}

function createVirtualNode(tagName: string): VirtualNode {
	const listeners = new Map<string, Array<(ev: VirtualEvent) => unknown>>();
	const node: VirtualNode = {
		tagName: tagName.toUpperCase(),
		className: "",
		type: "",
		value: "",
		textContent: "",
		style: createVirtualStyle(),
		children: [],
		parentNode: null,
		appendChild(child: VirtualNode) {
			child.parentNode = node;
			node.children.push(child);
			return child;
		},
		remove() {
			if (!node.parentNode) return;
			const idx = node.parentNode.children.indexOf(node);
			if (idx >= 0) {
				node.parentNode.children.splice(idx, 1);
			}
			node.parentNode = null;
		},
		addEventListener(type: string, cb: (ev: VirtualEvent) => unknown) {
			const list = listeners.get(type) ?? [];
			list.push(cb);
			listeners.set(type, list);
		},
		click() {
			const list = listeners.get("click") ?? [];
			const ev: VirtualEvent = {
				target: node,
				stopPropagation() {},
				preventDefault() {},
			};
			for (const cb of list) {
				cb(ev);
			}
		},
	};
	return node;
}

function createStyleTarget(rootElement?: HTMLElement): HTMLElement {
	if (rootElement && typeof rootElement.style?.setProperty === "function") {
		return rootElement;
	}
	if (
		typeof document !== "undefined" &&
		typeof document.createElement === "function"
	) {
		const el = document.createElement("div");
		if (typeof el?.style?.setProperty === "function") {
			return el;
		}
	}
	return createVirtualNode("div") as unknown as HTMLElement;
}

function readCssVar(target: HTMLElement, name: string): string {
	const styleObj = target.style as unknown as Record<string, unknown>;
	if (typeof styleObj?.getPropertyValue === "function") {
		const val = (styleObj.getPropertyValue as (prop: string) => string)(name);
		if (val) return String(val).trim();
	}
	const direct = styleObj?.[name];
	return typeof direct === "string" ? direct.trim() : "";
}

function withSafeQueryDocument<T>(fn: () => T): T {
	const g = globalThis as unknown as { document?: Document };
	const hadDocument = "document" in g && g.document !== undefined;
	const origDocument = g.document;

	if (!origDocument || typeof origDocument.querySelector !== "function") {
		const base = (origDocument ?? {}) as unknown as Record<string, unknown>;
		g.document = {
			...base,
			querySelector: () => null,
		} as unknown as Document;
		try {
			return fn();
		} finally {
			if (hadDocument) {
				g.document = origDocument;
			} else {
				delete g.document;
			}
		}
	}

	const balloonEl = origDocument.querySelector(
		".balloon",
	) as HTMLElement | null;
	const textEl = origDocument.querySelector(
		".balloon-text",
	) as HTMLElement | null;
	const savedBalloon = balloonEl
		? {
				padding: balloonEl.style.padding,
				transform: balloonEl.style.transform,
				transformOrigin: balloonEl.style.transformOrigin,
			}
		: null;
	const savedText = textEl
		? {
				maxWidth: textEl.style.maxWidth,
				maxHeight: textEl.style.maxHeight,
			}
		: null;

	try {
		return fn();
	} finally {
		if (balloonEl && savedBalloon) {
			balloonEl.style.padding = savedBalloon.padding;
			balloonEl.style.transform = savedBalloon.transform;
			balloonEl.style.transformOrigin = savedBalloon.transformOrigin;
		}
		if (textEl && savedText) {
			textEl.style.maxWidth = savedText.maxWidth;
			textEl.style.maxHeight = savedText.maxHeight;
		}
	}
}

function isCapableDomDocument(doc: Document | undefined): boolean {
	if (!doc || typeof doc.createElement !== "function") return false;
	try {
		const parent = doc.createElement("div");
		const child = doc.createElement("button");
		if (
			typeof parent?.appendChild !== "function" ||
			typeof child?.remove !== "function" ||
			typeof child?.addEventListener !== "function" ||
			typeof child?.click !== "function" ||
			parent?.children == null
		) {
			return false;
		}
		let fired = false;
		child.addEventListener("click", () => {
			fired = true;
		});
		parent.appendChild(child);
		child.click();
		const mounted = parent.children.length === 1;
		child.remove();
		const removed = Number(parent.children.length) === 0;
		return fired && mounted && removed;
	} catch {
		return false;
	}
}

async function withCapableDomDocument<T>(fn: () => Promise<T>): Promise<T> {
	const g = globalThis as unknown as { document?: Document };
	const hadDocument = "document" in g && g.document !== undefined;
	const origDocument = g.document;

	if (isCapableDomDocument(origDocument)) {
		return await fn();
	}

	const base = (origDocument ?? {}) as unknown as Record<string, unknown>;
	g.document = {
		...base,
		createElement: (tag: string) => createVirtualNode(tag),
	} as unknown as Document;

	try {
		return await fn();
	} finally {
		if (hadDocument) {
			g.document = origDocument;
		} else {
			delete g.document;
		}
	}
}

function collectNodes(root: unknown): Array<Record<string, unknown>> {
	const out: Array<Record<string, unknown>> = [];
	const visit = (node: unknown) => {
		if (!node || typeof node !== "object") return;
		const rec = node as Record<string, unknown>;
		out.push(rec);
		const children = rec.children as ArrayLike<unknown> | undefined;
		if (children) {
			for (let i = 0; i < children.length; i++) {
				visit(children[i]);
			}
		}
	};
	visit(root);
	return out;
}

export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

export function wireManualCheckProgress(
	container: HTMLElement | null,
	total: number,
): void {
	if (!container || typeof container.querySelectorAll !== "function") return;
	const checks = container.querySelectorAll(".manual-verify-check");
	const update = () => {
		let checked = 0;
		checks.forEach?.((el) => {
			if ((el as HTMLInputElement).checked) checked++;
		});
		const progressEl =
			typeof document !== "undefined"
				? document.getElementById("manual-verify-progress")
				: null;
		if (progressEl) {
			progressEl.textContent = `目視確認: ${checked} / ${total}`;
		}
	};
	checks.forEach?.((el) => {
		el.addEventListener?.("change", update);
	});
}

function runBalloonLayoutProbe(
	rootElement?: HTMLElement,
): UiComplianceProbeResult {
	const specName = "descript.txt (validrect / origin / wordwrappoint)";
	const usagePath =
		"descript.txt ➔ applyLayoutProperties / applyValidRectProperties / applyPositionProperties ➔ CSS Vars (--balloon-padding, --balloon-border-image-slice, --balloon-origin-x, --balloon-origin-y)";
	const manualCheckHint =
		"バルーン枠線内にテキストが収まり、原点(origin)指定で文字位置が二重に右下へ押し出されないか目視確認";

	try {
		const target = createStyleTarget(rootElement);
		const balloonDisplay = { style: { left: "", top: "" } };
		const props: Record<string, string> = {
			"validrect.left": "16",
			"validrect.top": "20",
			"validrect.right": "16",
			"validrect.bottom": "24",
			"origin.x": "12",
			"origin.y": "28",
			"wordwrappoint.x": "240",
			"wordwrappoint.y": "120",
		};

		withSafeQueryDocument(() => {
			applyLayoutProperties(target, props, {
				elements: { balloonDisplay: balloonDisplay as unknown as HTMLElement },
			});
			applyValidRectProperties(target, props);
			applyPositionProperties(target, props, {});
		});

		const padding = readCssVar(target, "--balloon-padding");
		const slice = readCssVar(target, "--balloon-border-image-slice");
		const originX = readCssVar(target, "--balloon-origin-x");
		const originY = readCssVar(target, "--balloon-origin-y");
		const maxWidth = readCssVar(target, "--balloon-max-width");
		const maxHeight = readCssVar(target, "--balloon-max-height");

		const passed =
			padding === "20px 16px 24px 16px" &&
			slice === "20 16 24 16 fill" &&
			originX === "12px" &&
			originY === "28px" &&
			maxWidth === "240px" &&
			maxHeight === "120px" &&
			balloonDisplay.style.left === "" &&
			balloonDisplay.style.top === "";

		return {
			id: "balloon-layout-ui",
			category: "Balloon Layout",
			specName,
			usagePath,
			passed,
			actualSummary: `padding=${padding || "(empty)"}, slice=${slice || "(empty)"}, origin=(${originX}, ${originY}), max=(${maxWidth}, ${maxHeight})`,
			manualCheckHint,
		};
	} catch (err) {
		return {
			id: "balloon-layout-ui",
			category: "Balloon Layout",
			specName,
			usagePath,
			passed: false,
			actualSummary: `Error: ${err instanceof Error ? err.message : String(err)}`,
			manualCheckHint,
		};
	}
}

function runBalloonFontAssetsProbe(
	rootElement?: HTMLElement,
): UiComplianceProbeResult {
	const specName =
		"font.name / font.height / arrow.filename / recommended.ghost";
	const usagePath =
		"descript.txt ➔ applyFontProperties / applyAssetProperties / verifyRecommendedGhost ➔ CSS Vars (--balloon-font-family, --balloon-font-size, --balloon-arrow-image, --balloon-recommended-ghost)";
	const manualCheckHint =
		"バルーンのフォント書体・サイズ、矢印画像表示、非推奨ゴースト警告表示が意図通りか目視確認";

	try {
		const target = createStyleTarget(rootElement);
		const props: Record<string, string> = {
			"font.name": "Meiryo",
			"font.height": "14",
			"font.color.r": "32",
			"font.color.g": "48",
			"font.color.b": "64",
			"arrow.filename": "arrow",
			"recommended.ghost": "Emily",
			"recommended.ghost.path": "ghost/emily",
		};

		applyFontProperties(target, props, {});
		applyAssetProperties(target, props, {
			currentBalloonTheme: "ivory",
			currentGhostName: "Emily",
			currentGhostPath: "C:/app/ghost/emily",
		} as unknown as Parameters<typeof applyAssetProperties>[2]);

		const recOk = verifyRecommendedGhost(props, "Emily", "C:/app/ghost/emily");
		const recMismatch = verifyRecommendedGhost(
			props,
			"Sakura",
			"C:/app/ghost/sakura",
		);

		const fontFamily = readCssVar(target, "--balloon-font-family");
		const fontSize = readCssVar(target, "--balloon-font-size");
		const textColor = readCssVar(target, "--balloon-text-color");
		const arrowImage = readCssVar(target, "--balloon-arrow-image");
		const arrow0Image = readCssVar(target, "--balloon-arrow0-image");
		const arrow1Image = readCssVar(target, "--balloon-arrow1-image");
		const arrowDisplay = readCssVar(target, "--balloon-arrow-display");
		const recGhost = readCssVar(target, "--balloon-recommended-ghost");

		const passed =
			fontFamily.includes("Meiryo") &&
			fontSize === "14px" &&
			textColor === "rgb(32, 48, 64)" &&
			arrowImage.includes("url(") &&
			arrowImage.includes("arrow") &&
			arrow0Image.includes("arrow0.png") &&
			arrow1Image.includes("arrow1.png") &&
			arrowDisplay === "block" &&
			recGhost === "Emily" &&
			recOk.isRecommended &&
			!recMismatch.isRecommended &&
			Boolean(recMismatch.warning);

		return {
			id: "balloon-font-assets-ui",
			category: "Balloon Font & Assets",
			specName,
			usagePath,
			passed,
			actualSummary: `font=${fontFamily} (${fontSize}), arrow=${arrowImage}, recommended=${recGhost} (mismatchWarn=${!recMismatch.isRecommended})`,
			manualCheckHint,
		};
	} catch (err) {
		return {
			id: "balloon-font-assets-ui",
			category: "Balloon Font & Assets",
			specName,
			usagePath,
			passed: false,
			actualSummary: `Error: ${err instanceof Error ? err.message : String(err)}`,
			manualCheckHint,
		};
	}
}

function runSakuraScriptTokensProbe(): UiComplianceProbeResult {
	const specName = "\\p[2] / \\s[20] / \\b[0] タグトークナイズ";
	const usagePath =
		"SakuraScript ➔ tokenizeScopeSurfaceTag / tokenizeDisplayTag ➔ Token Output (scope:2, surface:20, balloon:0)";
	const manualCheckHint =
		"\\p[2]・\\s[20]・\\b[0] を含むスクリプト再生時に3体目キャラ・サーフェス・バルーン切替が反映されるか確認";

	try {
		const scopeRes = tokenizeScopeSurfaceTag("\\p[2]", 1, 5);
		const surfaceRes = tokenizeScopeSurfaceTag("\\s[20]", 1, 6);
		const balloonRes = tokenizeDisplayTag("\\b[0]", 1, 5);

		const scopeTok = scopeRes?.tokens?.[0] as
			| { type?: string; value?: unknown }
			| undefined;
		const surfaceTok = surfaceRes?.tokens?.[0] as
			| { type?: string; value?: unknown }
			| undefined;
		const balloonTok = balloonRes?.tokens?.[0] as
			| { type?: string; value?: unknown }
			| undefined;

		const passed =
			scopeTok?.type === "scope" &&
			scopeTok?.value === 2 &&
			surfaceTok?.type === "surface" &&
			surfaceTok?.value === 20 &&
			balloonTok?.type === "balloon" &&
			balloonTok?.value === 0;

		return {
			id: "sakura-script-tokens-ui",
			category: "SakuraScript Parser",
			specName,
			usagePath,
			passed,
			actualSummary: `scope=${String(scopeTok?.value)}, surface=${String(surfaceTok?.value)}, balloon=${String(balloonTok?.value)}`,
			manualCheckHint,
		};
	} catch (err) {
		return {
			id: "sakura-script-tokens-ui",
			category: "SakuraScript Parser",
			specName,
			usagePath,
			passed: false,
			actualSummary: `Error: ${err instanceof Error ? err.message : String(err)}`,
			manualCheckHint,
		};
	}
}

function runSurfaceScopeCollisionProbe(): UiComplianceProbeResult {
	const specName =
		"surface.alias / kero.surface.alias / char*.surface.alias スコープ分離";
	const usagePath =
		"surfaces.txt ➔ surfaceCollisionMethods.resolveSurfaceNumber ➔ Scope-Isolated Surface ID";
	const manualCheckHint =
		"複数キャラ表示時に未定義エイリアス参照でスコープ0の画像に汚染されないか目視確認";

	try {
		const mockContext = {
			aliases: { default: [0, 1], sakura_happy: [5] },
			keroAliases: { kero_smile: [11] },
			charAliases: { 2: { c2_smile: [20, 21] } },
			names: { 0: "SakuraDefault", 20: "Char2Default" },
		};

		const s0 = surfaceCollisionMethods.resolveSurfaceNumber.call(
			mockContext,
			"sakura_happy",
			0,
		);
		const s1 = surfaceCollisionMethods.resolveSurfaceNumber.call(
			mockContext,
			"kero_smile",
			1,
		);
		const s1Isolation = surfaceCollisionMethods.resolveSurfaceNumber.call(
			mockContext,
			"sakura_happy",
			1,
		);
		const s2 = surfaceCollisionMethods.resolveSurfaceNumber.call(
			mockContext,
			"c2_smile",
			2,
		);
		const s2Isolation = surfaceCollisionMethods.resolveSurfaceNumber.call(
			mockContext,
			"default",
			2,
		);

		const passed =
			String(s0) === "5" &&
			String(s1) === "11" &&
			s1Isolation === "sakura_happy" &&
			["20", "21"].includes(String(s2)) &&
			s2Isolation === "default";

		return {
			id: "surface-scope-collision-ui",
			category: "Surface & Scope",
			specName,
			usagePath,
			passed,
			actualSummary: `scope0=${String(s0)}, scope1=${String(s1)} (isolated=${String(s1Isolation)}), scope2=${String(s2)} (isolated=${String(s2Isolation)})`,
			manualCheckHint,
		};
	} catch (err) {
		return {
			id: "surface-scope-collision-ui",
			category: "Surface & Scope",
			specName,
			usagePath,
			passed: false,
			actualSummary: `Error: ${err instanceof Error ? err.message : String(err)}`,
			manualCheckHint,
		};
	}
}

async function runMouseShioriEventProbe(): Promise<UiComplianceProbeResult> {
	const specName =
		"OnMouseClick / OnMouseDoubleClick / OnMouseWheel (Reference0..4)";
	const usagePath =
		"Mouse Input ➔ mouseMethods.onGhostClick / onGhostWheel ➔ detectCollision ➔ SHIORI (OnMouseClick / OnMouseWheel)";
	const manualCheckHint =
		"キャラの当たり判定部位（Head等）をクリック／ホイールして該当部位のSHIORI反応が返るか確認";

	try {
		const calls: Array<{ event: string; args: unknown[] }> = [];
		const playedScripts: unknown[] = [];
		let resolveClickFlow: (() => void) | null = null;
		const clickFlowDone = new Promise<void>((resolve) => {
			resolveClickFlow = resolve;
		});

		const surfaceManager = {
			...surfaceCollisionMethods,
			baseWidth: 300,
			baseHeight: 400,
			currentSurfaceIdFor: () => 0,
			collisions: {
				"0": [
					{
						id: 1,
						name: "Head",
						shape: "rect",
						x1: 50,
						y1: 100,
						x2: 150,
						y2: 200,
						minX: 50,
						minY: 100,
						maxX: 150,
						maxY: 200,
					},
				],
			},
			aliases: {},
			names: {},
			cursors: {},
			tooltips: {},
			collisionSort: "none",
		};

		const mockApp = {
			...mouseMethods,
			surfaceManager,
			ghostController: {
				sendShioriEvent: async (event: string, args: unknown[] = []) => {
					calls.push({ event, args });
					if (event === "OnMouseDoubleClick") {
						return { status: 204 };
					}
					if (event === "OnMouseClick") {
						return { status: 200, value: "\\0HeadClicked\\e" };
					}
					return { status: 200, value: "" };
				},
			},
			playSakuraScript: (script: unknown) => {
				playedScripts.push(script);
				resolveClickFlow?.();
			},
		};

		const rect = { left: 0, top: 0, width: 300, height: 400 };
		mouseMethods.onGhostClick.call(mockApp, 100, 150, rect, 0);
		let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
		try {
			await Promise.race([
				clickFlowDone,
				new Promise<void>((resolve) => {
					fallbackTimer = setTimeout(resolve, 50);
				}),
			]);
		} finally {
			if (fallbackTimer !== undefined) {
				clearTimeout(fallbackTimer);
			}
		}

		mouseMethods.onGhostWheel.call(mockApp, 100, 150, rect, -120, 1);

		const dblClickCall = calls.find((c) => c.event === "OnMouseDoubleClick");
		const clickCall = calls.find((c) => c.event === "OnMouseClick");
		const wheelCall = calls.find((c) => c.event === "OnMouseWheel");

		const passed =
			Boolean(dblClickCall) &&
			Boolean(clickCall) &&
			clickCall?.args[0] === 100 &&
			clickCall?.args[1] === 150 &&
			clickCall?.args[2] === 0 &&
			clickCall?.args[3] === 0 &&
			clickCall?.args[4] === "Head" &&
			playedScripts.includes("\\0HeadClicked\\e") &&
			Boolean(wheelCall) &&
			wheelCall?.args[0] === 100 &&
			wheelCall?.args[1] === 150 &&
			wheelCall?.args[2] === -120 &&
			wheelCall?.args[3] === 1 &&
			wheelCall?.args[4] === "Head";

		return {
			id: "mouse-shiori-event-ui",
			category: "Mouse & SHIORI",
			specName,
			usagePath,
			passed,
			actualSummary: `events=[${calls.map((c) => c.event).join(", ")}], clickRef4=${String(clickCall?.args[4])}, wheelRef2=${String(wheelCall?.args[2])}, wheelRef3=${String(wheelCall?.args[3])}`,
			manualCheckHint,
		};
	} catch (err) {
		return {
			id: "mouse-shiori-event-ui",
			category: "Mouse & SHIORI",
			specName,
			usagePath,
			passed: false,
			actualSummary: `Error: ${err instanceof Error ? err.message : String(err)}`,
			manualCheckHint,
		};
	}
}

async function runSystemDialogUiProbe(): Promise<UiComplianceProbeResult> {
	const specName = "\\![open,dialog,color] / terms UIフォーム & コールバック";
	const usagePath =
		"SakuraScript (\\![open,dialog,...]) ➔ createColorDialogForm / createTermsDialogForm ➔ DOM Form & SHIORI Callback";
	const manualCheckHint =
		"カラーピッカー（OK/Cancel）と利用規約（同意する/同意しない）フォームの表示と選択結果通知を確認";

	try {
		return await withCapableDomDocument(async () => {
			const shioriCalls: Array<{ event: string; args?: string[] }> = [];
			const activeBoxes = new Map<string, unknown>();
			const context: ModalDialogContext = {
				activeBoxes,
				app: {
					ghostController: {
						sendShioriEvent: async (event: string, args?: string[]) => {
							shioriCalls.push({ event, args });
							return { status: 200 };
						},
					},
				},
			};

			let colorSuccessValue = "";
			let colorCancelCount = 0;

			const colorMount = document.createElement("div");
			const colorDialog = createColorDialogForm(
				context,
				"色を選択",
				"#ff8040",
				"color-probe",
				async (rgbStr) => {
					colorSuccessValue = rgbStr;
				},
				async () => {
					colorCancelCount++;
				},
			);
			colorMount.appendChild(colorDialog.form as unknown as Node);
			activeBoxes.set(colorDialog.boxKey, colorDialog);

			const colorNodes = collectNodes(colorDialog.form);
			const colorInput = colorNodes.find(
				(n) => String(n.tagName ?? "").toLowerCase() === "input",
			);
			const okBtn = colorNodes.find(
				(n) =>
					String(n.tagName ?? "").toLowerCase() === "button" &&
					String(n.textContent ?? "").trim() === "OK",
			);
			const hasColorClass = String(colorDialog.form.className ?? "").includes(
				"balloon-color-dialog",
			);
			const hasInitialColor =
				String(colorInput?.value ?? "").toLowerCase() === "#ff8040";

			(okBtn as { click?: () => void } | undefined)?.click?.();
			await Promise.resolve();
			const colorCleanedAfterOk = !activeBoxes.has(colorDialog.boxKey);

			const colorCancelDialog = createColorDialogForm(
				context,
				"色キャンセル",
				"#000000",
				"color-cancel-probe",
				async () => {},
				async () => {
					colorCancelCount++;
				},
			);
			colorMount.appendChild(colorCancelDialog.form as unknown as Node);
			activeBoxes.set(colorCancelDialog.boxKey, colorCancelDialog);
			const cancelBtn = collectNodes(colorCancelDialog.form).find(
				(n) =>
					String(n.tagName ?? "").toLowerCase() === "button" &&
					String(n.textContent ?? "").trim() === "Cancel",
			);
			(cancelBtn as { click?: () => void } | undefined)?.click?.();
			await Promise.resolve();

			const termsMount = document.createElement("div");
			const termsDialog = createTermsDialogForm(
				context,
				"利用規約",
				"terms-1",
				"terms-probe",
			);
			termsMount.appendChild(termsDialog.form as unknown as Node);
			activeBoxes.set(termsDialog.boxKey, termsDialog);

			const termsNodes = collectNodes(termsDialog.form);
			const acceptBtn = termsNodes.find(
				(n) =>
					String(n.tagName ?? "").toLowerCase() === "button" &&
					String(n.textContent ?? "").trim() === "同意する",
			);
			const hasTermsClass = String(termsDialog.form.className ?? "").includes(
				"balloon-terms-dialog",
			);
			(acceptBtn as { click?: () => void } | undefined)?.click?.();
			await Promise.resolve();
			const termsCleaned = !activeBoxes.has(termsDialog.boxKey);

			const termsDeclineDialog = createTermsDialogForm(
				context,
				"利用規約2",
				"terms-2",
				"terms-decline-probe",
			);
			termsMount.appendChild(termsDeclineDialog.form as unknown as Node);
			activeBoxes.set(termsDeclineDialog.boxKey, termsDeclineDialog);
			const declineBtn = collectNodes(termsDeclineDialog.form).find(
				(n) =>
					String(n.tagName ?? "").toLowerCase() === "button" &&
					String(n.textContent ?? "").trim() === "同意しない",
			);
			(declineBtn as { click?: () => void } | undefined)?.click?.();
			await Promise.resolve();

			const acceptCall = shioriCalls.find(
				(c) => c.event === "OnGhostTermsAccept",
			);
			const declineCall = shioriCalls.find(
				(c) => c.event === "OnGhostTermsDecline",
			);

			const passed =
				hasColorClass &&
				hasInitialColor &&
				colorSuccessValue === "255,128,64" &&
				colorCleanedAfterOk &&
				colorCancelCount === 1 &&
				hasTermsClass &&
				termsCleaned &&
				acceptCall?.args?.[0] === "terms-1" &&
				declineCall?.args?.[0] === "terms-2";

			return {
				id: "system-dialog-ui",
				category: "System Dialog UI",
				specName,
				usagePath,
				passed,
				actualSummary: `colorRGB=${colorSuccessValue || "(none)"}, cancelCount=${colorCancelCount}, terms=[${shioriCalls.map((c) => `${c.event}(${c.args?.[0] ?? ""})`).join(", ")}]`,
				manualCheckHint,
			};
		});
	} catch (err) {
		return {
			id: "system-dialog-ui",
			category: "System Dialog UI",
			specName,
			usagePath,
			passed: false,
			actualSummary: `Error: ${err instanceof Error ? err.message : String(err)}`,
			manualCheckHint,
		};
	}
}

export async function runAllUiComplianceProbes(
	rootElement?: HTMLElement,
): Promise<UiComplianceSuiteReport> {
	const results: UiComplianceProbeResult[] = [
		runBalloonLayoutProbe(rootElement),
		runBalloonFontAssetsProbe(rootElement),
		runSakuraScriptTokensProbe(),
		runSurfaceScopeCollisionProbe(),
		await runMouseShioriEventProbe(),
		await runSystemDialogUiProbe(),
	];

	const total = results.length;
	const passed = results.filter((r) => r.passed).length;
	const failed = total - passed;
	const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

	return {
		total,
		passed,
		failed,
		passRate,
		results,
		timestamp: new Date().toISOString(),
	};
}

export function renderComplianceReportHtml(
	report: UiComplianceSuiteReport,
): string {
	const rowsHtml = report.results
		.map((r) => {
			const statusBadge = r.passed
				? '<span class="compliance-status pass">✅ PASS</span>'
				: '<span class="compliance-status fail">❌ FAIL</span>';
			const idEsc = escapeHtml(r.id);
			return `
        <tr class="compliance-row ${r.passed ? "compliance-probe-pass" : "compliance-probe-fail"}">
          <td>
            <div class="compliance-category">${escapeHtml(r.category)}</div>
            <div class="compliance-spec"><strong>${escapeHtml(r.specName)}</strong></div>
            <div class="compliance-usage"><code>${escapeHtml(r.usagePath)}</code></div>
          </td>
          <td>
            <div>${statusBadge}</div>
            <div class="compliance-actual">${escapeHtml(r.actualSummary)}</div>
          </td>
          <td>
            <label class="compliance-manual-label">
              <input type="checkbox" class="manual-verify-check" data-probe-id="${idEsc}" />
              目視確認済
            </label>
            <div class="compliance-hint">${escapeHtml(r.manualCheckHint)}</div>
          </td>
        </tr>`;
		})
		.join("");

	return `
    <div class="compliance-report">
      <div class="compliance-summary" style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;margin-bottom:0.75rem;">
        <span class="compliance-badge">合計: <strong>${report.total}</strong></span>
        <span class="compliance-badge pass">合格: <strong>${report.passed}</strong></span>
        <span class="compliance-badge fail">失敗: <strong>${report.failed}</strong></span>
        <span class="compliance-badge rate">適合率: <strong>${report.passRate}%</strong></span>
        <span class="compliance-badge manual" id="manual-verify-progress">目視確認: 0 / ${report.total}</span>
        <span class="compliance-timestamp" style="font-size:0.75rem;color:#666;">${escapeHtml(report.timestamp)}</span>
      </div>
      <div class="compliance-table-wrap" style="overflow-x:auto;">
        <table class="compliance-table" style="width:100%;border-collapse:collapse;font-size:0.78rem;">
          <thead>
            <tr>
              <th style="text-align:left;border-bottom:1px solid #ccc;padding:0.35rem;">仕様・使用経路</th>
              <th style="text-align:left;border-bottom:1px solid #ccc;padding:0.35rem;">自動検証結果</th>
              <th style="text-align:left;border-bottom:1px solid #ccc;padding:0.35rem;">UI目視確認</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    </div>`;
}
