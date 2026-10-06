'use client';

import React, { createContext, useContext, useState } from 'react';

export type AdminCanvasMode = 'preview' | 'studio';

interface AdminModeContextType {
  mode: AdminCanvasMode;
  setMode: (mode: AdminCanvasMode) => void;
  basePath?: string;
}

const AdminModeContext = createContext<AdminModeContextType>({
  mode: 'preview',
  setMode: () => {},
  basePath: '',
});

export function AdminModeProvider({ 
  children,
  basePath = '',
}: { 
  children: React.ReactNode;
  basePath?: string;
}) {
  const [mode, setMode] = useState<AdminCanvasMode>('preview');

  return (
    <AdminModeContext.Provider value={{ mode, setMode, basePath }}>
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  return useContext(AdminModeContext);
}
