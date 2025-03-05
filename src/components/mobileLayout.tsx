import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const AppDrawer = ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed top-0 left-0 w-full h-full z-[2000] bg-white">
      {children}
    </div>,
    document.body
  );
};

export default AppDrawer;