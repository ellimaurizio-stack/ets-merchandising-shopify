import type { ReactNode } from "react";
import { CartDrawer } from "./CartDrawer";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfcfd] text-[#334155]">
      <SiteHeader />
      {children}
      <SiteFooter />
      <CartDrawer />
    </div>
  );
}
