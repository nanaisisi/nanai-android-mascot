/**
 * @file sakura-parser.ts
 * @brief さくらスクリプト（SakuraScript）トークナイザー・パーサー
 */

export interface SakuraScriptToken {
	type: string;

	value?: unknown;

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	value?: any;

	animId?: number | string;
	wait?: boolean;
	half?: boolean;
	id?: string;
	text?: string;
	args?: string[];

	[key: string]: unknown;

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	[key: string]: any;
}

export {
	calculateAstTextLength,
	collectAnchors,
	collectAnimations,
	collectAstTokens,
	collectAstTokensByLifetime,
	collectChoices,
	collectScopeNodes,
	collectSurfaces,
	filterAstByScope,
	getSakuraTokenLifetime,
	stripWaitsFromAst,
	tokensToAst,
	traverseAst,
} from "./parser/ast.js";
export {
	parseSakuraScriptAsync,
	rustCommandsToTokens,
} from "./sakura-rust-bridge.js";
export { parseSakuraScript } from "./sakura-tokenizer.js";
