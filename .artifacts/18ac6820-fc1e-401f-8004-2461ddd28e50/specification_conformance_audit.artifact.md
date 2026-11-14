# Specification Conformance Audit & Re-evaluation Report

This audit report re-examines our implementation claims against the canonical UKADOC specifications (`docs/ukadoc-spec/`), categorizing features into **Full Conformance (完全準拠)**, **Partial Conformance (部分準拠 / 基本機能実装)**, and **Known Gaps / Future Work (未対応・拡張予定)**.

## 1. Sakura Script (さくらスクリプト)
- **Status:** **Full Conformance (Core & Extended)**
- **Implemented:**
  - Scope targets (`\0`, `\1`, `\p[N]`, `\h`, `\u`)
  - Surface switching (`\s[N]`, `\i[ID]`)
  - Waiting and timing (`\wN`, `\x`, `\t`, `\-`)
  - Formatting and fonts (`\n`, `\n[half]`, `\f[tag,param]`)
  - Balloon control (`\b[N]`, `\_w`, `\_q`, `\_a`, `\_s`, `\_l`)
  - Actions and events (`\q[Label,ID]`, `\![raise, ...]`, `\![bind, ...]`, `\c`, `\e`)
- **Gaps / Re-evaluation:**
  - Advanced property system interpolation (`%property[...]`) within scripts is treated as raw text or delegated to SHIORI rather than fully evaluated locally.

## 2. SHIORI / 3.0 Protocol & Events
- **Status:** **Partial Conformance (Core Lifecycle & Events)**
- **Implemented:**
  - SHIORI/3.0 Request/Response parsing and building (`GET`, `NOTIFY`, headers, multiline values, pass-thru).
  - Lifecycle events (`OnBoot`, `OnClose`, `OnSecondChange`, `OnMinuteChange`, `OnWindowStateMinimize/Restore`).
  - Interaction and system events (`OnMouseClick`, `OnBIFFBegin/Complete/Failure`, `OnUpdateResultExplorer`).
- **Gaps / Re-evaluation:**
  - The hundreds of niche extension events for specific plugins or historical games (`list/shiori-event-ex/`) are not hardcoded in the Rust dispatcher; they rely on generic event routing to the loaded SHIORI DLL (`yaya.dll` / `satori.dll`).

## 3. Surfaces & SERIKO Animation (`surfaces.txt`)
- **Status:** **High Conformance**
- **Implemented:**
  - Surface blocks (`surface[N]`, `surface.append[N]`, aliases).
  - Drawing elements (`element[N]` with draw methods like `overlay`, `base`, `interpolate`).
  - Collision detection (`collision[N]`, `collisionex` supporting `rect`, `polygon`, `circle`, `ellipse`).
  - SERIKO animation timelines (`animation[N].pattern[K]`, wait, min-max ranges, intervals like `random`, `periodic`, `sometimes`, `rarely`, `bind`).
  - Composition plan (`plan_composition` for MAYUNA layers and dress-up binds).
- **Gaps / Re-evaluation:**
  - Complex raster operations (`blendmethod`) in advanced collision or custom drawing filters have simplified approximations in frontend CSS/Canvas rendering.

## 4. Descript Properties (`descript.txt` for Ghost, Shell, Balloon)
- **Status:** **Hybrid Conformance (Essential Properties Implemented)**
- **Implemented:**
  - Ghost & Shell meta: `name`, `type`, `craftman`, `homeurl`, `sakura.name`, `kero.name`.
  - Shell binds: `bindgroup[N]`, `bindoption.group`.
  - Balloon core: `dpi`, `font.name`, `font.height`, `font.bold`, `font.italic`, `font.underline`, `font.strike`, `validrect.*`, `origin.*`, `arrow0/1.*`, `clickwaitmarker.*`, `vertical`, `windowposition.*`.
- **Gaps / Re-evaluation:**
  - Detailed anchor and cursor styling variants (`anchor.visited.*`, `anchor.notselect.*`, `cursor.blendmethod`, etc.) are parsed into Rust property maps (`Descript::properties`), but advanced per-state color overrides in CSS are partially defaulted to core anchor/text variables.
