export function SiteFooter() {
  return (
    <footer className="bg-[#2b3e52] text-white pt-[4rem] pb-[2rem] px-[5%]">
      <div className="max-w-[1200px] mx-auto flex flex-wrap justify-between items-start border-b border-white/20 pb-[2rem]">
        
        <div className="flex-1 min-w-[200px] mb-4 text-[0.95rem]">
          <h4 style={{ color: "#7a9cbf", fontSize: "1.1rem", textTransform: "uppercase", marginBottom: "8px" }}>Hai bisogno di aiuto?</h4>
          <p style={{ marginTop: 0 }}>
            <a href="https://ellimaurizio-stack.github.io/ETS_sito/contatti.html" style={{ color: "inherit", textDecoration: "none", fontWeight: "bold", fontSize: "1.2rem", borderBottom: "2px solid currentColor" }}>Contattaci</a>
          </p>
        </div>
        
        <div className="flex-1 min-w-[200px] mb-4 text-[0.95rem]">
          <h4 className="font-bold text-[1.1rem] mb-2 uppercase">MILANO</h4>
          <p className="m-0 leading-relaxed">Corso Buenos Aires, 77<br/>20124 (MI)</p>
        </div>
        
        <div className="flex-1 min-w-[200px] mb-4 text-[0.95rem]">
          <h4 className="font-bold text-[1.1rem] mb-2 uppercase">A-Tono E.T.S.</h4>
          <p className="m-0 leading-relaxed">
            <a href="https://ets.a-tono.com" target="_blank" rel="noreferrer" className="text-white hover:text-[#7a9cbf] transition-colors">ets.a-tono.com</a><br/>
            Ente del terzo settore
          </p>
        </div>
        
        <div className="flex-1 min-w-[200px] mb-4 text-[0.95rem]">
          <h4 className="font-bold text-[1.1rem] mb-2 uppercase">Codice Fiscale</h4>
          <p className="m-0 leading-relaxed">97737800157</p>
        </div>

        <div className="text-center w-full lg:text-right lg:w-auto font-heading text-[2rem] font-semibold mt-4 lg:mt-0">
          <img src="https://ellimaurizio-stack.github.io/ETS_sito/img/ets-logo-navbar.png" alt="e-ts" style={{ maxHeight: "50px", display: "inline-block" }} />
        </div>

      </div>
      
      <div className="text-center pt-[2rem] text-[0.85rem] opacity-70">
        A-Tono E.T.S. - Ente del terzo settore - Codice Fiscale 97737800157
      </div>
    </footer>
  );
}
