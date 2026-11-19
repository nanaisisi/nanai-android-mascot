import type { balloonDescriptActions as BalloonDescriptActions } from "../../../ui/ts/core/actions/balloon-descript.js";

export function testNullCheck(
	balloonDescriptActions: typeof BalloonDescriptActions,
) {
	// applyBalloonDescript null check
	balloonDescriptActions.applyBalloonDescript(
		null as unknown as Record<string, string>,
	);
}
