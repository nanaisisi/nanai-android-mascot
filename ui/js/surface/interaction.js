import { BalloonDragManager } from "./balloon-drag.js";

/**
 * Nanai Android Mascot - ドラッグ & タッチインタラクション管理
 * ドラッグ移動、スナップ退避、および部位撫で（Stroke）判定
 */
export class InteractionManager {
	/**
	 * @param {import('../../main.js').NanaiAndroidMascotApp} app
	 */
	constructor(app) {
		/** @type {import('../../main.js').NanaiAndroidMascotApp} */
		this.app = app;
		this.balloonDragManager = new BalloonDragManager(this);
	}

	get balloonOffsetX() {
		return this.balloonDragManager.balloonOffsetX;
	}

	set balloonOffsetX(val) {
		this.balloonDragManager.balloonOffsetX = val;
	}

	get balloonOffsetY() {
		return this.balloonDragManager.balloonOffsetY;
	}

	set balloonOffsetY(val) {
		this.balloonDragManager.balloonOffsetY = val;
	}

	setupDragging(target, onGhostClick, onGhostStroke) {
		if (!target) return;

		let isInteracting = false;
		let isDragging = false;
		let startX = 0;
		let startY = 0;
		let lastX = 0;
		let lastY = 0;
		let initialLeft = 0;
		let initialTop = 0;
		let hasMoved = false;
		let rafPending = false;

		// 長押し（Long Press）によるモバイルメニュー表示
		let longPressTimer = null;
		let longPressTriggered = false;
		const LONG_PRESS_DELAY = 600; // 600ms 長押しでメニュー表示

		// 撫で判定用
		let strokeDistance = 0;
		let strokeTriggered = false;
		const STROKE_THRESHOLD = 50; // 撫でと認識する移動積算距離(px)

		const onPointerDown = (e) => {
			if (e.button !== undefined && e.button !== 0) return;

			// ブラウザデフォルトの画像ドラッグやテキスト選択を防止
			if (e.cancelable) {
				e.preventDefault();
			}

			isInteracting = true;
			isDragging = false;
			hasMoved = false;
			strokeDistance = 0;
			strokeTriggered = false;
			longPressTriggered = false;

			const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
			const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

			startX = clientX;
			startY = clientY;
			lastX = clientX;
			lastY = clientY;

			const rect = target.getBoundingClientRect();
			initialLeft = rect.left + rect.width / 2;
			initialTop = rect.top + rect.height / 2;

			// 長押しタイマー開始
			if (longPressTimer) clearTimeout(longPressTimer);
			longPressTimer = setTimeout(() => {
				if (isInteracting && !hasMoved && !strokeTriggered) {
					longPressTriggered = true;
					this.app?.toggleMenu();
				}
			}, LONG_PRESS_DELAY);
		};

		const onPointerMove = (e) => {
			if (!isInteracting) return;

			const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
			const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

			const deltaX = clientX - startX;
			const deltaY = clientY - startY;
			const stepDist = Math.hypot(clientX - lastX, clientY - lastY);
			lastX = clientX;
			lastY = clientY;

			// 初期の遊び（微小な手振れ）を超えたら動作判定開始
			if (!hasMoved && Math.hypot(deltaX, deltaY) > 5) {
				hasMoved = true;
				if (longPressTimer) {
					clearTimeout(longPressTimer);
					longPressTimer = null;
				}
			}

			// ドッキング中でない場合、ドラッグ移動または撫で判定
			const isDocked =
				target.classList.contains("is-docked-left") ||
				target.classList.contains("is-docked-right");

			if (!isDocked && !isDragging) {
				// 当たり部位内での往復運動か、一方向への大きなドラッグかを判別
				strokeDistance += stepDist;
				if (strokeDistance >= STROKE_THRESHOLD && !strokeTriggered) {
					strokeTriggered = true;
					if (onGhostStroke) {
						const rect = target.getBoundingClientRect();
						onGhostStroke(clientX, clientY, rect);
					}
				}
			}

			// 撫でが発動していなければ通常のドラッグ移動を行う
			if (!strokeTriggered && hasMoved) {
				isDragging = true;
				target.classList.add("is-dragging");

				// デスクトップ環境（Windows等）の場合はネイティブウィンドウ自体を移動
				const isDesktop =
					globalThis.__TAURI__ && !navigator.userAgent.includes("Android");
				if (isDesktop) {
					const tauriWindow =
						globalThis.__TAURI__.window?.getCurrentWindow?.() ||
						globalThis.__TAURI__.getCurrentWindow?.();
					if (tauriWindow && typeof tauriWindow.startDragging === "function") {
						try {
							tauriWindow.startDragging();
							isInteracting = false;
							isDragging = false;
							return;
						} catch (err) {
							console.warn("startDragging failed:", err);
						}
					}
				}

				let newX = initialLeft + deltaX;
				let newY = initialTop + deltaY;

				const padding = 40;
				newX = Math.max(
					padding,
					Math.min(globalThis.innerWidth - padding, newX),
				);
				newY = Math.max(
					padding,
					Math.min(globalThis.innerHeight - padding, newY),
				);

				if (!rafPending) {
					rafPending = true;
					requestAnimationFrame(() => {
						rafPending = false;
						if (!isInteracting && !isDragging) return;
						target.style.left = `${newX}px`;
						target.style.top = `${newY}px`;
						target.style.transform = "translate(-50%, -50%)";

						// バルーンが存在する場合、設定された相対オフセットを維持してキャラクターに追従
						this.balloonDragManager.updateFollowPosition(newX, newY);
					});
				}
			}
		};

		const onPointerUp = (e) => {
			if (!isInteracting) return;
			isInteracting = false;
			rafPending = false;
			target.classList.remove("is-dragging");

			if (longPressTimer) {
				clearTimeout(longPressTimer);
				longPressTimer = null;
			}

			// 長押し発火後や撫で判定が発火していた場合はタップやドラッグ確定を行わない
			if (longPressTriggered || strokeTriggered) {
				return;
			}

			if (isDragging) {
				// 画面端スナップ（ドッキング退避判定: 画面幅の 12% 以内）
				const rect = target.getBoundingClientRect();
				const currentCenterX = rect.left + rect.width / 2;
				const screenWidth = globalThis.innerWidth;

				target.classList.remove("is-docked-left", "is-docked-right");
				if (currentCenterX < screenWidth * 0.12) {
					target.classList.add("is-docked-left");
				} else if (currentCenterX > screenWidth * 0.88) {
					target.classList.add("is-docked-right");
				}
			} else {
				// ドッキング中のタップで復帰
				if (
					target.classList.contains("is-docked-left") ||
					target.classList.contains("is-docked-right")
				) {
					const wasLeft = target.classList.contains("is-docked-left");
					target.classList.remove("is-docked-left", "is-docked-right");
					target.style.left = wasLeft
						? "120px"
						: `${globalThis.innerWidth - 120}px`;
					return;
				}

				// 通常タップ（Click）判定
				if (onGhostClick) {
					const clientX = e.clientX ?? startX;
					const clientY = e.clientY ?? startY;
					const rect = target.getBoundingClientRect();
					onGhostClick(clientX, clientY, rect);
				}
			}
		};

		target.addEventListener("mousedown", onPointerDown);
		globalThis.addEventListener("mousemove", onPointerMove);
		globalThis.addEventListener("mouseup", onPointerUp);

		target.addEventListener("touchstart", onPointerDown, { passive: true });
		globalThis.addEventListener("touchmove", onPointerMove, { passive: true });
		globalThis.addEventListener("touchend", onPointerUp);

		// バルーン自体のドラッグによる相対位置調整を設定
		this.setupBalloonDragging(target);
	}

	/**
	 * バルーンをドラッグしてキャラクターに対する相対位置（可変）を変更する
	 */
	setupBalloonDragging(ghostTarget) {
		this.balloonDragManager.setupBalloonDragging(ghostTarget);
	}
}
