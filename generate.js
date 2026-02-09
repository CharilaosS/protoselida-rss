const fs = require("fs");
const https = require("https");

const date = new Date();
const dd = String(date.getDate());
const mm = String(date.getMonth() + 1).padStart(2, "0");
const yy = String(date.getFullYear()).slice(-2);

// Όλες οι εφημερίδες και τα slugs τους
const papers = {
  "Καθημερινή": "kathimerini",
  "Δημοκρατία": "dimokratia",
  "Εστία": "estia",
  "Πρώτο Θέμα": "protothema",
  "Real News": "realnews",
  "Το Βήμα Κυριακής": "tovimatiskyriakis",
  "MetroSport": "metrosport",
  "Μακελειό": "makelio",
  "iEfimerida": "iefimerida",
  "Τύπος Θεσσαλονίκης": "typosthessalonikis",
  "Ναυτεμπορική": "naftemporiki",
  "Ελεύθερος Τύπος": "eleftherostypos",
  "ΤΑ ΝΕΑ": "tanea",
  "Kontra News": "kontranews",
  "Το Manifesto": "to-manifesto",
  "Ελεύθερη Ωρα": "eleftheriora"
};

// Helper για έλεγχο αν υπάρχει εικόνα
function checkImage(url) {
  return new Promise(resolve => {
    https.request(url, { method: "HEAD" }, res => {
      resolve(res.statusCode === 200);
    }).on("error", () => resolve(false)).end();
  });
}

async function generateRSS() {
  let items = "";

  for (const [title, slug] of Object.entries(papers)) {
    const img = `https://www.protoselidaefimeridon.gr/efimerides/${yy}${mm}${dd}/${slug}.JPG`;
    
    // Έλεγχο αν υπάρχει η εικόνα
    const exists = await checkImage(img);
    if (!exists) continue; // skip αν δεν υπάρχει

    items += `
<item>
<title>${title} – ${dd}/${mm}/${yy}</title>
<link>${img}</link>
<description><![CDATA[
<img src="${img}" />
]]></description>
</item>`;
  }

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Πρωτοσέλιδα Εφημερίδων</title>
<link>https://protoselidaefimeridon.gr</link>
<description>Ημερήσια πρωτοσέλιδα</description>
${items}
</channel>
</rss>`;

  fs.writeFileSync("rss.xml", rss, "utf8");
  console.log("RSS generated successfully!");
}

generateRSS();
