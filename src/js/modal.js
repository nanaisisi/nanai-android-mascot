/**
 * Nanai Android Mascot - モーダル & UIダイアログ管理
 */

export class ModalManager {
  constructor(app) {
    this.app = app;
    this.overlay = document.getElementById("modal-overlay");
    this.content = document.getElementById("modal-content");
    this.closeBtn = document.getElementById("modal-close");
    this.init();
  }

  init() {
    this.closeBtn?.addEventListener("click", () => this.hide());
    this.overlay?.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });
  }

  show(contentId) {
    const source = document.getElementById(contentId);
    if (!source || !this.content || !this.overlay) return;

    this.content.innerHTML = source.innerHTML;
    this.overlay.style.display = "flex";
    this.setupListeners(contentId);
  }

  hide() {
    if (this.overlay) {
      this.overlay.style.display = "none";
    }
  }

  setupListeners(contentId) {
    if (contentId === "ghost-modal-content") {
      this.renderGhostList();
      document.getElementById("refresh-ghosts-btn")?.addEventListener("click", async () => {
        await this.app.ghostController.scanAndLoadFirstGhost();
        this.renderGhostList();
      });
    } else if (contentId === "settings-modal-content") {
      this.setupSettingsListeners();
    } else if (contentId === "debug-modal-content") {
      this.setupDebugListeners();
    }
  }

  renderGhostList() {
    const ghostList = document.getElementById("ghost-list");
    if (!ghostList) return;

    const ghosts = this.app.ghostController.ghosts;
    if (!ghosts || ghosts.length === 0) {
      ghostList.innerHTML = '<div class="info">ゴーストが見つかりません。</div>';
      return;
    }

    ghostList.innerHTML = ghosts
      .map(
        (ghost) => `
        <div class="ghost-item ${this.app.ghostController.currentGhost?.name === ghost.name ? "active" : ""}" data-ghost="${ghost.name}">
          <strong>${ghost.name}</strong><br>
          <small>${ghost.path}</small>
        </div>`
      )
      .join("");

    ghostList.querySelectorAll(".ghost-item").forEach((item) => {
      item.addEventListener("click", () => {
        this.app.ghostController.selectGhost(item.dataset.ghost);
        this.renderGhostList();
      });
    });
  }

  setupSettingsListeners() {
    const form = {
      autoLoad: document.getElementById("auto-load-ghost"),
      darkMode: document.getElementById("dark-mode"),
      shellScale: document.getElementById("shell-scale"),
      balloonScale: document.getElementById("balloon-scale"),
      saveBtn: document.getElementById("save-settings-btn"),
      resetBtn: document.getElementById("reset-settings-btn"),
    };

    if (form.autoLoad) form.autoLoad.checked = this.app.settings.autoLoadGhost;
    if (form.darkMode) form.darkMode.checked = this.app.settings.darkMode;
    if (form.shellScale) form.shellScale.value = this.app.settings.shellScale || "100";
    if (form.balloonScale) form.balloonScale.value = this.app.settings.balloonScale || "100";

    form.saveBtn?.addEventListener("click", () => {
      this.app.settings.autoLoadGhost = form.autoLoad?.checked ?? true;
      this.app.settings.darkMode = form.darkMode?.checked ?? false;
      this.app.settings.shellScale = form.shellScale?.value ?? "100";
      this.app.settings.balloonScale = form.balloonScale?.value ?? "100";

      localStorage.setItem("nanai-android-mascot-settings", JSON.stringify(this.app.settings));
      this.app.applySettings();
      this.app.showBalloon("設定を保存しました。");
      setTimeout(() => this.app.hideBalloon(), 2000);
      this.hide();
    });

    form.resetBtn?.addEventListener("click", () => {
      if (confirm("設定を初期値に戻しますか？")) {
        localStorage.removeItem("nanai-android-mascot-settings");
        this.app.settings = {
          autoLoadGhost: true,
          enableNotifications: true,
          darkMode: false,
          alwaysOnTop: true,
          shellScale: "100",
          balloonScale: "100",
          debugLevel: "info",
        };
        this.app.applySettings();
        if (form.autoLoad) form.autoLoad.checked = true;
        if (form.darkMode) form.darkMode.checked = false;
        if (form.shellScale) form.shellScale.value = "100";
        if (form.balloonScale) form.balloonScale.value = "100";
        this.app.showBalloon("設定を初期化しました。");
        setTimeout(() => this.app.hideBalloon(), 2000);
      }
    });
  }

  setupDebugListeners() {
    document.getElementById("clear-logs")?.addEventListener("click", () => {
      const output = document.getElementById("log-output");
      if (output) output.innerHTML = '<div class="log-entry info">ログをクリアしました</div>';
    });

    document.getElementById("export-logs")?.addEventListener("click", () => {
      const output = document.getElementById("log-output");
      const text = output?.innerText || "";
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nanai-android-mascot-debug-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  /**
   * 共通エラー・情報通知モーダル表示ヘルパー
   */
  showNotification(title, message, isError = false) {
    if (!this.content || !this.overlay) return;
    this.content.innerHTML = `
      <h2>${isError ? "⚠️ " : "ℹ️ "}${title}</h2>
      <div class="form-section">
        <p style="${isError ? "color: #d32f2f;" : ""}">${message}</p>
      </div>
      <div class="form-section" style="text-align: right;">
        <button id="modal-ok-btn" class="primary">OK</button>
      </div>
    `;
    this.overlay.style.display = "flex";
    document.getElementById("modal-ok-btn")?.addEventListener("click", () => this.hide());
  }
}

