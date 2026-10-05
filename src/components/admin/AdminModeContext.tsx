'use client';

import React, { createContext, useContext, useState } from 'react';

export type AdminCanvasMode = 'preview' | 'studio';

interface AdminModeContextType {
  mode: AdminCanvasMode;
  setMode: (mode: AdminCanvasMode) => void;
}

const AdminModeContext = createContext<AdminModeContextType>({
  mode: 'preview',
  setMode: () => {},
});

export function AdminModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AdminCanvasMode>('preview');

  return (
    <AdminModeContext.Provider value={{ mode, setMode }}>
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  return useContext(AdminModeContext);
}
