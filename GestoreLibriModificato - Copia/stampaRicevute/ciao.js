const data = {
  title: "Report 2023",
  author: "Mario Rossi",
  items: ["Item 1", "Item 2", "Item 3"],
  showFooter: true
};

const xamlTemplate = {
  root: {
    type: "Page",
    children: [
      {
        type: "Header",
        content: "$title", // Placeholder per i dati dinamici
        fontSize: 20
      },
      {
        type: "List",
        items: "$items" // Placeholder per la lista
      },
      {
        type: "Footer",
        content: "Autore: $author",
        visible: "$showFooter"
      }
    ]
  }
};

function convertToTypst(node, data) {
  let typstCode = "";

  switch (node.type) {
    case "Page":
      typstCode += "#set page(width: 8.5in, height: 11in)\n";
      typstCode += node.children.map(child => convertToTypst(child, data)).join("\n");
      break;
    case "Header":
      typstCode += `#heading(size: ${node.fontSize})[${data.title}]`;
      break;
    case "List":
      typstCode += "#list[\n" + data.items.map(item => `  - ${item}`).join("\n") + "\n]";
      break;
    case "Footer":
      if (data.showFooter) {
        typstCode += `#text(style: "italic")[${node.content.replace("$author", data.author)}]`;
      }
      break;
  }

  return typstCode;
}

// Genera il codice Typst finale
const typstOutput = convertToTypst(xamlTemplate.root, data);
console.log(typstOutput);