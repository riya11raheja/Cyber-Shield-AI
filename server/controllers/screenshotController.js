const fs = require("fs");
const User = require("../models/User");
const SecurityEvent = require("../models/SecurityEvent");

const analyzeScreenshot = async (req, res) => {
  try {
    // ==========================================
    // CHECK IMAGE
    // ==========================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Screenshot image is required",
      });
    }

    // ==========================================
    // CHECK USER
    // ==========================================

    const userId = req.body.user;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==========================================
    // CHECK GEMINI API KEY
    // ==========================================

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key is not configured",
      });
    }

    // ==========================================
    // READ IMAGE
    // ==========================================

    const imageBuffer = fs.readFileSync(req.file.path);

    const base64Image = imageBuffer.toString("base64");

    // ==========================================
    // GEMINI PROMPT
    // ==========================================

    const prompt = `
You are a cybersecurity screenshot analyzer.

Analyze the provided screenshot for possible:
- phishing
- scam messages
- fake account verification
- OTP requests
- password requests
- banking/payment scams
- impersonation
- threats of account suspension
- suspicious links
- social engineering
- malicious instructions

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

riskScore must be between 0 and 100.

riskLevel must be exactly one of:
LOW
MEDIUM
HIGH
CRITICAL

signals must be an array of short strings.

If there is no suspicious text, suspiciousText should be an empty string.

Do not invent information that is not visible in the screenshot.

Be conservative and explain why something is suspicious.
`;

    // ==========================================
    // CALL GEMINI
    // ==========================================

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

    if (!geminiResponse.ok) {
      console.error("Gemini API error:", geminiData);

      return res.status(500).json({
        success: false,
        message: "Screenshot AI analysis failed",
        error:
          geminiData?.error?.message ||
          "Gemini API returned an error",
      });
    }

    // ==========================================
    // GET AI TEXT
    // ==========================================

    const aiText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      return res.status(500).json({
        success: false,
        message: "AI did not return an analysis",
      });
    }

    // ==========================================
    // CLEAN JSON RESPONSE
    // ==========================================

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

    let analysis;

    try {
      analysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("AI JSON parse error:", aiText);

      return res.status(500).json({
        success: false,
        message: "AI returned an invalid analysis format",
        rawAnalysis: aiText,
      });
    }

    // ==========================================
    // NORMALIZE VALUES
    // ==========================================

    const riskScore = Math.min(
      100,
      Math.max(0, Number(analysis.riskScore) || 0)
    );

    const allowedRiskLevels = [
      "LOW",
      "MEDIUM",
      "HIGH",
      "CRITICAL",
    ];

    const riskLevel = allowedRiskLevels.includes(
      analysis.riskLevel
    )
      ? analysis.riskLevel
      : riskScore >= 80
      ? "HIGH"
      : riskScore >= 50
      ? "MEDIUM"
      : "LOW";

    const signals = Array.isArray(analysis.signals)
      ? analysis.signals
      : [];

    // ==========================================
    // GENERATE EVIDENCE ID
    // ==========================================

    const evidenceId =
      "CS-" +
      Math.floor(1000 + Math.random() * 9000);

    // ==========================================
    // CREATE SECURITY EVENT
    // ==========================================

    const event = await SecurityEvent.create({
      user: user._id,

      type: "SCREENSHOT_ANALYSIS",

      title:
        riskScore >= 70
          ? "Suspicious Screenshot Detected"
          : "Screenshot Security Analysis",

      description:
        analysis.explanation ||
        "Screenshot analyzed by Cyber Shield AI.",

      riskScore,

      riskLevel,

      status:
        riskScore >= 70
          ? "DETECTED"
          : "RESOLVED",

      metadata: {
        evidenceId,

        originalFileName: req.file.originalname,

        storedFileName: req.file.filename,

        mimeType: req.file.mimetype,

        fileSize: req.file.size,

        signals,

        suspiciousText:
          analysis.suspiciousText || "",

        explanation:
          analysis.explanation || "",

        recommendation:
          analysis.recommendation || "",

        analyzedBy: "Gemini AI",
      },
    });

    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      message: "Screenshot analyzed successfully",

      analysis: {
        riskScore,

        riskLevel,

        signals,

        suspiciousText:
          analysis.suspiciousText || "",

        explanation:
          analysis.explanation || "",

        recommendation:
          analysis.recommendation || "",
      },

      evidence: {
        id: evidenceId,

        eventId: event._id,

        status: event.status,

        createdAt: event.createdAt,
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
  }
};

module.exports = {
  analyzeScreenshot,
};