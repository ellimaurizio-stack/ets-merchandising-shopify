import { useCart } from "@/contexts/CartContext";
import { Link, useLocation } from "wouter";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  // { label: "Home", href: "/" },
  { label: "Lo shop", href: "/shop" },
  // { label: "Il nostro impatto", href: "/#impatto" },
  // { label: "A-Tono ETS", href: "https://ets.a-tono.com" },
];

export function SiteHeader() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#2b3e52]/95 text-white shadow-[0_12px_30px_rgba(25,45,65,0.16)] backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex shrink-0 items-center" aria-label="A-Tono ETS — home shop">
          <img
            src="/manus-storage/ets-logo-navbar_11e75fec.png"
            alt="A-Tono ETS"
            className="h-8 w-auto sm:h-9"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigazione principale">
          {navigation.map(item => {
            const isCurrent = item.href === location;
            const isExternal = item.href.startsWith("http");
            return isExternal ? (
              <a key={item.label} href={item.href} className="nav-link" target="_blank" rel="noreferrer">
                {item.label}
              </a>
            ) : (
              <Link key={item.label} href={item.href} className={isCurrent ? "nav-link nav-link-active" : "nav-link"}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button type="button" className="cart-button" onClick={openCart} aria-label={`Apri carrello, ${itemCount} prodotti`}>
            <ShoppingBag aria-hidden="true" size={19} strokeWidth={1.8} />
            <span className="hidden text-[11px] font-bold uppercase tracking-[0.16em] sm:inline">Carrello</span>
            <span className="cart-count" aria-hidden="true">{itemCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(open => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 transition-colors hover:bg-white/10 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
          >
            {menuOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={23} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-navigation" className="border-t border-white/10 bg-[#2b3e52] px-5 py-5 lg:hidden" aria-label="Navigazione mobile">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-1 sm:px-3">
            {navigation.map(item => {
              const isExternal = item.href.startsWith("http");
              const commonClass = "rounded-md px-3 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10";
              return isExternal ? (
                <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className={commonClass} onClick={() => setMenuOpen(false)}>{item.label}</a>
              ) : (
                <Link key={item.label} href={item.href} className={commonClass} onClick={() => setMenuOpen(false)}>{item.label}</Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
