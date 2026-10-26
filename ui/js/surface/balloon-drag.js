/**
 * バルーンのドラッグ移動およびキャラクター追従・オフセット永続化管理
 */
export class BalloonDragManager {
  /**
   * @param {import('./interaction.js').InteractionManager} interaction
   */
  constructor(interaction) {
    this.interaction = interaction;
    this.balloonOffsetX = undefined;
    this.balloonOffsetY = undefined;

    this.restoreOffset();
  }

  restoreOffset() {
    try {
      const savedOffset = localStorage.getItem("nanai_balloon_offset");
      if (savedOffset) {
        const parsed = JSON.parse(savedOffset);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          this.balloonOffsetX = parsed.x;
          this.balloonOffsetY = parsed.y;
        }
      }
    } catch (_) {
      // LocalStorage access restricted or unavailable
    }
  }

  updateFollowPosition(newX, newY) {
    const balloon = document.getElementById("balloon-display");
    if (!balloon) return;

    const offsetX = this.balloonOffsetX !== undefined ? this.balloonOffsetX : 0;
    const offsetY = this.balloonOffsetY !== undefined ? this.balloonOffsetY : -120;
    balloon.style.left = `${newX + offsetX}px`;
    balloon.style.top = `${Math.max(20, newY + offsetY)}px`;
  }

  setupBalloonDragging(ghostTarget) {
    const balloon = document.getElementById("balloon-display");
    if (!balloon) return;

    let isBalloonDragging = false;
    let bStartX = 0;
    let bStartY = 0;
    let bInitialLeft = 0;
    let bInitialTop = 0;

    const onStart = (clientX, clientY, targetEl) => {
      if (targetEl && (targetEl.tagName === "A" || targetEl.tagName === "BUTTON")) return false;
      isBalloonDragging = true;
      bStartX = clientX;
      bStartY = clientY;

      const rect = balloon.getBoundingClientRect();
      bInitialLeft = rect.left + rect.width / 2;
      bInitialTop = rect.top + rect.height / 2;

      balloon.style.cursor = "grabbing";
      return true;
    };

    const onMove = (clientX, clientY) => {
      if (!isBalloonDragging) return;

      const deltaX = clientX - bStartX;
      const deltaY = clientY - bStartY;

      const newLeft = bInitialLeft + deltaX;
      const newTop = bInitialTop + deltaY;

      balloon.style.left = `${newLeft}px`;
      balloon.style.top = `${newTop}px`;

      // キャラクターの中心位置に対する相対オフセットを記録
      const ghostRect = ghostTarget.getBoundingClientRect();
      const ghostCenterX = ghostRect.left + ghostRect.width / 2;
      const ghostCenterY = ghostRect.top + ghostRect.height / 2;

      this.balloonOffsetX = newLeft - ghostCenterX;
      this.balloonOffsetY = newTop - ghostCenterY;
      this.interaction.balloonOffsetX = this.balloonOffsetX;
      this.interaction.balloonOffsetY = this.balloonOffsetY;
    };

    const onEnd = () => {
      if (isBalloonDragging) {
        isBalloonDragging = false;
        balloon.style.cursor = "";
        // 相対オフセットを保存
        if (this.balloonOffsetX !== undefined && this.balloonOffsetY !== undefined) {
          try {
            localStorage.setItem(
              "nanai_balloon_offset",
              JSON.stringify({ x: this.balloonOffsetX, y: this.balloonOffsetY })
            );
          } catch (_) {
            // LocalStorage access restricted or unavailable
          }
        }
      }
    };

    balloon.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      if (onStart(e.clientX, e.clientY, e.target)) {
        e.stopPropagation();
      }
    });

    globalThis.addEventListener("mousemove", (e) => {
      onMove(e.clientX, e.clientY);
    });

    globalThis.addEventListener("mouseup", onEnd);

    balloon.addEventListener(
      "touchstart",
      (e) => {
        const touch = e.touches[0];
        if (touch && onStart(touch.clientX, touch.clientY, e.target)) {
          e.stopPropagation();
        }
      },
      { passive: true }
    );

    globalThis.addEventListener(
      "touchmove",
      (e) => {
        const touch = e.touches[0];
        if (touch) onMove(touch.clientX, touch.clientY);
      },
      { passive: true }
    );

    globalThis.addEventListener("touchend", onEnd);
  }
}
