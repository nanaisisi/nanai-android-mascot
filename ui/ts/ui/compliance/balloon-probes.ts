import {
	applyAssetProperties,
	verifyRecommendedGhost,
} from "../../core/actions/balloon-descript/assets.js";
import { applyFontProperties } from "../../core/actions/balloon-descript/font.js";
import { applyPositionProperties } from "../../core/actions/balloon-descript/layout/position.js";
import { applyValidRectProperties } from "../../core/actions/balloon-descript/layout/rect.js";
import { applyLayoutProperties } from "../../core/actions/balloon-descript/layout.js";
import { tokenizeScopeSurfaceTag } from "../../ghost/parser/tag/scope-surface.js";
import { tokenizeDisplayTag } from "../../ghost/parser/tag-tokenizer.js";
import { surfaceCollisionMethods } from "../../surface/surface-collision.js";
import {
	createStyleTarget,
	readCssVar,
	withSafeQueryDocument,
	type UiComplianceProbeResult,
} from "./types.js";

export function runBalloonLayoutProbe(rootElement?: HTMLElement): UiComplianceProbeResult {
	const specName = "descript.txt (validrect/origin/wordwrappoint)";
	const usagePath = "applyLayoutProperties / applyValidRectProperties / applyPositionProperties";
	const manualCheckHint = "バルーン枠線内にテキストが収まり原点指定が正しいか確認";

	try {
		const target = createStyleTarget(rootElement);
		const balloonDisplay = { style: { left: "", top: "" } };
		const props: Record<string, string> = {
			"validrect.left": "16", "validrect.top": "20",
			"validrect.right": "16", "validrect.bottom": "24",
			"origin.x": "12", "origin.y": "28",
			"wordwrappoint.x": "240", "wordwrappoint.y": "120",
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
			originX === "12px" && originY === "28px" &&
			maxWidth === "240px" && maxHeight === "120px" &&
			balloonDisplay.style.left === "" && balloonDisplay.style.top === "";

		return {
			id: "balloon-layout-ui",
			category: "Balloon Layout",
			specName, usagePath, passed,
			actualSummary: `padding=${padding}, slice=${slice}, origin=(${originX}, ${originY})`,
			manualCheckHint,
		};
	} catch (err) {
		return {
			id: "balloon-layout-ui",
			category: "Balloon Layout",
			specName, usagePath, passed: false,
			actualSummary: `Error: ${err instanceof Error ? err.message : String(err)}`,
			manualCheckHint,
		};
	}
}

export function runBalloonFontAssetsProbe(rootElement?: HTMLElement): UiComplianceProbeResult {
	const specName = "font.name / font.height / arrow.filename / recommended.ghost";
	const usagePath = "applyFontProperties / applyAssetProperties / verifyRecommendedGhost";
	const manualCheckHint = "フォント書体・サイズ、矢印画像表示、非推奨ゴースト警告を確認";

	try {
		const target = createStyleTarget(rootElement);
		const props: Record<string, string> = {
			"font.name": "Meiryo", "font.height": "14",
			"font.color.r": "32", "font.color.g": "48", "font.color.b": "64",
			"arrow.filename": "arrow",
			"recommended.ghost": "Emily", "recommended.ghost.path": "ghost/emily",
		};

		applyFontProperties(target, props, {});
		applyAssetProperties(target, props, {
			currentBalloonTheme: "ivory",
			currentGhostName: "Emily",
			currentGhostPath: "C:/app/ghost/emily",
		} as unknown as Parameters<typeof applyAssetProperties>[2]);

		const recOk = verifyRecommendedGhost(props, "Emily", "C:/app/ghost/emily");
		const recMismatch = verifyRecommendedGhost(props, "Sakura", "C:/app/ghost/sakura");

		const fontFamily = readCssVar(target, "--balloon-font-family");
		const fontSize = readCssVar(target, "--balloon-font-size");
		const textColor = readCssVar(target, "--balloon-text-color");
		const arrowImage = readCssVar(target, "--balloon-arrow-image");
		const recGhost = readCssVar(target, "--balloon-recommended-ghost");

		const passed =
			fontFamily.includes("Meiryo") && fontSize === "14px" &&
			textColor === "rgb(32, 48, 64)" && arrowImage.includes("arrow") &&
			recGhost === "Emily" && recOk.isRecommended && !recMismatch.isRecommended;

		return {
			id: "balloon-font-assets-ui",
			category: "Balloon Font & Assets",
			specName, usagePath, passed,
			actualSummary: `font=${fontFamily} (${fontSize}), arrow=${arrowImage}, recommended=${recGhost}`,
			manualCheckHint,
		};
	} catch (err) {
		return {
			id: "balloon-font-assets-ui",
			category: "Balloon Font & Assets",
			specName, usagePath, passed: false,
			actualSummary: `Error: ${err instanceof Error ? err.message : String(err)}`,
			manualCheckHint,
		};
	}
}

export function runSakuraScriptTokensProbe(): UiComplianceProbeResult {
	const specName = "\\p[2] / \\s[20] / \\b[0] タグトークナイズ";
	const usagePath = "tokenizeScopeSurfaceTag / tokenizeDisplayTag";
	const manualCheckHint = "キャラ・サーフェス・バルーン切替が反映されるか確認";

	try {
		const scopeRes = tokenizeScopeSurfaceTag("\\p[2]", 1, 5);
		const surfaceRes = tokenizeScopeSurfaceTag("\\s[20]", 1, 6);
		const balloonRes = tokenizeDisplayTag("\\b[0]", 1, 5);

		const scopeTok = scopeRes?.tokens?.[0] as { type?: string; value?: unknown } | undefined;
		const surfaceTok = surfaceRes?.tokens?.[0] as { type?: string; value?: unknown } | undefined;
		const balloonTok = balloonRes?.tokens?.[0] as { type?: string; value?: unknown } | undefined;

		const passed =
			scopeTok?.type === "scope" && scopeTok?.value === 2 &&
			surfaceTok?.type === "surface" && surfaceTok?.value === 20 &&
			balloonTok?.type === "balloon" && balloonTok?.value === 0;

		return {
			id: "sakura-script-tokens-ui",
			category: "SakuraScript Parser",
			specName, usagePath, passed,
			actualSummary: `scope=${scopeTok?.value}, surface=${surfaceTok?.value}, balloon=${balloonTok?.value}`,
			manualCheckHint,
		};
	} catch (err) {
		return {
			id: "sakura-script-tokens-ui",
			category: "SakuraScript Parser",
			specName, usagePath, passed: false,
			actualSummary: `Error: ${err instanceof Error ? err.message : String(err)}`,
			manualCheckHint,
		};
	}
}

export function runSurfaceScopeCollisionProbe(): UiComplianceProbeResult {
	const specName = "surface.alias / kero.alias スコープ分離";
	const usagePath = "surfaceCollisionMethods.resolveSurfaceNumber";
	const manualCheckHint = "複数キャラ表示時にスコープ分離が機能するか確認";

	try {
		const mockContext = {
			aliases: { default: [0, 1], sakura_happy: [5] },
			keroAliases: { kero_smile: [11] },
			charAliases: { 2: { c2_smile: [20, 21] } },
			names: { 0: "SakuraDefault", 20: "Char2Default" },
		};

		const s0 = surfaceCollisionMethods.resolveSurfaceNumber.call(mockContext, "sakura_happy", 0);
		const s1 = surfaceCollisionMethods.resolveSurfaceNumber.call(mockContext, "kero_smile", 1);
		const s1Iso = surfaceCollisionMethods.resolveSurfaceNumber.call(mockContext, "sakura_happy", 1);
		const s2 = surfaceCollisionMethods.resolveSurfaceNumber.call(mockContext, "c2_smile", 2);

		const passed =
			String(s0) === "5" && String(s1) === "11" &&
			s1Iso === "sakura_happy" && ["20", "21"].includes(String(s2));

		return {
			id: "surface-scope-collision-ui",
			category: "Surface & Scope",
			specName, usagePath, passed,
			actualSummary: `s0=${s0}, s1=${s1} (iso=${s1Iso}), s2=${s2}`,
			manualCheckHint,
		};
	} catch (err) {
		return {
			id: "surface-scope-collision-ui",
			category: "Surface & Scope",
			specName, usagePath, passed: false,
			actualSummary: `Error: ${err instanceof Error ? err.message : String(err)}`,
			manualCheckHint,
		};
	}
}
