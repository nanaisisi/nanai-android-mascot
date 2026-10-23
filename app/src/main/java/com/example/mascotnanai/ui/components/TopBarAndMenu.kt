package com.example.mascotnanai.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mascotnanai.ui.viewmodel.ActiveModal

@Composable
fun TopMenuButton(
    isMenuOpen: Boolean,
    onToggleMenu: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier
            .size(48.dp)
            .shadow(elevation = 8.dp, shape = CircleShape)
            .clip(CircleShape)
            .background(Color.White.copy(alpha = 0.95f))
            .border(width = 1.5.dp, color = Color.Black.copy(alpha = 0.2f), shape = CircleShape)
            .clickable { onToggleMenu() }
            .testTag("menu_button")
    ) {
        Icon(
            imageVector = if (isMenuOpen) Icons.Default.Close else Icons.Default.Menu,
            contentDescription = if (isMenuOpen) "メニューを閉じる" else "メニューを開く",
            tint = Color(0xFF2C3E50),
            modifier = Modifier.size(24.dp)
        )
    }
}

@Composable
fun DropdownMenuCard(
    isOpen: Boolean,
    onItemClick: (ActiveModal) -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    AnimatedVisibility(
        visible = isOpen,
        enter = fadeIn() + slideInVertically(initialOffsetY = { -20 }),
        exit = fadeOut() + slideOutVertically(targetOffsetY = { -20 }),
        modifier = modifier
    ) {
        Surface(
            shape = RoundedCornerShape(14.dp),
            color = MaterialTheme.colorScheme.surface.copy(alpha = 0.98f),
            shadowElevation = 16.dp,
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
            modifier = Modifier
                .width(220.dp)
                .testTag("dropdown_menu_card")
        ) {
            Column(
                modifier = Modifier.padding(vertical = 6.dp)
            ) {
                MenuItemRow(
                    icon = "👻",
                    title = "ゴースト管理",
                    onClick = { onItemClick(ActiveModal.GHOST_MGMT) }
                )
                MenuItemRow(
                    icon = "💭",
                    title = "バルーン管理",
                    onClick = { onItemClick(ActiveModal.BALLOON_MGMT) }
                )

                HorizontalDivider(
                    modifier = Modifier.padding(vertical = 4.dp),
                    color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
                )

                MenuItemRow(
                    icon = "🔍",
                    title = "スキャン",
                    onClick = { onItemClick(ActiveModal.SCANNER) }
                )
                MenuItemRow(
                    icon = "🧪",
                    title = "テスト",
                    onClick = { onItemClick(ActiveModal.SHIORI_TEST) }
                )

                HorizontalDivider(
                    modifier = Modifier.padding(vertical = 4.dp),
                    color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
                )

                MenuItemRow(
                    icon = "⚙️",
                    title = "設定",
                    onClick = { onItemClick(ActiveModal.SETTINGS) }
                )
                MenuItemRow(
                    icon = "🐛",
                    title = "デバッグ",
                    onClick = { onItemClick(ActiveModal.DEBUG_LOGS) }
                )
                MenuItemRow(
                    icon = "❓",
                    title = "ヘルプ",
                    onClick = { onItemClick(ActiveModal.HELP) }
                )
            }
        }
    }
}

@Composable
private fun MenuItemRow(
    icon: String,
    title: String,
    onClick: () -> Unit
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(horizontal = 16.dp, vertical = 11.dp)
            .testTag("menu_item_${title}")
    ) {
        Text(
            text = icon,
            fontSize = 17.sp,
            modifier = Modifier.width(28.dp)
        )
        Text(
            text = title,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurface,
            fontWeight = FontWeight.Normal
        )
    }
}
