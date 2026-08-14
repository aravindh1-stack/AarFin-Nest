# UI/UX Design Brief & Styling System — AarFin Nest

## 1. Aesthetic Direction: Premium Modern Dark Glassmorphism
AarFin Nest adheres to a financial dashboard aesthetic featuring deep slate backgrounds, emerald neon highlights, glassmorphic translucent panels, and micro-interactions.

---

## 2. Color Palette Tokens

### Core Theme Tokens
- **Primary Background (`--bg-main`)**: `#0B132B` / `#090D16` (Deep Midnight Slate).
- **Card & Panel Background (`--card-bg`)**: `#1C2541` / `rgba(15, 23, 42, 0.75)` with `backdrop-filter: blur(12px)`.
- **Primary Accent Emerald (`--accent-primary`)**: `#0F766E` (Deep Teal Emerald).
- **Active Neon Emerald (`--accent-green`)**: `#10B981` / `#34D399` (High Contrast Collection Success).
- **Warning Amber (`--warning-amber`)**: `#F59E0B` / `#FBBF24` (Pending Cycle Active Due).
- **Overdue Rose (`--danger-rose`)**: `#F43F5E` / `#FB7185` (Overdue Unpaid Dues).
- **Border & Glass Divider (`--border-color`)**: `rgba(255, 255, 255, 0.08)`.

---

## 3. Component Design System

### 3.1 Status Badges
- **`UP TO DATE`**: Emerald background (`rgba(16, 185, 129, 0.15)`), emerald text, subtle green border.
- **`OVERDUE PENDING`**: Rose background (`rgba(244, 63, 94, 0.15)`), rose text, red border.
- **`SKIPPED (₹0)`**: Slate gray background (`rgba(100, 116, 139, 0.2)`), gray text.
- **`ACTIVE DUE TODAY`**: Amber background (`rgba(245, 158, 11, 0.2)`), amber text.

### 3.2 Loading Overlay Animation
Full-screen blur loading overlay featuring:
- Translucent backdrop blur (`backdrop-blur-md`).
- Pulsing glowing AarFin Finance Logo badge.
- Dual-ring spinning financial loading ring.
- Smooth page navigation transitions.

### 3.3 Micro-Animations & Interactivity
- Hover border highlight (`hover:border-[#0F766E]`) with smooth transition (`transition-all duration-200`).
- Card shadow elevation on mouse hover (`hover:shadow-lg`).
- Tactile button press feedback (`active:scale-95`).
