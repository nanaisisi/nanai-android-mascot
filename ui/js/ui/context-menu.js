/**
 * Nanai Android Mascot - 標準メニューイベント制御
 */

function dispatchAction(action, payload = null) {
  if (!action) return;
  console.log(`Context Menu Action: ${action}`, payload || "");

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
    // 終了（close/exit）の場合は直接 exit_app を呼び出して確実にプロセスを落とす
    if (action === "close" || action === "exit") {
      if (typeof invokeFn === "function") {
        invokeFn("exit_app").catch(() => {});
      }
      return;
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
        renderCallGhostSubmenu(data.ghosts || []);
        if (data.shells) {
          renderShellSubmenu(data.shells, data.currentShell);
        }
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

  shells.forEach((shellItem) => {
    const shellName = typeof shellItem === "string" ? shellItem : shellItem?.name || "master";
    const displayName = typeof shellItem === "object" && shellItem?.display_name ? shellItem.display_name : shellName;
    const isCurrent = currentShell === shellName;
    const btn = document.createElement("button");
    btn.className = `menu-item ${isCurrent ? "is-current" : ""}`;
    btn.dataset.shellName = shellName;
    btn.innerHTML = `<span>${isCurrent ? "✓ " : "　"}${displayName}</span>`;
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

  // ゴースト取り込みモーダルを開くボタン
  const installBtn = document.createElement("button");
  installBtn.className = "menu-item";
  installBtn.id = "install-btn";
  installBtn.innerHTML = `<span>📥 ゴーストの取り込み...</span>`;
  installBtn.addEventListener("click", () => {
    dispatchAction("install");
  });
  container.appendChild(installBtn);
}

function renderCallGhostSubmenu(ghosts) {
  const container = document.getElementById("call-ghost-submenu");
  if (!container) return;

  container.innerHTML = "";

  ghosts.forEach((ghost) => {
    const btn = document.createElement("button");
    btn.className = "menu-item";
    btn.dataset.ghostName = ghost.name;
    btn.innerHTML = `<span>➕ ${ghost.name}</span>`;
    btn.addEventListener("click", () => {
      dispatchAction("call-ghost", ghost.name);
    });
    container.appendChild(btn);
  });

  if (ghosts.length === 0) {
    const emptySpan = document.createElement("div");
    emptySpan.className = "menu-item is-disabled";
    emptySpan.innerHTML = `<span>(ゴーストがありません)</span>`;
    container.appendChild(emptySpan);
  }
}

// 独立サブメニューウィンドウを開く補助関数 (デスクトップ環境用)
function _triggerSubmenuWindow(menuType, buttonEl) {
  if (globalThis.__TAURI__) {
    const invokeFn = globalThis.__TAURI__.core?.invoke || globalThis.__TAURI__.invoke;
    if (typeof invokeFn === "function") {
      const rect = buttonEl.getBoundingClientRect();
      const sX = globalThis.screenX ?? 0;
      const sY = globalThis.screenY ?? 0;
      // メニューウィンドウの右横 (+2px) かつボタンの上下位置に合わせる
      const posX = sX + 240 + 2;
      const posY = sY + rect.top;
      invokeFn("show_submenu_window", {
        menuType: menuType,
        x: posX,
        y: posY,
        width: 220,
        height: 320,
      }).catch((e) => console.error("Failed to show submenu window:", e));
    }
  }
}

document.addEventListener("click", (e) => {
  const menuItem = e.target.closest(".menu-item");
  if (!menuItem) return;

  // サブメニュー展開用の親ボタン
  if (menuItem.classList.contains("has-submenu")) {
    const menuType = menuItem.id.replace("-menu-btn", "").replace("-switch-btn", "");
    if (globalThis.__TAURI__) {
      _triggerSubmenuWindow(menuType, menuItem);
      return;
    }

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

    const action = menuItem.dataset.action || menuItem.id.replace("-btn", "");
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

  // ホバー時にも右/左展開を判定 & 独立サブメニューウィンドウ呼び出し
  document.querySelectorAll(".menu-item-wrapper").forEach((wrapper) => {
    wrapper.addEventListener("mouseenter", () => {
      checkSubmenuFlip(wrapper);
      if (globalThis.__TAURI__) {
        const btn = wrapper.querySelector(".menu-item.has-submenu");
        if (btn) {
          const menuType = btn.id.replace("-menu-btn", "").replace("-switch-btn", "");
          _triggerSubmenuWindow(menuType, btn);
        }
      } else {
        wrapper.classList.add("open");
      }
    });
    wrapper.addEventListener("mouseleave", () => {
      if (!globalThis.__TAURI__) {
        wrapper.classList.remove("open");
      }
    });
  });

  // 初期化時に親ウィンドウへ同期リクエスト & 保存済みテーマの即時適用
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

  // 単一アクセラレータキー (SSP標準キーバインド準拠)
  const keyMap = {
    a: "talk",       // もう一度話す (Again)
    r: "recommend",  // おすすめサイト (Recommend)
    t: "portal",     // ポータル (Portal)
    u: "update",     // ネットワーク更新 (Update)
    b: "balloon",    // バルーン (Balloon)
    f: "tools",      // ツール
    i: "install",    // ファイル導入
    o: "settings",   // 設定 (Options)
    h: "help",       // 情報・ヘルプ (Help)
    l: "license",    // 著作権・ライセンス (License)
    m: "minimize",   // 最小化 (Minimize)
    w: "close",      // 終了
  };

  const action = keyMap[e.key.toLowerCase()];
  if (action) {
    e.preventDefault();
    dispatchAction(action);
  }
});

