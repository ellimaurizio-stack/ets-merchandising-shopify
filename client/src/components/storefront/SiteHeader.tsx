import { useCart } from "@/contexts/CartContext";
import { Link, useLocation } from "wouter";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { label: "Home", href: "https://www.ets-atono.com/index.html" },
  { label: "Chi Siamo", href: "https://www.ets-atono.com/chi-siamo.html" },
  { label: "Progetti", href: "https://www.ets-atono.com/progetti.html" },
  { label: "Sostienici", href: "https://www.ets-atono.com/sostienici.html" },
  { label: "Contatti", href: "https://www.ets-atono.com/contatti.html" },
  { label: "Shop", href: "/shop" },
];

export function SiteHeader() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, openCart } = useCart();

  return (
    <header className="sticky top-0 z-[1000] bg-[#2b3e52] text-white">
      <div className="flex items-center justify-between px-[5%] py-[1.5rem] w-full">
        <Link href="/" className="flex shrink-0 items-center gap-[10px] font-semibold text-[1.8rem] text-white no-underline" style={{ fontFamily: "Roboto, sans-serif" }} aria-label="A-Tono ETS">
          <img
            src="https://www.ets-atono.com/img/ets-logo-navbar.png"
            alt="A-Tono ETS"
            style={{ maxHeight: "40px", width: "auto" }}
          />
        </Link>

        {/* Desktop Nav and Cart */}
        <div className="hidden lg:flex items-center gap-[2rem]">
          <nav className="flex items-center gap-[2rem]" aria-label="Navigazione principale">
            {navigation.map(item => {
              const isCurrent = item.href === location || (item.label === "Shop" && location === "/");
              const isExternal = item.href.startsWith("http");
              
              const baseClass = "text-[0.9rem] font-normal uppercase tracking-[1px] transition-colors";
              const activeClass = "text-[#7a9cbf] border-b-[2px] border-[#7a9cbf] pb-[4px]";
              const inactiveClass = "text-white hover:text-[#7a9cbf]";
              
              const linkClass = `${baseClass} ${isCurrent ? activeClass : inactiveClass}`;

              return isExternal ? (
                <a key={item.label} href={item.href} className={linkClass}>
                  {item.label}
                </a>
              ) : (
                <Link key={item.label} href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Cart Icon styled simply like a nav link */}
          <button type="button" className="flex items-center gap-1.5 text-white hover:text-[#7a9cbf] transition-colors" onClick={openCart} aria-label={`Apri carrello, ${itemCount} prodotti`}>
            <ShoppingBag aria-hidden="true" size={20} />
            <span className="text-[0.9rem] font-normal">({itemCount})</span>
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-4 lg:hidden">
          <button type="button" className="flex items-center gap-1.5 text-white hover:text-[#7a9cbf] transition-colors" onClick={openCart} aria-label={`Apri carrello, ${itemCount} prodotti`}>
            <ShoppingBag aria-hidden="true" size={24} />
            <span className="text-[0.9rem] font-normal">({itemCount})</span>
          </button>
          
          <div
            onClick={() => setMenuOpen(open => !open)}
            className="text-white text-[2rem] cursor-pointer select-none"
            aria-expanded={menuOpen}
          >
            &#9776;
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav className="absolute top-[70px] left-0 w-full bg-[#2b3e52] py-8 text-center shadow-[0_4px_6px_rgba(0,0,0,0.1)] lg:hidden">
          <div className="flex flex-col items-center gap-6 m-0 p-0">
            {navigation.map(item => {
              const isCurrent = item.href === location || (item.label === "Shop" && location === "/");
              const isExternal = item.href.startsWith("http");
              
              const baseClass = "text-[0.9rem] font-normal uppercase tracking-[1px] transition-colors";
              const activeClass = "text-[#7a9cbf] border-b-[2px] border-[#7a9cbf] pb-[4px]";
              const inactiveClass = "text-white hover:text-[#7a9cbf]";
              
              const linkClass = `${baseClass} ${isCurrent ? activeClass : inactiveClass}`;

              return isExternal ? (
                <a key={item.label} href={item.href} className={linkClass} onClick={() => setMenuOpen(false)}>{item.label}</a>
              ) : (
                <Link key={item.label} href={item.href} className={linkClass} onClick={() => setMenuOpen(false)}>{item.label}</Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
