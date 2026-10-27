/**
 * Nanai Android Mascot - 独立サブメニューウィンドウ制御
 */
import { emit, invoke, isTauriAvailable } from "../core/tauri-helper.js";

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
/** @type {{ sakura: object, kero: object }|null} */
let cachedDressup = null;
/** @type {number} */
let dressupScope = 0;
/** @type {any[]} */
let cachedBalloons = [];
/** @type {string|null} */
let currentBalloonTheme = null;

/**
 * サブメニューのアクションをイベントとして送信
 * @param {string} action
 * @param {any} [payload]
 */
async function dispatchSubmenuAction(action, payload = null) {
  if (isTauriAvailable()) {
    try {
      await emit("menu-action", { action, payload });
      await Promise.all([
        invoke("hide_menu_window"),
        invoke("hide_submenu_window"),
      ]);
    } catch (error) {
      console.error("サブメニューアクションの送信に失敗しました:", error);
    }
  }
}

function renderContent() {
  const container = document.getElementById("submenu-content");
  if (!container) return;
  container.innerHTML = "";

  if (currentSubmenuType === "ghost") {
    cachedGhosts.forEach((ghostItem) => {
      const ghostName =
        typeof ghostItem === "string" ? ghostItem : ghostItem?.name || "";
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

  } else if (currentSubmenuType === "shell") {
    (cachedShells.length > 0 ? cachedShells : ["master"]).forEach(
      (shellItem) => {
        const shellName =
          typeof shellItem === "string"
            ? shellItem
            : shellItem?.name || "master";
        const displayName =
          typeof shellItem === "object" && shellItem?.display_name
            ? shellItem.display_name
            : shellName;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `menu-item${shellName === currentShellName ? " is-current" : ""}`;
        btn.innerHTML = `<span>${shellName === currentShellName ? "✓ " : ""}${displayName}</span>`;
        btn.addEventListener("click", () => {
          dispatchSubmenuAction("switch-shell", shellName);
        });
        container.appendChild(btn);
      },
    );
  } else if (currentSubmenuType === "dressup") {
    const data =
      dressupScope === 1 ? cachedDressup?.kero : cachedDressup?.sakura;
    const categories = data?.categories ?? [];
    if (categories.length === 0) {
      const empty = document.createElement("div");
      empty.className = "menu-item is-disabled";
      empty.innerHTML = `<span>(着せ替えパーツなし)</span>`;
      container.appendChild(empty);
    }
    for (const cat of categories) {
      const label = document.createElement("div");
      label.className = "menu-item is-disabled";
      label.innerHTML = `<span>${cat.category}</span>`;
      container.appendChild(label);

      for (const part of cat.parts) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `menu-item${part.on ? " is-current" : ""}`;
        btn.innerHTML = `<span>${part.on ? "✓ " : "　"}${part.part}</span>`;
        btn.addEventListener("click", () => {
          dispatchSubmenuAction("dressup-toggle", {
            category: cat.category,
            part: part.part,
            scope: dressupScope,
          });
        });
        container.appendChild(btn);
      }
    }
  } else if (currentSubmenuType === "balloon") {
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

    const themes = cachedBalloons.length > 0
      ? cachedBalloons.map((balloon) => ({
          id: balloon.dir_name,
          label: balloon.name || balloon.dir_name,
        }))
      : [
          { id: "ivory", label: "アイボリー (Ivory)" },
          { id: "pixel", label: "ピクセル (Pixel)" },
          { id: "comic", label: "コミック (Comic)" },
          { id: "dark", label: "ダーク (Dark)" },
        ];
    themes.forEach((t) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `menu-item${currentBalloonTheme === t.id ? " is-current" : ""}`;
      btn.innerHTML = `<span>${currentBalloonTheme === t.id ? "✓ " : "　"}${t.label}</span>`;
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

function applyShellMenuTheme(activeShell) {
  const rootStyle = document.documentElement.style;
  const theme = activeShell?.menu_theme;
  const setOrRemove = (property, value) => {
    if (value) rootStyle.setProperty(property, value);
    else rootStyle.removeProperty(property);
  };

  setOrRemove("--balloon-bg", theme?.background_color);
  setOrRemove("--balloon-highlight-bg", theme?.foreground_color);
  setOrRemove(
    "--balloon-text-color",
    theme?.background_font_color || theme?.font_color,
  );
  setOrRemove("--balloon-highlight-text", theme?.foreground_font_color);
  setOrRemove("--balloon-disable-text", theme?.disable_font_color);
  setOrRemove("--balloon-separator-color", theme?.separator_color);

  const shellPath = activeShell?.path?.replace(/\\/g, "/") || "";
  const setImage = (property, relativePath) => {
    if (!relativePath) {
      rootStyle.removeProperty(property);
      return;
    }
    const fullPath = shellPath
      ? `${shellPath}/${String(relativePath).replace(/\\/g, "/")}`
      : String(relativePath);
    const url = globalThis.__TAURI__?.core?.convertFileSrc
      ? globalThis.__TAURI__.core.convertFileSrc(fullPath)
      : fullPath;
    rootStyle.setProperty(property, `url("${url}")`);
  };
  setImage("--menu-bg-image", theme?.background_bitmap);
  setImage("--menu-fg-image", theme?.foreground_bitmap);
  setImage("--menu-sidebar-image", theme?.sidebar_bitmap);
  document.body.classList.toggle("has-sidebar", Boolean(theme?.sidebar_bitmap));
}

if (globalThis.__TAURI__) {
  const listenFn =
    globalThis.__TAURI__.event?.listen || globalThis.__TAURI__.listen;
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
        // 着せ替え (bindgroup) メニューデータの同期
        if (data.dressup) {
          cachedDressup = data.dressup;
        }
        if (typeof data.scope === "number") {
          dressupScope = data.scope;
        }
        // ゴースト/シェルの descript.txt 由来のメニュー配色を適用
        const activeShell =
          data.shells?.find((s) => s.name === data.currentShell) ||
          data.shells?.[0];
        applyShellMenuTheme(activeShell);
        renderContent();
      }
    });

    listenFn("sync-balloons", (event) => {
      cachedBalloons = event.payload || [];
      renderContent();
    });

    listenFn("sync-theme", (event) => {
      currentBalloonTheme = event.payload || null;
      document.documentElement.setAttribute("data-balloon-theme", currentBalloonTheme || "");
      document.body.classList.remove(
        "balloon-theme-ivory",
        "balloon-theme-pixel",
        "balloon-theme-comic",
        "balloon-theme-dark",
      );
      if (currentBalloonTheme) {
        document.body.classList.add(`balloon-theme-${currentBalloonTheme}`);
      }
      renderContent();
    });

    listenFn("sync-menu-scope", (event) => {
      const scope =
        typeof event.payload === "number"
          ? event.payload
          : parseInt(event.payload, 10);
      if (!Number.isNaN(scope)) {
        dressupScope = scope;
        // 着せ替えサブメニュー表示中なら新スコープへ切替
        if (currentSubmenuType === "dressup") {
          renderContent();
        }
      }
    });

  }
}

globalThis.addEventListener("DOMContentLoaded", () => {
  try {
    const savedTheme = localStorage.getItem("nanai_balloon_theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-balloon-theme", savedTheme);
      document.body.classList.add(`balloon-theme-${savedTheme}`);
    }
  } catch (_err) {
    // LocalStorage access restricted or unavailable
  }
  renderContent();
  if (globalThis.__TAURI__) {
    const emitFn =
      globalThis.__TAURI__.event?.emit || globalThis.__TAURI__.emit;
    if (typeof emitFn === "function") {
      emitFn("menu-action", { action: "request-sync" });
    }
  }
});
