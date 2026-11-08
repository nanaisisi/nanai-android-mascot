/**
 * surfaces.txt パーサー統合モジュール
 */

import {
	finalizeAnimations,
	handleAnimationCollision,
	handleAnimationCollisionEx,
	handleAnimationInterval,
	handleAnimationName,
	handleAnimationOption,
	handleAnimationPattern,
} from "./animation.js";
import { handleCollision, handleCollisionEx } from "./collision.js";
import { handleElement } from "./element.js";
import { handleBalloonOffset, handlePoint } from "./point.js";
import { handleScopeBlockLine, matchScopeBlockHeader } from "./scope-blocks.js";
import { expandSurfaceRange } from "./utils.js";

export { handleBalloonOffset, handlePoint } from "./point.js";
export { expandSurfaceRange } from "./utils.js";

/**
 * surfaces.txt をパースして collisions, elements, animations, points, balloonOffsets, collisionSort, animationSort, cursors, tooltips を抽出
 * @param {string} text
 * @returns {{ collisions: Record<string, import('../surface-parser.js').CollisionArea[]>, elements: Record<string, import('../surface-parser.js').SurfaceElement[]>, animations: Record<string, import('../surface-parser.js').SurfaceAnimation[]>, points: Record<string, any>, balloonOffsets: Record<string, Record<string, { x?: number, y?: number }>>, collisionSort: string, animationSort: string, cursors: Record<string, Array<{ event: string, collision: string, cursor: string }>>, tooltips: Record<string, Record<string, string>> }}
 */
export function parseSurfacesTxt(text) {
	const collisions = {};
	const elements = {};
	const animations = {};
	const animationMaps = {};
	const points = {};
	const balloonOffsets = {};
	const cursors = {};
	const tooltips = {};
	const names = {};
	const iconRects = {};
	let collisionSort = "none";
	let animationSort = "none";

	const lines = text.split(/\r?\n/);
	let currentSurfaces = ["default"];
	let currentScopeBlock = null; // { type: 'cursor'|'tooltip', scope: string }

	lines.forEach((line) => {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("//")) return;

		if (trimmed === "{") return;
		if (trimmed === "}") {
			currentScopeBlock = null;
			return;
		}

		// collision-sort / collision.sort / animation-sort / animation.sort
		const sortMatch = trimmed.match(
			/^(collision[.-]sort|animation[.-]sort),\s*(\S+)/i,
		);
		if (sortMatch) {
			const key = sortMatch[1].toLowerCase();
			const val = sortMatch[2].toLowerCase();
			if (key.startsWith("collision")) {
				collisionSort = val;
			} else {
				animationSort = val;
			}
			return;
		}

		// *.cursor / *.tooltips ブロック開始判定
		const scopeMatch = matchScopeBlockHeader(trimmed, cursors, tooltips);
		if (scopeMatch) {
			currentScopeBlock = scopeMatch;
			return;
		}

		// スコープブロック内の行処理
		if (currentScopeBlock) {
			handleScopeBlockLine(trimmed, currentScopeBlock, cursors, tooltips);
			return;
		}

		// surface[ID] または surface.append[ID] または sakura.surface[ID] / kero.surface[ID] / charN.surface[ID] ブロック開始
		const surfaceMatch = trimmed.match(
			/^(?:(?:sakura|kero|char\d+)\.)?surface(?:\.append)?(?:\[([^\]]+)\]|([0-9,\-!]+))(?:\s*\{.*)?$/i,
		);
		if (surfaceMatch) {
			currentScopeBlock = null;
			const rangeSpec = surfaceMatch[1] ?? surfaceMatch[2];
			currentSurfaces = expandSurfaceRange(rangeSpec);
			currentSurfaces.forEach((s) => {
				if (!collisions[s]) collisions[s] = [];
			});
			return;
		}

		// name,定義名
		const nameMatch = trimmed.match(/^name,\s*(.+)$/i);
		if (nameMatch) {
			const defName = nameMatch[1].trim();
			currentSurfaces.forEach((s) => {
				names[s] = defName;
			});
			return;
		}

		// icon.rect,x1,y1,x2,y2
		const iconRectMatch = trimmed.match(/^icon\.rect,\s*(.+)$/i);
		if (iconRectMatch) {
			const coords = iconRectMatch[1]
				.split(",")
				.map((n) => Number.parseInt(n.trim(), 10))
				.filter((n) => !Number.isNaN(n));
			if (coords.length >= 4) {
				const rect = [coords[0], coords[1], coords[2], coords[3]];
				currentSurfaces.forEach((s) => {
					iconRects[s] = rect;
				});
			}
			return;
		}

		// collisionex[ID],[name],[shape],[coords...] または collision[ID],[coords...],[name]
		if (trimmed.startsWith("collisionex")) {
			handleCollisionEx(trimmed, currentSurfaces, collisions);
		} else if (trimmed.startsWith("collision")) {
			handleCollision(trimmed, currentSurfaces, collisions);
		} else if (trimmed.startsWith("element")) {
			handleElement(trimmed, currentSurfaces, elements);
		} else if (
			trimmed.startsWith("point.") ||
			/^point\.[a-z0-9_.]+,/i.test(trimmed)
		) {
			handlePoint(trimmed, currentSurfaces, points);
		} else if (
			trimmed.startsWith("balloon.offset") ||
			/[a-z0-9_.]+\.balloon\.offset/i.test(trimmed)
		) {
			handleBalloonOffset(trimmed, currentSurfaces, balloonOffsets);
		} else if (/^(?:animation\d+\.|\d+)collisionex\d*,/i.test(trimmed)) {
			handleAnimationCollisionEx(
				trimmed,
				currentSurfaces,
				animations,
				animationMaps,
			);
		} else if (/^(?:animation\d+\.|\d+)collision\d*,/i.test(trimmed)) {
			handleAnimationCollision(
				trimmed,
				currentSurfaces,
				animations,
				animationMaps,
			);
		} else if (/^(?:animation\d+\.|\d+)interval,/.test(trimmed)) {
			handleAnimationInterval(
				trimmed,
				currentSurfaces,
				animations,
				animationMaps,
			);
		} else if (/^(?:animation\d+\.|\d+)name,/.test(trimmed)) {
			handleAnimationName(trimmed, currentSurfaces, animations, animationMaps);
		} else if (/^(?:animation\d+\.|\d+)option,/.test(trimmed)) {
			handleAnimationOption(
				trimmed,
				currentSurfaces,
				animations,
				animationMaps,
			);
		} else if (/^(?:animation\d+\.|\d+)pattern\d+,/.test(trimmed)) {
			handleAnimationPattern(
				trimmed,
				currentSurfaces,
				animations,
				animationMaps,
			);
		}
	});

	finalizeAnimations(animations);

	return {
		collisions,
		elements,
		animations,
		points,
		balloonOffsets,
		collisionSort,
		animationSort,
		cursors,
		tooltips,
		names,
		iconRects,
	};
}
