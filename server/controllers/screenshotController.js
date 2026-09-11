const fs = require("fs");
const path = require("path");

const analyzeScreenshot = async (req, res) => {
  let uploadedFilePath = null;

  try {
    // -----------------------------------------
    // 1. Check screenshot
    // -----------------------------------------
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Screenshot image is required",
      });
    }

    uploadedFilePath = req.file.path;

    // -----------------------------------------
    // 2. Check Gemini API key
    // -----------------------------------------
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key is not configured",
      });
    }

    // -----------------------------------------
    // 3. Read uploaded image
    // -----------------------------------------
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString("base64");

    // -----------------------------------------
    // 4. Cyber Shield AI Prompt
    // -----------------------------------------
    const prompt = `
You are Cyber Shield AI, a cybersecurity screenshot analyzer.

Analyze the provided screenshot for possible cybersecurity threats.

Look specifically for:

- phishing
- scam messages
- fake account verification
- OTP requests
- password requests
- banking/payment scams
- fake refunds
- impersonation
- fake customer support
- threats of account suspension
- suspicious links
- malicious instructions
- social engineering
- urgency or pressure tactics
- requests for sensitive information
- suspicious payment instructions

Return ONLY valid JSON.

Use exactly this structure:

{
  "riskScore": 0,
  "riskLevel": "LOW",
  "signals": [],
  "suspiciousText": "",
  "explanation": "",
  "recommendation": ""
}

Rules:

1. riskScore must be a number between 0 and 100.

2. riskLevel must be exactly one of:
LOW
MEDIUM
HIGH
CRITICAL

3. signals must be an array of short strings.

4. suspiciousText must contain only text that is actually visible in the screenshot.

5. If there is no suspicious text, return:
"suspiciousText": ""

6. Do not invent information that is not visible in the screenshot.

7. Be conservative.

8. Explain why the screenshot is suspicious or safe.

9. The recommendation should give a clear cybersecurity safety action.

10. Return JSON only. Do not use markdown or code fences.
`;

    // -----------------------------------------
    // 5. Call Gemini AI
    // -----------------------------------------
    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
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
                  text: prompt,
                },
                {
                  inline_data: {
                    mime_type: req.file.mimetype,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const geminiData = await geminiResponse.json();

    // -----------------------------------------
    // 6. Gemini API error
    // -----------------------------------------
    if (!geminiResponse.ok) {
      console.error(
        "Gemini API error:",
        JSON.stringify(geminiData, null, 2)
      );

      return res.status(500).json({
        success: false,
        message: "Screenshot AI analysis failed",
        error:
          geminiData?.error?.message ||
          "Gemini API returned an error",
      });
    }

    // -----------------------------------------
    // 7. Get AI response
    // -----------------------------------------
    const aiText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      console.error(
        "Gemini response did not contain analysis:",
        JSON.stringify(geminiData, null, 2)
      );

      return res.status(500).json({
        success: false,
        message: "AI did not return an analysis",
      });
    }

    // -----------------------------------------
    // 8. Clean AI JSON
    // -----------------------------------------
    let cleanedText = aiText.trim();

    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText
        .replace(/^```json/, "")
        .replace(/```$/, "")
        .trim();
    }

    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();
    }

    // Sometimes AI may return extra text before/after JSON.
    // Try to extract the JSON object safely.
    const firstBrace = cleanedText.indexOf("{");
    const lastBrace = cleanedText.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanedText = cleanedText.substring(
        firstBrace,
        lastBrace + 1
      );
    }

    // -----------------------------------------
    // 9. Parse AI JSON
    // -----------------------------------------
    let analysis;

    try {
      analysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(
        "AI JSON parse error:",
        parseError.message
      );

      console.error("Raw AI response:", aiText);

      return res.status(500).json({
        success: false,
        message: "AI returned an invalid analysis format",
        rawAnalysis: aiText,
      });
    }

    // -----------------------------------------
    // 10. Normalize Risk Score
    // -----------------------------------------
    let riskScore = Number(analysis.riskScore);

    if (Number.isNaN(riskScore)) {
      riskScore = 0;
    }

    riskScore = Math.min(
      100,
      Math.max(0, Math.round(riskScore))
    );

    // -----------------------------------------
    // 11. Normalize Risk Level
    // -----------------------------------------
    const allowedRiskLevels = [
      "LOW",
      "MEDIUM",
      "HIGH",
      "CRITICAL",
    ];

    let riskLevel = String(
      analysis.riskLevel || ""
    ).toUpperCase();

    if (!allowedRiskLevels.includes(riskLevel)) {
      if (riskScore >= 80) {
        riskLevel = "CRITICAL";
      } else if (riskScore >= 60) {
        riskLevel = "HIGH";
      } else if (riskScore >= 30) {
        riskLevel = "MEDIUM";
      } else {
        riskLevel = "LOW";
      }
    }

    // -----------------------------------------
    // 12. Normalize Signals
    // -----------------------------------------
    const signals = Array.isArray(analysis.signals)
      ? analysis.signals
          .filter(
            (signal) =>
              typeof signal === "string" &&
              signal.trim().length > 0
          )
          .map((signal) => signal.trim())
      : [];

    // -----------------------------------------
    // 13. Other AI fields
    // -----------------------------------------
    const suspiciousText =
      typeof analysis.suspiciousText === "string"
        ? analysis.suspiciousText.trim()
        : "";

    const explanation =
      typeof analysis.explanation === "string"
        ? analysis.explanation.trim()
        : "Screenshot analyzed by Cyber Shield AI.";

    const recommendation =
      typeof analysis.recommendation === "string"
        ? analysis.recommendation.trim()
        : "Do not click suspicious links or share OTPs, passwords, PINs or banking information.";

    // -----------------------------------------
    // 14. Generate Evidence ID
    // -----------------------------------------
    const evidenceId =
      "CS-" +
      Math.floor(1000 + Math.random() * 9000);

    const createdAt = new Date();

    // -----------------------------------------
    // 15. Final response
    // -----------------------------------------
    return res.status(200).json({
      success: true,

      message: "Screenshot analyzed successfully",

      analysis: {
        riskScore,
        riskLevel,
        signals,
        suspiciousText,
        explanation,
        recommendation,
      },

      evidence: {
        id: evidenceId,
        status:
          riskScore >= 70
            ? "DETECTED"
            : "RESOLVED",
        createdAt,
      },

      file: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error(
      "Screenshot analysis error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Screenshot analysis failed",
      error: error.message,
    });
  } finally {
    // -----------------------------------------
    // 16. Delete temporary uploaded image
    // -----------------------------------------
    if (uploadedFilePath) {
      try {
        if (fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);
        }
      } catch (deleteError) {
        console.error(
          "Temporary screenshot cleanup error:",
          deleteError.message
        );
      }
    }
  }
};

module.exports = {
  analyzeScreenshot,
};