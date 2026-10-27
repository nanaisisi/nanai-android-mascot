package com.nanai_android_mascot.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.os.Build
import android.provider.Settings
import androidx.activity.enableEdgeToEdge
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    requestNotificationPermission()
    requestOverlayPermission(savedInstanceState == null)
  }

  override fun onResume() {
    super.onResume()
    handleServiceIntent(intent)
    if (Settings.canDrawOverlays(this)) {
      val intent = Intent(this, NanaiForegroundService::class.java)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        startForegroundService(intent)
      } else {
        startService(intent)
      }
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
      ActivityCompat.requestPermissions(
        this,
        arrayOf(Manifest.permission.POST_NOTIFICATIONS),
        NOTIFICATION_PERMISSION_REQUEST_CODE
      )
    }
  }

  private fun requestOverlayPermission(isFirstCreation: Boolean) {
    if (!Settings.canDrawOverlays(this) && isFirstCreation) {
      startActivity(
        Intent(
          Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
          Uri.parse("package:$packageName")
        )
      )
    }
  }

  companion object {
    private const val NOTIFICATION_PERMISSION_REQUEST_CODE = 1001
  }
}
