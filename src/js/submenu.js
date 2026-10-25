/**
 * Nanai Android Mascot - 独立サブメニューウィンドウ制御
 */

let currentSubmenuType = "ghost";
let cachedGhosts = [];
let currentGhostName = null;
let cachedShells = [];
let currentShellName = null;

function dispatchSubmenuAction(action, payload = null) {
  if (globalThis.__TAURI__) {
    const emitFn = globalThis.__TAURI__.event?.emit || globalThis.__TAURI__.emit;
    const invokeFn = globalThis.__TAURI__.core?.invoke || globalThis.__TAURI__.invoke;
    if (typeof emitFn === "function") {
      emitFn("menu-action", { action, payload });
    }
    if (typeof invokeFn === "function") {
      invokeFn("hide_menu_window").catch(() => {});
      invokeFn("hide_submenu_window").catch(() => {});
    }
  }
}

function renderContent() {
  const container = document.getElementById("submenu-content");
  if (!container) return;
  container.innerHTML = "";

  if (currentSubmenuType === "ghost") {
    cachedGhosts.forEach((ghost) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `menu-item${ghost === currentGhostName ? " is-current" : ""}`;
      btn.innerHTML = `<span>${ghost === currentGhostName ? "✓ " : ""}${ghost}</span>`;
      btn.addEventListener("click", () => {
        dispatchSubmenuAction("switch-ghost", ghost);
      });
      container.appendChild(btn);
    });

    const sep = document.createElement("div");
    sep.className = "menu-separator";
    container.appendChild(sep);

    const manageBtn = document.createElement("button");
    manageBtn.type = "button";
    manageBtn.className = "menu-item";
    manageBtn.innerHTML = `<span>📂 ゴースト一覧・管理...</span>`;
    manageBtn.addEventListener("click", () => {
      dispatchSubmenuAction("ghost");
    });
    container.appendChild(manageBtn);
  } else if (currentSubmenuType === "shell") {
    (cachedShells.length > 0 ? cachedShells : ["master"]).forEach((shell) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `menu-item${shell === currentShellName ? " is-current" : ""}`;
      btn.innerHTML = `<span>${shell === currentShellName ? "✓ " : ""}${shell}</span>`;
      btn.addEventListener("click", () => {
        dispatchSubmenuAction("switch-shell", shell);
      });
      container.appendChild(btn);
    });
  } else if (currentSubmenuType === "scale") {
    const scales = [
      { label: "50%", val: 0.5 },
      { label: "75%", val: 0.75 },
      { label: "100% (標準)", val: 1.0 },
      { label: "125%", val: 1.25 },
      { label: "150%", val: 1.5 },
      { label: "200%", val: 2.0 },
    ];
    scales.forEach((s) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "menu-item";
      btn.innerHTML = `<span>${s.label}</span>`;
      btn.addEventListener("click", () => {
        dispatchSubmenuAction("scale", s.val);
      });
      container.appendChild(btn);
    });
  }
}

if (globalThis.__TAURI__) {
  const listenFn = globalThis.__TAURI__.event?.listen || globalThis.__TAURI__.listen;
  if (typeof listenFn === "function") {
    listenFn("set-submenu-type", (event) => {
      if (event.payload?.type) {
        currentSubmenuType = event.payload.type;
        renderContent();
      }
    });

    listenFn("sync-ghosts", (event) => {
      const data = event.payload;
      if (data) {
        cachedGhosts = data.ghosts || [];
        currentGhostName = data.currentGhost;
        cachedShells = data.shells || [];
        currentShellName = data.currentShell;
        renderContent();
      }
    });

    listenFn("sync-theme", (event) => {
      const theme = event.payload;
      if (theme) {
        document.documentElement.setAttribute("data-balloon-theme", theme);
        document.body.className = `balloon-theme-${theme}`;
      }
    });
  }
}

globalThis.addEventListener("DOMContentLoaded", () => {
  renderContent();
  if (globalThis.__TAURI__) {
    const emitFn = globalThis.__TAURI__.event?.emit || globalThis.__TAURI__.emit;
    if (typeof emitFn === "function") {
      emitFn("menu-action", { action: "request-sync" });
    }
  }
});
