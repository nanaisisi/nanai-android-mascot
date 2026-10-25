/**
 * Nanai Android Mascot - 独立サブメニューウィンドウ制御
 */

/** @type {string} */
let currentSubmenuType = "ghost";
/** @type {string[]} */
let cachedGhosts = [];
/** @type {string|null} */
let currentGhostName = null;
/** @type {string[]} */
let cachedShells = [];
/** @type {string|null} */
let currentShellName = null;

/**
 * サブメニューのアクションをイベントとして送信
 * @param {string} action
 * @param {any} [payload]
 */
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
    cachedGhosts.forEach((ghostItem) => {
      const ghostName = typeof ghostItem === "string" ? ghostItem : ghostItem?.name || "";
      const isCurrent = ghostName === currentGhostName;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `menu-item${isCurrent ? " is-current" : ""}`;
      btn.innerHTML = `<span>${isCurrent ? "✓ " : ""}${ghostName}</span>`;
      btn.addEventListener("click", () => {
        dispatchSubmenuAction("switch-ghost", ghostName);
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
    (cachedShells.length > 0 ? cachedShells : ["master"]).forEach((shellItem) => {
      const shellName = typeof shellItem === "string" ? shellItem : shellItem?.name || "master";
      const displayName = typeof shellItem === "object" && shellItem?.display_name ? shellItem.display_name : shellName;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `menu-item${shellName === currentShellName ? " is-current" : ""}`;
      btn.innerHTML = `<span>${shellName === currentShellName ? "✓ " : ""}${displayName}</span>`;
      btn.addEventListener("click", () => {
        dispatchSubmenuAction("switch-shell", shellName);
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
        // ゴースト/シェルの descript.txt 由来のメニュー配色を適用
        const activeShell = data.shells?.find((s) => s.name === data.currentShell) || data.shells?.[0];
        if (activeShell?.menu_theme) {
          const mt = activeShell.menu_theme;
          const rootStyle = document.documentElement.style;
          if (mt.background_color) rootStyle.setProperty("--balloon-bg", mt.background_color);
          if (mt.foreground_color) rootStyle.setProperty("--balloon-highlight-bg", mt.foreground_color);
          if (mt.background_font_color || mt.font_color) {
            rootStyle.setProperty("--balloon-text-color", mt.background_font_color || mt.font_color);
          }
          if (mt.foreground_font_color) rootStyle.setProperty("--balloon-highlight-text", mt.foreground_font_color);
          if (mt.disable_font_color) rootStyle.setProperty("--balloon-disable-text", mt.disable_font_color);
          if (mt.separator_color) rootStyle.setProperty("--balloon-separator-color", mt.separator_color);
        }
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
