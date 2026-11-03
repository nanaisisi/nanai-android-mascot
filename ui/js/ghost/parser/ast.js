/**
 * @file ast.js
 * @brief さくらスクリプト AST (Abstract Syntax Tree) 構築モジュール
 */

/**
 * @typedef {Object} SakuraAstNode
 * @property {string} nodeType - ノード種別 ('root' | 'scope' | 'anchor' | 'choice' | 'command')
 * @property {number} [scope] - スコープ番号 (\0, \1, \p[n])
 * @property {string} [id] - アンカーや選択肢ID
 * @property {string} [text] - テキスト
 * @property {string[]} [args] - 引数リスト
 * @property {any} [token] - コマンドトークン本体
 * @property {SakuraAstNode[]} [children] - 子ノード配列
 */

/**
 * トークン列から階層的な AST ツリーを構築する
 * @param {import('../sakura-parser.js').SakuraScriptToken[]} tokens
 * @returns {SakuraAstNode}
 */
export function tokensToAst(tokens) {
	/** @type {SakuraAstNode[]} */
	const rootChildren = [];
	let currentScope = null;
	/** @type {SakuraAstNode[]} */
	let scopeChildren = [];

	let currentAnchor = null;
	/** @type {SakuraAstNode[]} */
	let anchorChildren = [];

	const pushToCurrentContainer = (node) => {
		if (currentAnchor) {
			anchorChildren.push(node);
		} else if (currentScope !== null) {
			scopeChildren.push(node);
		} else {
			rootChildren.push(node);
		}
	};

	for (const token of tokens) {
		if (token.type === "scope") {
			// スコープの切り替え
			if (currentAnchor) {
				const anchorNode = {
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
		} else if (token.type === "anchor_begin") {
			currentAnchor = {
				id: token.id || "",
				text: token.text || "",
				args: token.args || [],
			};
			anchorChildren = [];
		} else if (token.type === "anchor_end") {
			if (currentAnchor) {
				const anchorNode = {
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

	if (currentAnchor) {
		const anchorNode = {
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

/**
 * AST ツリーを深さ優先探索で走査する
 * @param {SakuraAstNode} node
 * @param {(node: SakuraAstNode) => void} visitor
 */
export function traverseAst(node, visitor) {
	if (!node) return;
	visitor(node);
	if (Array.isArray(node.children)) {
		for (const child of node.children) {
			traverseAst(child, visitor);
		}
	}
}

/**
 * トークンの寿命分類を判定する (notes_lifespan.md に準拠)
 * @param {any} token
 * @returns {'Scope' | 'Script' | 'Permanent'}
 */
export function getSakuraTokenLifetime(token) {
	if (!token) return "Script";
	const type = token.type;

	// スコープ固有のフォントや修飾
	if (type === "font") {
		return "Scope";
	}

	// 永続設定（サーフィス、壁紙、プロキシ、バインド、ウィンドウ状態等）
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

	// スクリプト単位で維持され、\e でリセットされる状態
	return "Script";
}

/**
 * AST ツリー内のすべてのトークン／コマンドを抽出する
 * @param {SakuraAstNode} ast
 * @returns {any[]}
 */
export function collectAstTokens(ast) {
	const tokens = [];
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

/**
 * 寿命区分 ('Scope' | 'Script' | 'Permanent') でトークンをフィルタリング抽出する
 * @param {SakuraAstNode} ast
 * @param {'Scope' | 'Script' | 'Permanent'} lifetime
 * @returns {any[]}
 */
export function collectAstTokensByLifetime(ast, lifetime) {
	return collectAstTokens(ast).filter(
		(token) => getSakuraTokenLifetime(token) === lifetime,
	);
}
