import { Suspense } from "react";
import { MenuBrowser } from "./MenuBrowser";

// useSearchParams() inside MenuBrowser needs a Suspense boundary for the
// page to prerender its static shell.
export default function MenuBrowserPage() {
  return (
    <Suspense fallback={null}>
      <MenuBrowser />
    </Suspense>
  );
}
