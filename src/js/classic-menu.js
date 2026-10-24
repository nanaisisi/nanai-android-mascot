/**
 * Nanai Android Mascot - クラシックメニューイベント制御
 */

function dispatchAction(action, payload = null) {
  if (!action) return;
  console.log(`Classic Menu Action: ${action}`, payload || "");

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
}

// 親ウィンドウからの状態同期メッセージ受信
globalThis.addEventListener("message", (event) => {
  if (event.data?.type === "sync-ghosts") {
    const ghosts = event.data.ghosts || [];
    const currentGhost = event.data.currentGhost;
    renderGhostSubmenu(ghosts, currentGhost);
  } else if (event.data?.type === "sync-shells") {
    const shells = event.data.shells || ["master"];
    const currentShell = event.data.currentShell || "master";
    renderShellSubmenu(shells, currentShell);
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

document.addEventListener("click", (e) => {
  const menuItem = e.target.closest(".menu-item");
  if (!menuItem) return;

  // サブメニュー展開用の親ボタンはクリックで閉じない
  if (menuItem.classList.contains("has-submenu")) return;

  const action = menuItem.id.replace("-btn", "");
  dispatchAction(action);
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
    b: "balloon",
    r: "scan",
    p: "plugins",
    o: "settings",
    d: "debug",
    a: "help",
  };

  const action = keyMap[e.key.toLowerCase()];
  if (action) {
    e.preventDefault();
    dispatchAction(action);
  }
});

