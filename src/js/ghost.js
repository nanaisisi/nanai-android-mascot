import { ShioriProtocol } from "./shiori-protocol.js";

/**
 * Nanai Android Mascot - ゴースト & SHIORI 管理モジュール
 */

export class GhostController {
  constructor(app) {
    this.app = app;
    this.ghosts = [];
    this.currentGhost = null;
    this.shells = ["master"];
    this.currentShell = "master";
  }


  async autoLoadGhost() {
    console.log("🔄 自動ゴースト読み込み開始...");
    try {
      const savedGhost = localStorage.getItem("nanai-android-mascot-current-ghost");
      if (savedGhost) {
        const ghostInfo = JSON.parse(savedGhost);
        const exists = await this.verifyGhostExists(ghostInfo);
        if (exists) {
          this.currentGhost = ghostInfo;
          this.updateGhostCharacter(ghostInfo.name);
          return;
        }
      }
      await this.scanAndLoadFirstGhost();
    } catch (error) {
      console.error("❌ 自動ゴースト読み込みエラー:", error);
      this.updateGhostCharacter("mock_nanai");
    }
  }

  async verifyGhostExists(ghostInfo) {
    if (!globalThis.__TAURI__) return false;
    try {
      const result = await globalThis.__TAURI__.invoke("scan_ghosts", {
        ghostPath: ghostInfo.path || "assets/ghost",
      });
      return result.ghosts?.some((g) => g.name === ghostInfo.name) || false;
    } catch (error) {
      console.error("ゴースト存在確認エラー:", error);
      return false;
    }
  }

  async scanAndLoadFirstGhost() {
    if (!globalThis.__TAURI__) {
      console.log("Tauri環境ではありません - デフォルトmock_nanaiを使用");
      this.selectGhost("mock_nanai");
      return;
    }

    try {
      const result = await globalThis.__TAURI__.invoke("scan_ghosts", {
        ghostPath: "assets/ghost",
      });
      this.ghosts = result.ghosts || [];
      if (this.ghosts.length > 0) {
        const defaultGhost = this.ghosts.find((g) => g.name === "mock_nanai") || this.ghosts[0];
        this.selectGhost(defaultGhost.name);
      } else {
        this.selectGhost("mock_nanai");
      }
    } catch (error) {
      console.error("❌ ゴーストスキャンエラー:", error);
      this.selectGhost("mock_nanai");
    }
  }

  selectGhost(ghostName) {
    const ghost = this.ghosts.find((g) => g.name === ghostName) || {
      name: ghostName,
      path: `assets/ghost/${ghostName}`,
    };

    this.currentGhost = ghost;
    this.updateCurrentGhostDisplay();
    this.updateGhostCharacter(ghostName);
    localStorage.setItem("nanai-android-mascot-current-ghost", JSON.stringify(ghost));

    this.initializeGhostSHIORI(ghost);
    this.currentShell = "master";
    this.app.surfaceManager.loadSurfacesTxt(ghost.path || `assets/ghost/${ghostName}`);
    this.app.showBalloon(`ゴースト「${ghostName}」を選択しました。`);
    setTimeout(() => this.app.hideBalloon(), 2000);
  }

  selectShell(shellName) {
    this.currentShell = shellName;
    const ghostName = this.currentGhost?.name || "mock_nanai";
    console.log(`👗 シェル切り替え: ${shellName}`);

    // サーフィス画像の更新
    const img = document.querySelector("#sakura-placeholder img");
    if (img) {
      img.src = `assets/ghost/${ghostName}/shell/${shellName}/surface0.png`;
      img.onerror = () => {
        img.src = `assets/ghost/${ghostName}/shell/master/surface0.png`;
      };
    }

    // surfaces.txt の再読み込み
    const ghostPath = this.currentGhost?.path || `assets/ghost/${ghostName}`;
    this.app.surfaceManager.loadSurfacesTxt(`${ghostPath}/shell/${shellName}`);

    // SHIORIへの通知
    this.sendShioriEvent("OnShellChanged", [shellName]);
    this.app.showBalloon(`シェルを「${shellName}」に変更しました。`);
    setTimeout(() => this.app.hideBalloon(), 1500);
  }


  async initializeGhostSHIORI(ghost) {
    if (!globalThis.__TAURI__) return;
    try {
      console.log(`🎭 SHIORI初期化開始: ${ghost.name}`);
      await globalThis.__TAURI__.invoke("load_ghost", { ghostName: ghost.name });
      setTimeout(async () => {
        try {
          await this.sendShioriEvent("OnBoot");
        } catch (_error) {
          // OnBoot送信失敗時はスキップ
        }
      }, 1000);
    } catch (error) {
      console.error("❌ SHIORI初期化エラー:", error);
    }
  }

  async sendShioriEvent(eventName, args = []) {
    if (!globalThis.__TAURI__) {
      // モック対話（さくらスクリプトテスト用）
      if (eventName === "OnChoiceSelect") {
        const choiceId = args[0];
        const choiceText = args[1] || choiceId;
        if (choiceId === "Talk") {
          this.triggerRandomTalk();
        } else if (choiceId === "Stroke") {
          this.app.playSakuraScript("\\0\\s0あたまを優しくなでてみてね♪\\e");
        } else {
          this.app.playSakuraScript(`\\0\\s0選択肢「${choiceText}」が選ばれたよ！\\w5\\nありがとう♪\\e`);
        }
      } else if (eventName === "OnMouseClick") {
        const part = args[1];
        const scope = args[2] || 0;
        if (scope === 1) {
          // 1番手（kero）がタップされた場合: sakuraとの掛け合い
          this.app.playSakuraScript("\\1\\s10ボクをつついたな〜！\\w5\\0\\s0ふふ、仲良しだね♪\\e");
        } else if (part === "head") {
          this.app.playSakuraScript("\\0\\s0あたまをなでてくれたの？\\w5\\nえへへ…♪\\e");
        } else if (part === "bust") {
          this.app.playSakuraScript("\\0\\s10ちょ、ちょっと…！\\w5\\nどこ触ってるの…！\\e");
        } else if (part === "skirt") {
          this.app.playSakuraScript("\\0\\s10きゃっ！\\w5\\nめくっちゃダメだよ！\\e");
        } else if (part === "hand") {
          this.app.playSakuraScript("\\0\\s0てをつないでくれるの？\\w5\\nあったかいね。\\e");
        } else {
          this.app.playSakuraScript("\\0\\s0こんにちは！\\w5\\n何かご用事かな？\\w3\\n\\q[お話しする,Talk]\\n\\q[なでる,Stroke]\\e");
        }
      } else if (eventName === "OnMouseMove") {
        const part = args[1];
        const scope = args[2] || 0;
        if (scope === 1) {
          this.app.playSakuraScript("\\1\\s10わわ、くすぐったいぞ！\\w5\\0\\s0楽しそうだね。\\e");
        } else if (part === "head") {
          this.app.playSakuraScript("\\0\\s0ん…なでなで、きもちいい…♪\\e");
        } else if (part === "bust") {
          this.app.playSakuraScript("\\0\\s10触りすぎだよっ、もう…！\\e");
        } else {
          this.app.playSakuraScript("\\0\\s0くすぐったいよ〜！\\e");
        }
      } else if (eventName === "OnUpdate" || eventName === "OnUpdateCheck") {
        this.app.playSakuraScript("\\0\\s0ネットワーク更新を確認中…\\w8\\n\\s0更新ファイルはありませんでした。\\w5最新の状態です♪\\e");
      } else if (eventName === "OnSecondChange") {
        this.triggerRandomTalk();
      } else {
        this.app.playSakuraScript("\\0\\s0こんにちは！\\w5\\n\\q[お話しする,Talk]\\n\\q[なでる,Stroke]\\e");
      }

      return;
    }

    try {
      // SHIORI/3.0 標準リクエストの構築
      const requestText = ShioriProtocol.buildRequest(eventName, args);
      console.log(`📤 送信 SHIORI/3.0 リクエスト:\n${requestText}`);

      // send_shiori_request または send_shiori_event への送信
      let response = "";
      try {
        response = await globalThis.__TAURI__.invoke("send_shiori_request", {
          request: requestText,
        });
      } catch (_e) {
        response = await globalThis.__TAURI__.invoke("send_shiori_event", {
          event: eventName,
        });
      }

      // SHIORI/3.0 レスポンスのパース
      if (response && response.trim()) {
        const parsed = ShioriProtocol.parseResponse(response);
        const script = parsed.value || response;
        if (script.trim()) {
          this.app.playSakuraScript(script);
        } else {
          this.app.playSakuraScript("\\0\\s0……\\e");
        }
      } else {
        this.app.playSakuraScript("\\0\\s0……\\e");
      }
    } catch (_error) {
      this.app.playSakuraScript("\\0\\s0エラーが発生したよ。\\e");
    }
  }

  triggerRandomTalk() {
    const talks = [
      "\\0\\s0今日はいいお天気だね！\\w5\\n何か楽しいことないかな〜。\\e",
      "\\0\\s0ぼーっとしてたら、\\w3少し眠くなっちゃった…\\w8ふぁぁ。\\e",
      "\\0\\s0画面の端っこにいるから、\\w4邪魔なときは端に寄せてね♪\\e",
      "\\0\\s0開発が進むと、\\w3いろんなゴーストさんと交代できるようになるんだって！\\w5楽しみだね。\\e",
      "\\0\\s0\\q[お話しする,Talk]\\n\\q[あたまをなでる,Stroke]\\e",
    ];
    const picked = talks[Math.floor(Math.random() * talks.length)];
    this.app.playSakuraScript(picked);
  }

  updateSurface(surfaceId, scopeId = 0) {
    const ghostName = this.currentGhost?.name || "mock_nanai";
    const selector = scopeId === 1 ? "#kero-placeholder img" : "#sakura-placeholder img";
    const placeholder = scopeId === 1 ? document.getElementById("kero-placeholder") : document.getElementById("sakura-placeholder");
    const container = scopeId === 1 ? document.getElementById("kero-display") : document.getElementById("ghost-display");

    if (scopeId === 0) {
      this.app.surfaceManager.setSurfaceId(surfaceId);
    }

    if (scopeId === 1 && container && container.style.display === "none") {
      container.style.display = "flex";
      // keroをsakuraの少し左下に配置
      const sakuraRect = this.app.elements.ghostDisplay?.getBoundingClientRect();
      if (sakuraRect) {
        container.style.left = `${Math.max(80, sakuraRect.left - 100)}px`;
        container.style.top = `${sakuraRect.top + 60}px`;
      }
    }

    const img = document.querySelector(selector);
    if (!img && placeholder) {
      placeholder.innerHTML = `<img src="assets/ghost/${ghostName}/shell/master/surface${surfaceId}.png" 
                                     alt="scope${scopeId}" 
                                     style="width: 100%; height: 100%; object-fit: contain;">`;
      return;
    }

    if (img) {
      img.src = `assets/ghost/${ghostName}/shell/master/surface${surfaceId}.png`;
      img.onerror = () => {
        img.src = `assets/ghost/${ghostName}/shell/master/surface${scopeId === 1 ? 10 : 0}.png`;
      };
    }
  }

  updateGhostCharacter(ghostName) {
    const sakuraPlaceholder = document.getElementById("sakura-placeholder") || document.querySelector(".character-placeholder");
    if (!sakuraPlaceholder) return;

    if (!ghostName) {
      sakuraPlaceholder.innerHTML = "";
      return;
    }

    sakuraPlaceholder.innerHTML = `<img src="assets/ghost/${ghostName}/shell/master/surface0.png" 
                                   alt="${ghostName}" 
                                   style="width: 100%; height: 100%; object-fit: contain;" 
                                   onerror="console.error('画像読み込みエラー'); this.style.display='none';">`;
    sakuraPlaceholder.title = ghostName || "";
  }

  updateCurrentGhostDisplay() {
    const currentGhostEl = document.getElementById("current-ghost");
    if (currentGhostEl) {
      currentGhostEl.textContent = this.currentGhost ? this.currentGhost.name : "未選択";
    }
  }
}
