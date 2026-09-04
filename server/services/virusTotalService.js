const axios = require("axios");
const FormData = require("form-data");

const VIRUSTOTAL_API = "https://www.virustotal.com/api/v3";

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const scanUrlWithVirusTotal = async (url) => {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;

  if (!apiKey) {
    const error = new Error("VirusTotal API key is not configured");
    error.statusCode = 500;
    throw error;
  }

  try {
    // --------------------------------------------------
    // STEP 1: Submit URL to VirusTotal
    // --------------------------------------------------

    const form = new FormData();
    form.append("url", url);

    const submitResponse = await axios.post(
      `${VIRUSTOTAL_API}/urls`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          "x-apikey": apiKey,
        },
        timeout: 30000,
      }
    );

    const analysisId = submitResponse.data?.data?.id;

    if (!analysisId) {
      throw new Error("VirusTotal did not return an analysis ID");
    }

    // --------------------------------------------------
    // STEP 2: Poll analysis result
    // --------------------------------------------------

    let analysisData = null;

    const maxAttempts = 15;
    const delay = 1500;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await sleep(delay);

      const analysisResponse = await axios.get(
        `${VIRUSTOTAL_API}/analyses/${analysisId}`,
        {
          headers: {
            "x-apikey": apiKey,
          },
          timeout: 30000,
        }
      );

      analysisData = analysisResponse.data?.data;

      const status = analysisData?.attributes?.status;

      console.log(
        `VirusTotal scan status: ${status} (attempt ${attempt + 1}/${maxAttempts})`
      );

      if (status === "completed") {
        break;
      }
    }

    // --------------------------------------------------
    // STEP 3: Extract statistics
    // --------------------------------------------------

    const attributes = analysisData?.attributes || {};
    const stats = attributes.stats || {};

    const harmless = Number(stats.harmless || 0);
    const malicious = Number(stats.malicious || 0);
    const suspicious = Number(stats.suspicious || 0);
    const undetected = Number(stats.undetected || 0);
    const timeout = Number(stats.timeout || 0);

    // --------------------------------------------------
    // STEP 4: Determine Cyber Shield result
    // --------------------------------------------------

    let status;
    let message;

    if (malicious > 0) {
      status = "malicious";
      message = "Malicious activity was detected for this URL.";
    } else if (suspicious > 0) {
      status = "suspicious";
      message = "Suspicious signals were detected for this URL.";
    } else if (harmless > 0) {
      status = "safe";
      message = "No malicious or suspicious detections were found.";
    } else {
      status = "unknown";
      message = "VirusTotal did not return enough results yet.";
    }

    return {
      url,
      status,
      message,
      analysisId,
      stats: {
        harmless,
        malicious,
        suspicious,
        undetected,
        timeout,
      },
    };
  } catch (error) {
    console.error(
      "VirusTotal Service Error:",
      error.response?.data || error.message
    );

    if (error.response?.status === 401 || error.response?.status === 403) {
      const apiError = new Error(
        "VirusTotal API key was rejected. Please check your API key."
      );
      apiError.statusCode = 500;
      throw apiError;
    }

    if (error.response?.status === 429) {
      const apiError = new Error(
        "VirusTotal rate limit reached. Please try again later."
      );
      apiError.statusCode = 429;
      throw apiError;
    }

    const apiError = new Error(
      "Unable to scan this URL with VirusTotal."
    );
    apiError.statusCode = 502;
    throw apiError;
  }
};

module.exports = {
  scanUrlWithVirusTotal,
};