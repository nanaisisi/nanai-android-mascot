/**
 * Mascot Nanai - クラシックメニューイベント制御
 */

function dispatchAction(action) {
  if (!action) return;
  console.log(`Classic Menu Action: ${action}`);

  if (globalThis.parent && globalThis.parent !== globalThis) {
    globalThis.parent.postMessage(
      {
        type: "menu-action",
        action: action,
        timestamp: Date.now(),
      },
      "*"
    );
  }
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

