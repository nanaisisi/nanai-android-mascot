/**
 * @file ast.ts
 * @brief さくらスクリプト AST (Abstract Syntax Tree) 構築モジュール
 */

import type {
	SakuraAnchorScope,
	SakuraAstNode,
	SakuraChoiceScope,
	SakuraToken,
} from "./ast-types.js";

export type {
	SakuraAnchorScope,
	SakuraAstNode,
	SakuraChoiceScope,
	SakuraToken,
} from "./ast-types.js";
export { traverseAst } from "./ast-types.js";
export type { AstDiagnostics } from "./ast-utils.js";
export {
	calculateAstTextLength,
	collectAnchors,
	collectAnimations,
	collectAstTokens,
	collectAstTokensByLifetime,
	collectChoices,
	collectScopeNodes,
	collectSurfaces,
	extractAstText,
	filterAstByScope,
	getAstDiagnostics,
	getSakuraTokenLifetime,
	mapAstCommands,
	stripWaitsFromAst,
} from "./ast-utils.js";

export function tokensToAst(tokens: unknown[]): SakuraAstNode {
	const rootChildren: SakuraAstNode[] = [];
	let currentScope: number | null = null;
	let scopeChildren: SakuraAstNode[] = [];

	let currentAnchor: SakuraAnchorScope | null = null;
	let anchorChildren: SakuraAstNode[] = [];

	let currentChoiceScope: SakuraChoiceScope | null = null;
	let choiceScopeChildren: SakuraAstNode[] = [];

	const pushToCurrentContainer = (node: SakuraAstNode) => {
		if (currentChoiceScope) {
			choiceScopeChildren.push(node);
		} else if (currentAnchor) {
			anchorChildren.push(node);
		} else if (currentScope !== null) {
			scopeChildren.push(node);
		} else {
			rootChildren.push(node);
		}
	};

	for (const rawToken of tokens) {
		const token = (rawToken ?? {}) as SakuraToken;
		if (token.type === "scope") {
			if (currentChoiceScope) {
				const choiceNode: SakuraAstNode = {
					nodeType: "choice",
					id: currentChoiceScope.id,
					text: choiceScopeChildren
						.filter(
							(n) =>
								Boolean(n.token) && (n.token as SakuraToken).type === "char",
						)
						.map((n) => String((n.token as SakuraToken).value ?? ""))
						.join(""),
					args: currentChoiceScope.args || [],
					children: choiceScopeChildren,
				};
				currentChoiceScope = null;
				choiceScopeChildren = [];
				if (currentScope !== null) {
					scopeChildren.push(choiceNode);
				} else {
					rootChildren.push(choiceNode);
				}
			}
			if (currentAnchor) {
				const anchorNode: SakuraAstNode = {
					nodeType: "anchor",
					id: currentAnchor.id,
					text: currentAnchor.text,
					args: currentAnchor.args || [],
					children: anchorChildren,
				};
				currentAnchor = null;
				anchorChildren = [];
				if (currentScope !== null) {
					scopeChildren.push(anchorNode);
				} else {
					rootChildren.push(anchorNode);
				}
			}

			if (currentScope !== null) {
				rootChildren.push({
					nodeType: "scope",
					scope: currentScope,
					children: scopeChildren,
				});
				scopeChildren = [];
			}
			currentScope = typeof token.value === "number" ? token.value : 0;
		} else if (token.type === "choice_scope_begin") {
			currentChoiceScope = {
				id: token.id || "",
				args: token.args || [],
			};
			choiceScopeChildren = [];
		} else if (token.type === "choice_scope_end") {
			if (currentChoiceScope) {
				const choiceNode: SakuraAstNode = {
					nodeType: "choice",
					id: currentChoiceScope.id,
					text: choiceScopeChildren
						.filter(
							(n) =>
								Boolean(n.token) && (n.token as SakuraToken).type === "char",
						)
						.map((n) => String((n.token as SakuraToken).value ?? ""))
						.join(""),
					args: currentChoiceScope.args || [],
					children: choiceScopeChildren,
				};
				currentChoiceScope = null;
				choiceScopeChildren = [];
				if (currentAnchor) {
					anchorChildren.push(choiceNode);
				} else if (currentScope !== null) {
					scopeChildren.push(choiceNode);
				} else {
					rootChildren.push(choiceNode);
				}
			}
		} else if (token.type === "anchor_begin") {
			currentAnchor = {
				id: token.id || "",
				text: token.text || "",
				args: token.args || [],
			};
			anchorChildren = [];
		} else if (token.type === "anchor_end") {
			if (currentAnchor) {
				const derivedText =
					currentAnchor.text ||
					anchorChildren
						.filter(
							(n) =>
								Boolean(n.token) && (n.token as SakuraToken).type === "char",
						)
						.map((n) => String((n.token as SakuraToken).value ?? ""))
						.join("");
				const anchorNode: SakuraAstNode = {
					nodeType: "anchor",
					id: currentAnchor.id,
					text: derivedText,
					args: currentAnchor.args || [],
					children: anchorChildren,
				};
				currentAnchor = null;
				anchorChildren = [];
				if (currentScope !== null) {
					scopeChildren.push(anchorNode);
				} else {
					rootChildren.push(anchorNode);
				}
			}
		} else if (token.type === "choice") {
			pushToCurrentContainer({
				nodeType: "choice",
				id: token.id || "",
				text: token.text || "",
				args: token.args || [],
			});
		} else {
			pushToCurrentContainer({
				nodeType: "command",
				token,
			});
		}
	}

	if (currentChoiceScope) {
		const choiceNode: SakuraAstNode = {
			nodeType: "choice",
			id: currentChoiceScope.id,
			text: choiceScopeChildren
				.filter(
					(n) => Boolean(n.token) && (n.token as SakuraToken).type === "char",
				)
				.map((n) => String((n.token as SakuraToken).value ?? ""))
				.join(""),
			args: currentChoiceScope.args || [],
			children: choiceScopeChildren,
		};
		if (currentAnchor) {
			anchorChildren.push(choiceNode);
		} else if (currentScope !== null) {
			scopeChildren.push(choiceNode);
		} else {
			rootChildren.push(choiceNode);
		}
	}
	if (currentAnchor) {
		const derivedText =
			currentAnchor.text ||
			anchorChildren
				.filter(
					(n) => Boolean(n.token) && (n.token as SakuraToken).type === "char",
				)
				.map((n) => String((n.token as SakuraToken).value ?? ""))
				.join("");
		const anchorNode: SakuraAstNode = {
			nodeType: "anchor",
			id: currentAnchor.id,
			text: derivedText,
			args: currentAnchor.args || [],
			children: anchorChildren,
		};
		if (currentScope !== null) {
			scopeChildren.push(anchorNode);
		} else {
			rootChildren.push(anchorNode);
		}
	}
	if (currentScope !== null) {
		rootChildren.push({
			nodeType: "scope",
			scope: currentScope,
			children: scopeChildren,
		});
	}

	return {
		nodeType: "root",
		children: rootChildren,
	};
}
