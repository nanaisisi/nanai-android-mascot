/**
 * @file sakura-parser.ts
 * @brief さくらスクリプト（SakuraScript）トークナイザー・パーサー
 */

export interface SakuraScriptToken {
	type: string;
<<<<<<< HEAD
	value?: unknown;
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	value?: any;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	animId?: number | string;
	wait?: boolean;
	half?: boolean;
	id?: string;
	text?: string;
	args?: string[];
<<<<<<< HEAD
	[key: string]: unknown;
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	[key: string]: any;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
