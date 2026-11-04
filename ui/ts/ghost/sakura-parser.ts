/**
 * @file sakura-parser.ts
 * @brief さくらスクリプト（SakuraScript）トークナイザー・パーサー
 */

export interface SakuraScriptToken {
	type: string;
	value?: any;
	animId?: number | string;
	wait?: boolean;
	half?: boolean;
	id?: string;
	text?: string;
	args?: string[];
	[key: string]: any;
}

export {
	collectAstTokens,
	collectAstTokensByLifetime,
	getSakuraTokenLifetime,
	tokensToAst,
	traverseAst,
} from "./parser/ast.js";
export {
	parseSakuraScriptAsync,
	rustCommandsToTokens,
} from "./sakura-rust-bridge.js";
export { parseSakuraScript } from "./sakura-tokenizer.js";
