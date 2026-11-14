import { mouseMethods } from "../../core/events/mouse.js";
import { surfaceCollisionMethods } from "../../surface/surface-collision.js";
import {
	collectNodes,
	withCapableDomDocument,
	type UiComplianceProbeResult,
} from "./types.js";
import {
	createColorDialogForm,
	createTermsDialogForm,
	type ModalDialogContext,
} from "../renderers/modal-dialog-ui.js";

export async function runMouseShioriEventProbe(): Promise<UiComplianceProbeResult> {
	const specName = "OnMouseClick / OnMouseDoubleClick / OnMouseWheel";
	const usagePath = "mouseMethods.onGhostClick / onGhostWheel ➔ SHIORI Events";
	const manualCheckHint = "キャラクターの部位クリック・ホイールでSHIORI反応が返るか確認";

	try {
		const calls: Array<{ event: string; args: unknown[] }> = [];
		const playedScripts: unknown[] = [];
		let resolveClickFlow: (() => void) | null = null;
		const clickFlowDone = new Promise<void>((resolve) => {
			resolveClickFlow = resolve;
		});

		const surfaceManager = {
			...surfaceCollisionMethods,
			baseWidth: 300, baseHeight: 400,
			currentSurfaceIdFor: () => 0,
			collisions: {
				"0": [{ id: 1, name: "Head", shape: "rect", x1: 50, y1: 100, x2: 150, y2: 200, minX: 50, minY: 100, maxX: 150, maxY: 200 }],
			},
			aliases: {}, names: {}, cursors: {}, tooltips: {}, collisionSort: "none",
		};

		const mockApp = {
			...mouseMethods,
			surfaceManager,
			ghostController: {
				sendShioriEvent: async (event: string, args: unknown[] = []) => {
					calls.push({ event, args });
					if (event === "OnMouseDoubleClick") return { status: 204 };
					if (event === "OnMouseClick") return { status: 200, value: "\\0HeadClicked\\e" };
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
			if (fallbackTimer !== undefined) clearTimeout(fallbackTimer);
		}

		mouseMethods.onGhostWheel.call(mockApp, 100, 150, rect, -120, 1);

		const dblClickCall = calls.find((c) => c.event === "OnMouseDoubleClick");
		const clickCall = calls.find((c) => c.event === "OnMouseClick");
		const wheelCall = calls.find((c) => c.event === "OnMouseWheel");

		const passed =
			Boolean(dblClickCall) && Boolean(clickCall) &&
			clickCall?.args[0] === 100 && clickCall?.args[1] === 150 &&
			clickCall?.args[4] === "Head" && playedScripts.includes("\\0HeadClicked\\e") &&
			Boolean(wheelCall) && wheelCall?.args[2] === -120 && wheelCall?.args[4] === "Head";

		return {
			id: "mouse-shiori-event-ui",
			category: "Mouse & SHIORI",
			specName, usagePath, passed,
			actualSummary: `events=[${calls.map((c) => c.event).join(", ")}], ref4=${clickCall?.args[4]}`,
			manualCheckHint,
		};
	} catch (err) {
		return {
			id: "mouse-shiori-event-ui",
			category: "Mouse & SHIORI",
			specName, usagePath, passed: false,
			actualSummary: `Error: ${err instanceof Error ? err.message : String(err)}`,
			manualCheckHint,
		};
	}
}

export async function runSystemDialogUiProbe(): Promise<UiComplianceProbeResult> {
	const specName = "\\![open,dialog,color] / terms UIフォーム & コールバック";
	const usagePath = "createColorDialogForm / createTermsDialogForm ➔ DOM Form & SHIORI Callback";
	const manualCheckHint = "カラーピッカーと利用規約フォームの表示・応答を確認";

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
				context, "色を選択", "#ff8040", "color-probe",
				async (rgbStr) => { colorSuccessValue = rgbStr; },
				async () => { colorCancelCount++; },
			);
			colorMount.appendChild(colorDialog.form as unknown as Node);
			activeBoxes.set(colorDialog.boxKey, colorDialog);

			const colorNodes = collectNodes(colorDialog.form);
			const colorInput = colorNodes.find((n) => String(n.tagName ?? "").toLowerCase() === "input");
			const okBtn = colorNodes.find((n) => String(n.tagName ?? "").toLowerCase() === "button" && String(n.textContent ?? "").trim() === "OK");
			const hasColorClass = String(colorDialog.form.className ?? "").includes("balloon-color-dialog");
			const hasInitialColor = String(colorInput?.value ?? "").toLowerCase() === "#ff8040";

			(okBtn as { click?: () => void } | undefined)?.click?.();
			await Promise.resolve();
			const colorCleanedAfterOk = !activeBoxes.has(colorDialog.boxKey);

			const termsMount = document.createElement("div");
			const termsDialog = createTermsDialogForm(context, "利用規約", "terms-1", "terms-probe");
			termsMount.appendChild(termsDialog.form as unknown as Node);
			activeBoxes.set(termsDialog.boxKey, termsDialog);

			const termsNodes = collectNodes(termsDialog.form);
			const acceptBtn = termsNodes.find((n) => String(n.tagName ?? "").toLowerCase() === "button" && String(n.textContent ?? "").trim() === "同意する");
			const hasTermsClass = String(termsDialog.form.className ?? "").includes("balloon-terms-dialog");
			(acceptBtn as { click?: () => void } | undefined)?.click?.();
			await Promise.resolve();
			const termsCleaned = !activeBoxes.has(termsDialog.boxKey);

			const acceptCall = shioriCalls.find((c) => c.event === "OnGhostTermsAccept");

			const passed =
				hasColorClass && hasInitialColor && colorSuccessValue === "255,128,64" &&
				colorCleanedAfterOk && hasTermsClass && termsCleaned && acceptCall?.args?.[0] === "terms-1";

			return {
				id: "system-dialog-ui",
				category: "System Dialog UI",
				specName, usagePath, passed,
				actualSummary: `colorRGB=${colorSuccessValue}, terms=${shioriCalls.map((c) => c.event).join(",")}`,
				manualCheckHint,
			};
		});
	} catch (err) {
		return {
			id: "system-dialog-ui",
			category: "System Dialog UI",
			specName, usagePath, passed: false,
			actualSummary: `Error: ${err instanceof Error ? err.message : String(err)}`,
			manualCheckHint,
		};
	}
}
