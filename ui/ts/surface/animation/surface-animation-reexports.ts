export function getSurfaceAnimationManagerExports() {
	return {};
}

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
} from "./animation/animation-options.js";
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
} from "./animation/animation-playback.js";
export {
	AnimationScheduler,
	createPlaceholderCanvas,
	FrameStepEvent,
} from "./animation/scheduler-events.js";
export {
	buildAnimationTimeline,
	parseInterval,
	resolvePatternWait,
} from "./animation-parser.js";
