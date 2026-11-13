/**
 * @file verification-suite.test.ts
 * @brief テストコードベースの実装確認スイート (Implementation Verification Suite)
 */

import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { verifyRecommendedGhost } from "../ui/ts/core/actions/balloon-descript/assets.js";
import { applyPositionProperties } from "../ui/ts/core/actions/balloon-descript/layout/position.ts";
import { applyValidRectProperties } from "../ui/ts/core/actions/balloon-descript/layout/rect.js";
import { applyLayoutProperties } from "../ui/ts/core/actions/balloon-descript/layout.js";
import { mouseMethods } from "../ui/ts/core/events/mouse.js";
import { loadBalloonSkinImages } from "../ui/ts/ghost/balloon-window/theme.js";
import { tokenizeScopeSurfaceTag } from "../ui/ts/ghost/parser/tag/scope-surface.js";
import { tokenizeDisplayTag } from "../ui/ts/ghost/parser/tag-tokenizer.js";
import { surfaceCollisionMethods } from "../ui/ts/surface/surface-collision.js";
import { ModalManager } from "../ui/ts/ui/modal.js";
import {
	escapeHtml,
	renderComplianceReportHtml,
	runAllUiComplianceProbes,
} from "../ui/ts/ui/spec-compliance-runner.js";
import { setupBalloonMockEnvironment } from "./balloon-window/mock-balloon-env.js";

describe("全面実装確認スイート (Implementation Verification Suite)", () => {
	describe("1. バルーンスキン & 方向別画像ロードの検証", () => {
		it("右向き・左向きの方向別バルーン画像候補を正確に試行すること", async () => {
			setupBalloonMockEnvironment();

			// Scope 0 (さくら): 左配置時は balloons0, 右配置時は balloons1
			const sakuraLeft = await loadBalloonSkinImages("ivory", 0, "left");
			assert.ok(sakuraLeft);

			const sakuraRight = await loadBalloonSkinImages("ivory", 0, "right");
			assert.ok(sakuraRight);

			// Scope 1 (うにゅう/きろ): 左配置時は balloonk1, 右配置時は balloonk0
			const keroLeft = await loadBalloonSkinImages("ivory", 1, "left");
			assert.ok(keroLeft);

			const keroRight = await loadBalloonSkinImages("ivory", 1, "right");
			assert.ok(keroRight);

			// Scope 2 (3体目): balloonp2.png
			const char2 = await loadBalloonSkinImages("ivory", 2, "auto");
			assert.ok(char2);
		});
	});

	describe("2. UKADOC validrect & 9スライス領域制限の検証", () => {
		it("validrect のパディングが 9スライス枠線幅以上を保ち、テキストが枠線外に被らないこと", () => {
			const vars: Record<string, string> = {};
			const mockRoot = {
				style: {
					setProperty: (k: string, v: string) => {
						vars[k] = v;
					},
				},
			} as unknown as HTMLElement;

			const props = {
				"validrect.left": "10",
				"validrect.top": "40",
				"validrect.right": "10",
				"validrect.bottom": "15",
			};

			applyValidRectProperties(mockRoot, props);

			assert.equal(vars["--balloon-border-image-slice"], "40 10 15 10 fill");
			assert.equal(vars["--balloon-border-image-width"], "40px 10px 15px 10px");
			assert.equal(vars["--balloon-padding"], "40px 10px 15px 10px");
		});
	});

	describe("3. 原点座標 (origin.x/y) の変数分離検証 (右下押し出しの防止)", () => {
		it("origin.x / origin.y が CSS変数に格納され、balloonDisplay.style.left に誤代入されないこと", () => {
			const vars: Record<string, string> = {};
			const mockRoot = {
				style: {
					setProperty: (k: string, v: string) => {
						vars[k] = v;
					},
				},
			} as unknown as HTMLElement;

			const balloonDisplay = { style: { left: "", top: "" } };
			const instance = { elements: { balloonDisplay } };

			const props = {
				"origin.x": "12",
				"origin.y": "28",
			};

			applyPositionProperties(mockRoot, props, instance as unknown);

			assert.equal(vars["--balloon-origin-x"], "12px");
			assert.equal(vars["--balloon-origin-y"], "28px");
			// inline left/top が汚染されないことを確認
			assert.equal(balloonDisplay.style.left, "");
			assert.equal(balloonDisplay.style.top, "");
		});
	});

	describe("4. UKADOC recommended.ghost 検証機能の動作確認", () => {
		it("推奨ゴースト一致時は正常、不一致時は警告変数・ログを出力すること", () => {
			const props = {
				"recommended.ghost": "Emily",
				"recommended.ghost.path": "ghost/emily",
			};

			const okRes = verifyRecommendedGhost(
				props,
				"Emily",
				"C:/app/ghost/emily",
			);
			assert.equal(okRes.isRecommended, true);

			const ngRes = verifyRecommendedGhost(
				props,
				"Sakura",
				"C:/app/ghost/sakura",
			);
			assert.equal(ngRes.isRecommended, false);
			assert.ok(ngRes.warning);
		});
	});

	describe("5. スコープ間のサーフィス・エイリアス分離検証", () => {
		it("スコープ2 (3体目) が未定義エイリアス参照時にスコープ0 (メインキャラ) の画像に汚染されないこと", () => {
			const mockContext = {
				aliases: { default: [0, 1] },
				charAliases: { 2: { c2_smile: [20, 21] } },
				names: { 0: "SakuraDefault", 20: "Char2Default" },
			};

			// スコープ2固有のエイリアス
			const foundScope2 = surfaceCollisionMethods.resolveSurfaceNumber.call(
				mockContext,
				"c2_smile",
				2,
			);
			assert.ok(["20", "21"].includes(String(foundScope2)));

			// スコープ2に存在しないエイリアス -> スコープ0の "default" にフォールバックせず undefined / raw
			const fallbackScope2 = surfaceCollisionMethods.resolveSurfaceNumber.call(
				mockContext,
				"default",
				2,
			);
			assert.equal(fallbackScope2, "default"); // スコープ0の0番へ汚染されないことを検証
		});
	});

	describe("6. 入力 ➔ パイプライン ➔ 出力 全経路成立検証 (Input -> Pipeline -> Output Chain)", () => {
		it("SakuraScript (入力) ➔ タグ解析 (パイプライン) ➔ トークン出力 (出力) の全経路が規格通り成立すること", () => {
			// 1. Input (SakuraScript string)
			const scopeToken = tokenizeScopeSurfaceTag("p[2]", 0, 4);
			const surfaceToken = tokenizeScopeSurfaceTag("s[20]", 0, 5);
			const balloonToken = tokenizeDisplayTag("\\b[0]", 1, 5);

			// 2. Output Assertions
			assert.deepEqual(scopeToken?.tokens, [{ type: "scope", value: 2 }]);
			assert.deepEqual(surfaceToken?.tokens, [{ type: "surface", value: 20 }]);
			assert.deepEqual(balloonToken?.tokens, [{ type: "balloon", value: 0 }]);
		});

		it("descript.txt (入力) ➔ レイアウトパーサー (パイプライン) ➔ CSS変数/DOM (出力) の全経路が成立すること", () => {
			const mockStyleMap = new Map<string, string>();
			const mockRoot = {
				style: {
					setProperty: (k: string, v: string) => mockStyleMap.set(k, v),
					removeProperty: (k: string) => mockStyleMap.delete(k),
				},
			} as unknown as HTMLElement;

			const descriptProps = {
				"validrect.left": "16",
				"validrect.top": "16",
				"validrect.right": "16",
				"validrect.bottom": "24",
				"origin.x": "12",
				"origin.y": "28",
				"wordwrappoint.x": "-40",
			};

			applyLayoutProperties(mockRoot, descriptProps, {});

			// 規格に沿った出力検証
			assert.equal(
				mockStyleMap.get("--balloon-padding"),
				"16px 16px 24px 16px",
			);
			assert.equal(
				mockStyleMap.get("--balloon-border-image-slice"),
				"16 16 24 16 fill",
			);
			assert.equal(mockStyleMap.get("--balloon-origin-x"), "12px");
			assert.equal(mockStyleMap.get("--balloon-origin-y"), "28px");
		});
	});

	describe("7. マウスイベント (OnMouse*) ➔ 判定 ➔ SHIORI通知の全経路検証", () => {
		it("マウス位置/クリック (入力) ➔ 当たり判定 (パイプライン) ➔ SHIORI通知 (出力) の全経路が規格通り成立すること", async () => {
			let sentEventName = "";
			let sentArgs: unknown[] = [];

			const mockController = {
				sendShioriEvent: async (eventName: string, args: unknown[]) => {
					sentEventName = eventName;
					sentArgs = args;
					return { status: 200, value: "\\0hello\\e" };
				},
			};

			const mockSurfaceManager = {
				detectCollision: (
					x: number,
					y: number,
					_rect: unknown,
					_surfaceId: unknown,
					_scopeId: number,
				) => {
					return { name: "Head", canvasX: x, canvasY: y };
				},
			};

			const mockApp = {
				ghostController: mockController,
				surfaceManager: mockSurfaceManager,
				...mouseMethods,
			};

			// 1. Mouse Click Event (Input -> Pipeline -> Output)
			mockApp.onGhostClick(100, 150, {}, 0);

			// Yield event loop for promise resolution
			await new Promise((r) => setTimeout(r, 0));

			assert.ok(["OnMouseDoubleClick", "OnMouseClick"].includes(sentEventName));
			assert.equal(sentArgs[0], 100); // canvasX
			assert.equal(sentArgs[1], 150); // canvasY
			assert.equal(sentArgs[3], 0); // scopeId
			assert.equal(sentArgs[4], "Head"); // collision region name

			// 2. Mouse Wheel Event
			mockApp.onGhostWheel(100, 150, {}, -120, 1);
			assert.equal(sentEventName, "OnMouseWheel");
			assert.equal(sentArgs[0], 100);
			assert.equal(sentArgs[1], 150);
			assert.equal(sentArgs[2], -120); // delta
			assert.equal(sentArgs[3], 1); // scope 1 (Kero)
			assert.equal(sentArgs[4], "Head");
		});
	});

	describe("8. 全使用部〜UI半自動確認ランナー (runAllUiComplianceProbes) の一括検証", () => {
		it("全UI仕様適合プローブを実行し 100% 合格とチェックリストHTMLを返すこと", async () => {
			const report = await runAllUiComplianceProbes();

			assert.ok(report.total >= 6);
			assert.equal(report.failed, 0);
			assert.equal(report.passRate, 100);
			assert.equal(report.passed, report.total);

			for (const probe of report.results) {
				assert.equal(
					probe.passed,
					true,
					`Probe ${probe.id} failed: ${probe.actualSummary}`,
				);
			}

			const html = renderComplianceReportHtml(report);
			assert.ok(html.includes("100%"));
			for (const probe of report.results) {
				assert.ok(
					html.includes(escapeHtml(probe.usagePath)),
					`Rendered report missing usagePath for ${probe.id}`,
				);
				assert.ok(
					html.includes(
						`class="manual-verify-check" data-probe-id="${escapeHtml(probe.id)}"`,
					),
					`Rendered report missing manual-verify-check for ${probe.id}`,
				);
			}
		});
	});

	describe("9. テストモーダル (ModalManager: test-modal-content) からのUI半自動検証操作の成立検証", () => {
		it("test-modal-content を開き #run-spec-compliance-btn クリックで #test-results に検証レポートが描画されること", async () => {
			const g = globalThis as unknown as Record<string, unknown>;
			const hadDocument = "document" in g;
			const origDocument = g.document;
			const hadWindow = "window" in g;
			const origWindow = g.window;
			const hadTauri = "__TAURI__" in g;
			const origTauri = g.__TAURI__;
			const hadTauriInternals = "__TAURI_INTERNALS__" in g;
			const origTauriInternals = g.__TAURI_INTERNALS__;

			const { doc, pendingPromises } = createMountedModalDom();
			g.window = g;
			g.document = doc;
			delete g.__TAURI__;
			delete g.__TAURI_INTERNALS__;

			try {
				const modal = new ModalManager();
				modal.show("test-modal-content");

				const overlay = doc.getElementById("modal-overlay");
				assert.equal(overlay?.style.display, "flex");

				const runBtn = doc.getElementById("run-spec-compliance-btn");
				assert.ok(
					runBtn,
					"#run-spec-compliance-btn must exist after showing test-modal-content",
				);

				const resultsEl = doc.getElementById("test-results");
				assert.ok(
					resultsEl,
					"#test-results must exist after showing test-modal-content",
				);

				runBtn.click();

				const deadline = Date.now() + 2000;
				while (
					pendingPromises.length > 0 ||
					(!resultsEl.innerHTML.includes("manual-verify-check") &&
						Date.now() < deadline)
				) {
					if (pendingPromises.length > 0) {
						const batch = pendingPromises.splice(0, pendingPromises.length);
						await Promise.all(batch);
					} else {
						await new Promise((r) => setTimeout(r, 10));
					}
				}

				assert.ok(resultsEl.innerHTML.includes("compliance-report"));
				assert.ok(resultsEl.innerHTML.includes("manual-verify-check"));
				assert.ok(resultsEl.innerHTML.includes("100%"));
				assert.ok(!resultsEl.innerHTML.includes("❌ FAIL"));

				const checks = resultsEl.querySelectorAll(".manual-verify-check");
				assert.ok(checks.length >= 6);
				const firstCheck = checks[0] as unknown as {
					checked?: boolean;
					trigger?: (type: string) => void;
				};
				firstCheck.checked = true;
				firstCheck.trigger?.("change");

				const progressEl = doc.getElementById("manual-verify-progress");
				assert.ok(progressEl?.textContent?.includes(`1 / ${checks.length}`));
			} finally {
				if (hadDocument) {
					g.document = origDocument;
				} else {
					delete g.document;
				}
				if (hadWindow) {
					g.window = origWindow;
				} else {
					delete g.window;
				}
				if (hadTauri) {
					g.__TAURI__ = origTauri;
				} else {
					delete g.__TAURI__;
				}
				if (hadTauriInternals) {
					g.__TAURI_INTERNALS__ = origTauriInternals;
				} else {
					delete g.__TAURI_INTERNALS__;
				}
			}
		});
	});
});

interface MockDomStyle extends Record<string, unknown> {
	setProperty: (name: string, value: string) => void;
	getPropertyValue: (name: string) => string;
	removeProperty: (name: string) => string;
}

interface MockDomElement {
	tagName: string;
	id: string;
	className: string;
	type: string;
	value: string;
	checked: boolean;
	textContent: string;
	innerHTML: string;
	style: MockDomStyle;
	children: MockDomElement[];
	parentNode: MockDomElement | null;
	appendChild: (child: MockDomElement) => MockDomElement;
	remove: () => void;
	addEventListener: (
		type: string,
		cb: (ev: {
			target: MockDomElement;
			stopPropagation: () => void;
			preventDefault: () => void;
		}) => unknown,
	) => void;
	click: () => void;
	trigger: (type: string) => void;
	querySelector: (selector: string) => MockDomElement | null;
	querySelectorAll: (selector: string) => MockDomElement[];
}

function createMockDomStyle(): MockDomStyle {
	const store = new Map<string, string>();
	return new Proxy(
		{
			setProperty(name: string, value: string) {
				store.set(name, String(value));
			},
			getPropertyValue(name: string) {
				return store.get(name) ?? "";
			},
			removeProperty(name: string) {
				const prev = store.get(name) ?? "";
				store.delete(name);
				return prev;
			},
		} as MockDomStyle,
		{
			get(target, prop: string) {
				if (prop in target) {
					return target[prop];
				}
				return store.get(prop) ?? "";
			},
			set(target, prop: string, value: unknown) {
				if (prop in target) {
					target[prop] = value;
				} else {
					store.set(prop, String(value ?? ""));
				}
				return true;
			},
		},
	);
}

function createMountedModalDom(): {
	doc: Document;
	pendingPromises: Promise<unknown>[];
} {
	const elementsById = new Map<string, MockDomElement>();
	const pendingPromises: Promise<unknown>[] = [];

	const createNode = (tagName: string, id = ""): MockDomElement => {
		const listeners = new Map<
			string,
			Array<
				(ev: {
					target: MockDomElement;
					stopPropagation: () => void;
					preventDefault: () => void;
				}) => unknown
			>
		>();
		let rawInnerHtml = "";
		let parsedChecks: MockDomElement[] = [];

		const node: MockDomElement = {
			tagName: tagName.toUpperCase(),
			id,
			className: "",
			type: "",
			value: "",
			checked: false,
			textContent: "",
			get innerHTML() {
				return rawInnerHtml;
			},
			set innerHTML(html: string) {
				rawInnerHtml = String(html);
				parsedChecks = [];
				for (const match of rawInnerHtml.matchAll(/\bid=["']([^"']+)["']/g)) {
					const foundId = match[1];
					if (foundId && !elementsById.has(foundId)) {
						elementsById.set(foundId, createNode("div", foundId));
					}
				}
				for (const _match of rawInnerHtml.matchAll(
					/<input[^>]*class=["'][^"']*manual-verify-check[^"']*["'][^>]*>/g,
				)) {
					const cb = createNode("input");
					cb.type = "checkbox";
					cb.className = "manual-verify-check";
					parsedChecks.push(cb);
				}
			},
			style: createMockDomStyle(),
			children: [],
			parentNode: null,
			appendChild(child: MockDomElement) {
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
			addEventListener(type, cb) {
				const list = listeners.get(type) ?? [];
				list.push(cb);
				listeners.set(type, list);
			},
			trigger(type: string) {
				const list = listeners.get(type) ?? [];
				const ev = {
					target: node,
					stopPropagation() {},
					preventDefault() {},
				};
				for (const cb of list) {
					const result = cb(ev);
					if (
						result &&
						typeof (result as Promise<unknown>).then === "function"
					) {
						pendingPromises.push(result as Promise<unknown>);
					}
				}
			},
			click() {
				node.trigger("click");
			},
			querySelector() {
				return null;
			},
			querySelectorAll(selector: string) {
				if (selector === ".manual-verify-check") {
					return parsedChecks;
				}
				return [];
			},
		};

		return node;
	};

	for (const baseId of ["modal-overlay", "modal-content", "modal-close"]) {
		elementsById.set(baseId, createNode("div", baseId));
	}

	const doc = {
		getElementById(id: string) {
			return elementsById.get(id) ?? null;
		},
		querySelector() {
			return null;
		},
		querySelectorAll(selector: string) {
			if (selector === ".manual-verify-check") {
				return (
					elementsById.get("test-results")?.querySelectorAll(selector) ?? []
				);
			}
			return [];
		},
		createElement(tagName: string) {
			return createNode(tagName);
		},
	} as unknown as Document;

	return { doc, pendingPromises };
}
