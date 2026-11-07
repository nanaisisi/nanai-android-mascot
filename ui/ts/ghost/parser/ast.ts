/**
 * @file ast.ts
 * @brief さくらスクリプト AST (Abstract Syntax Tree) 構築モジュール
 */

export interface SakuraAstNode {
	nodeType: "root" | "scope" | "anchor" | "choice" | "command";
	scope?: number;
	id?: string;
	text?: string;
	args?: string[];
	token?: any;
	children?: SakuraAstNode[];
}

export function tokensToAst(tokens: any[]): SakuraAstNode {
	const rootChildren: SakuraAstNode[] = [];
	let currentScope: number | null = null;
	let scopeChildren: SakuraAstNode[] = [];

	let currentAnchor: any = null;
	let anchorChildren: SakuraAstNode[] = [];

	let currentChoiceScope: any = null;
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

	for (const token of tokens) {
		if (token.type === "scope") {
			if (currentChoiceScope) {
				const choiceNode: SakuraAstNode = {
					nodeType: "choice",
					id: currentChoiceScope.id,
					text: choiceScopeChildren
						.filter((n) => n.token?.type === "char")
						.map((n) => n.token.value)
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
						.filter((n) => n.token?.type === "char")
						.map((n) => n.token.value)
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
				.filter((n) => n.token?.type === "char")
				.map((n) => n.token.value)
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
		const anchorNode: SakuraAstNode = {
			nodeType: "anchor",
			id: currentAnchor.id,
			text: currentAnchor.text,
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

export function traverseAst(
	node: SakuraAstNode,
	visitor: (node: SakuraAstNode) => void,
) {
	if (!node) return;
	visitor(node);
	if (Array.isArray(node.children)) {
		for (const child of node.children) {
			traverseAst(child, visitor);
		}
	}
}

export function getSakuraTokenLifetime(
	token: any,
): "Scope" | "Script" | "Permanent" {
	if (!token) return "Script";
	const type = token.type;

	if (type === "font") {
		return "Scope";
	}

	if (
		type === "surface" ||
		type === "bind" ||
		(type === "command" &&
			(token.command === "bind" ||
				token.command === "windowstate" ||
				token.command === "setwallpaper" ||
				token.command === "setproxy" ||
				token.command === "sethttptimeout"))
	) {
		return "Permanent";
	}

	return "Script";
}

export function collectAstTokens(ast: SakuraAstNode): any[] {
	const tokens: any[] = [];
	traverseAst(ast, (node) => {
		if (node.nodeType === "command" && node.token) {
			tokens.push(node.token);
		} else if (node.nodeType === "choice") {
			tokens.push({
				type: "choice",
				id: node.id,
				text: node.text,
				args: node.args,
			});
		} else if (node.nodeType === "scope") {
			tokens.push({
				type: "scope",
				value: node.scope,
			});
		}
	});
	return tokens;
}

export function collectAstTokensByLifetime(
	ast: SakuraAstNode,
	lifetime: "Scope" | "Script" | "Permanent",
): any[] {
	return collectAstTokens(ast).filter(
		(token) => getSakuraTokenLifetime(token) === lifetime,
	);
}

export function collectChoices(
	ast: SakuraAstNode,
): Array<{ id: string; text: string; args: string[] }> {
	const choices: Array<{ id: string; text: string; args: string[] }> = [];
	traverseAst(ast, (node) => {
		if (node.nodeType === "choice") {
			choices.push({
				id: node.id || "",
				text: node.text || "",
				args: node.args || [],
			});
		}
	});
	return choices;
}

export function collectSurfaces(ast: SakuraAstNode): number[] {
	const surfaces: number[] = [];
	traverseAst(ast, (node) => {
		if (node.nodeType === "command" && node.token?.type === "surface") {
			surfaces.push(node.token.value);
		}
	});
	return surfaces;
}
