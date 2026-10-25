import { invoke, isTauriAvailable } from "../core/tauri-helper.js";

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

      const fileInput = this.content.querySelector("#ghost-archive-input");
      const importBtn = this.content.querySelector("#import-ghost-btn");
      const statusEl = this.content.querySelector("#import-ghost-status");

      const handleGhostImport = async () => {
        const file = fileInput?.files?.[0];
        if (!file) {
          if (statusEl) statusEl.textContent = "ファイルを選択してください。";
          return;
        }

        if (statusEl) {
          statusEl.textContent = `⏳ 取り込み中: ${file.name}...`;
          statusEl.style.color = "#2980b9";
        }

        if (isTauriAvailable()) {
          try {
            let res;
            if (file.path) {
              res = await invoke("install_ghost_archive", { archivePath: file.path });
            } else {
              const arrayBuffer = await file.arrayBuffer();
              const bytes = Array.from(new Uint8Array(arrayBuffer));
              res = await invoke("install_ghost_archive_bytes", { fileName: file.name, bytes });
            }
            if (statusEl) {
              statusEl.textContent = `✅ 「${res.name}」を取り込みました！`;
              statusEl.style.color = "#27ae60";
            }
            await this.app.ghostController.scanGhosts();
            this.app.ghostController.selectGhost(res.name);
            this.renderGhostList();
          } catch (err) {
            console.error("アーカイブ取り込み失敗:", err);
            if (statusEl) {
              statusEl.textContent = `❌ 失敗: ${err}`;
              statusEl.style.color = "#c0392b";
            }
          }
        } else {
          if (statusEl) statusEl.textContent = "※ ブラウザ環境ではアーカイブ展開はサポートされていません";
        }
      };

      importBtn?.addEventListener("click", handleGhostImport);
      fileInput?.addEventListener("change", handleGhostImport);
    } else if (contentId === "install-modal-content") {
      this.setupInstallListeners();
    } else if (contentId === "settings-modal-content") {
      this.setupSettingsListeners();
    } else if (contentId === "balloon-modal-content") {
      this.renderBalloonList();
    } else if (contentId === "plugins-modal-content") {
      this.setupPluginListeners();
    } else if (contentId === "debug-modal-content") {
      this.setupDebugListeners();
    }
  }

  setupInstallListeners() {
    const fileInput = this.content.querySelector("#modal-install-file-input");
    const submitBtn = this.content.querySelector("#modal-install-submit-btn");
    const statusEl = this.content.querySelector("#modal-install-status");

    const doInstall = async () => {
      const file = fileInput?.files?.[0];
      if (!file) {
        if (statusEl) {
          statusEl.textContent = "ファイルを選択してください。";
          statusEl.style.color = "#c0392b";
        }
        return;
      }

      if (statusEl) {
        statusEl.textContent = `⏳ 取り込み処理中: ${file.name}...`;
        statusEl.style.color = "#2980b9";
      }

      if (isTauriAvailable()) {
        try {
          let res;
          if (file.path) {
            res = await invoke("install_ghost_archive", { archivePath: file.path });
          } else {
            const arrayBuffer = await file.arrayBuffer();
            const bytes = Array.from(new Uint8Array(arrayBuffer));
            res = await invoke("install_ghost_archive_bytes", { fileName: file.name, bytes });
          }

          if (statusEl) {
            statusEl.textContent = `✅ ゴースト「${res.name}」を取り込みました！`;
            statusEl.style.color = "#27ae60";
          }
          await this.app.ghostController.scanGhosts();
          this.app.ghostController.selectGhost(res.name);
          this.app.showBalloon(`「${res.name}」をインストールして切り替えました！`);
          setTimeout(() => this.app.hideBalloon(), 2500);
        } catch (err) {
          console.error("アーカイブ取り込み失敗:", err);
          if (statusEl) {
            statusEl.textContent = `❌ 取り込み失敗: ${err}`;
            statusEl.style.color = "#c0392b";
          }
        }
      } else {
        if (statusEl) {
          statusEl.textContent = "※ ブラウザ環境ではネイティブアーカイブ展開はサポートされていません（Tauri環境で実行してください）";
          statusEl.style.color = "#e67e22";
        }
      }
    };

    submitBtn?.addEventListener("click", doInstall);
    fileInput?.addEventListener("change", doInstall);
  }

  setupPluginListeners() {
    const addBtn = document.getElementById("add-plugin-btn");
    addBtn?.addEventListener("click", () => {
      this.showNotification(
        "プラグイン管理",
        "プラグイン（.js / WASM）の追加は、`plugins/` ディレクトリにフォルダを配置することで自動認識されます。"
      );
    });

    const pluginItems = document.querySelectorAll("#plugin-list .ghost-item");
    pluginItems.forEach((item) => {
      item.addEventListener("click", () => {
        const isActive = item.classList.toggle("active");
        const title = item.querySelector("strong")?.textContent || "プラグイン";
        this.app.showBalloon(`${title} を${isActive ? "有効化" : "無効化"}しました。`);
        setTimeout(() => this.app.hideBalloon(), 1500);
      });
    });
  }


  renderBalloonList() {
    const list = document.getElementById("balloon-list");
    const currentLabel = document.getElementById("current-balloon");
    if (!list) return;

    const balloonThemes = [
      { id: "default", name: "標準モダン (デフォルト)", desc: "半透明の角丸バルーン" },
      { id: "ivory", name: "アイボリー", desc: "歴史的なレトロクリーム調枠線" },
      { id: "comic", name: "コミック", desc: "ポップな太枠吹き出し" },
      { id: "dark", name: "ダークモダン", desc: "シックな黒基調スタイル" },
    ];

    const currentTheme = this.app.settings.balloonTheme || "default";
    if (currentLabel) {
      const activeObj = balloonThemes.find((b) => b.id === currentTheme);
      currentLabel.textContent = activeObj ? activeObj.name : currentTheme;
    }

    list.innerHTML = balloonThemes
      .map(
        (b) => `
        <div class="ghost-item ${currentTheme === b.id ? "active" : ""}" data-theme="${b.id}" style="cursor: pointer;">
          <strong>${currentTheme === b.id ? "✓ " : ""}${b.name}</strong><br>
          <small>${b.desc}</small>
        </div>`
      )
      .join("");

    list.querySelectorAll(".ghost-item").forEach((item) => {
      item.addEventListener("click", () => {
        const selected = item.dataset.theme;
        this.app.setBalloonTheme(selected);
        this.renderBalloonList();
      });
    });
  }


  renderGhostList() {
    const ghostList = this.content ? this.content.querySelector("#ghost-list") : document.getElementById("ghost-list");
    const currentGhostLabel = this.content ? this.content.querySelector("#current-ghost") : document.getElementById("current-ghost");
    if (!ghostList) return;

    if (currentGhostLabel) {
      currentGhostLabel.textContent = this.app.ghostController.currentGhost?.name || "未選択";
    }

    const ghosts = this.app.ghostController.ghosts;
    if (!ghosts || ghosts.length === 0) {
      ghostList.innerHTML = '<div class="info">ゴーストが見つかりません。</div>';
      return;
    }

    ghostList.innerHTML = ghosts
      .map(
        (ghost) => `
        <div class="ghost-item ${this.app.ghostController.currentGhost?.name === ghost.name ? "active" : ""}" data-ghost="${ghost.name}" style="cursor: pointer; padding: 6px; border-bottom: 1px solid rgba(0,0,0,0.05);">
          <strong>${this.app.ghostController.currentGhost?.name === ghost.name ? "✓ " : ""}${ghost.name}</strong><br>
          <small style="color: #666;">${ghost.path}</small>
        </div>`
      )
      .join("");

    ghostList.querySelectorAll(".ghost-item").forEach((item) => {
      item.addEventListener("click", () => {
        const ghostName = item.dataset.ghost;
        this.app.ghostController.selectGhost(ghostName);
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

    const overlayBtn = document.getElementById("open-overlay-settings-btn");
    overlayBtn?.addEventListener("click", async () => {
      if (isTauriAvailable()) {
        try {
          await invoke("request_overlay_permission");
        } catch (_e) {
          this.showNotification(
            "Android 設定案内",
            "Androidの『設定』→『アプリ』→『特別なアプリアクセス』→『他のアプリの上に重ねて表示』から Nanai Mascot を許可してください。"
          );
        }
      } else {
        this.showNotification(
          "Android 設定案内",
          "Android環境で実行時に『他のアプリの上に重ねて表示（SYSTEM_ALERT_WINDOW）』設定画面へ案内されます。"
        );
      }
    });

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
      const text = output?.textContent || "";
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

