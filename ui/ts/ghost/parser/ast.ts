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
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	token?: any;
	children?: SakuraAstNode[];
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function tokensToAst(tokens: any[]): SakuraAstNode {
	const rootChildren: SakuraAstNode[] = [];
	let currentScope: number | null = null;
	let scopeChildren: SakuraAstNode[] = [];

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	let currentAnchor: any = null;
	let anchorChildren: SakuraAstNode[] = [];

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
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
				const derivedText =
					currentAnchor.text ||
					anchorChildren
						.filter((n) => n.token?.type === "char")
						.map((n) => n.token.value)
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
		const derivedText =
			currentAnchor.text ||
			anchorChildren
				.filter((n) => n.token?.type === "char")
				.map((n) => n.token.value)
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
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
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

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function collectAstTokens(ast: SakuraAstNode): any[] {
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
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
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
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

export function collectAnchors(
	ast: SakuraAstNode,
): Array<{ id: string; text: string; args: string[] }> {
	const anchors: Array<{ id: string; text: string; args: string[] }> = [];
	traverseAst(ast, (node) => {
		if (node.nodeType === "anchor") {
			anchors.push({
				id: node.id || "",
				text: node.text || "",
				args: node.args || [],
			});
		}
	});
	return anchors;
}

export function calculateAstTextLength(ast: SakuraAstNode): number {
	let length = 0;
	traverseAst(ast, (node) => {
		if (node.nodeType === "command" && node.token?.type === "char") {
			length += 1;
		} else if (
			node.nodeType === "choice" &&
			(!node.children || node.children.length === 0) &&
			node.text
		) {
			length += Array.from(node.text).length;
		}
	});
	return length;
}

export function collectScopeNodes(
	ast: SakuraAstNode,
	targetScope: number,
): SakuraAstNode[] {
	const nodes: SakuraAstNode[] = [];
	if (ast.nodeType === "root" && Array.isArray(ast.children)) {
		for (const child of ast.children) {
			if (child.nodeType === "scope" && child.scope === targetScope) {
				if (Array.isArray(child.children)) {
					nodes.push(...child.children);
				}
			}
		}
	} else if (ast.nodeType === "scope" && ast.scope === targetScope) {
		if (Array.isArray(ast.children)) {
			nodes.push(...ast.children);
		}
	}
	return nodes;
}

/**
 * AST 内のすべてのアニメーション呼出 (id, wait) を抽出する
 */
export function collectAnimations(
	ast: SakuraAstNode,
): Array<{ id: number | string; wait: boolean }> {
	const animations: Array<{ id: number | string; wait: boolean }> = [];
	traverseAst(ast, (node) => {
		if (node.nodeType === "command" && node.token?.type === "animation") {
			animations.push({
				id: node.token.animId ?? 0,
				wait: node.token.wait === true,
			});
		}
	});
	return animations;
}

/**
 * 指定したスコープ（\0, \1, \p[N]）配下のノードのみを抽出した新しい AST を生成する
 */
export function filterAstByScope(
	ast: SakuraAstNode,
	targetScope: number,
): SakuraAstNode {
	if (ast.nodeType === "root" && Array.isArray(ast.children)) {
		const filteredChildren = ast.children
			.filter(
				(child) => child.nodeType === "scope" && child.scope === targetScope,
			)
			.map((child) => ({
				...child,
				children: child.children ? [...child.children] : [],
			}));
		return {
			nodeType: "root",
			children: filteredChildren,
		};
	}
	if (ast.nodeType === "scope" && ast.scope === targetScope) {
		return {
			...ast,
			children: ast.children ? [...ast.children] : [],
		};
	}
	return {
		nodeType: "root",
		children: [],
	};
}

/**
 * ログ保存や早送り再生用にウェイト（\w, \_w）トークンを除去した AST を再帰生成する
 */
export function stripWaitsFromAst(ast: SakuraAstNode): SakuraAstNode {
	if (
		ast.nodeType === "command" &&
		(ast.token?.type === "wait" ||
			ast.token?.type === "wait_audio" ||
			ast.token?.type === "wait_anim")
	) {
		return {
			nodeType: "root",
			children: [],
		};
	}

	if (!ast.children || ast.children.length === 0) {
		return { ...ast };
	}

	const newChildren = ast.children
		.map((child) => stripWaitsFromAst(child))
		.filter(
			(child) =>
				!(
					child.nodeType === "root" &&
					(!child.children || child.children.length === 0)
				),
		);

	return {
		...ast,
		children: newChildren,
	};
}
