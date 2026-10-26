/**
 * コンテキストメニューの各サブメニュー（ゴースト、シェル、呼び出し）描画
 */
export class MenuSubmenuRenderer {
  /**
   * @param {import('./menu-dispatcher.js').MenuDispatcher} dispatcher
   */
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
  }

  renderShellSubmenu(shells, currentShell) {
    const container = document.getElementById("shell-submenu");
    if (!container) return;

    container.innerHTML = "";

    shells.forEach((shellItem) => {
      const shellName =
        typeof shellItem === "string" ? shellItem : shellItem?.name || "master";
      const displayName =
        typeof shellItem === "object" && shellItem?.display_name
          ? shellItem.display_name
          : shellName;
      const isCurrent = currentShell === shellName;
      const btn = document.createElement("button");
      btn.className = `menu-item ${isCurrent ? "is-current" : ""}`;
      btn.dataset.shellName = shellName;
      btn.innerHTML = `<span>${isCurrent ? "✓ " : "　"}${displayName}</span>`;
      btn.addEventListener("click", () => {
        this.dispatcher.dispatchAction("switch-to-shell", shellName);
      });
      container.appendChild(btn);
    });
  }

  renderGhostSubmenu(ghosts, currentGhost) {
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
        this.dispatcher.dispatchAction("switch-to-ghost", ghost.name);
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
      this.dispatcher.dispatchAction("ghost");
    });
    container.appendChild(manageBtn);

    // ゴースト取り込みモーダルを開くボタン
    const installBtn = document.createElement("button");
    installBtn.className = "menu-item";
    installBtn.id = "install-btn";
    installBtn.innerHTML = `<span>📥 ゴーストの取り込み...</span>`;
    installBtn.addEventListener("click", () => {
      this.dispatcher.dispatchAction("install");
    });
    container.appendChild(installBtn);
  }

  renderCallGhostSubmenu(ghosts) {
    const container = document.getElementById("call-ghost-submenu");
    if (!container) return;

    container.innerHTML = "";

    ghosts.forEach((ghost) => {
      const btn = document.createElement("button");
      btn.className = "menu-item";
      btn.dataset.ghostName = ghost.name;
      btn.innerHTML = `<span>➕ ${ghost.name}</span>`;
      btn.addEventListener("click", () => {
        this.dispatcher.dispatchAction("call-ghost", ghost.name);
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

  applyTheme(theme) {
    if (theme) {
      document.documentElement.setAttribute("data-balloon-theme", theme);
      document.body.className = `balloon-theme-${theme}`;
    }
  }

  applyShellTheme(activeShell) {
    if (activeShell?.menu_theme) {
      const mt = activeShell.menu_theme;
      const rootStyle = document.documentElement.style;
      if (mt.background_color)
        rootStyle.setProperty("--balloon-bg", mt.background_color);
      if (mt.foreground_color)
        rootStyle.setProperty("--balloon-highlight-bg", mt.foreground_color);
      if (mt.background_font_color || mt.font_color) {
        rootStyle.setProperty(
          "--balloon-text-color",
          mt.background_font_color || mt.font_color
        );
      }
      if (mt.foreground_font_color)
        rootStyle.setProperty(
          "--balloon-highlight-text",
          mt.foreground_font_color
        );
      if (mt.disable_font_color)
        rootStyle.setProperty("--balloon-disable-text", mt.disable_font_color);
      if (mt.separator_color)
        rootStyle.setProperty("--balloon-separator-color", mt.separator_color);
    }
  }
}
