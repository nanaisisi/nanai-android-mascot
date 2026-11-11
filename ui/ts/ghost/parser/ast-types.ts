export interface SakuraToken {
	type: string;
	command?: string;
	id?: string;
	text?: string;
	value?: unknown;
	args?: string[];
	[key: string]: unknown;
}

export interface SakuraChoiceScope {
	id: string;
	args: string[];
}

export interface SakuraAnchorScope {
	id: string;
	text?: string;
	args: string[];
}

export interface SakuraAstNode {
	nodeType: "root" | "scope" | "anchor" | "choice" | "command";
	type?: string;
	scope?: number;
	id?: string;
	text?: string;
	args?: string[];
	value?: number | string | unknown;
	animId?: number | string;
	wait?: boolean;
	path?: string;
	mode?: string;
	x?: number | string;
	y?: number | string;
	timeout?: number;
	count?: number;
	tag?: string;
	param?: string;
	half?: boolean;
	noClear?: boolean;
	scopes?: number[];
	token?: SakuraToken | unknown;
	children?: SakuraAstNode[];
	[key: string]: unknown;
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
