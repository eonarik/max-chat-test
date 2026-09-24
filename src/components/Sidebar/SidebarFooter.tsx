import type { FunctionComponent } from "react";

interface SidebarFooterProps {
  onLogout: () => void;
}

const SidebarFooter: FunctionComponent<SidebarFooterProps> = ({ onLogout }) => {
  return (
    <div className="h-12 px-3 flex items-center shrink-0 border-t border-gray-100">
      <button
        onClick={onLogout}
        className="w-full text-detail text-max-text-secondary hover:text-max-error transition-colors text-left"
      >
        Выйти
      </button>
    </div>
  );
};

export default SidebarFooter;
