#set page(width: 210mm, height: 297mm, margin: (x: 1.2cm, y: 1.0cm),) // Formato A4
#set text(font: "Bungee Tint", size: 14pt)
//-------------------------------------------------------
#set table(
  stroke: 0.5pt,
  gutter: 0.2em,
  fill: (x, y) =>
    if y == 0 { rgb(70, 76, 77) },
  inset: (right: 1.5em),
)

#show table.cell: it => {
  if it.y == 0 {
    set text(white)
    strong(it)
  } else if it.body == [] {
    // Replace empty cells with 'N/A'
    pad(..it.inset)[_N/A_]
  } else {
    it
  }
}
//-------------------------------------------------------
// Logo Marconi
#align(center+top)[
	#image("logoMarconi.png", width: 50%)
]

#text(size: 14pt)[
  = *RICEVUTA ACQUISTO LIBRI di ClienteX:* //${libro.titolo}
]


// Box con i dettagli di acquisto
#box(
    stroke: 1pt,
    fill: rgb(220, 242, 242),
    inset: 12pt,
    radius: 4pt
)[
    #set text(size: 12pt)

    **DATA DI ACQUISTO:**  

	#table(
	  columns: 2,
	  [TITOLO], [PREZZO],
	  [STRADA CON L'ALTRO - EDIZIONE VERDE (LA)], [23€],
	  [SISTEMI E RETI SECONDA EDIZIONE - VOLUME 2], [34€],
	  [STORIE IN TASCA - MITO ED EPICA], [12€],
	  [TECNICA DELL'AUTOMOBILE MANUALE DI TECNOLOGIA DEI VEICOLI A MOTORE], [20€],
	  [PER PARLARE E SCRIVERE BENE  VOLUME BASE], [21€],
	  [VALORE STORIA 2 DALLA MET� DEL SEICENTO ALLA FINE DELL'OTTOCENTO], [50€],
	  [CORSO DI LOGISTICA E TRASPORTI  SPEDIZIONI], [61€],
	  [ELETTROTECNICA ED ELETTRONICA 2 CON OPENBOOK VOLUME 2], [52€],
	  [CHIMICA PRATICA - LIBRO MISTO CON LIBRO DIGITALE], [50€],
	  [CODICE LETTERARIO 2020 - LIBRO MISTO CON LIBRO DIGITALE  VOLUME 3A], [14€],
	  [VENTURI EZIO,NUOVO CORSO DI SISTEMI AUTOMATICI  PER L'ARTICOLAZIONE ELETTRONICA], [20€],
	  [CORSO DI LOGISTICA E TRASPORTI  SPEDIZIONI- NORMATIVA E COMMERCIO INTERNAZIONALE], [34€],
	  [CORSO DI LOGISTICA E TRASPORTI  SPEDIZIONI- NORMATIVA E COMMERCIO INTERNAZIONALE], [34€],
	  [CORSO DI LOGISTICA E TRASPORTI  SPEDIZIONI- NORMATIVA E COMMERCIO INTERNAZIONALE], [34€],
	  [CORSO DI LOGISTICA E TRASPORTI  SPEDIZIONI- NORMATIVA E COMMERCIO INTERNAZIONALE], [34€],
	  [CORSO DI LOGISTICA E TRASPORTI  SPEDIZIONI- NORMATIVA E COMMERCIO INTERNAZIONALE], [34€],
	  [CORSO DI LOGISTICA E TRASPORTI  SPEDIZIONI- NORMATIVA E COMMERCIO INTERNAZIONALE], [34€],
	)


]

#v(1pt)
#align(center+top)[
	#image("qr.png", width: 20%)
]
#v(0pt)
// URL sito
#align(center)[
    *www.mercatinolibri.it*
]

