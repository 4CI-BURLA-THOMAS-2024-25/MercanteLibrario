#set page(width: 210mm, height: 297mm) // Formato A4
#set text(font: "Bungee Tint", size: 14pt)
//-------------------------------------------------------
#set table(
  stroke: none,
  gutter: 0.2em,
  fill: (x, y) =>
    if x == 0 or y == 0 { rgb(70, 76, 77) },
  inset: (right: 1.5em),
)

#show table.cell: it => {
  if it.x == 0 or it.y == 0 {
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
// Titolo
= RICEVUTA ACQUISTO LIBRI di ClienteX: //${libro.titolo}

// Linea divisoria
#rect(fill: rgb(196, 239, 245), width: 80%, height: 1mm)

// Box con i dettagli dell'acquisto
#box(
    stroke: 1pt,
    fill: rgb(196, 239, 245),
    inset: 12pt,
    radius: 4pt
)[
    #set text(size: 18pt)

    **DATA DI ACQUISTO:**  
    // Scrivi la data qui manualmente o usa un comando esterno.

	#table(
	  columns: 3,
	  [], [TITOLO], [PREZZO],

	  [1], [libro1], [prezzo1],
	  [2], [libro2], [prezzo1],
	  [3], [libro3], [prezzo3],
	)


]

// Linea separazione
#rect(fill: rgb(211, 211, 211), width: 100%, height: 1mm)

// Messaggio finale
#box(
    stroke: 1pt,
    inset: 12pt,
    radius: 6pt
)[
    *Grazie per aver utilizzato il nostro servizio!*  
    *Ci auguriamo di rivedervi presto.*
]

// URL sito
#align(center)[
    *www.mercatinolibri.it*
]

// Logo Marconi
#image("logoMarconi.png")

