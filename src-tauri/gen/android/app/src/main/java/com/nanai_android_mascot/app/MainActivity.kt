package com.nanai_android_mascot.app

import android.Manifest
import android.app.AlertDialog
import android.app.WallpaperManager
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.net.Uri
import android.os.Bundle
import android.os.Build
import android.provider.Settings
import android.view.WindowManager
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import java.io.File
import java.lang.ref.WeakReference

class MainActivity : TauriActivity() {
  private var hasPromptedOverlayThisSession = false
  private var isOverlayDialogShowing = false
  private var isOverlayServiceEnabled = false
  private var isActivityForeground = false

  override fun onCreate(savedInstanceState: Bundle?) {
    extractBundledGhostIfNeeded()
    extractBundledBalloonsIfNeeded()
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    applyOsWallpaperBackground()
    currentActivity = WeakReference(this)
    requestNotificationPermission()
    requestOverlayPermission()
  }

  private fun extractBundledGhostIfNeeded() {
    val targetRoot = File(filesDir, "ghost/mock_nanai")
    if (File(targetRoot, "ghost/master/descript.txt").exists() &&
      File(targetRoot, "shell/master/surfaces.txt").exists()
    ) return
    val assetCandidates = listOf("_up_/assets/ghost/mock_nanai", "assets/ghost/mock_nanai", "ghost/mock_nanai")
    for (assetBase in assetCandidates) {
      val list = try { assets.list(assetBase) } catch (_: Exception) { null }
      if (!list.isNullOrEmpty()) {
        copyAssetDir(assetBase, targetRoot)
        break
      }
    }
  }

  private fun extractBundledBalloonsIfNeeded() {
    val bundledBalloons = listOf("nam", "nam_vertical")
    for (balloonName in bundledBalloons) {
      val targetRoot = File(filesDir, "balloon/$balloonName")
      if (File(targetRoot, "descript.txt").exists()) continue
      val assetCandidates = listOf(
        "_up_/assets/balloon/$balloonName",
        "assets/balloon/$balloonName",
        "balloon/$balloonName"
      )
      for (assetBase in assetCandidates) {
        val list = try { assets.list(assetBase) } catch (_: Exception) { null }
        if (!list.isNullOrEmpty()) {
          copyAssetDir(assetBase, targetRoot)
          break
        }
      }
    }
  }

  private fun copyAssetDir(assetPath: String, destDir: File) {
    val children = assets.list(assetPath) ?: return
    if (children.isEmpty()) {
      destDir.parentFile?.mkdirs()
      assets.open(assetPath).use { input ->
        destDir.outputStream().use { output -> input.copyTo(output) }
      }
      return
    }
    destDir.mkdirs()
    for (child in children) {
      copyAssetDir("$assetPath/$child", File(destDir, child))
    }
  }

  private fun applyOsWallpaperBackground() {
    window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WALLPAPER)
    window.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)
    webView.setBackgroundColor(Color.TRANSPARENT)
    (webView.parent as? android.view.View)?.setBackgroundColor(Color.TRANSPARENT)
    window.decorView.setBackgroundColor(Color.TRANSPARENT)
  }

  override fun onDestroy() {
    if (currentActivity?.get() === this) {
      currentActivity = null
    }
    super.onDestroy()
  }

  override fun onResume() {
    super.onResume()
    currentActivity = WeakReference(this)
    isActivityForeground = true
    handleServiceIntent(intent)
    NanaiForegroundService.getInstance()?.setOverlayVisible(false)
    if (Settings.canDrawOverlays(this)) {
      hasPromptedOverlayThisSession = false
    } else if (!hasPromptedOverlayThisSession) {
      requestOverlayPermission()
    }
  }

  override fun onPause() {
    isActivityForeground = false
    super.onPause()
  }

  override fun onStop() {
    super.onStop()
    if (!isChangingConfigurations && isOverlayServiceEnabled && Settings.canDrawOverlays(this)) {
      NanaiForegroundService.getInstance()?.setOverlayVisible(true)
    }
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    handleServiceIntent(intent)
  }

  private fun handleServiceIntent(intent: Intent) {
    when (intent.action) {
      NanaiForegroundService.ACTION_HIDE -> moveTaskToBack(true)
      NanaiForegroundService.ACTION_SHOW -> {
        window.decorView.visibility = android.view.View.VISIBLE
      }
    }
  }

  private fun requestNotificationPermission() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
      ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) !=
        PackageManager.PERMISSION_GRANTED
    ) {
      AlertDialog.Builder(this)
        .setTitle("通知権限について")
        .setMessage("マスコットをバックグラウンドで安定して常駐させるため、通知の表示権限が必要です。")
        .setPositiveButton("許可する") { _, _ ->
          ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.POST_NOTIFICATIONS),
            NOTIFICATION_PERMISSION_REQUEST_CODE
          )
        }
        .setNegativeButton("あとで", null)
        .show()
    }
  }

  private fun requestOverlayPermission() {
    if (!Settings.canDrawOverlays(this) && !isOverlayDialogShowing) {
      hasPromptedOverlayThisSession = true
      isOverlayDialogShowing = true
      AlertDialog.Builder(this)
        .setTitle("画面最前面表示の権限について")
        .setMessage("マスコットを他のアプリの上に表示するため、「他のアプリの上に重ねて表示」権限が必要です。次の画面で許可してください。")
        .setPositiveButton("設定を開く") { _, _ ->
          isOverlayDialogShowing = false
          startActivity(
            Intent(
              Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
              Uri.parse("package:$packageName")
            )
          )
        }
        .setNegativeButton("あとで") { _, _ ->
          isOverlayDialogShowing = false
        }
        .setOnCancelListener {
          isOverlayDialogShowing = false
        }
        .show()
    }
  }

  fun setupForegroundService(enabled: Boolean) {
    isOverlayServiceEnabled = enabled
    val canDraw = Settings.canDrawOverlays(this)
    android.util.Log.i(
      "NanaiOverlay",
      "setupForegroundService(enabled=$enabled, canDraw=$canDraw, fg=$isActivityForeground)"
    )
    runOnUiThread {
      val serviceIntent = Intent(this, NanaiForegroundService::class.java)
      if (enabled && canDraw) {
        serviceIntent.action = NanaiForegroundService.ACTION_SHOW_OVERLAY
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          startForegroundService(serviceIntent)
        } else {
          startService(serviceIntent)
        }
        if (isActivityForeground) {
          moveTaskToBack(true)
        } else {
          NanaiForegroundService.getInstance()?.setOverlayVisible(true)
        }
      } else if (!enabled) {
        stopService(serviceIntent)
        if (!isActivityForeground) {
          val showMain = Intent(this, MainActivity::class.java).apply {
            action = NanaiForegroundService.ACTION_SHOW
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
          }
          startActivity(showMain)
        }
      }
    }
  }

  fun setOverlayTransparency(alpha: Float) {
    val clamped = alpha.coerceIn(0.0f, 1.0f)
    runOnUiThread {
      val params = window.attributes
      params.alpha = clamped
      window.attributes = params
    }
  }

  fun setClickThrough(enabled: Boolean) {
    runOnUiThread {
      if (enabled) {
        window.addFlags(WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE)
      } else {
        window.clearFlags(WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE)
      }
    }
  }

  fun resizeOverlayWindow(width: Int, height: Int) {
    if (width <= 0 || height <= 0) return
    runOnUiThread {
      window.setLayout(width, height)
    }
  }

  override fun onTrimMemory(level: Int) {
    super.onTrimMemory(level)
  }

  companion object {
    private const val NOTIFICATION_PERMISSION_REQUEST_CODE = 1001
    private var currentActivity: WeakReference<MainActivity>? = null

    @JvmStatic
    fun getInstance(): MainActivity? = currentActivity?.get()

    @JvmStatic
    fun canDrawOverlays(): Boolean {
      val activity = getInstance() ?: return false
      return Settings.canDrawOverlays(activity)
    }

    @JvmStatic
    fun openOverlayPermissionSettings() {
      val activity = getInstance() ?: return
      activity.runOnUiThread {
        activity.startActivity(
          Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:${activity.packageName}")
          )
        )
      }
    }

    @JvmStatic
    fun applyOverlayTransparency(alpha: Float) {
      NanaiForegroundService.getInstance()?.updateOverlayTransparency(alpha)
    }

    @JvmStatic
    fun applyClickThrough(enabled: Boolean) {
      NanaiForegroundService.getInstance()?.updateClickThrough(enabled)
    }

    @JvmStatic
    fun applyResizeOverlayWindow(width: Int, height: Int) {
      NanaiForegroundService.getInstance()?.updateOverlaySize(width, height)
    }

    @JvmStatic
    fun applyForegroundService(enabled: Boolean) {
      getInstance()?.setupForegroundService(enabled)
    }
  }
}
