/**
 * @file types.ts
 * @brief VirtualWindow and InternalWindowManager type definitions
 */

export interface VirtualWindowOptions {
	scopeId: number | string;
	title?: string;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	minWidth?: number;
	minHeight?: number;
	className?: string;
	resizable?: boolean;
	closable?: boolean;
	minimizable?: boolean;
	maximizable?: boolean;
	pinnable?: boolean;
	titleBar?: boolean;
}

export type VirtualWindowResizeDirection =
	| "n"
	| "s"
	| "e"
	| "w"
	| "ne"
	| "nw"
	| "se"
	| "sw";

export interface WindowGeometry {
	x: number;
	y: number;
	width: number;
	height: number;
}
