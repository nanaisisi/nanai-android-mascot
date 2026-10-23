package com.example.mascotnanai.ui.dialogs

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.mascotnanai.data.model.AppSettings
import com.example.mascotnanai.data.model.GhostSize
import com.example.mascotnanai.data.model.MascotBackground
import com.example.mascotnanai.data.model.TalkFrequency
import kotlin.math.roundToInt

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsDialog(
    currentSettings: AppSettings,
    onSaveSettings: (AppSettings) -> Unit,
    onResetSettings: () -> Unit,
    onDismiss: () -> Unit
) {
    var autoLoadGhost by remember { mutableStateOf(currentSettings.autoLoadGhost) }
    var enableTalks by remember { mutableStateOf(currentSettings.enableTalks) }
    var talkFrequency by remember { mutableStateOf(currentSettings.talkFrequency) }
    var darkMode by remember { mutableStateOf(currentSettings.darkMode) }
    var alwaysOnTop by remember { mutableStateOf(currentSettings.alwaysOnTop) }
    var ghostSize by remember { mutableStateOf(currentSettings.ghostSize) }
    var shellScale by remember { mutableFloatStateOf(currentSettings.shellScale) }
    var balloonScale by remember { mutableFloatStateOf(currentSettings.balloonScale) }
    var backgroundTheme by remember { mutableStateOf(currentSettings.backgroundTheme) }
    var debugLevel by remember { mutableStateOf(currentSettings.debugLevel) }

    var sizeExpanded by remember { mutableStateOf(false) }
    var freqExpanded by remember { mutableStateOf(false) }
    var bgExpanded by remember { mutableStateOf(false) }
    var debugExpanded by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
                .testTag("settings_dialog")
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .heightIn(max = 640.dp)
            ) {
                // Header
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = "⚙️", fontSize = 22.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "設定",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    IconButton(onClick = onDismiss, modifier = Modifier.size(36.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "閉じる")
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Checkboxes
                    item {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Checkbox(
                                checked = autoLoadGhost,
                                onCheckedChange = { autoLoadGhost = it },
                                modifier = Modifier.testTag("auto_load_ghost")
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "自動ゴースト読み込み",
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }

                    item {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Checkbox(
                                checked = enableTalks,
                                onCheckedChange = { enableTalks = it },
                                modifier = Modifier.testTag("enable_talks")
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "定時トーク / 通知を有効化",
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }

                    item {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Checkbox(
                                checked = darkMode,
                                onCheckedChange = { darkMode = it },
                                modifier = Modifier.testTag("dark_mode")
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "ダークモード (UI Dark Theme)",
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }

                    item {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Checkbox(
                                checked = alwaysOnTop,
                                onCheckedChange = { alwaysOnTop = it },
                                modifier = Modifier.testTag("always_on_top")
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "常に最前面に表示 (Always On Top)",
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }

                    // Ghost Size Dropdown
                    item {
                        Column {
                            Text(
                                text = "ゴースト表示サイズ (Ghost Size):",
                                style = MaterialTheme.typography.labelMedium
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            ExposedDropdownMenuBox(
                                expanded = sizeExpanded,
                                onExpandedChange = { sizeExpanded = !sizeExpanded }
                            ) {
                                OutlinedTextField(
                                    value = ghostSize.label,
                                    onValueChange = {},
                                    readOnly = true,
                                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = sizeExpanded) },
                                    modifier = Modifier
                                        .menuAnchor()
                                        .fillMaxWidth(),
                                    shape = RoundedCornerShape(10.dp)
                                )
                                ExposedDropdownMenu(
                                    expanded = sizeExpanded,
                                    onDismissRequest = { sizeExpanded = false }
                                ) {
                                    GhostSize.entries.forEach { size ->
                                        DropdownMenuItem(
                                            text = { Text(size.label) },
                                            onClick = {
                                                ghostSize = size
                                                sizeExpanded = false
                                            }
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Shell scale slider
                    item {
                        Column {
                            Row(
                                horizontalArrangement = Arrangement.SpaceBetween,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = "シェル倍率 (Shell Zoom):",
                                    style = MaterialTheme.typography.labelMedium
                                )
                                Text(
                                    text = "${(shellScale * 100).roundToInt()}%",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = MaterialTheme.colorScheme.primary,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Slider(
                                value = shellScale,
                                onValueChange = { shellScale = it },
                                valueRange = 0.6f..1.6f,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }

                    // Balloon scale slider
                    item {
                        Column {
                            Row(
                                horizontalArrangement = Arrangement.SpaceBetween,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = "バルーン倍率 (Balloon Zoom):",
                                    style = MaterialTheme.typography.labelMedium
                                )
                                Text(
                                    text = "${(balloonScale * 100).roundToInt()}%",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = MaterialTheme.colorScheme.primary,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Slider(
                                value = balloonScale,
                                onValueChange = { balloonScale = it },
                                valueRange = 0.7f..1.5f,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }

                    // Talk Frequency Dropdown
                    item {
                        Column {
                            Text(
                                text = "トーク頻度 (Talk Interval):",
                                style = MaterialTheme.typography.labelMedium
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            ExposedDropdownMenuBox(
                                expanded = freqExpanded,
                                onExpandedChange = { freqExpanded = !freqExpanded }
                            ) {
                                OutlinedTextField(
                                    value = talkFrequency.label,
                                    onValueChange = {},
                                    readOnly = true,
                                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = freqExpanded) },
                                    modifier = Modifier
                                        .menuAnchor()
                                        .fillMaxWidth(),
                                    shape = RoundedCornerShape(10.dp)
                                )
                                ExposedDropdownMenu(
                                    expanded = freqExpanded,
                                    onDismissRequest = { freqExpanded = false }
                                ) {
                                    TalkFrequency.entries.forEach { freq ->
                                        DropdownMenuItem(
                                            text = { Text(freq.label) },
                                            onClick = {
                                                talkFrequency = freq
                                                freqExpanded = false
                                            }
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Background theme
                    item {
                        Column {
                            Text(
                                text = "背景テーマ (Backdrop):",
                                style = MaterialTheme.typography.labelMedium
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            ExposedDropdownMenuBox(
                                expanded = bgExpanded,
                                onExpandedChange = { bgExpanded = !bgExpanded }
                            ) {
                                OutlinedTextField(
                                    value = backgroundTheme.label,
                                    onValueChange = {},
                                    readOnly = true,
                                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = bgExpanded) },
                                    modifier = Modifier
                                        .menuAnchor()
                                        .fillMaxWidth(),
                                    shape = RoundedCornerShape(10.dp)
                                )
                                ExposedDropdownMenu(
                                    expanded = bgExpanded,
                                    onDismissRequest = { bgExpanded = false }
                                ) {
                                    MascotBackground.entries.forEach { bg ->
                                        DropdownMenuItem(
                                            text = { Text(bg.label) },
                                            onClick = {
                                                backgroundTheme = bg
                                                bgExpanded = false
                                            }
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Debug Level Dropdown
                    item {
                        Column {
                            Text(
                                text = "デバッグレベル (Debug Level):",
                                style = MaterialTheme.typography.labelMedium
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            ExposedDropdownMenuBox(
                                expanded = debugExpanded,
                                onExpandedChange = { debugExpanded = !debugExpanded }
                            ) {
                                OutlinedTextField(
                                    value = debugLevel,
                                    onValueChange = {},
                                    readOnly = true,
                                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = debugExpanded) },
                                    modifier = Modifier
                                        .menuAnchor()
                                        .fillMaxWidth(),
                                    shape = RoundedCornerShape(10.dp)
                                )
                                ExposedDropdownMenu(
                                    expanded = debugExpanded,
                                    onDismissRequest = { debugExpanded = false }
                                ) {
                                    listOf("error", "warn", "info", "debug").forEach { level ->
                                        DropdownMenuItem(
                                            text = { Text(level) },
                                            onClick = {
                                                debugLevel = level
                                                debugExpanded = false
                                            }
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Bottom actions
                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Button(
                        onClick = {
                            val newSettings = currentSettings.copy(
                                autoLoadGhost = autoLoadGhost,
                                enableTalks = enableTalks,
                                talkFrequency = talkFrequency,
                                darkMode = darkMode,
                                alwaysOnTop = alwaysOnTop,
                                ghostSize = ghostSize,
                                shellScale = shellScale,
                                balloonScale = balloonScale,
                                backgroundTheme = backgroundTheme,
                                debugLevel = debugLevel
                            )
                            onSaveSettings(newSettings)
                            onDismiss()
                        },
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("save_settings_btn")
                    ) {
                        Text("設定保存")
                    }

                    OutlinedButton(
                        onClick = {
                            onResetSettings()
                            onDismiss()
                        },
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("reset_settings_btn")
                    ) {
                        Text("初期化")
                    }
                }
            }
        }
    }
}
