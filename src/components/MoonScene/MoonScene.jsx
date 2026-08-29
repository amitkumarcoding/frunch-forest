import { Suspense, lazy } from "react";
import "./MoonScene.css";

// three.js is heavy (~600kb) — load it only when night mode actually
// mounts this component, not in the main bundle.
const MoonCanvas = lazy(() => import("./MoonCanvas"));

export default function MoonScene() {
  return (
    <div className="moon-scene" aria-hidden="true">
      <Suspense fallback={null}>
        <MoonCanvas />
      </Suspense>
    </div>
  );
}
