package com.nanai_android_mascot.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.provider.Settings
import android.view.Gravity
import android.view.WindowManager
import android.webkit.WebView
import androidx.core.app.NotificationCompat

class NanaiForegroundService : Service() {
  private var windowManager: WindowManager? = null
  private var overlayWebView: WebView? = null
  private var overlayParams: WindowManager.LayoutParams? = null

  override fun onCreate() {
    super.onCreate()
    instance = this
    createNotificationChannel()
    startForeground(NOTIFICATION_ID, buildNotification())
    ensureOverlayWindow()
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_STOP) {
      removeOverlayWindow()
      stopForeground(STOP_FOREGROUND_REMOVE)
      stopSelf()
      return START_NOT_STICKY
    }
    ensureOverlayWindow()
    return START_STICKY
  }

  override fun onDestroy() {
    removeOverlayWindow()
    if (instance === this) {
      instance = null
    }
    super.onDestroy()
  }

  private fun ensureOverlayWindow() {
    if (overlayWebView != null || !Settings.canDrawOverlays(this)) return
    val wm = getSystemService(WINDOW_SERVICE) as? WindowManager ?: return
    val overlayType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
    } else {
      @Suppress("DEPRECATION")
      WindowManager.LayoutParams.TYPE_PHONE
    }
    val params = WindowManager.LayoutParams(
      WindowManager.LayoutParams.MATCH_PARENT,
      WindowManager.LayoutParams.MATCH_PARENT,
      overlayType,
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
        WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE or
        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
      PixelFormat.TRANSLUCENT
    ).apply {
      gravity = Gravity.TOP or Gravity.START
    }
    val webView = WebView(this).apply {
      setBackgroundColor(Color.TRANSPARENT)
      settings.javaScriptEnabled = true
    }
    wm.addView(webView, params)
    windowManager = wm
    overlayWebView = webView
    overlayParams = params
  }

  private fun removeOverlayWindow() {
    val wm = windowManager
    val view = overlayWebView
    if (wm != null && view != null) {
      try {
        wm.removeView(view)
      } catch (_: IllegalArgumentException) {
      }
      view.destroy()
    }
    overlayWebView = null
    overlayParams = null
    windowManager = null
  }

  fun updateOverlayTransparency(alpha: Float) {
    val wm = windowManager ?: return
    val view = overlayWebView ?: return
    val params = overlayParams ?: return
    params.alpha = alpha.coerceIn(0.0f, 1.0f)
    wm.updateViewLayout(view, params)
  }

  fun updateClickThrough(enabled: Boolean) {
    val wm = windowManager ?: return
    val view = overlayWebView ?: return
    val params = overlayParams ?: return
    params.flags = if (enabled) {
      params.flags or WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
    } else {
      params.flags and WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE.inv()
    }
    wm.updateViewLayout(view, params)
  }

  fun updateOverlaySize(width: Int, height: Int) {
    if (width <= 0 || height <= 0) return
    val wm = windowManager ?: return
    val view = overlayWebView ?: return
    val params = overlayParams ?: return
    params.width = width
    params.height = height
    wm.updateViewLayout(view, params)
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun buildNotification(): Notification {
    val showIntent = Intent(this, MainActivity::class.java)
      .setAction(ACTION_SHOW)
      .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    val contentIntent = PendingIntent.getActivity(
      this,
      0,
      showIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or pendingIntentImmutableFlag()
    )
    val hideIntent = PendingIntent.getActivity(
      this,
      2,
      Intent(this, MainActivity::class.java)
        .setAction(ACTION_HIDE)
        .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP),
      PendingIntent.FLAG_UPDATE_CURRENT or pendingIntentImmutableFlag()
    )
    val stopIntent = PendingIntent.getService(
      this,
      1,
      Intent(this, NanaiForegroundService::class.java).setAction(ACTION_STOP),
      PendingIntent.FLAG_UPDATE_CURRENT or pendingIntentImmutableFlag()
    )

    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_dialog_info)
      .setContentTitle("Nanai Android Mascot が常駐中")
      .setContentText("ゴースト: ナナイ (タップでメニュー表示)")
      .setContentIntent(contentIntent)
      .setOngoing(true)
      .addAction(android.R.drawable.ic_menu_view, "表示", contentIntent)
      .addAction(android.R.drawable.ic_menu_close_clear_cancel, "隠す", hideIntent)
      .addAction(android.R.drawable.ic_menu_close_clear_cancel, "終了", stopIntent)
      .build()
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        CHANNEL_ID,
        "Nanai Android Mascot 常駐サービス",
        NotificationManager.IMPORTANCE_LOW
      )
      getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }
  }

  private fun pendingIntentImmutableFlag(): Int =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0

  companion object {
    @Volatile
    private var instance: NanaiForegroundService? = null

    fun getInstance(): NanaiForegroundService? = instance

    const val ACTION_HIDE = "com.nanai_android_mascot.app.HIDE"
    const val ACTION_SHOW = "com.nanai_android_mascot.app.SHOW"
    private const val CHANNEL_ID = "nanai_mascot_service"
    private const val NOTIFICATION_ID = 1001
    private const val ACTION_STOP = "com.nanai_android_mascot.app.STOP_SERVICE"
  }
}
