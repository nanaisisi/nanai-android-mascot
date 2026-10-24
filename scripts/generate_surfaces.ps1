Add-Type -AssemblyName System.Drawing

function Draw-BoxMascot([string]$mode, [string]$outputPath) {
    $bmp = New-Object System.Drawing.Bitmap(200, 400)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::Transparent)

    # 共通カラー
    $bodyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 243, 246))
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(156, 163, 175), 4)
    $screenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(20, 30, 45))
    $screenPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(71, 85, 105), 3)
    $antennaPole = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(156, 163, 175))
    $legBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(75, 85, 99))
    $footBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(31, 41, 55))
    $armBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(107, 114, 128))
    $glowCyan = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(56, 189, 248))
    $penCyan = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(56, 189, 248), 4)
    $cheekBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 244, 63, 94))
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)

    # 脚
    $g.FillRectangle($legBrush, 56, 328, 24, 40)
    $g.FillRectangle($legBrush, 120, 328, 24, 40)
    $g.FillRectangle($footBrush, 48, 356, 40, 18)
    $g.FillRectangle($footBrush, 112, 356, 40, 18)

    # アンテナ
    $g.FillRectangle($antennaPole, 96, 26, 8, 36)
    if ($mode -eq "surprise") {
        $antOrb = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 158, 11))
        $g.FillEllipse($antOrb, 86, 10, 28, 28)
        $g.FillEllipse($whiteBrush, 96, 18, 8, 8)
    } else {
        $g.FillEllipse($glowCyan, 88, 12, 24, 24)
        $g.FillEllipse($whiteBrush, 97, 18, 6, 6)
    }

    # 四角ボディ (角丸風)
    $g.FillRectangle($bodyBrush, 26, 60, 148, 268)
    $g.DrawRectangle($borderPen, 26, 60, 148, 268)

    # アーム (左右)
    if ($mode -eq "smile") {
        # 上げ気味
        $g.FillRectangle($armBrush, 14, 150, 12, 50)
        $g.FillEllipse($legBrush, 12, 144, 16, 16)
        $g.FillRectangle($armBrush, 174, 150, 12, 50)
        $g.FillEllipse($legBrush, 172, 144, 16, 16)
    } else {
        $g.FillRectangle($armBrush, 14, 190, 12, 50)
        $g.FillEllipse($legBrush, 12, 234, 16, 16)
        $g.FillRectangle($armBrush, 174, 190, 12, 50)
        $g.FillEllipse($legBrush, 172, 234, 16, 16)
    }

    # ディスプレイ画面 (Face)
    $g.FillRectangle($screenBrush, 40, 92, 120, 108)
    $g.DrawRectangle($screenPen, 40, 92, 120, 108)

    # 表情別描画
    if ($mode -eq "normal") {
        # 通常 ● ●
        $g.FillEllipse($glowCyan, 66, 134, 20, 20)
        $g.FillEllipse($whiteBrush, 72, 138, 6, 6)
        $g.FillEllipse($glowCyan, 114, 134, 20, 20)
        $g.FillEllipse($whiteBrush, 120, 138, 6, 6)
        $g.FillEllipse($cheekBrush, 55, 160, 14, 8)
        $g.FillEllipse($cheekBrush, 131, 160, 14, 8)
        $g.FillRectangle($glowCyan, 94, 162, 12, 3)
    } elseif ($mode -eq "smile") {
        # 笑顔 ^ ^
        $g.DrawArc($penCyan, 64, 134, 24, 20, 180, 180)
        $g.DrawArc($penCyan, 112, 134, 24, 20, 180, 180)
        $g.FillEllipse($cheekBrush, 54, 158, 16, 10)
        $g.FillEllipse($cheekBrush, 130, 158, 16, 10)
        $g.DrawArc($penCyan, 92, 154, 16, 14, 0, 180)
    } elseif ($mode -eq "surprise") {
        # 驚き O O
        $yellowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(252, 211, 77))
        $g.FillEllipse($yellowBrush, 64, 130, 24, 24)
        $g.FillEllipse($screenBrush, 72, 138, 8, 8)
        $g.FillEllipse($yellowBrush, 112, 130, 24, 24)
        $g.FillEllipse($screenBrush, 120, 138, 8, 8)
        $g.FillEllipse($yellowBrush, 94, 158, 12, 16)
    }

    # 胸部パネル / スロット
    $panelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(226, 232, 240))
    $g.FillRectangle($panelBrush, 46, 220, 108, 54)
    $slotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(148, 163, 184))
    $g.FillRectangle($slotBrush, 56, 230, 88, 5)
    $g.FillRectangle($slotBrush, 56, 244, 88, 5)
    $g.FillRectangle($slotBrush, 56, 258, 88, 5)

    # インジケーターランプ
    $lamp1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(16, 185, 129))
    $lamp2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(56, 189, 248))
    $lamp3 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(156, 163, 175))
    $g.FillEllipse($lamp1, 58, 288, 12, 12)
    $g.FillEllipse($lamp2, 76, 288, 12, 12)
    $g.FillEllipse($lamp3, 94, 288, 12, 12)

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

function Draw-Petit([string]$outputPath) {
    $bmp = New-Object System.Drawing.Bitmap(200, 400)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::Transparent)

    $ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(160, 56, 189, 248), 2)
    $bodyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(224, 242, 254))
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(56, 189, 248), 3)
    $screenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
    $glowCyan = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(56, 189, 248))
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $redOrb = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(244, 63, 94))

    # フロートリング
    $g.DrawEllipse($ringPen, 64, 174, 72, 16)

    # アンテナ
    $antennaPole = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 116, 139))
    $g.FillRectangle($antennaPole, 97, 182, 6, 20)
    $g.FillEllipse($redOrb, 94, 174, 12, 12)

    # 小型キューブボディ (100x100)
    $g.FillRectangle($bodyBrush, 50, 200, 100, 100)
    $g.DrawRectangle($borderPen, 50, 200, 100, 100)

    # 画面
    $g.FillRectangle($screenBrush, 62, 222, 76, 56)

    # 単眼コア
    $g.FillEllipse($glowCyan, 86, 236, 28, 28)
    $g.FillEllipse($whiteBrush, 94, 244, 12, 12)

    # スラスター光
    $pts = @(
        (New-Object System.Drawing.Point(88, 304)),
        (New-Object System.Drawing.Point(112, 304)),
        (New-Object System.Drawing.Point(100, 324))
    )
    $g.FillPolygon($glowCyan, $pts)

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

$shellPath = "$PWD/assets/ghost/mock_nanai/shell/master"
Draw-BoxMascot "normal" "$shellPath/surface0.png"
Draw-BoxMascot "smile" "$shellPath/surface1.png"
Draw-BoxMascot "surprise" "$shellPath/surface2.png"
Draw-Petit "$shellPath/surface10.png"
Write-Host "🎨 モック & プチの PNG サーフィス画像を生成しました！"
