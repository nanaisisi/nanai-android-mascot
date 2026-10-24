/**
 * Mascot Nanai - ドラッグ & タッチインタラクション管理
 */

export class InteractionManager {
  constructor(app) {
    this.app = app;
  }

  setupDragging(target, onGhostClick) {
    if (!target) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let hasMoved = false;

    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;

      isDragging = true;
      hasMoved = false;
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

      startX = clientX;
      startY = clientY;

      const rect = target.getBoundingClientRect();
      initialLeft = rect.left + rect.width / 2;
      initialTop = rect.top + rect.height / 2;

      target.classList.add("is-dragging");
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;

      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      if (Math.hypot(deltaX, deltaY) > 4) {
        hasMoved = true;
      }

      let newX = initialLeft + deltaX;
      let newY = initialTop + deltaY;

      const padding = 40;
      newX = Math.max(padding, Math.min(globalThis.innerWidth - padding, newX));
      newY = Math.max(padding, Math.min(globalThis.innerHeight - padding, newY));

      target.style.left = `${newX}px`;
      target.style.top = `${newY}px`;
      target.style.transform = "translate(-50%, -50%)";

      const balloon = document.getElementById("balloon-display");
      if (balloon) {
        balloon.style.left = `${newX}px`;
        balloon.style.top = `${Math.max(20, newY - 120)}px`;
      }
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      target.classList.remove("is-dragging");

      if (!hasMoved && onGhostClick) {
        const clientX = e.clientX ?? startX;
        const clientY = e.clientY ?? startY;
        const rect = target.getBoundingClientRect();
        onGhostClick(clientX, clientY, rect);
      }
    };

    target.addEventListener("mousedown", onPointerDown);
    globalThis.addEventListener("mousemove", onPointerMove);
    globalThis.addEventListener("mouseup", onPointerUp);

    target.addEventListener("touchstart", onPointerDown, { passive: true });
    globalThis.addEventListener("touchmove", onPointerMove, { passive: true });
    globalThis.addEventListener("touchend", onPointerUp);
  }
}
