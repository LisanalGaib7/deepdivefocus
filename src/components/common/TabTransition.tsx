import { ReactNode, useEffect, useState } from "react";

interface TabTransitionProps {
  activeKey: string;
  children: ReactNode;
}

/**
 * Lightweight fluid tab-swap wrapper. On `activeKey` change, replays a short
 * fade+lift+blur-clear animation. Respects prefers-reduced-motion (via CSS
 * media query on .tab-transition-in).
 */
const TabTransition = ({ activeKey, children }: TabTransitionProps) => {
  const [renderKey, setRenderKey] = useState(activeKey);

  useEffect(() => {
    setRenderKey(activeKey);
  }, [activeKey]);

  return (
    <div key={renderKey} className="tab-transition-in">
      {children}
    </div>
  );
};

export default TabTransition;
