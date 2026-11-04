/**
 * surfaces.txt パーサーモジュール
 */

export {
	expandSurfaceRange,
	handleBalloonOffset,
	handlePoint,
	parseSurfacesTxt,
} from "./parser/index.js";

/**
 * @typedef {Object} CollisionArea
 * @property {number} [id]
 * @property {string} name
 * @property {string} shape
 * @property {number} [x1]
 * @property {number} [y1]
 * @property {number} [x2]
 * @property {number} [y2]
 * @property {number} [cx]
 * @property {number} [cy]
 * @property {number} [rx]
 * @property {number} [ry]
 * @property {number} minX
 * @property {number} minY
 * @property {number} maxX
 * @property {number} maxY
 */

/**
 * @typedef {Object} SurfaceElement
 * @property {string} type
 * @property {string} file
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} AnimationPattern
 * @property {string|number} surface
 * @property {number} wait
 * @property {string} type
 * @property {number} x
 * @property {number} y
 * @property {string} [targetParam]
 */

/**
 * @typedef {Object} SurfaceAnimation
 * @property {number} id
 * @property {string} interval
 * @property {string} [name]
 * @property {string[]} [options]
 * @property {AnimationPattern[]} patterns
 */
