/**
 * Mascot Nanai - クラシックメニューイベント制御
 */

document.addEventListener("click", (e) => {
  const menuItem = e.target.closest(".menu-item");
  if (!menuItem) return;

  // サブメニュー展開用の親ボタンはクリックで閉じない
  if (menuItem.classList.contains("has-submenu")) return;

  const action = menuItem.id.replace("-btn", "");
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
});
