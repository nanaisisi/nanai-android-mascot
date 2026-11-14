/**
 * SurfaceManager compatibility stub
 */
export class SurfaceManager {
	load() {}
	render() {}
	detectCollision() {
		return { name: "", canvasX: 0, canvasY: 0 };
	}
}
export const surfaceCollisionMethods = {
	detectCollision: () => ({ name: "", canvasX: 0, canvasY: 0 }),
};
