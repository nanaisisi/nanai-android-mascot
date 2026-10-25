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
    const installBtn = document.createElement("button");
    installBtn.type = "button";
    installBtn.className = "menu-item";
    installBtn.innerHTML = `<span>📥 ゴーストの取り込み...</span>`;
    installBtn.addEventListener("click", () => {
      dispatchSubmenuAction("install");
    });
    container.appendChild(installBtn);
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
  } else if (currentSubmenuType === "balloon") {
    const themes = [
      { id: "emily4", label: "クラシック (Emily)" },
      { id: "ivory", label: "アイボリー (Ivory)" },
      { id: "pixel", label: "ピクセル (Pixel)" },
      { id: "comic", label: "コミック (Comic)" },
      { id: "dark", label: "ダーク (Dark)" },
    ];
    const cycleBtn = document.createElement("button");
    cycleBtn.type = "button";
    cycleBtn.className = "menu-item";
    cycleBtn.innerHTML = `<span>🔄 次のスキンへ切り替え</span>`;
    cycleBtn.addEventListener("click", () => {
      dispatchSubmenuAction("balloon-cycle");
    });
    container.appendChild(cycleBtn);

    const sep = document.createElement("div");
    sep.className = "menu-separator";
    container.appendChild(sep);

    themes.forEach((t) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "menu-item";
      btn.innerHTML = `<span>${t.label}</span>`;
      btn.addEventListener("click", () => {
        dispatchSubmenuAction(`balloon-theme-${t.id}`);
      });
      container.appendChild(btn);
    });
  } else if (currentSubmenuType === "tools") {
    const tools = [
      { id: "install", label: "📥 ファイル取り込み・導入..." },
      { id: "scan", label: "📂 ゴーストフォルダ再スキャン" },
      { id: "headline", label: "📰 ヘッドライン/ニュース" },
      { id: "plugins", label: "🧩 プラグイン・拡張機能" },
      { id: "debug", label: "🐛 デバッグログ" },
    ];
    tools.forEach((t) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "menu-item";
      btn.innerHTML = `<span>${t.label}</span>`;
      btn.addEventListener("click", () => {
        dispatchSubmenuAction(t.id);
      });
      container.appendChild(btn);
    });
  } else if (currentSubmenuType === "scale") {
    const scales = [
      { label: "50%", val: "scale-50" },
      { label: "75%", val: "scale-75" },
      { label: "100% (標準)", val: "scale-100" },
      { label: "125%", val: "scale-125" },
      { label: "150%", val: "scale-150" },
      { label: "200%", val: "scale-200" },
    ];
    scales.forEach((s) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "menu-item";
      btn.innerHTML = `<span>${s.label}</span>`;
      btn.addEventListener("click", () => {
        dispatchSubmenuAction(s.val);
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
  try {
    const savedTheme = localStorage.getItem("nanai_balloon_theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-balloon-theme", savedTheme);
      document.body.className = `balloon-theme-${savedTheme}`;
    }
  } catch (_err) {
    // LocalStorage access restricted or unavailable
  }
  renderContent();
  if (globalThis.__TAURI__) {
    const emitFn = globalThis.__TAURI__.event?.emit || globalThis.__TAURI__.emit;
    if (typeof emitFn === "function") {
      emitFn("menu-action", { action: "request-sync" });
    }
  }
});
