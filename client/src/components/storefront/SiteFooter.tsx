export function SiteFooter() {
  return (
    <footer className="flex flex-col bg-[#eaf2f8] text-[#2b3e52] pt-16 pb-8 px-[5%]">
      <div className="flex flex-wrap justify-between gap-8 mx-auto w-full max-w-[1280px]">
        
        <div className="flex flex-col">
          <h4 className="text-[#7a9cbf] text-[1.1rem] uppercase font-semibold mb-2">Hai bisogno di aiuto?</h4>
          <p>
            <a href="mailto:ets@a-tono.com" className="text-inherit no-underline font-bold text-[1.2rem] border-b-2 border-current pb-1 hover:text-[#7a9cbf] transition-colors">Contattaci</a>
          </p>
        </div>
        
        <div className="flex flex-col text-[0.95rem]">
          <h4 className="uppercase font-semibold mb-2 text-[#2b3e52]">MILANO</h4>
          <p className="text-slate-600 leading-relaxed">Corso Buenos Aires, 77<br/>20124 (MI)</p>
        </div>
        
        <div className="flex flex-col text-[0.95rem]">
          <h4 className="uppercase font-semibold mb-2 text-[#2b3e52]">A-Tono E.T.S.</h4>
          <p className="text-slate-600 leading-relaxed"><a href="https://ets.a-tono.com" target="_blank" rel="noreferrer" className="hover:underline">ets.a-tono.com</a></p>
        </div>
        
        <div className="flex flex-col text-[0.95rem]">
          <h4 className="uppercase font-semibold mb-2 text-[#2b3e52]">Codice Fiscale</h4>
          <p className="text-slate-600 leading-relaxed">97737800157</p>
        </div>

      </div>
      
      <div className="text-center mt-12 pt-8 border-t border-black/10 text-[0.9rem] text-slate-500 max-w-[1280px] w-full mx-auto">
        A-Tono E.T.S. - Ente del terzo settore - Codice Fiscale 97737800157
      </div>
    </footer>
  );
}
