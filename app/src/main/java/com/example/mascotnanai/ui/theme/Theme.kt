package com.example.mascotnanai.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = NanaiDarkPrimary,
    onPrimary = NanaiDarkOnPrimary,
    primaryContainer = NanaiDarkPrimaryContainer,
    onPrimaryContainer = NanaiDarkOnPrimaryContainer,
    secondary = NanaiDarkSecondary,
    onSecondary = NanaiDarkOnSecondary,
    secondaryContainer = NanaiDarkSecondaryContainer,
    onSecondaryContainer = NanaiDarkOnSecondaryContainer,
    background = NanaiDarkBackground,
    onBackground = NanaiDarkOnBackground,
    surface = NanaiDarkSurface,
    onSurface = NanaiDarkOnSurface,
    surfaceVariant = NanaiDarkSurfaceVariant,
    onSurfaceVariant = NanaiDarkOnSurfaceVariant
)

private val LightColorScheme = lightColorScheme(
    primary = NanaiPrimary,
    onPrimary = NanaiOnPrimary,
    primaryContainer = NanaiPrimaryContainer,
    onPrimaryContainer = NanaiOnPrimaryContainer,
    secondary = NanaiSecondary,
    onSecondary = NanaiOnSecondary,
    secondaryContainer = NanaiSecondaryContainer,
    onSecondaryContainer = NanaiOnSecondaryContainer,
    background = NanaiBackground,
    onBackground = NanaiOnBackground,
    surface = NanaiSurface,
    onSurface = NanaiOnSurface,
    surfaceVariant = NanaiSurfaceVariant,
    onSurfaceVariant = NanaiOnSurfaceVariant
)

@Composable
fun MascotNanaiTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
