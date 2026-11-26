/**
 * @file collision.ts
 * @brief Collision detection and part detection helpers for mouse events
 */

import { resolveContainedImageRect } from "../../../surface/interaction/transparency.js";

interface CollisionRectLike {
	left?: number;
	top?: number;
	width?: number;
	height?: number;
	naturalWidth?: number;
	naturalHeight?: number;
}

interface CollisionDomElement {
	querySelector?: (selector: string) => unknown;
	getBoundingClientRect?: () => Partial<CollisionRectLike> | null;
	naturalWidth?: number;
	naturalHeight?: number;
}

interface CollisionSurfaceManager {
	detectCollision?: (
		clickX: number,
		clickY: number,
		targetRect: unknown,
		surfaceId?: number | string | null,
		scopeId?: number,
	) => { name?: string; canvasX: number; canvasY: number; id?: number };
}

function getScopeElementId(scopeId: number): string {
	if (scopeId === 0) return "ghost-display";
	if (scopeId === 1) return "kero-display";
	return `char-display-${scopeId}`;
}

function hasPositiveSize(
	rect: Partial<CollisionRectLike> | null | undefined,
): rect is CollisionRectLike & { width: number; height: number } {
	return Boolean(
		rect &&
			typeof rect.width === "number" &&
			rect.width > 0 &&
			typeof rect.height === "number" &&
			rect.height > 0,
	);
}

function resolveDomFallbackRect(scopeId: number): CollisionRectLike | null {
	if (
		typeof document === "undefined" ||
		typeof document.getElementById !== "function"
	) {
		return null;
	}
	const container = document.getElementById(
		getScopeElementId(scopeId),
	) as CollisionDomElement | null;
	if (!container) return null;

	const img =
		typeof container.querySelector === "function"
			? (container.querySelector("img") as CollisionDomElement | null)
			: null;

	const rawNaturalW = img?.naturalWidth ?? container.naturalWidth;
	const rawNaturalH = img?.naturalHeight ?? container.naturalHeight;
	const naturalWidth =
		typeof rawNaturalW === "number" && rawNaturalW > 0
			? rawNaturalW
			: undefined;
	const naturalHeight =
		typeof rawNaturalH === "number" && rawNaturalH > 0
			? rawNaturalH
			: undefined;

	const imgRect =
		img && typeof img.getBoundingClientRect === "function"
			? img.getBoundingClientRect()
			: null;
	const baseRect = hasPositiveSize(imgRect)
		? imgRect
		: typeof container.getBoundingClientRect === "function"
			? container.getBoundingClientRect()
			: null;

	if (!hasPositiveSize(baseRect)) return null;

	const resolvedRect =
		naturalWidth !== undefined && naturalHeight !== undefined
			? resolveContainedImageRect(
					{
						left: baseRect.left ?? 0,
						top: baseRect.top ?? 0,
						width: baseRect.width,
						height: baseRect.height,
					},
					naturalWidth,
					naturalHeight,
				)
			: {
					left: baseRect.left ?? 0,
					top: baseRect.top ?? 0,
					width: baseRect.width,
					height: baseRect.height,
				};

	return {
		left: resolvedRect.left,
		top: resolvedRect.top,
		width: resolvedRect.width,
		height: resolvedRect.height,
		...(naturalWidth !== undefined ? { naturalWidth } : {}),
		...(naturalHeight !== undefined ? { naturalHeight } : {}),
	};
}

export function getCollisionInfo(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	scopeId: number = 0,
) {
	const app = this as {
		surfaceManager?: CollisionSurfaceManager;
	} | null;
	if (
		clientX === undefined ||
		clientY === undefined ||
		!app?.surfaceManager?.detectCollision
	) {
		return { name: "", canvasX: 0, canvasY: 0 };
	}

	const inputRect = rect as Partial<CollisionRectLike> | null | undefined;
	const resolvedDomRect = resolveDomFallbackRect(scopeId);
	const targetRect = hasPositiveSize(inputRect)
		? inputRect
		: hasPositiveSize(resolvedDomRect)
			? resolvedDomRect
			: { left: 0, top: 0, width: 200, height: 400 };

	return app.surfaceManager.detectCollision(
		clientX,
		clientY,
		targetRect,
		null,
		scopeId,
	);
}

export function detectPart(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	scopeId: number = 0,
) {
	return (
		this as unknown as {
			getCollisionInfo: (
				clientX?: number,
				clientY?: number,
				rect?: unknown,
				scopeId?: number,
			) => { name?: string };
		}
	).getCollisionInfo(clientX, clientY, rect, scopeId).name;
}
