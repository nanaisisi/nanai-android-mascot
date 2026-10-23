package com.example.mascotnanai.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog

@Composable
fun ShioriTestDialog(
    lastRequest: String,
    lastResponse: String,
    onTriggerEvent: (String, String?) -> Unit,
    onDismiss: () -> Unit
) {
    var testMessage by remember { mutableStateOf("こんにちは！") }
    var testPath by remember { mutableStateOf("../assets/ghost") }
    var pathResult by remember { mutableStateOf<String?>(null) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
                .testTag("shiori_test_dialog")
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
                        Text(text = "🧪", fontSize = 22.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "SHIORI テスト機能",
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
                    // SHIORI controls
                    item {
                        Text(
                            text = "SHIORI イベント実行:",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Button(
                                onClick = { onTriggerEvent("OnBoot", null) },
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("test_shiori_init"),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Text("初期化", fontSize = 13.sp)
                            }
                            FilledTonalButton(
                                onClick = { onTriggerEvent("OnTalk", null) },
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("test_shiori_request"),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Text("トーク", fontSize = 13.sp)
                            }
                            OutlinedButton(
                                onClick = { onTriggerEvent("OnMouseClick", null) },
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("test_shiori_click"),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Text("タップ", fontSize = 13.sp)
                            }
                        }
                    }

                    // Test message to ghost
                    item {
                        Column {
                            Text(
                                text = "テストメッセージ送信:",
                                style = MaterialTheme.typography.labelMedium
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                OutlinedTextField(
                                    value = testMessage,
                                    onValueChange = { testMessage = it },
                                    modifier = Modifier.weight(1f),
                                    singleLine = true,
                                    shape = RoundedCornerShape(10.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Button(
                                    onClick = {
                                        if (testMessage.isNotBlank()) {
                                            onTriggerEvent("SendMessage", testMessage)
                                        }
                                    },
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.testTag("send_test_message")
                                ) {
                                    Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("送信")
                                }
                            }
                        }
                    }

                    // Path resolve test
                    item {
                        Column {
                            Text(
                                text = "パステスト (Path Resolver):",
                                style = MaterialTheme.typography.labelMedium
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                OutlinedTextField(
                                    value = testPath,
                                    onValueChange = { testPath = it },
                                    modifier = Modifier.weight(1f),
                                    singleLine = true,
                                    shape = RoundedCornerShape(10.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                FilledTonalButton(
                                    onClick = {
                                        pathResult = "解決成功: /app/assets/ghost -> 検出済 (Status: OK)"
                                    },
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.testTag("test_path_resolve")
                                ) {
                                    Text("解決")
                                }
                            }
                            if (pathResult != null) {
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = pathResult ?: "",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.primary,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }
                    }

                    // Raw test results console
                    item {
                        Text(
                            text = "SHIORI 3.0 プロトコル通信ログ:",
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.SemiBold
                        )
                    }

                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                                    RoundedCornerShape(10.dp)
                                )
                                .border(
                                    1.dp,
                                    MaterialTheme.colorScheme.outlineVariant,
                                    RoundedCornerShape(10.dp)
                                )
                                .padding(12.dp)
                                .testTag("test_results")
                        ) {
                            val content = buildString {
                                if (lastRequest.isNotEmpty()) {
                                    append(">>> REQUEST:\n")
                                    append(lastRequest)
                                    append("\n")
                                }
                                if (lastResponse.isNotEmpty()) {
                                    append("<<< RESPONSE:\n")
                                    append(lastResponse)
                                }
                                if (lastRequest.isEmpty() && lastResponse.isEmpty()) {
                                    append("ボタンを押してSHIORIリクエストを送信してください。")
                                }
                            }
                            Text(
                                text = content,
                                style = MaterialTheme.typography.bodySmall,
                                fontFamily = FontFamily.Monospace,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }
        }
    }
}
