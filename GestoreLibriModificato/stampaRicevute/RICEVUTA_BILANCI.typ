#set page(width: 210mm, height: 297mm) //Formato A4
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
//Logo marconi
#image("logoMarconi.png")

//Intestazone
= RICEVUTA LIBRI #underline[VENDUTI] di ClienteX


//Box con la lista dei libri venduti
#box(
    stroke: 1pt, //
    fill: rgb(196, 239, 245), 
    inset: 12pt, // 
    radius: 4pt //
)[
    #set text(size: 18pt) 

    #table(
	  columns: 4,
	  [], [TITOLO], [PREZZO DI ACQUISTO], [DATA VENDITA],

	  [1], [libro1], [prezzo1], [data1],
	  [2], [libro2], [prezzo1], [data2],
	  [3], [libro3], [prezzo3], [data3],
	)
	*TOTALE VENDUTO:*
]


// Linea divisoria
#rect(fill: rgb(211, 211, 211), width: 100%, height: 1mm) 


= RICEVUTA LIBRI #underline[INVENDUTI] di ClienteX


//Box con la lista dei libri invenduti
#box(
    stroke: 1pt, //
    fill: rgb(196, 239, 245), 
    inset: 12pt, // 
    radius: 4pt //
)[
    #set text(size: 18pt) 

    #table(
	  columns: 2,
	  [], [TITOLO], 

	  [1], [libro1],
	  [2], [libro2], 
	  [3], [libro3],
	)
]


// Linea divisoria
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

//URL sito
#align(center)[
	*www.mercatinolibri.it*
]


