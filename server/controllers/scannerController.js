const { scanUrlWithVirusTotal } = require("../services/virusTotalService");

const scanUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    // Basic URL validation
    let parsedUrl;

    try {
      parsedUrl = new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid URL",
      });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        success: false,
        message: "Only HTTP and HTTPS URLs are supported",
      });
    }

    const result = await scanUrlWithVirusTotal(url);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Scanner Controller Error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "URL scan failed",
    });
  }
};

module.exports = {
  scanUrl,
};