export function SiteFooter() {
  return (
    <footer className="bg-[#2b3e52] px-5 pb-7 pt-14 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-10 border-b border-white/20 pb-10 sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr_auto] lg:gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9fc0dc]">Hai bisogno di aiuto?</p>
            <a className="mt-3 inline-block border-b-2 border-current pb-1 font-display text-2xl font-light transition-colors hover:text-[#9fc0dc]" href="mailto:ets@a-tono.com">Contattaci</a>
          </div>
          <div className="footer-block"><p>Milano</p><span>Corso Buenos Aires, 77<br />20124 (MI)</span></div>
          <div className="footer-block"><p>A-Tono E.T.S.</p><a href="https://ets.a-tono.com" target="_blank" rel="noreferrer">ets.a-tono.com</a><span>Ente del terzo settore</span></div>
          <div className="footer-block"><p>Codice fiscale</p><span>97737800157</span></div>
          <img src="/manus-storage/ets-logo-navbar_11e75fec.png" alt="A-Tono ETS" className="h-10 w-auto self-end justify-self-start lg:justify-self-end" />
        </div>
        <p className="pt-6 text-center text-[11px] uppercase tracking-[0.11em] text-white/55">A-Tono E.T.S. — Ente del Terzo Settore — Codice Fiscale 97737800157</p>
      </div>
    </footer>
  );
}
