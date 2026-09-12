export function SiteFooter() {
  return (
    <footer className="flex flex-col bg-[#2b3e52] text-white pt-16 pb-8 px-[5%]">
      <div className="flex flex-wrap justify-between gap-8 mx-auto w-full max-w-[1280px]">
        
        <div className="flex flex-col">
          <h4 className="text-[#9fc0dc] text-[1.1rem] uppercase font-semibold mb-2">Hai bisogno di aiuto?</h4>
          <p>
            <a href="mailto:ets@a-tono.com" className="text-inherit no-underline font-bold text-[1.2rem] border-b-2 border-current pb-1 hover:text-[#9fc0dc] transition-colors">Contattaci</a>
          </p>
        </div>
        
        <div className="flex flex-col text-[0.95rem]">
          <h4 className="uppercase font-semibold mb-2 text-white">MILANO</h4>
          <p className="text-white/70 leading-relaxed">Corso Buenos Aires, 77<br/>20124 (MI)</p>
        </div>
        
        <div className="flex flex-col text-[0.95rem]">
          <h4 className="uppercase font-semibold mb-2 text-white">A-Tono E.T.S.</h4>
          <p className="text-white/70 leading-relaxed"><a href="https://ets.a-tono.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">ets.a-tono.com</a></p>
        </div>
        
        <div className="flex flex-col text-[0.95rem]">
          <h4 className="uppercase font-semibold mb-2 text-white">Codice Fiscale</h4>
          <p className="text-white/70 leading-relaxed">97737800157</p>
        </div>

      </div>
      
      <div className="text-center mt-12 pt-8 border-t border-white/10 text-[0.9rem] text-white/50 max-w-[1280px] w-full mx-auto">
        A-Tono E.T.S. - Ente del terzo settore - Codice Fiscale 97737800157
      </div>
    </footer>
  );
}
