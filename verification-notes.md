# Verifica storefront

La pagina shop risponde correttamente dopo il caricamento iniziale: espone le categorie **Tutti**, **Oggetti quotidiani** e **Accessori**, oltre ai due prodotti Shopify di anteprima con titolo, descrizione e prezzi in euro.

Le richieste commerce sono state verificate anche lato server: il catalogo restituisce immagini, disponibilità e varianti normalizzate. Il controllo visivo proseguirà su immagini prodotto, carrello, dettaglio e versione mobile.

Le immagini prodotto di anteprima risultano caricate dal CDN Shopify e le schede sono visibili con la relativa categorizzazione. Il primo screenshot era stato acquisito durante la richiesta dati; un controllo successivo ha confermato il caricamento del catalogo.

La pagina di dettaglio della tote bag mostra immagine, prezzo, descrizione, messaggio di impatto e collegamento ai progetti dell’ETS dopo il normale caricamento della richiesta. È stata rilevata la variante tecnica predefinita di Shopify, da non esporre nell’interfaccia quando il prodotto non presenta opzioni reali.

La correzione è stata verificata nel browser: il selettore della variante tecnica non è più esposto e il pulsante di aggiunta al carrello è disponibile. È stata avviata una prova del carrello per verificare la mutazione Shopify e l’apertura del pannello laterale.

La mutazione di aggiunta ha creato correttamente un carrello Shopify, aggiornando quantità, subtotale e pannello laterale. Il prodotto di prova è stato rimosso subito dopo il controllo; il checkout non è stato aperto nel browser personale, ma il relativo URL sicuro viene verificato nei test commerce esistenti.

Gli stati di caricamento sono stati sostituiti con skeleton coerenti con la palette del sito. La pagina prodotto passa dal caricamento progressivo al contenuto completo senza esporre varianti tecniche; la sessione browser conferma nuovamente un carrello vuoto.
