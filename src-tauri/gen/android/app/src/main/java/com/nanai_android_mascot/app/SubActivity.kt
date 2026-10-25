package com.nanai_android_mascot.app

import android.os.Bundle
import androidx.activity.enableEdgeToEdge

class SubActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }
}
