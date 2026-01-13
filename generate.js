const fs = require("fs");
const path = require("path");
const https = require("https");

// Αρχείο RSS
const rssFile = path.join(__dirname, "rss.xml");

// Σημερινή ημερομηνία
const dateObj = new Date();
const dd = String(dateObj.getDate()).padStart(2, "0");
const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
const yy = String(dateObj.getFullYear()).slice(-2);
const todayStr = `${dd}${mm}${yy}`;         
const todayDisplay = `${dd}/${mm}/${dateObj.getFullYear()}`;

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

// Helper: check αν υπάρχει η εικόνα (HEAD request)
function checkImage(url) {
  return new Promise(resolve => {
    https.request(url, { method: "HEAD" }, res => {
      resolve(res.statusCode === 200);
    }).on("error", () => resolve(false)).end();
  });
}

// Διαβάζουμε παλιό RSS και κρατάμε μέχρι 6 προηγούμενες μέρες
let oldItems = [];
let existingUrls = new Set(); // για skip του checkImage
if (fs.existsSync(rssFile)) {
  const content = fs.readFileSync(rssFile, "utf8");
  const itemsMatch = content.match(/<item>[\s\S]*?<\/item>/g);
  if (itemsMatch) {
    const cutoff = new Date(dateObj.getTime() - 6*24*60*60*1000); // 6 μέρες πίσω
    oldItems = itemsMatch.filter(item => {
      const dateMatch = item.match(/<title>.* – (\d+)\/(\d+)\/(\d+)<\/title>/);
      if (!dateMatch) return false;
      const [ , d, m, y ] = dateMatch;
      const itemDate = new Date(`${y}-${m}-${d}`);
      return itemDate >= cutoff;
    });

    // Συλλέγουμε URLs για ήδη υπάρχουσες εικόνες
    oldItems.forEach(item => {
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      if (linkMatch) existingUrls.add(linkMatch[1]);
    });
  }
}

// Δημιουργούμε νέα items για σήμερα
async function createRSS() {
  let newItems = "";

  for (const [title, slug] of Object.entries(papers)) {
    const imgUrl = `https://protoselidaefimeridon.gr/efimerides/${todayStr}/${slug}.JPG`;

    // Skip αν υπάρχει ήδη στο ιστορικό
    if (existingUrls.has(imgUrl)) {
      newItems += oldItems.find(i => i.includes(imgUrl)) + "\n";
      continue;
    }

    // Έλεγχος αν η εικόνα υπάρχει στο server
    const exists = await checkImage(imgUrl);
    if (!exists) continue;

    newItems += `
<item>
<title>${title} – ${todayDisplay}</title>
<link>${imgUrl}</link>
<description><![CDATA[
<img src="${imgUrl}" style="max-width:100%;" />
]]></description>
</item>`;
  }

  // Νέο RSS: νέα items πάνω από παλιά (χωρίς duplicates)
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Πρωτοσέλιδα Εφημερίδων</title>
<link>https://protoselidaefimeridon.gr</link>
<description>Ημερήσια πρωτοσέλιδα</description>

${newItems}
${oldItems.join("\n")}

</channel>
</rss>`;

  fs.writeFileSync(rssFile, rss, "utf8");
  console.log("RSS updated successfully with 7-day history!");
}

createRSS();
