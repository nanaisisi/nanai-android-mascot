package com.example.mascotnanai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChatBubble
import androidx.compose.material.icons.filled.CropFree
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.TouchApp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mascotnanai.data.model.MascotBackground
import com.example.mascotnanai.ui.components.DropdownMenuCard
import com.example.mascotnanai.ui.components.MascotCharacterView
import com.example.mascotnanai.ui.components.SpeechBalloonView
import com.example.mascotnanai.ui.components.TopMenuButton
import com.example.mascotnanai.ui.dialogs.BalloonManagementDialog
import com.example.mascotnanai.ui.dialogs.DebugLogsDialog
import com.example.mascotnanai.ui.dialogs.GhostManagementDialog
import com.example.mascotnanai.ui.dialogs.HelpDialog
import com.example.mascotnanai.ui.dialogs.ScannerDialog
import com.example.mascotnanai.ui.dialogs.SettingsDialog
import com.example.mascotnanai.ui.dialogs.ShioriTestDialog
import com.example.mascotnanai.ui.theme.MascotNanaiTheme
import com.example.mascotnanai.ui.viewmodel.ActiveModal
import com.example.mascotnanai.ui.viewmodel.MascotViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: MascotViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            val settings by viewModel.settings.collectAsState()

            MascotNanaiTheme(darkTheme = settings.darkMode) {
                MascotMainScreen(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun MascotMainScreen(viewModel: MascotViewModel) {
    val currentGhost by viewModel.currentGhost.collectAsState()
    val currentSurfaceId by viewModel.currentSurfaceId.collectAsState()
    val currentBalloon by viewModel.currentBalloon.collectAsState()
    val balloonText by viewModel.balloonText.collectAsState()
    val isBalloonVisible by viewModel.isBalloonVisible.collectAsState()
    val activeModal by viewModel.activeModal.collectAsState()
    val isMenuOpen by viewModel.isMenuOpen.collectAsState()
    val settings by viewModel.settings.collectAsState()
    val availableGhosts by viewModel.availableGhosts.collectAsState()
    val balloonStyles by viewModel.balloonStyles.collectAsState()
    val logs by viewModel.logs.collectAsState()
    val lastRequest by viewModel.lastShioriRequest.collectAsState()
    val lastResponse by viewModel.lastShioriResponse.collectAsState()
    val mascotOffsetX by viewModel.mascotOffsetX.collectAsState()
    val mascotOffsetY by viewModel.mascotOffsetY.collectAsState()

    // Handle Back button
    BackHandler(enabled = isMenuOpen || activeModal != ActiveModal.NONE) {
        if (isMenuOpen) {
            viewModel.closeMenu()
        } else if (activeModal != ActiveModal.NONE) {
            viewModel.closeModal()
        }
    }

    // Background gradient brush based on settings
    val bgBrush = when (settings.backgroundTheme) {
        MascotBackground.TRANSLUCENT -> Brush.verticalGradient(
            colors = listOf(
                Color(0xFFE8EEF5),
                Color(0xFFF7FAFD),
                Color(0xFFDEE7F2)
            )
        )
        MascotBackground.COZY_ROOM -> Brush.verticalGradient(
            colors = listOf(
                Color(0xFFFDEFE8),
                Color(0xFFFFF7F2),
                Color(0xFFF6DFD3)
            )
        )
        MascotBackground.PASTEL_SKY -> Brush.verticalGradient(
            colors = listOf(
                Color(0xFFD4E9F7),
                Color(0xFFE6F2FA),
                Color(0xFFC7DEF0)
            )
        )
        MascotBackground.MIDNIGHT -> Brush.verticalGradient(
            colors = listOf(
                Color(0xFF0F172A),
                Color(0xFF1E293B),
                Color(0xFF0A0F1D)
            )
        )
    }

    val statusBarPadding = WindowInsets.statusBars.asPaddingValues()
    val navBarPadding = WindowInsets.navigationBars.asPaddingValues()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(bgBrush)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) {
                if (isMenuOpen) viewModel.closeMenu()
            }
    ) {
        // Main mascot stage (centered with offset)
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 70.dp)
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // Speech balloon directly above mascot
                SpeechBalloonView(
                    text = balloonText,
                    visible = isBalloonVisible,
                    balloonStyle = currentBalloon,
                    scale = settings.balloonScale,
                    onClick = { viewModel.hideBalloon() },
                    modifier = Modifier.padding(bottom = 6.dp)
                )

                // Mascot character
                MascotCharacterView(
                    ghost = currentGhost,
                    currentSurfaceId = currentSurfaceId,
                    ghostSize = settings.ghostSize,
                    shellScale = settings.shellScale,
                    offsetX = mascotOffsetX,
                    offsetY = mascotOffsetY,
                    onDrag = { dx, dy -> viewModel.updateMascotPosition(dx, dy) },
                    onClick = { viewModel.onCharacterClick() }
                )
            }
        }

        // Top Header Bar
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = statusBarPadding.calculateTopPadding() + 8.dp)
                .padding(horizontal = 16.dp)
        ) {
            // App & Status badge
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.surface.copy(alpha = 0.92f),
                shadowElevation = 4.dp,
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(if (currentGhost != null) Color(0xFF2E7D32) else Color.Gray)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = currentGhost?.sakuraName ?: "Mascot Nanai",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }

            // Top Right Circular Menu Button ☰
            TopMenuButton(
                isMenuOpen = isMenuOpen,
                onToggleMenu = { viewModel.toggleMenu() }
            )
        }

        // Dropdown Menu (anchored under top right button)
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(
                    top = statusBarPadding.calculateTopPadding() + 62.dp,
                    end = 16.dp
                )
        ) {
            DropdownMenuCard(
                isOpen = isMenuOpen,
                onItemClick = { modal -> viewModel.openModal(modal) },
                onDismiss = { viewModel.closeMenu() }
            )
        }

        // Bottom Surface Switcher and Quick Actions Bar
        Surface(
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
            color = MaterialTheme.colorScheme.surface.copy(alpha = 0.94f),
            shadowElevation = 12.dp,
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(bottom = navBarPadding.calculateBottomPadding())
        ) {
            Column(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
            ) {
                // Quick expression chips row
                val expressions = currentGhost?.expressions ?: emptyList()
                if (expressions.isNotEmpty()) {
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        contentPadding = PaddingValues(horizontal = 4.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(expressions) { exp ->
                            val isSelected = currentSurfaceId == exp.id
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = if (isSelected) {
                                    MaterialTheme.colorScheme.primary
                                } else {
                                    MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.7f)
                                },
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .clickable { viewModel.selectSurface(exp.id) }
                                    .testTag("surface_chip_${exp.id}")
                            ) {
                                Text(
                                    text = exp.label,
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                // Quick Action Bar
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    // Reset position button
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .clickable { viewModel.resetMascotPosition() }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Icon(
                            Icons.Default.CropFree,
                            contentDescription = "位置リセット",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "位置リセット",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }

                    // Direct Talk Button
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .clickable { viewModel.triggerShioriEvent("OnTalk") }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Icon(
                            Icons.Default.ChatBubble,
                            contentDescription = "おしゃべり",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "話しかける",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }

                    // Tap interaction button
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .clickable { viewModel.onCharacterClick() }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Icon(
                            Icons.Default.TouchApp,
                            contentDescription = "つんつん",
                            tint = MaterialTheme.colorScheme.secondary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "つんつん",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.secondary
                        )
                    }
                }
            }
        }

        // Modals
        when (activeModal) {
            ActiveModal.GHOST_MGMT -> {
                GhostManagementDialog(
                    currentGhost = currentGhost,
                    availableGhosts = availableGhosts,
                    currentSurfaceId = currentSurfaceId,
                    onSelectGhost = { viewModel.loadGhost(it) },
                    onSelectSurface = { viewModel.selectSurface(it) },
                    onDismiss = { viewModel.closeModal() }
                )
            }
            ActiveModal.BALLOON_MGMT -> {
                BalloonManagementDialog(
                    currentBalloon = currentBalloon,
                    availableBalloons = balloonStyles,
                    balloonScale = settings.balloonScale,
                    onSelectBalloon = { viewModel.setBalloonStyle(it) },
                    onUpdateScale = { viewModel.updateSettings(settings.copy(balloonScale = it)) },
                    onDismiss = { viewModel.closeModal() }
                )
            }
            ActiveModal.SCANNER -> {
                ScannerDialog(
                    onDismiss = { viewModel.closeModal() }
                )
            }
            ActiveModal.SHIORI_TEST -> {
                ShioriTestDialog(
                    lastRequest = lastRequest,
                    lastResponse = lastResponse,
                    onTriggerEvent = { event, msg -> viewModel.triggerShioriEvent(event, msg) },
                    onDismiss = { viewModel.closeModal() }
                )
            }
            ActiveModal.SETTINGS -> {
                SettingsDialog(
                    currentSettings = settings,
                    onSaveSettings = { viewModel.updateSettings(it) },
                    onResetSettings = { viewModel.resetSettings() },
                    onDismiss = { viewModel.closeModal() }
                )
            }
            ActiveModal.DEBUG_LOGS -> {
                DebugLogsDialog(
                    logs = logs,
                    onClearLogs = { viewModel.clearLogs() },
                    getExportText = { viewModel.getLogsExportText() },
                    onDismiss = { viewModel.closeModal() }
                )
            }
            ActiveModal.HELP -> {
                HelpDialog(
                    onDismiss = { viewModel.closeModal() }
                )
            }
            ActiveModal.NONE -> {}
        }
    }
}
