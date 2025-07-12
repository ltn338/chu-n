const axios = require("axios");
const fs = require("fs");

const inputFile = "list_api.txt";
const outputFile = "checkapi.txt";

// Đọc danh sách URL
const urls = fs.readFileSync(inputFile, "utf-8")
  .split("\n")
  .map(x => x.trim())
  .filter(x => x && !x.includes("i.imgur.com")); // Bỏ qua link imgur

(async () => {
  let result = "";
  for (let url of urls) {
    try {
      await axios.get(url, { timeout: 5000 });
      console.log("✅ LIVE:", url);
      result += `✅ LIVE: ${url}\n`;
    } catch {
      console.log("❌ DEAD:", url);
      result += `❌ DEAD: ${url}\n`;
    }
  }

  // Ghi kết quả vào file
  fs.writeFileSync(outputFile, result, "utf-8");
  console.log(`📄 Kết quả đã lưu vào ${outputFile}`);
})();
