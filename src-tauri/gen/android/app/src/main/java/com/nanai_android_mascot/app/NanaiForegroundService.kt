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
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.provider.Settings
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.core.app.NotificationCompat
import androidx.webkit.WebViewAssetLoader
import java.io.ByteArrayInputStream
import org.json.JSONObject

class NanaiForegroundService : Service() {
  private val mainHandler = Handler(Looper.getMainLooper())
  private var windowManager: WindowManager? = null
  private var overlayWebView: WebView? = null
  private var overlayParams: WindowManager.LayoutParams? = null
  private var assetLoader: WebViewAssetLoader? = null
  private val menuSlot = PopupOverlaySlot("https://appassets.androidplatform.net/menu-iframe.html?overlay=1")
  private val submenuSlot = PopupOverlaySlot("https://appassets.androidplatform.net/submenu-iframe.html?overlay=1")
  private val subcharSlots = mutableMapOf<Int, PopupOverlaySlot>()
  private val balloonSlots = mutableMapOf<Int, PopupOverlaySlot>()
  private var isClickThrough = false
  private var isOverlayVisible = false

  override fun onCreate() {
    super.onCreate()
    instance = this
    createNotificationChannel()
    startForeground(NOTIFICATION_ID, buildNotification())
    ensureOverlayWindow()
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_STOP -> {
        removeOverlayWindow()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
        return START_NOT_STICKY
      }
      ACTION_SHOW_OVERLAY -> {
        setOverlayVisible(true)
        return START_STICKY
      }
      ACTION_TOGGLE_CLICK_THROUGH -> {
        updateClickThrough(!isClickThrough)
        val nm = getSystemService(NotificationManager::class.java)
        nm.notify(NOTIFICATION_ID, buildNotification())
        return START_STICKY
      }
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
    mainHandler.post {
      if (overlayWebView != null || !Settings.canDrawOverlays(this)) return@post
      val wm = getSystemService(WINDOW_SERVICE) as? WindowManager ?: return@post
      val density = resources.displayMetrics.density
      val screenW = resources.displayMetrics.widthPixels
      val screenH = resources.displayMetrics.heightPixels
      val initialW = (180 * density).toInt().coerceAtMost((screenW * 0.75f).toInt())
      val initialH = (320 * density).toInt().coerceAtMost((screenH * 0.75f).toInt())
      val marginX = (12 * density).toInt()
      val marginY = (48 * density).toInt()

      val overlayType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
      } else {
        @Suppress("DEPRECATION")
        WindowManager.LayoutParams.TYPE_PHONE
      }
      val params = WindowManager.LayoutParams(
        initialW,
        initialH,
        overlayType,
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
          WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
        PixelFormat.TRANSLUCENT
      ).apply {
        gravity = Gravity.TOP or Gravity.START
        x = (screenW - initialW - marginX).coerceAtLeast(0)
        y = (screenH - initialH - marginY).coerceAtLeast(0)
      }

      val loader = WebViewAssetLoader.Builder()
        .setDomain("appassets.androidplatform.net")
        .addPathHandler("/", WebViewAssetLoader.AssetsPathHandler(this))
        .build()
      assetLoader = loader

      val webView = createOverlayWebView(
        url = "https://appassets.androidplatform.net/index.html?overlay=1",
        loader = loader,
        viewProvider = { overlayWebView },
        paramsProvider = { overlayParams }
      ).apply {
        visibility = if (isOverlayVisible) View.VISIBLE else View.GONE
      }
      wm.addView(webView, params)
      windowManager = wm
      overlayWebView = webView
      overlayParams = params
    }
  }

  fun setOverlayVisible(visible: Boolean) {
    isOverlayVisible = visible
    Log.i("NanaiOverlay", "setOverlayVisible($visible), hasView=${overlayWebView != null}")
    mainHandler.post {
      if (visible) {
        ensureOverlayWindow()
        overlayWebView?.let {
          it.visibility = View.VISIBLE
          evalOverlayEvent(it, "overlay-sync-ghost", "{}")
        }
      } else {
        overlayWebView?.visibility = View.GONE
        hidePopupSlot(menuSlot)
        hidePopupSlot(submenuSlot)
        subcharSlots.values.forEach { hidePopupSlot(it) }
        balloonSlots.values.forEach { hidePopupSlot(it) }
      }
    }
  }

  private fun overlayWindowType(): Int =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
    } else {
      @Suppress("DEPRECATION")
      WindowManager.LayoutParams.TYPE_PHONE
    }

  private fun createOverlayWebView(
    url: String,
    loader: WebViewAssetLoader,
    viewProvider: () -> WebView?,
    paramsProvider: () -> WindowManager.LayoutParams?,
    onPageLoaded: ((WebView) -> Unit)? = null,
  ): WebView {
    return WebView(this).apply {
      setBackgroundColor(Color.TRANSPARENT)
      settings.javaScriptEnabled = true
      settings.domStorageEnabled = true
      settings.allowFileAccess = false
      webChromeClient = object : WebChromeClient() {
        override fun onConsoleMessage(consoleMessage: ConsoleMessage): Boolean {
          Log.i(
            "NanaiOverlay",
            "[WebView ${consoleMessage.messageLevel()}] ${consoleMessage.message()} (${consoleMessage.sourceId()}:${consoleMessage.lineNumber()})"
          )
          return true
        }
      }
      webViewClient = object : WebViewClient() {
        override fun shouldInterceptRequest(
          view: WebView,
          request: WebResourceRequest
        ): WebResourceResponse? {
          val url = request.url
          if (url.host == "appassets.androidplatform.net") {
            val reqPath = url.encodedPath ?: "/"
            val bytes = nativeOverlayLoadAsset(reqPath)
            if (bytes != null) {
              val mime = guessMimeType(reqPath)
              val headers = mapOf("Access-Control-Allow-Origin" to "*")
              return WebResourceResponse(
                mime,
                "UTF-8",
                200,
                "OK",
                headers,
                ByteArrayInputStream(bytes)
              )
            }
          }
          return loader.shouldInterceptRequest(url)
        }

        override fun onReceivedError(
          view: WebView,
          request: WebResourceRequest,
          error: WebResourceError
        ) {
          super.onReceivedError(view, request, error)
          Log.e("NanaiOverlay", "WebView error on ${request.url}: ${error.description}")
        }

        override fun onPageFinished(view: WebView, loadedUrl: String?) {
          super.onPageFinished(view, loadedUrl)
          onPageLoaded?.invoke(view)
        }
      }
      addJavascriptInterface(
        OverlayJsBridge(this@NanaiForegroundService, viewProvider, paramsProvider),
        "__NANAI_OVERLAY_IPC__"
      )
      loadUrl(url)
    }
  }

  private fun removeOverlayWindow() {
    val wm = windowManager
    val view = overlayWebView
    overlayWebView = null
    overlayParams = null
    windowManager = null
    assetLoader = null
    mainHandler.post {
      if (wm != null) {
        menuSlot.destroy(wm)
        submenuSlot.destroy(wm)
        subcharSlots.values.forEach { it.destroy(wm) }
        subcharSlots.clear()
        balloonSlots.values.forEach { it.destroy(wm) }
        balloonSlots.clear()
        if (view != null) {
          try {
            wm.removeView(view)
          } catch (_: IllegalArgumentException) {
          }
          view.destroy()
        }
      }
    }
  }

  fun updateOverlayTransparency(alpha: Float) {
    mainHandler.post {
      val wm = windowManager ?: return@post
      val view = overlayWebView ?: return@post
      val params = overlayParams ?: return@post
      val clamped = if (isClickThrough && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        alpha.coerceIn(0.0f, 0.8f)
      } else {
        alpha.coerceIn(0.0f, 1.0f)
      }
      params.alpha = clamped
      wm.updateViewLayout(view, params)
    }
  }

  fun updateClickThrough(enabled: Boolean) {
    isClickThrough = enabled
    mainHandler.post {
      val wm = windowManager ?: return@post
      val view = overlayWebView ?: return@post
      val params = overlayParams ?: return@post
      params.flags = if (enabled) {
        params.flags or WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
      } else {
        params.flags and WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE.inv()
      }
      if (enabled && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && params.alpha > 0.8f) {
        params.alpha = 0.8f
      }
      wm.updateViewLayout(view, params)
    }
  }

  fun updateOverlaySize(width: Int, height: Int) {
    if (width <= 0 || height <= 0) return
    mainHandler.post {
      val wm = windowManager ?: return@post
      val view = overlayWebView ?: return@post
      val params = overlayParams ?: return@post
      val density = resources.displayMetrics.density
      val screenW = resources.displayMetrics.widthPixels
      val screenH = resources.displayMetrics.heightPixels
      params.width = (width * density).toInt().coerceIn((120 * density).toInt(), screenW)
      params.height = (height * density).toInt().coerceIn((160 * density).toInt(), screenH)
      params.x = params.x.coerceIn(0, (screenW - params.width).coerceAtLeast(0))
      params.y = params.y.coerceIn(0, (screenH - params.height).coerceAtLeast(0))
      wm.updateViewLayout(view, params)
    }
  }

  fun moveSlotBy(view: WebView?, params: WindowManager.LayoutParams?, dxDp: Float, dyDp: Float) {
    val targetView = view ?: return
    val targetParams = params ?: return
    mainHandler.post {
      val wm = windowManager ?: return@post
      val density = resources.displayMetrics.density
      val screenW = resources.displayMetrics.widthPixels
      val screenH = resources.displayMetrics.heightPixels
      val dx = (dxDp * density).toInt()
      val dy = (dyDp * density).toInt()
      targetParams.x = (targetParams.x + dx).coerceIn(0, (screenW - targetParams.width).coerceAtLeast(0))
      targetParams.y = (targetParams.y + dy).coerceIn(0, (screenH - targetParams.height).coerceAtLeast(0))
      wm.updateViewLayout(targetView, targetParams)
    }
  }

  fun moveOverlayBy(dxDp: Float, dyDp: Float) {
    moveSlotBy(overlayWebView, overlayParams, dxDp, dyDp)
  }

  fun getPositionJson(params: WindowManager.LayoutParams?): String {
    val p = params ?: return """{"x":0,"y":0}"""
    val density = resources.displayMetrics.density
    val xDp = if (density > 0f) p.x / density else p.x.toFloat()
    val yDp = if (density > 0f) p.y / density else p.y.toFloat()
    return """{"x":${xDp.toInt()},"y":${yDp.toInt()}}"""
  }

  private fun clampPopupRect(
    xDp: Double,
    yDp: Double,
    widthDp: Double,
    heightDp: Double,
    flipUpOnBottomOverflow: Boolean,
  ): IntArray {
    val density = resources.displayMetrics.density
    val screenW = resources.displayMetrics.widthPixels
    val screenH = resources.displayMetrics.heightPixels
    val wPx = (widthDp * density).toInt().coerceIn((120 * density).toInt(), screenW)
    val hPx = (heightDp * density).toInt().coerceIn((80 * density).toInt(), (screenH * 0.9f).toInt())
    var xPx = (xDp * density).toInt()
    var yPx = (yDp * density).toInt()
    val marginPx = (8 * density).toInt()

    if (xPx + wPx > screenW - marginPx) {
      xPx = (screenW - wPx - marginPx).coerceAtLeast(marginPx)
    } else {
      xPx = xPx.coerceAtLeast(marginPx)
    }

    val safeBottom = screenH - (48 * density).toInt()
    if (flipUpOnBottomOverflow && yPx + hPx > safeBottom) {
      yPx = (yPx - hPx).coerceAtLeast(marginPx)
    }
    yPx = yPx.coerceIn(marginPx, (screenH - hPx - marginPx).coerceAtLeast(marginPx))
    return intArrayOf(xPx, yPx, wPx, hPx)
  }

  private fun showPopupSlot(
    slot: PopupOverlaySlot,
    xDp: Double,
    yDp: Double,
    widthDp: Double,
    heightDp: Double,
    flipUpOnBottomOverflow: Boolean,
    pendingEventName: String,
    pendingPayloadJson: String,
  ) {
    mainHandler.post {
      val wm = windowManager ?: return@post
      val loader = assetLoader ?: return@post
      val rect = clampPopupRect(xDp, yDp, widthDp, heightDp, flipUpOnBottomOverflow)
      slot.pendingInitEvent = pendingEventName to pendingPayloadJson

      val existingView = slot.webView
      val existingParams = slot.params
      if (existingView != null && existingParams != null) {
        existingParams.x = rect[0]
        existingParams.y = rect[1]
        existingParams.width = rect[2]
        existingParams.height = rect[3]
        existingView.visibility = View.VISIBLE
        wm.updateViewLayout(existingView, existingParams)
        if (slot.isLoaded) {
          evalOverlayEvent(existingView, pendingEventName, pendingPayloadJson)
        }
        return@post
      }

      val params = WindowManager.LayoutParams(
        rect[2],
        rect[3],
        overlayWindowType(),
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
          WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
        PixelFormat.TRANSLUCENT
      ).apply {
        gravity = Gravity.TOP or Gravity.START
        x = rect[0]
        y = rect[1]
      }
      val webView = createOverlayWebView(
        url = slot.url,
        loader = loader,
        viewProvider = { slot.webView },
        paramsProvider = { slot.params },
        onPageLoaded = { view ->
          slot.isLoaded = true
          slot.pendingInitEvent?.let { (ev, payload) ->
            evalOverlayEvent(view, ev, payload)
          }
        }
      )
      slot.params = params
      slot.webView = webView
      wm.addView(webView, params)
    }
  }

  private fun hidePopupSlot(slot: PopupOverlaySlot) {
    mainHandler.post {
      slot.webView?.visibility = View.GONE
    }
  }

  private fun resizePopupSlot(slot: PopupOverlaySlot, widthDp: Double, heightDp: Double) {
    if (widthDp <= 0.0 || heightDp <= 0.0) return
    mainHandler.post {
      val wm = windowManager ?: return@post
      val view = slot.webView ?: return@post
      val params = slot.params ?: return@post
      val density = resources.displayMetrics.density
      val xDp = if (density > 0f) params.x / density.toDouble() else params.x.toDouble()
      val yDp = if (density > 0f) params.y / density.toDouble() else params.y.toDouble()
      val rect = clampPopupRect(xDp, yDp, widthDp, heightDp, flipUpOnBottomOverflow = false)
      params.x = rect[0]
      params.y = rect[1]
      params.width = rect[2]
      params.height = rect[3]
      wm.updateViewLayout(view, params)
    }
  }

  fun showMenuOverlay(xDp: Double, yDp: Double, scope: Int) {
    val density = resources.displayMetrics.density
    val existingW = menuSlot.params?.width?.let {
      val logical = if (density > 0f) it / density.toDouble() else 220.0
      if (logical in 150.0..380.0) logical else null
    } ?: 220.0
    val heightDp = if (scope > 0) 220.0 else 460.0
    showPopupSlot(
      slot = menuSlot,
      xDp = xDp,
      yDp = yDp,
      widthDp = existingW,
      heightDp = heightDp,
      flipUpOnBottomOverflow = true,
      pendingEventName = "sync-menu-scope",
      pendingPayloadJson = scope.toString(),
    )
  }

  fun hideMenuOverlay() {
    hidePopupSlot(menuSlot)
    hidePopupSlot(submenuSlot)
  }

  fun resizeMenuOverlay(widthDp: Double, heightDp: Double) {
    resizePopupSlot(menuSlot, widthDp, heightDp)
  }

  fun showSubmenuOverlay(
    menuType: String,
    xDp: Double,
    yDp: Double,
    widthDp: Double,
    heightDp: Double,
  ) {
    val payload = JSONObject().put("type", menuType).toString()
    showPopupSlot(
      slot = submenuSlot,
      xDp = xDp,
      yDp = yDp,
      widthDp = widthDp,
      heightDp = heightDp,
      flipUpOnBottomOverflow = false,
      pendingEventName = "set-submenu-type",
      pendingPayloadJson = payload,
    )
  }

  fun hideSubmenuOverlay() {
    hidePopupSlot(submenuSlot)
  }

  fun resizeSubmenuOverlay(widthDp: Double, heightDp: Double) {
    resizePopupSlot(submenuSlot, widthDp, heightDp)
  }

  private fun anchorForScopeDp(scopeId: Int): Pair<Double, Double> {
    val density = resources.displayMetrics.density.takeIf { it > 0f } ?: 1f
    val targetParams = if (scopeId == 0) overlayParams else subcharSlots[scopeId]?.params
    if (targetParams != null) {
      return (targetParams.x / density.toDouble()) to (targetParams.y / density.toDouble())
    }
    val screenW = resources.displayMetrics.widthPixels / density.toDouble()
    val screenH = resources.displayMetrics.heightPixels / density.toDouble()
    return (screenW - 220.0).coerceAtLeast(16.0) to (screenH - 360.0).coerceAtLeast(48.0)
  }

  fun showBalloonOverlay(
    scopeId: Int,
    payloadJson: String,
    widthDp: Double,
    heightDp: Double,
  ) {
    mainHandler.post {
      val slot = balloonSlots.getOrPut(scopeId) {
        PopupOverlaySlot("https://appassets.androidplatform.net/balloon.html?scope=$scopeId&overlay=1")
      }
      val (anchorX, anchorY) = anchorForScopeDp(scopeId)
      val w = if (widthDp > 0.0) widthDp else 240.0
      val h = if (heightDp > 0.0) heightDp else 140.0
      val xDp = slot.params?.let {
        val d = resources.displayMetrics.density.takeIf { d0 -> d0 > 0f } ?: 1f
        it.x / d.toDouble()
      } ?: (anchorX - w - 8.0).coerceAtLeast(8.0)
      val yDp = slot.params?.let {
        val d = resources.displayMetrics.density.takeIf { d0 -> d0 > 0f } ?: 1f
        it.y / d.toDouble()
      } ?: (anchorY - h - 8.0).coerceAtLeast(24.0)
      showPopupSlot(
        slot = slot,
        xDp = xDp,
        yDp = yDp,
        widthDp = w,
        heightDp = h,
        flipUpOnBottomOverflow = false,
        pendingEventName = "balloon-update",
        pendingPayloadJson = payloadJson,
      )
    }
  }

  fun hideBalloonOverlay(scopeId: Int) {
    balloonSlots[scopeId]?.let { hidePopupSlot(it) }
  }

  fun resizeBalloonOverlay(scopeId: Int, widthDp: Double, heightDp: Double) {
    balloonSlots[scopeId]?.let { resizePopupSlot(it, widthDp, heightDp) }
  }

  fun showSubcharOverlay(scopeId: Int, widthDp: Double, heightDp: Double) {
    if (scopeId == 0) {
      if (widthDp > 0.0 && heightDp > 0.0) {
        updateOverlaySize(widthDp.toInt(), heightDp.toInt())
      }
      return
    }
    mainHandler.post {
      val slot = subcharSlots.getOrPut(scopeId) {
        PopupOverlaySlot("https://appassets.androidplatform.net/character.html?scope=$scopeId&overlay=1")
      }
      val (mainX, mainY) = anchorForScopeDp(0)
      val w = if (widthDp > 0.0) widthDp else 140.0
      val h = if (heightDp > 0.0) heightDp else 260.0
      val d = resources.displayMetrics.density.takeIf { d0 -> d0 > 0f } ?: 1f
      val xDp = slot.params?.let { it.x / d.toDouble() } ?: (mainX - w * scopeId - 8.0).coerceAtLeast(8.0)
      val yDp = slot.params?.let { it.y / d.toDouble() } ?: mainY
      val syncPayload = JSONObject().put("scopeId", scopeId).toString()
      showPopupSlot(
        slot = slot,
        xDp = xDp,
        yDp = yDp,
        widthDp = w,
        heightDp = h,
        flipUpOnBottomOverflow = false,
        pendingEventName = "subchar-init",
        pendingPayloadJson = syncPayload,
      )
    }
  }

  fun hideSubcharOverlay(scopeId: Int) {
    if (scopeId == 0) return
    subcharSlots[scopeId]?.let { hidePopupSlot(it) }
  }

  private fun allOverlayViews(): List<WebView> =
    listOfNotNull(overlayWebView, menuSlot.webView, submenuSlot.webView) +
      subcharSlots.values.mapNotNull { it.webView } +
      balloonSlots.values.mapNotNull { it.webView }

  private fun evalOverlayEvent(view: WebView, eventName: String, payloadJson: String) {
    val eventLit = JSONObject.quote(eventName)
    val payloadLit = JSONObject.quote(payloadJson)
    view.evaluateJavascript(
      "window.__NANAI_OVERLAY_EVENT_DISPATCH__ && window.__NANAI_OVERLAY_EVENT_DISPATCH__($eventLit, $payloadLit);",
      null
    )
  }

  fun dispatchOverlayEvent(eventName: String, payloadJson: String) {
    mainHandler.post {
      allOverlayViews().forEach { view ->
        evalOverlayEvent(view, eventName, payloadJson)
      }
    }
  }

  fun dispatchOverlayIpcResult(reqId: String, ok: Boolean, payloadJson: String) {
    val reqLit = JSONObject.quote(reqId)
    val payloadLit = JSONObject.quote(payloadJson)
    mainHandler.post {
      allOverlayViews().forEach { view ->
        view.evaluateJavascript(
          "window.__NANAI_OVERLAY_IPC_RESOLVE__ && window.__NANAI_OVERLAY_IPC_RESOLVE__($reqLit, $ok, $payloadLit);",
          null
        )
      }
    }
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
    val toggleTouchIntent = PendingIntent.getService(
      this,
      3,
      Intent(this, NanaiForegroundService::class.java).setAction(ACTION_TOGGLE_CLICK_THROUGH),
      PendingIntent.FLAG_UPDATE_CURRENT or pendingIntentImmutableFlag()
    )
    val stopIntent = PendingIntent.getService(
      this,
      1,
      Intent(this, NanaiForegroundService::class.java).setAction(ACTION_STOP),
      PendingIntent.FLAG_UPDATE_CURRENT or pendingIntentImmutableFlag()
    )

    val touchLabel = if (isClickThrough) "操作を有効化" else "タッチ透過"
    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_dialog_info)
      .setContentTitle("Nanai Android Mascot が常駐中")
      .setContentText("オーバーレイ表示稼働中 (タップで管理画面を開く)")
      .setContentIntent(contentIntent)
      .setOngoing(true)
      .setAutoCancel(false)
      .setOnlyAlertOnce(true)
      .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
      .addAction(android.R.drawable.ic_menu_view, "管理画面", contentIntent)
      .addAction(android.R.drawable.ic_menu_compass, touchLabel, toggleTouchIntent)
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

  private class PopupOverlaySlot(val url: String) {
    var webView: WebView? = null
    var params: WindowManager.LayoutParams? = null
    var isLoaded: Boolean = false
    var pendingInitEvent: Pair<String, String>? = null

    fun destroy(wm: WindowManager) {
      val view = webView
      webView = null
      params = null
      isLoaded = false
      pendingInitEvent = null
      if (view != null) {
        try {
          wm.removeView(view)
        } catch (_: IllegalArgumentException) {
        }
        view.destroy()
      }
    }
  }

  private class OverlayJsBridge(
    private val service: NanaiForegroundService,
    private val viewProvider: () -> WebView?,
    private val paramsProvider: () -> WindowManager.LayoutParams?,
  ) {
    @JavascriptInterface
    fun invoke(reqId: String, cmd: String, argsJson: String) {
      nativeOverlayInvoke(reqId, cmd, argsJson)
    }

    @JavascriptInterface
    fun emitEvent(eventName: String, payloadJson: String) {
      service.dispatchOverlayEvent(eventName, payloadJson)
    }

    @JavascriptInterface
    fun moveWindowBy(dx: Float, dy: Float) {
      service.moveSlotBy(viewProvider(), paramsProvider(), dx, dy)
    }

    @JavascriptInterface
    fun getWindowPosition(): String {
      return service.getPositionJson(paramsProvider())
    }
  }

  companion object {
    @Volatile
    private var instance: NanaiForegroundService? = null

    fun getInstance(): NanaiForegroundService? = instance

    @JvmStatic
    fun resolveOverlayIpc(reqId: String, ok: Boolean, payloadJson: String) {
      instance?.dispatchOverlayIpcResult(reqId, ok, payloadJson)
    }

    @JvmStatic
    fun showMenuFromNative(x: Double, y: Double, scope: Int) {
      instance?.showMenuOverlay(x, y, scope)
    }

    @JvmStatic
    fun hideMenuFromNative() {
      instance?.hideMenuOverlay()
    }

    @JvmStatic
    fun resizeMenuFromNative(width: Double, height: Double) {
      instance?.resizeMenuOverlay(width, height)
    }

    @JvmStatic
    fun showSubmenuFromNative(menuType: String, x: Double, y: Double, width: Double, height: Double) {
      instance?.showSubmenuOverlay(menuType, x, y, width, height)
    }

    @JvmStatic
    fun hideSubmenuFromNative() {
      instance?.hideSubmenuOverlay()
    }

    @JvmStatic
    fun resizeSubmenuFromNative(width: Double, height: Double) {
      instance?.resizeSubmenuOverlay(width, height)
    }

    @JvmStatic
    fun showBalloonFromNative(scopeId: Int, payloadJson: String, width: Double, height: Double) {
      instance?.showBalloonOverlay(scopeId, payloadJson, width, height)
    }

    @JvmStatic
    fun hideBalloonFromNative(scopeId: Int) {
      instance?.hideBalloonOverlay(scopeId)
    }

    @JvmStatic
    fun resizeBalloonFromNative(scopeId: Int, width: Double, height: Double) {
      instance?.resizeBalloonOverlay(scopeId, width, height)
    }

    @JvmStatic
    fun showSubcharFromNative(scopeId: Int, width: Double, height: Double) {
      instance?.showSubcharOverlay(scopeId, width, height)
    }

    @JvmStatic
    fun hideSubcharFromNative(scopeId: Int) {
      instance?.hideSubcharOverlay(scopeId)
    }

    @JvmStatic
    private external fun nativeOverlayInvoke(reqId: String, cmd: String, argsJson: String)

    @JvmStatic
    private external fun nativeOverlayLoadAsset(path: String): ByteArray?

    private fun guessMimeType(path: String): String {
      val clean = path.substringBefore('?').substringBefore('#').lowercase()
      return when {
        clean.endsWith(".html") || clean == "/" || clean.isEmpty() -> "text/html"
        clean.endsWith(".js") || clean.endsWith(".mjs") -> "application/javascript"
        clean.endsWith(".css") -> "text/css"
        clean.endsWith(".wasm") -> "application/wasm"
        clean.endsWith(".json") -> "application/json"
        clean.endsWith(".svg") -> "image/svg+xml"
        clean.endsWith(".png") -> "image/png"
        clean.endsWith(".jpg") || clean.endsWith(".jpeg") -> "image/jpeg"
        clean.endsWith(".webp") -> "image/webp"
        else -> "application/octet-stream"
      }
    }

    const val ACTION_HIDE = "com.nanai_android_mascot.app.HIDE"
    const val ACTION_SHOW = "com.nanai_android_mascot.app.SHOW"
    const val ACTION_SHOW_OVERLAY = "com.nanai_android_mascot.app.SHOW_OVERLAY"
    private const val ACTION_TOGGLE_CLICK_THROUGH = "com.nanai_android_mascot.app.TOGGLE_CLICK_THROUGH"
    private const val CHANNEL_ID = "nanai_mascot_service"
    private const val NOTIFICATION_ID = 1001
    private const val ACTION_STOP = "com.nanai_android_mascot.app.STOP_SERVICE"
  }
}
