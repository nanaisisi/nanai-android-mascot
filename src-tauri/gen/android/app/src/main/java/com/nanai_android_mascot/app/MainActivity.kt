package com.nanai_android_mascot.app

import android.Manifest
import android.app.AlertDialog
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
import java.lang.ref.WeakReference

class MainActivity : TauriActivity() {
  private var hasPromptedOverlayThisSession = false
  private var isOverlayDialogShowing = false

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    window.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
    currentActivity = WeakReference(this)
    requestNotificationPermission()
    requestOverlayPermission()
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
    handleServiceIntent(intent)
    if (Settings.canDrawOverlays(this)) {
      hasPromptedOverlayThisSession = false
      val intent = Intent(this, NanaiForegroundService::class.java)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        startForegroundService(intent)
      } else {
        startService(intent)
      }
    } else if (!hasPromptedOverlayThisSession) {
      requestOverlayPermission()
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
    val serviceIntent = Intent(this, NanaiForegroundService::class.java)
    if (enabled && Settings.canDrawOverlays(this)) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        startForegroundService(serviceIntent)
      } else {
        startService(serviceIntent)
      }
    } else if (!enabled) {
      stopService(serviceIntent)
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
    fun applyOverlayTransparency(alpha: Float) {
      getInstance()?.setOverlayTransparency(alpha)
      NanaiForegroundService.getInstance()?.updateOverlayTransparency(alpha)
    }

    @JvmStatic
    fun applyClickThrough(enabled: Boolean) {
      getInstance()?.setClickThrough(enabled)
      NanaiForegroundService.getInstance()?.updateClickThrough(enabled)
    }

    @JvmStatic
    fun applyResizeOverlayWindow(width: Int, height: Int) {
      getInstance()?.resizeOverlayWindow(width, height)
      NanaiForegroundService.getInstance()?.updateOverlaySize(width, height)
    }

    @JvmStatic
    fun applyForegroundService(enabled: Boolean) {
      getInstance()?.setupForegroundService(enabled)
    }
  }
}
