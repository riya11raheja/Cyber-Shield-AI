require("dotenv").config();

async function testGemini() {
  try {
    console.log("Testing Gemini API...");
    console.log(
      "API key loaded:",
      !!process.env.GEMINI_API_KEY
    );

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Say hello in one short sentence.",
                },
              ],
            },
          ],
        }),
      }
    );

    console.log("HTTP STATUS:", response.status);

    const data = await response.json();

    console.log(
      JSON.stringify(data, null, 2)
    );
  } catch (error) {
    console.error("GEMINI TEST ERROR:", error);
  }
}

testGemini();