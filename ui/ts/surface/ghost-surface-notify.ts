// @ts-nocheck
export async function notifySurfaceChangeEvents(
	thisObj: any,
	scopeId: number,
	surfaceId: number | string,
	img: any,
	isAnimationFrame: boolean,
) {
	if (!isAnimationFrame && surfaceId !== -1 && surfaceId !== "-1") {
		try {
			const surf0 =
				thisObj.app?.surfaceManager?.currentSurfaceIdFor?.(0) ??
				(scopeId === 0 ? surfaceId : 0);
			const surf1 =
				thisObj.app?.surfaceManager?.currentSurfaceIdFor?.(1) ??
				(scopeId === 1 ? surfaceId : 10);
			const width = img?.naturalWidth || img?.clientWidth || 0;
			const height = img?.naturalHeight || img?.clientHeight || 0;

			if (thisObj.notifySurfaceChange) {
				await thisObj.notifySurfaceChange(scopeId, surf0, surf1, width, height);
			}

			if (
				thisObj.otherSurfaceChangeEnabled &&
				thisObj.notifyOtherSurfaceChange
			) {
				const ghostName = thisObj.ghostManifest?.name || "master";
				const sakuraName = thisObj.ghostManifest?.sakura?.name || ghostName;
				const prevSurf = thisObj._prevSurfaceIds?.[scopeId] ?? surfaceId;
				const rectStr = `0,0,${width},${height}`;
				await thisObj.notifyOtherSurfaceChange(
					ghostName,
					sakuraName,
					scopeId,
					surfaceId,
					prevSurf,
					rectStr,
				);
			}

			thisObj._prevSurfaceIds ??= {};
			thisObj._prevSurfaceIds[scopeId] = surfaceId;
		} catch (_err) {}
	}
}
