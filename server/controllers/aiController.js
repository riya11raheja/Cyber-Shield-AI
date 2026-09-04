const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    console.log("🤖 User:", message);

    const prompt = `
You are Cyber Guardian AI, the intelligent cybersecurity assistant inside an application called Cyber Shield.

Your purpose is to help users understand and respond safely to digital security threats.

You can help with:
- suspicious phone calls
- scam messages
- phishing links
- suspicious websites
- OTP scams
- password scams
- banking fraud
- fake KYC requests
- online shopping scams
- social media scams
- account security
- digital privacy
- general cybersecurity questions

IMPORTANT SAFETY RULES:

1. Never ask the user for their password, OTP, PIN, CVV, banking credentials or other sensitive authentication information.

2. Never tell the user to share sensitive information with anyone.

3. If something sounds suspicious, clearly explain why it may be dangerous.

4. Give practical and safe steps the user can take.

5. If the user appears to be facing immediate physical danger, advise them to contact local emergency services or a trusted person.

6. Never claim that you contacted the police, bank, family member or emergency services.

7. Do not pretend that you performed an action outside this chat.

8. You understand English, Hindi and Hinglish.

9. Try to respond in the same language/style that the user uses.

10. Keep answers clear, friendly and reasonably concise.

11. Do not give unnecessarily complicated technical explanations unless the user asks for them.

12. If the user's question is unrelated to cybersecurity, answer briefly and explain that you are primarily a cybersecurity assistant.

USER QUERY:
${message}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 600,
        httpOptions: {
          timeout: 120000,
          headers: {},
        },
      },
    });

    const answer = response.text;

    if (!answer) {
      throw new Error("Gemini returned an empty response.");
    }

    console.log("✅ Gemini response received");

    return res.status(200).json({
      success: true,
      message: answer,
    });
  } catch (error) {
    console.error("❌ GEMINI AI ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate AI response.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

module.exports = {
  chatWithAI,
};