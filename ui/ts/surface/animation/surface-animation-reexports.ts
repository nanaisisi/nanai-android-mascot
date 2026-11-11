/**
 * @file surface-animation-reexports.ts
 * @brief SERIKO animation exports re-mapping
 */

export function getSurfaceAnimationManagerExports() {
	return {};
}

export {
	buildAnimationTimeline,
	parseInterval,
	resolvePatternWait,
} from "../animation-parser.js";
export {
	clearPausedAnimations,
	findAnimation,
	getActiveAnimationCount,
	getActiveAnimations,
	getActiveCollisions,
	getAnimationOffset,
	isAnimationPaused,
	isAnimationRunning,
	isBlockedByExclusive,
	parseAnimationOptions,
	pauseAnimation,
	resumeAnimation,
	setAnimationOffset,
	stopAnimation,
} from "./animation-options.js";
export {
	_applyAnimationFrame,
	_playAnimationPatterns,
	_playOnePat,
	_playTimelineFrames,
	onCharSpoken,
	onScriptEnd,
	onTalkEnd,
	onTalkStart,
	playAnimationById,
	playAnimationPatterns,
	renderAnimationFrame,
	waitForAnimation,
} from "./animation-playback.js";
export {
	AnimationScheduler,
	createPlaceholderCanvas,
	FrameStepEvent,
} from "./scheduler-events.js";
