(()=>{"use strict";window.addEventListener("message",(t=>o));const t=document.getElementById("aggiungiCopia");null==t||t.addEventListener("click",(function(){null!=e&&(e.style.display="flex")}));const e=document.getElementById("popupRegistraCopia"),n=document.getElementById("chiudiPopup");function o(t){if("object"==typeof t.data&&"materia"in t.data&&"isbn"in t.data&&"autore"in t.data&&"titolo"in t.data&&"volume"in t.data&&"editore"in t.data&&"prezzoListino"in t.data&&"classe"in t.data&&"nCopie"in t.data){const e=t.data;console.log(e);const n=document.getElementById("corpoInfoLibro");n.innerHTML="";const o=document.createElement("tr");o.innerHTML=`<td>${e.materia}</td><td>${e.isbn}</td><td>${e.autore}</td><td>${e.titolo}</td><td>${e.volume}</td><td>${e.editore}</td><td>${e.prezzoListino}</td><td>${e.classe}</td>`,n.appendChild(o);const d=document.getElementById("corpoTabellaCopie");d.innerHTML="",console.log(d);const i=e.getCopieAsArray();for(let t=0;t<e.getNCopie();t++){let e=i[t];const n=document.createElement("tr");n.innerHTML=`<td>${e.codiceUnivoco}</td><td>${e.venditore}</td><td>${e.scontoPrezzoListino}</td>`,d.appendChild(n)}}}null==n||n.addEventListener("click",(function(){null!=e&&(e.style.display="none")}))})();