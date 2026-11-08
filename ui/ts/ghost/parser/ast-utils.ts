import type { SakuraAstNode } from "./ast-types.js";
import { traverseAst } from "./ast-types.js";

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

export function collectAstTokens(ast: SakuraAstNode): unknown[] {
	const tokens: unknown[] = [];
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
): unknown[] {
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
		if (
			node.nodeType === "command" &&
			(node.token as any)?.type === "surface"
		) {
			surfaces.push((node.token as any).value);
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
		if (node.nodeType === "command" && (node.token as any)?.type === "char") {
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
		if (
			node.nodeType === "command" &&
			(node.token as any)?.type === "animation"
		) {
			animations.push({
				id: (node.token as any).animId ?? 0,
				wait: (node.token as any).wait === true,
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
		((ast.token as any)?.type === "wait" ||
			(ast.token as any)?.type === "wait_audio" ||
			(ast.token as any)?.type === "wait_anim")
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

/**
 * AST 内の各コマンドトークンに対して変換関数を適用し、新しい AST を生成する
 */
export function mapAstCommands(
	ast: SakuraAstNode,
	transform: (token: any) => any,
): SakuraAstNode {
	if (ast.nodeType === "command") {
		return {
			...ast,
			token: transform(ast.token),
		};
	}

	if (!ast.children || ast.children.length === 0) {
		return { ...ast };
	}

	return {
		...ast,
		children: ast.children.map((child) => mapAstCommands(child, transform)),
	};
}

/**
 * AST 内の表示用プレーンテキストを連結して抽出する（ログ保存・スクリーンリーダー・TTS用）
 */
export function extractAstText(ast: SakuraAstNode): string {
	let text = "";
	traverseAst(ast, (node) => {
		if (node.nodeType === "command" && (node.token as any)?.type === "char") {
			text += (node.token as any).value ?? "";
		} else if (
			node.nodeType === "choice" &&
			(!node.children || node.children.length === 0) &&
			node.text
		) {
			text += node.text;
		}
	});
	return text;
}

/**
 * AST の構造診断情報（総ノード数、最大深さ、スコープ別ノード数など）を返す
 */
export interface AstDiagnostics {
	nodeCount: number;
	maxDepth: number;
	scopeCounts: Record<number, number>;
	commandCount: number;
	choiceCount: number;
	anchorCount: number;
}

export function getAstDiagnostics(ast: SakuraAstNode): AstDiagnostics {
	let nodeCount = 0;
	let commandCount = 0;
	let choiceCount = 0;
	let anchorCount = 0;
	const scopeCounts: Record<number, number> = {};

	const computeDepth = (node: SakuraAstNode): number => {
		nodeCount += 1;
		if (node.nodeType === "command") {
			commandCount += 1;
		} else if (node.nodeType === "choice") {
			choiceCount += 1;
		} else if (node.nodeType === "anchor") {
			anchorCount += 1;
		} else if (node.nodeType === "scope" && typeof node.scope === "number") {
			scopeCounts[node.scope] = (scopeCounts[node.scope] || 0) + 1;
		}

		if (!node.children || node.children.length === 0) {
			return 1;
		}
		return 1 + Math.max(...node.children.map(computeDepth));
	};

	const maxDepth = computeDepth(ast);

	return {
		nodeCount,
		maxDepth,
		scopeCounts,
		commandCount,
		choiceCount,
		anchorCount,
	};
}
