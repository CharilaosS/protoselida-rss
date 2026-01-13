const fs = require("fs");

const date = new Date();
const dd = String(date.getDate()).padStart(2, "0");
const mm = String(date.getMonth() + 1).padStart(2, "0");
const yy = String(date.getFullYear()).slice(-2);

const papers = {
  "Δημοκρατία": "dimokratia",
  "Καθημερινή": "kathimerini",
  "Τα Νέα": "ta_nea"
};

let items = "";
for (const [title, slug] of Object.entries(papers)) {
  const img = `https://www.protoselidaefimeridon.gr/efimerides/${yy}${mm}${dd}/${slug}.JPG`;
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

fs.writeFileSync("rss.xml", rss);
