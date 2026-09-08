SMARTCONVEYOR — 

Build a complete, production-quality frontend web application for:

SmartConveyor — Intelligent Monitoring and Prediction of Conveyor Belt Joint Rupture and Damages in Iron Ore Mining Industry

The application is an industrial monitoring and control dashboard for monitoring conveyor belts, detecting belt/joint damage, viewing sensor health, visualizing a digital twin, managing alerts, generating reports, and interacting with an AI assistant.

---



---

2. TECHNOLOGY STACK

Use:

- React
- Vite
- JavaScript/JSX
- Tailwind CSS
- shadcn/ui
- React Router
- Lucide React icons
- Recharts for charts
- Three.js for the existing Digital Twin
- Existing project libraries should be preserved.
- Animations  Gsap 
 - react 4 layer Architecture and redux for state managagement

Do not introduce unnecessary UI libraries.

shadcn/ui should be the primary UI component system.

---

3. DESIGN DIRECTION

The design should look like a:

Modern Industrial Control Room / Smart Factory Monitoring System

The UI should feel:

- Professional
- Industrial
- Technical
- Reliable
- Clean
- Data-focused
- Modern
- Enterprise-grade
- Suitable for an iron ore mining company
- Suitable for a college project demonstration
- Suitable for a professional product presentation
- Minimal 


---

4. COLOR SYSTEM

Use a professional industrial graphite/steel theme, refined for long-shift monitoring (low eye strain, minimal visual noise, status colors reserved for meaning).

Base colors:

- Background: #214366
- Surface: #151C23
- Elevated Surface: #1B242D
- Border: #2A3742
- Grid Line (charts/dividers): #23303A

Accent colors:

- Primary Accent (interactive elements, active states, focus rings): #22D3EE
- Secondary Accent (links, minor UI only — use sparingly): #38BDF8

Text colors:

- Main Text: #E7EDF2
- Muted Text: #8B9AA8
- Data Viz Neutral (idle/inactive chart lines): #64748B

Status colors:

- Healthy / Normal: #22C55E
- Warning / Degraded: #F59E0B
- Critical / Fault: #EF4444

Utility:

- Overlay Scrim (modals/tooltips over live data): rgba(15, 20, 25, 0.7)

Rules:

- Use status colors ONLY to indicate actual system state — never decoratively, never for hover/borders/emphasis. Overuse of Critical (#EF4444) causes alarm fatigue and technicians will start ignoring it.
- Use only one primary accent for anything interactive. Secondary accent is for minor/non-critical UI only.
- Use CSS variables/design tokens so the color system is easy to modify later.
- Do not create a dark/light theme switcher. The application should use one consistent industrial visual theme.
- Do not randomly introduce additional accent colors.

5. TYPOGRAPHY

Use a clean modern font such as Inter.

Use normal typography for:

- Headings
- Labels
- Navigation
- Descriptions

Use monospace/tabular numbers for technical values where appropriate:

- Temperature
- Vibration
- Current
- RUL
- Percentages
- Sensor readings
- Timestamps
- Machine IDs
- Confidence values

Numbers should be easy to scan quickly.

---

6. GENERAL UI PRINCIPLES

Use:

- Compact spacing
- 4–6px border radius
- Thin borders
- Clear visual hierarchy
- Consistent padding
- Consistent component sizes
- Subtle hover effects
- Subtle transitions
- Clear active navigation state
- Strong status indicators
- Technical-looking data presentation

Avoid:

- Excessively rounded UI
- Giant cards
- Excessive shadows
- Excessive animations
- Excessive gradients
- Excessive whitespace
- Decorative elements that don't provide information

The dashboard should feel information-dense but not cluttered.

---



7. APPLICATION STRUCTURE

Create the following application screens:

/Home
/dashboard
/digital-twin
/vision-monitoring
/sensor-health
/alerts
/reports
/settings

The AI Assistant should be available globally rather than necessarily being a separate full page.

---


7.1 - Home page — project overview and a guide to using the web app.

8. MAIN APPLICATION LAYOUT



Structure:

┌─────────────────────────────────────────────────────────────┐
│                        TOPBAR                               │
├───────────────┬─────────────────────────────────────────────┤
│               │                                             │
│               │                                             │
│   SIDEBAR     │              PAGE CONTENT                   │
│ Home          │                                             │
│ Dashboard     │                                             │
│ Digital Twin  │                                             │
│ Vision        │                                             │
│ Sensors       │                                             │
│ Alerts        │                                             │
│ Reports       │                                             │
│ Settings      │                                             │
│               │                                             │
│               │                                             │
└───────────────┴─────────────────────────────────────────────┘

Create a reusable:

"DashboardLayout"

containing:

- Sidebar
- Topbar
- Main content area
- Global notifications
- AI Assistant trigger

---

9. SIDEBAR

Create a professional industrial sidebar.

Include:

Header

- SmartConveyor logo/icon
- SmartConveyor name
- Small subtitle such as "Industrial Monitoring"

Navigation

1. Dashboard
2. Digital Twin
3. Vision Monitoring
4. Sensor Health
5. Alerts
6. Reports
7. Settings

Use Lucide icons.

Each navigation item should have:

- Icon
- Label
- Active state
- Hover state



Bottom section

Show:

- System status
- User profile
- Logout

Example:

SMARTCONVEYOR
Industrial Monitoring
   Home
▣ Dashboard
◈ Digital Twin
◉ Vision Monitoring
⌁ Sensor Health
⚠ Alerts
▤ Reports
⚙ Settings

────────────────

● SYSTEM ONLINE

Krish
Administrator

---

10. TOPBAR

Create a compact technical topbar.

Include:

- Current page title
- Breadcrumb where useful
- System status
- Last updated time
- Notification icon
- AI Assistant button
- User profile

Example:

Dashboard                         ● SYSTEM ONLINE
                                  Updated 10:42:31
                                  🔔 3   AI

System status should clearly show:

"ONLINE"

with a green indicator.

---



12. DASHBOARD

The Dashboard is the main screen.

Structure:

Dashboard
│
├── Page Header
│
├── KPI Cards
│
├── Conveyor Overview
│
├── Sensor Monitoring
│
├── Health / RUL
│
├── Sensor Trend Charts
│
└── Recent Alerts

---

13. DASHBOARD PAGE HEADER

Show:

Conveyor Monitoring Dashboard

Real-time condition monitoring and predictive maintenance overview

● System Online
Last updated: 10:42:31

Include a refresh action if appropriate.

---

14. KPI CARDS

Create reusable "KPICard" components.

Display:

KPI 1

Machine Health

96.4%
Healthy

KPI 2

Conveyor Status

RUNNING
2.4 m/s

KPI 3

Active Alerts

03
1 Critical

KPI 4

Remaining Useful Life

147 HRS
Estimated

Additional possible KPIs:

- Sensors Online
- Detection Confidence
- Current Load
- Maintenance Due

Each KPI card should include:

- Icon
- Title
- Main value
- Unit
- Status
- Optional trend
- Optional timestamp

Use shadcn "Card".

---

15. CONVEYOR OVERVIEW CARD

Create a large card showing the current conveyor status.

Display:

- Conveyor ID
- Running/Stopped status
- Speed
- Load
- Overall health
- Current operating condition

Example:

CONVEYOR C-01

● RUNNING

Speed
2.4 m/s

Load
72%

Health
96.4%

Condition
NORMAL

Use badges and progress indicators where appropriate.

---

16. SENSOR MONITORING

Create sensor cards for:

Temperature

Temperature
25.4 °C
● NORMAL

Vibration

Vibration
3.21
● NORMAL

Current

Current
0.031 A
● NORMAL

Each sensor card should display:

- Sensor icon
- Sensor name
- Current reading
- Unit
- Status
- Trend
- Last updated
- Optional mini sparkline

Create a reusable:

"SensorCard"

component.

---

17. HEALTH GAUGE

Create a professional health gauge.

Example:

        ╭────────╮
      ╱            ╲
     │     96.4%    │
     │    HEALTH    │
      ╲            ╱
        ╰────────╯

       ● HEALTHY

The gauge should visually communicate:

- Healthy
- Warning
- Critical

Do not use excessive animation.

---

18. RUL COMPONENT

Create a Remaining Useful Life card.

Example:

REMAINING USEFUL LIFE

147 HOURS

████████████████░░░░

Estimated operating time remaining

Confidence: 91%

Use:

- Card
- Progress
- Badge

---

19. SENSOR TREND CHARTS

Use Recharts.

Create separate charts for:

Temperature

Show temperature over time.

Vibration

Show vibration over time.

Current

Show current over time.

Each chart should include:

- Chart title
- Current value
- Time axis
- Tooltip
- Grid
- Status indication where appropriate

Use realistic mock data initially.

Do not create fake alerts from random values.

---

20. RECENT ALERTS

Create a compact alert section on Dashboard.

Show:

Recent Alerts

10:42   Joint Damage       CRITICAL
10:35   High Vibration     WARNING
09:51   Temperature        WARNING
09:22   Sensor Offline     CRITICAL

Each row should include:

- Time
- Alert type
- Severity
- Status
- View action

Provide:

"View All Alerts"

button.

---

21. DIGITAL TWIN SCREEN

Create the Digital Twin page 

Layout:

Digital Twin

┌────────────────────────────────────────────┐
│                                            │
│           THREE.JS CONVEYOR                │
│              3D VIEW                       │
│                                            │
│                                            │
└────────────────────────────────────────────┘

Conveyor Status      RUNNING
Health               96.4%
Speed                2.4 m/s

Include:

- 3D conveyor visualization
- Conveyor status
- Machine health
- Speed
- Control buttons
- Selected joint information

---

22. DIGITAL TWIN CONTROLS

Act as a Senior 3D WebGL / Three.js Engineer and Full-Stack React Architect. 

Build a complete, real-time, interactive 3D Digital Twin for an industrial ore mining conveyor belt system (e.g., NMDC 1200m ST-5400 steel cord conveyor) using React and Three.js.

=============================================================================
CORE REQUIREMENTS & SPECIFICATIONS
=============================================================================

1. PROCEDURAL 3D CONVEYOR GEOMETRY & ENVIRONMENT:
   - Construct the entire conveyor procedurally without external 3D CAD dependencies:
     * Structural steel truss stringers, vertical support pillars, and yellow safety guardrails.
     * Head Drive Station with rotating drive pulley, motor gearbox, and ore discharge hood.
     * Tail Loading Station with rotating tail pulley, impact bed, and overhead ore feed hopper chute.
     * 3-Roll Troughing Idler Sets along the top carrying strand (center roll horizontal, two wing rolls at +35° and -35° trough angles) and flat horizontal return rollers on the bottom strand.
     * Dynamic Stream of Iron Ore Lumps riding on the carrying strand that recycle at the discharge end.
     * Stationary Sensor Gantries: (1) Optical Line-Scan AI Gantry with downward visible laser sheet, (2) Ultrasonic Core Scanner Bridge, (3) Tri-Axial Vibration Station on bearing housings.
   - Closed-Loop 35° Troughed Rubber Belt Ribbon:
     * Generate custom BufferGeometry with 5 transverse vertices across the width to form a 35° trough curve on the top strand and a flat profile on the return strand.
     * Procedural canvas texture featuring dark vulcanized rubber, chevron cleats, steel cord ribs, and cyan alignment lines.

2. MATHEMATICAL KINEMATICS & CONTINUOUS LOOP PHYSICS:
   - Model the closed loop of total length L_total = 2*L + 2*PI*R across 4 piecewise sections:
     (1) Top carrying strand (-L/2 to +L/2 with catenary idler sag),
     (2) Head discharge 180° arc (+L/2),
     (3) Bottom return strand (+L/2 to -L/2),
     (4) Tail hopper 180° arc (-L/2).
   - In the 60 FPS animation loop, advance belt texture UV coordinates and rotate rollers based on belt speed (m/s).
   - Propagate 6 vulcanized splice joints ('Joint-01' through 'Joint-06') along the path, matching position and orientation quaternions from tangent and normal vectors.
   - Trigger laser scan and LED glow intensity when moving joints pass under sensor gantries.

3. SPLICE JOINT ENTITIES & DYNAMIC HEALTH STATES:
   - Each joint includes: (a) Transverse Seam Bar, (b) Floating HUD Status Pin, (c) Pulsing Alert Halo Ring.
   - Status color coding:
     * OPTIMAL (Green / 0x10B981) - Healthy splice.
     * ELEVATED_WEAR (Amber / 0xF59E0B) - Moderate wear, warning glow.
     * CRITICAL_DELAMINATION (Red / 0xEF4444) - Severe delamination, pulsing halo, energetic flash.
   - Support in-place material updates without tearing down or recreating 3D geometries.

4. CAMERA RIG & 5 OPERATIONAL VIEW PRESETS:
   - Spherical orbit controls (left-click drag to rotate, wheel to zoom).
   - Smooth camera lerp transitions for 5 view modes:
     (1) Orbit (Isometric default),
     (2) Head Discharge (drive station & chute),
     (3) Tail Hopper (loading zone),
     (4) Top-Down Synoptic (full belt overview),
     (5) Follow Splice (dynamically tracks the selected moving joint along the loop).

5. INTERACTIVE RAYCASTING & SPLICE DIAGNOSTIC INSPECTOR:
   - Raycasting on pointer click to select any joint in the 3D viewport.
   - Dedicated side inspector card showing:
     * Diagnostic Status Badge & Splice Name.
     * Estimated Remaining Useful Life (RUL in days & hours) with degrading/improving trend arrows.
     * Rupture Risk Index progress bar.
     * 72-Hour Health Degradation SVG Sparkline with an active timeline needle.
     * Physical Transducer Array (Ultrasonic Thickness mm, Thermal Core °C, Vibration mm/s, Acoustic dB).
     * AI Maintenance Prescription Recommendations.

6. 72-HOUR HISTORICAL TIME-TRAVEL SCRUBBER:
   - Toggle between 'LIVE STREAM' and 'HISTORICAL PLAYBACK'.
   - Horizontal timeline slider spanning 72 hours ago to Present.
   - Play/Pause continuous clock with 1x, 5x, and 20x speed multipliers.
   - Instant O(1) indexed lookup of historical telemetry to update 3D joint health and colors in place.

7. PERFORMANCE & LIFECYCLE BEST PRACTICES:
   - Delta-time based animation smoothing.
   - Mutate existing materials/positions in-place (no re-renders/leaks).
   - Comprehensive unmount cleanup (cancel requestAnimationFrame, remove listeners, dispose renderer and textures).

---

23. JOINT DETAILS

When a conveyor joint is selected:

Open a right-side:

"Sheet"

Display:

JOINT J-04

Status
● WARNING

Health
82%

Last Inspection
08 Sep 2026

Detected Issues
Surface Damage

Confidence
93%

Recommended Action
Schedule maintenance inspection

The Sheet should not cover the entire application.

---

24. VISION MONITORING SCREEN

Create a dedicated computer vision interface.

This page should be designed for future YOLOv8 integration.

Layout:

Vision Monitoring

┌───────────────────────────┬─────────────────────────┐
│                           │ Detection Information   │
│                           │                         │
│     CAMERA / IMAGE        │ Detection: Joint       │
│                           │ Damage                  │
│     VIEWER                │                         │
│                           │ Confidence: 94%         │
│                           │ Severity: CRITICAL      │
└───────────────────────────┴─────────────────────────┘

Detection History
─────────────────────────────────────────────────────
Time       Detection       Confidence      Severity

---

25. VISION IMAGE VIEWER

Create an image/video viewer area.

The frontend must support displaying:

- Camera frame
- Uploaded image
- Processed image
- Detection results

Create a clear visual boundary around detected objects.

For YOLOv8 results, support:

- Bounding boxes
- Class name
- Confidence
- Severity

Do not implement fake AI detections.

When real YOLOv8 data is connected later, the frontend should simply render the returned detection information.

---

26. DETECTION OVERLAY

Example:

┌────────────────────────────────────┐
│                                    │
│      ┌──────────────────────┐      │
│      │ JOINT DAMAGE  94%    │      │
│      └──────────────────────┘      │
│                                    │
│          CONVEYOR BELT             │
│                                    │
└────────────────────────────────────┘

The overlay should display:

- Detection class
- Confidence
- Bounding box
- Severity

---

27. DETECTION HISTORY TABLE

Use shadcn Table.

Columns:

Time
Detection
Location
Confidence
Severity
Status
Action

Example:

10:42
Joint Damage
Joint J-04
94%
CRITICAL
Active
View

---

28. SENSOR HEALTH SCREEN

Create a dedicated sensor health page.

Structure:

Sensor Health

Overall Sensor Status

┌──────────┐ ┌──────────┐ ┌──────────┐
│Temperature│ │Vibration │ │ Current  │
│  ONLINE   │ │  ONLINE  │ │  ONLINE  │
└──────────┘ └──────────┘ └──────────┘

Sensor Trends

Sensor Details

Each sensor should show:

- Online/offline
- Reading
- Health percentage
- Last update
- Signal quality if available
- Trend

Use:

- Card
- Badge
- Progress
- Tooltip
- Chart

---

29. ALERTS SCREEN

Create a complete alert management page.

Structure:

Alerts

Alert Statistics

[Total] [Critical] [Warning] [Acknowledged]

Filters

Severity | Status | Date | Search

Alert Table

Table columns:

Time
Alert
Source
Severity
Status
Description
Action

---

30. ALERT SEVERITY

Use:

NORMAL    → Green
WARNING   → Amber
CRITICAL  → Red

Make severity immediately recognizable.

---

31. ACKNOWLEDGE ALERT

Each active alert can have:

"Acknowledge"

button.

When clicked:

Alert
 ↓
Confirmation
 ↓
Acknowledged

After acknowledgement, visually update the status.

---

32. EMERGENCY STOP

Provide a prominent Emergency Stop control where appropriate.

Use a destructive shadcn Button.

Flow:

Emergency Stop
      ↓
Confirmation Dialog
      ↓
"Are you sure you want to stop the conveyor?"
      ↓
Cancel / Confirm Stop

The button should never trigger the action accidentally.

---

33. REPORTS SCREEN

Create:

Reports
│
├── Report Statistics
├── Filters
├── Report List/Table
└── Generate Report

Report types:

- Conveyor Performance Report
- Damage Detection Report
- Sensor Health Report
- Alert History Report
- Maintenance Report

Use:

- Cards
- Table
- Tabs
- Select
- Button
- Dialog

---

34. SETTINGS SCREEN

Use Tabs.

Tabs:

General
Conveyor
Sensors
Notifications
System

Settings can contain:

General

- Application name
- User preferences

Conveyor

- Conveyor ID
- Speed limits
- Operating parameters

Sensors

- Sensor configuration
- Monitoring parameters

Notifications

- Alert notifications
- Critical alerts
- Warning alerts

System

- System information
- Version
- Connection status

Use:

- Input
- Label
- Select
- Switch
- Button
- Card

---



36. REUSABLE COMPONENTS

Create reusable components rather than duplicating UI.

Recommended structure:

components/
│
├── ui/
│   ├── button
│   ├── card
│   ├── badge
│   ├── input
│   ├── table
│   ├── dialog
│   ├── sheet
│   ├── tabs
│   ├── select
│   ├── progress
│   ├── slider
│   ├── tooltip
│   ├── separator
│   └── scroll-area
│
├── layout/
│   ├── Sidebar
│   ├── Topbar
│   └── DashboardLayout
│
├── dashboard/
│   ├── KPICard
│   ├── SensorCard
│   ├── HealthGauge
│   ├── RULCard
│   ├── SensorChart
│   └── RecentAlerts
│
├── alerts/
│   ├── AlertTable
│   ├── AlertStats
│   └── AlertFilters
│
├── vision/
│   ├── VisionViewer
│   ├── DetectionOverlay
│   ├── DetectionInfo
│   └── DetectionTable
│
└── common/
    ├── StatusBadge
    ├── LoadingState
    ├── EmptyState
    ├── ErrorState
    └── PageHeader

---

37. SHADCN/UI COMPONENT MAPPING

Use shadcn components wherever appropriate:

Cards
→ Card

Buttons
→ Button

Status labels
→ Badge

Tables
→ Table

Confirmation
→ Dialog

Side panels
→ Sheet

Tabs
→ Tabs

Dropdowns
→ Select / DropdownMenu

Progress
→ Progress

Timeline/playback
→ Slider

Forms
→ Input + Label + Form

Notifications
→ Sonner/Toast

Tooltips
→ Tooltip

Separators
→ Separator

Scrollable areas
→ ScrollArea

Do not create custom versions when a suitable shadcn component already exists.

---

38. DATA ARCHITECTURE FOR FRONTEND

For now, create mock data separately from components.

Example conceptual structure:

data/
├── dashboardData.js
├── sensorData.js
├── alertData.js
├── detectionData.js
└── reportData.js

Components should receive data through props.

Do not hardcode the same value in multiple components.

Example:

dashboardData
      ↓
Dashboard
      ↓
KPICard
SensorCard
Chart

This makes later API/Firebase integration easier.

---

39. FRONTEND STATES

Every data-driven component should consider:

Loading

Show skeleton.

Success

Show actual content.

Empty

Show meaningful empty state.

Error

Show error message and retry option.

Example:

Loading
   ↓
Success

or:

Loading
   ↓
Error
   ↓
Retry

---

40. INTERACTIONS

Implement frontend interactions such as:

- Sidebar navigation
- Active navigation state
- Tabs
- Dropdowns
- Filters
- Search
- Dialog opening/closing
- Sheet opening/closing
- Alert acknowledgement UI
- Emergency stop confirmation
- Chart tooltips
- Sensor selection
- Joint selection
- AI Assistant opening
- AI message input
- Loading states
- Toast notifications

Interactions should feel smooth but restrained.

---

41. RESPONSIVE DESIGN

Desktop is the primary target because this is an industrial control dashboard.

Still support:

- Laptop
- Tablet
- Mobile

On smaller screens:

- Collapse sidebar
- Stack cards
- Make tables horizontally scrollable
- Resize charts
- Convert multi-column layouts into one column
- Keep important status information visible

Never allow content to overflow the viewport unnecessarily.

---

42. ACCESSIBILITY

Use:

- Semantic HTML
- Proper button elements
- Labels for inputs
- Keyboard navigation
- Visible focus states
- Accessible dialog labels
- Accessible tooltips
- Good text contrast

Do not rely only on color to communicate status.

For example:

● CRITICAL

rather than only displaying a red color.

---

43. ANIMATIONS

Use subtle animations only.

Allowed:

- Fade
- Slide
- Hover
- Loading pulse
- Status indicator pulse
- Smooth sidebar transition
- Sheet/dialog transitions



The application should feel like professional industrial software.

---

44. PERFORMANCE

Keep the frontend performant.
Important:
Reuse components
Avoid unnecessary re-renders
Lazy-load large pages where useful
Avoid excessive chart rendering
Avoid unnecessary animations
Keep Three.js isolated from unrelated UI updates
Do not load huge assets unnecessarily