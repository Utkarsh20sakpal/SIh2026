import { createSlice } from '@reduxjs/toolkit'

export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarCollapsed: false,
    sidebarMobileOpen: false,
    aiOpen: false,
    emergencyDialog: false,
    toasts: [],
  },
  reducers: {
    toggleSidebar:        s => { s.sidebarCollapsed = !s.sidebarCollapsed },
    setSidebarMobile:     (s, a) => { s.sidebarMobileOpen = a.payload },
    setAIOpen:            (s, a) => { s.aiOpen = a.payload },
    toggleAI:             s => { s.aiOpen = !s.aiOpen },
    setEmergencyDialog:   (s, a) => { s.emergencyDialog = a.payload },
    pushToast: (s, a) => { s.toasts.push({ id: Date.now().toString(), ...a.payload }) },
    removeToast: (s, a) => { s.toasts = s.toasts.filter(t => t.id !== a.payload) },
  },
})

export const { toggleSidebar, setSidebarMobile, setAIOpen, toggleAI, setEmergencyDialog, pushToast, removeToast } = uiSlice.actions
export default uiSlice.reducer
