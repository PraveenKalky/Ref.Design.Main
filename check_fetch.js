async function check() {
  const urls = [
    'https://dribbble.com/shots/25774296/attachments',
    'https://dribbble.com/shots/25774296/attachments.json',
    'https://dribbble.com/shots/25774296/attachments?format=json',
    'https://dribbble.com/shots/25774296?format=json',
  ];

  for (const url of urls) {
    try {
      console.log("\n--- Testing URL:", url);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      console.log("Status:", res.status);
      const text = await res.text();
      console.log("HTML length:", text.length);
      console.log("HTML Snippet:", text.substring(0, 300));
    } catch (e) {
      console.error("Error for URL:", url, e.message);
    }
  }
}
check();
