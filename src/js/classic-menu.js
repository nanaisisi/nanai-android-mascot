/**
 * Nanai Android Mascot - クラシックメニューイベント制御
 */

function dispatchAction(action, payload = null) {
  if (!action) return;
  console.log(`Classic Menu Action: ${action}`, payload || "");

  // iframe 環境の場合
  if (globalThis.parent && globalThis.parent !== globalThis) {
    globalThis.parent.postMessage(
      {
        type: "menu-action",
        action: action,
        payload: payload,
        timestamp: Date.now(),
      },
      "*"
    );
  }

  // 独立ウィンドウ（WebviewWindow）環境の場合
  if (globalThis.__TAURI__) {
    const emitFn = globalThis.__TAURI__.event?.emit || globalThis.__TAURI__.emit;
    const invokeFn = globalThis.__TAURI__.core?.invoke || globalThis.__TAURI__.invoke;
    if (typeof emitFn === "function") {
      emitFn("menu-action", { action, payload });
    }
    if (typeof invokeFn === "function" && action !== "request-sync") {
      invokeFn("hide_menu_window").catch(() => {});
    }
  }
}

// 独立ウィンドウ環境での Tauri イベント受信 (ゴースト・シェル・バルーンテーマ同期)
if (globalThis.__TAURI__) {
  const listenFn = globalThis.__TAURI__.event?.listen || globalThis.__TAURI__.listen;
  if (typeof listenFn === "function") {
    listenFn("sync-ghosts", (event) => {
      const data = event.payload;
      if (data) {
        renderGhostSubmenu(data.ghosts || [], data.currentGhost);
        if (data.shells) {
          renderShellSubmenu(data.shells, data.currentShell);
        }
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

// 親ウィンドウからの状態同期メッセージ受信 (iframeフォールバック時)
globalThis.addEventListener("message", (event) => {
  if (event.data?.type === "sync-ghosts") {
    const ghosts = event.data.ghosts || [];
    const currentGhost = event.data.currentGhost;
    renderGhostSubmenu(ghosts, currentGhost);
  } else if (event.data?.type === "sync-shells") {
    const shells = event.data.shells || ["master"];
    const currentShell = event.data.currentShell || "master";
    renderShellSubmenu(shells, currentShell);
  } else if (event.data?.type === "sync-theme") {
    const theme = event.data.theme;
    if (theme) {
      document.documentElement.setAttribute("data-balloon-theme", theme);
      document.body.className = `balloon-theme-${theme}`;
    }
  }
});

function renderShellSubmenu(shells, currentShell) {
  const container = document.getElementById("shell-submenu");
  if (!container) return;

  container.innerHTML = "";

  shells.forEach((shellName) => {
    const isCurrent = currentShell === shellName;
    const btn = document.createElement("button");
    btn.className = `menu-item ${isCurrent ? "is-current" : ""}`;
    btn.dataset.shellName = shellName;
    btn.innerHTML = `<span>${isCurrent ? "✓ " : "　"}${shellName}</span>`;
    btn.addEventListener("click", () => {
      dispatchAction("switch-to-shell", shellName);
    });
    container.appendChild(btn);
  });
}


function renderGhostSubmenu(ghosts, currentGhost) {
  const container = document.getElementById("ghost-submenu");
  if (!container) return;

  container.innerHTML = "";

  // 検出されたゴースト一覧
  ghosts.forEach((ghost) => {
    const isCurrent = currentGhost && currentGhost.name === ghost.name;
    const btn = document.createElement("button");
    btn.className = `menu-item ${isCurrent ? "is-current" : ""}`;
    btn.dataset.ghostName = ghost.name;
    btn.innerHTML = `<span>${isCurrent ? "✓ " : "　"}${ghost.name}</span>`;
    btn.addEventListener("click", () => {
      dispatchAction("switch-to-ghost", ghost.name);
    });
    container.appendChild(btn);
  });

  // セパレータ
  if (ghosts.length > 0) {
    const sep = document.createElement("div");
    sep.className = "menu-separator";
    container.appendChild(sep);
  }

  // ゴースト管理モーダルを開くボタン
  const manageBtn = document.createElement("button");
  manageBtn.className = "menu-item";
  manageBtn.id = "ghost-btn";
  manageBtn.innerHTML = `<span>📂 ゴースト管理...</span>`;
  manageBtn.addEventListener("click", () => {
    dispatchAction("ghost");
  });
  container.appendChild(manageBtn);
}

// 独立サブメニューウィンドウを開く補助関数 (必要時のオプション用)
function _triggerSubmenuWindow(menuType, buttonEl) {
  if (globalThis.__TAURI__) {
    const invokeFn = globalThis.__TAURI__.core?.invoke || globalThis.__TAURI__.invoke;
    if (typeof invokeFn === "function") {
      const rect = buttonEl.getBoundingClientRect();
      const sX = globalThis.screenX ?? 0;
      const sY = globalThis.screenY ?? 0;
      const posX = sX + rect.right + 2;
      const posY = sY + rect.top;
      invokeFn("show_submenu_window", {
        menuType: menuType,
        x: posX,
        y: posY,
        width: 240,
        height: 360,
      }).catch((e) => console.error("Failed to show submenu window:", e));
    }
  }
}

document.addEventListener("click", (e) => {
  const menuItem = e.target.closest(".menu-item");
  if (!menuItem) return;

  // サブメニュー展開用の親ボタンはクリックで開閉をトグル
  if (menuItem.classList.contains("has-submenu")) {
    const wrapper = menuItem.closest(".menu-item-wrapper");
    if (wrapper) {
      const isAlreadyOpen = wrapper.classList.contains("open");
      document.querySelectorAll(".menu-item-wrapper.open").forEach((el) => {
        el.classList.remove("open");
      });
      if (!isAlreadyOpen) {
        checkSubmenuFlip(wrapper);
        wrapper.classList.add("open");
      }
    }
    return;
  }

  const action = menuItem.id.replace("-btn", "");
  dispatchAction(action);
});

// SSP準拠: サブメニューが画面右端を超える場合は左側へ反転展開
function checkSubmenuFlip(wrapper) {
  const container = document.querySelector(".menu-container");
  if (!container) return;

  const containerRect = container.getBoundingClientRect();
  const submenuWidth = 240; // およそのサブメニュー幅
  const spaceOnRight = (globalThis.innerWidth ?? 800) - containerRect.right;

  // 右側にサブメニューを出す十分なスペースがない場合は左側に展開
  if (spaceOnRight < submenuWidth) {
    wrapper.classList.add("flip-left");
  } else {
    wrapper.classList.remove("flip-left");
  }
}

// ホバー時にも右/左展開を判定
document.querySelectorAll(".menu-item-wrapper").forEach((wrapper) => {
  wrapper.addEventListener("mouseenter", () => {
    checkSubmenuFlip(wrapper);
  });
});

// 初期化時に親ウィンドウへ同期リクエスト
globalThis.addEventListener("DOMContentLoaded", () => {
  dispatchAction("request-sync");
});

// ショートカットキー対応 (T, B, R, P, O, D, A, Ctrl+I, Ctrl+W, Escape)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    dispatchAction("close-menu");
    return;
  }

  if (e.ctrlKey || e.metaKey) {
    if (e.key.toLowerCase() === "i") {
      e.preventDefault();
      dispatchAction("minimize");
    } else if (e.key.toLowerCase() === "w") {
      e.preventDefault();
      dispatchAction("close");
    }
    return;
  }

  // 単一アクセラレータキー
  const keyMap = {
    t: "talk",
    u: "update",
    h: "headline",
    b: "balloon",
    i: "install",
    r: "scan",
    p: "plugins",
    o: "settings",
    d: "debug",
    a: "help",
    l: "license",
    w: "close",
  };

  const action = keyMap[e.key.toLowerCase()];
  if (action) {
    e.preventDefault();
    dispatchAction(action);
  }
});

