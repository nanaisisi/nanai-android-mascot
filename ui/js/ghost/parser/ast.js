/**
 * @file ast.js
 * @brief さくらスクリプト AST (Abstract Syntax Tree) 構築モジュール
 */

/**
 * @typedef {Object} SakuraAstNode
 * @property {string} nodeType - ノード種別 ('root' | 'scope' | 'anchor' | 'command')
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
