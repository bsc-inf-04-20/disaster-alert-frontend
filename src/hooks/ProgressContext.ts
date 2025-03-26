// src/contexts/ProgressContext.tsx
/*import { createContext, useContext, useState, ReactNode } from 'react';

interface ProgressContextType {
  progress: UserProgress;
  markDocumentAsViewed: (moduleId: string, documentId: string) => void;
  getModuleProgress: (moduleId: string) => number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(() => {
    // Initialize from localStorage or create empty progress
    const saved = localStorage.getItem('userProgress');
    return saved ? JSON.parse(saved) : { userId: 'current-user', modules: [] };
  });

  const markDocumentAsViewed = (moduleId: string, documentId: string) => {
    setProgress(prev => {
      // Find or create module progress
      const moduleIndex = prev.modules.findIndex(m => m.moduleId === moduleId);
      let updatedModules = [...prev.modules];
      
      if (moduleIndex === -1) {
        // New module progress
        updatedModules.push({
          moduleId,
          documentsViewed: [documentId],
          completed: false
        });
      } else {
        // Update existing progress if document not already viewed
        const moduleProgress = updatedModules[moduleIndex];
        if (!moduleProgress.documentsViewed.includes(documentId)) {
          updatedModules[moduleIndex] = {
            ...moduleProgress,
            documentsViewed: [...moduleProgress.documentsViewed, documentId],
            lastAccessed: new Date()
          };
        }
      }

      const newProgress = { ...prev, modules: updatedModules };
      localStorage.setItem('userProgress', JSON.stringify(newProgress));
      return newProgress;
    });
  };

  const getModuleProgress = (moduleId: string) => {
    const moduleProgress = progress.modules.find(m => m.moduleId === moduleId);
    return moduleProgress ? moduleProgress.documentsViewed.length : 0;
  };

  return (
    <ProgressContext.Provider value={{ progress, markDocumentAsViewed, getModuleProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}*/