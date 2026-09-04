import os
import time
import requests

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from urllib.parse import urlparse


# Load environment variables
load_dotenv()


# Create FastAPI app
app = FastAPI()


# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# VirusTotal API key
VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY")

VT_URL = "https://www.virustotal.com/api/v3/urls"


# Request model
class URLRequest(BaseModel):
    url: str


# -----------------------------
# Home / Backend Test
# -----------------------------

@app.get("/")
def home():
    return {
        "message": "Cyber Shield Backend is running!"
    }


# -----------------------------
# URL Scanner
# -----------------------------

@app.post("/api/scan-url")
def scan_url(request: URLRequest):

    url = request.url.strip()

    # -----------------------------
    # 1. Validate URL
    # -----------------------------

    parsed = urlparse(url)

    if parsed.scheme not in ["http", "https"] or not parsed.netloc:
        return {
            "status": "error",
            "message": "Please enter a valid URL."
        }

    # -----------------------------
    # 2. Check VirusTotal API Key
    # -----------------------------

    if not VIRUSTOTAL_API_KEY:
        return {
            "status": "error",
            "message": "VirusTotal API key is not configured."
        }

    headers = {
        "x-apikey": VIRUSTOTAL_API_KEY
    }

    try:

        # -----------------------------
        # 3. Submit URL to VirusTotal
        # -----------------------------

        response = requests.post(
            VT_URL,
            headers=headers,
            data={"url": url},
            timeout=20
        )

        if response.status_code not in [200, 201]:
            return {
                "status": "error",
                "message": "VirusTotal could not scan this URL.",
                "details": response.text
            }

        data = response.json()

        analysis_id = data["data"]["id"]

        # -----------------------------
        # 4. Get Analysis Result
        # -----------------------------

        analysis_url = (
            f"https://www.virustotal.com/api/v3/analyses/{analysis_id}"
        )

        analysis = None

        for _ in range(10):

            result = requests.get(
                analysis_url,
                headers=headers,
                timeout=20
            )

            if result.status_code != 200:
                return {
                    "status": "error",
                    "message": "Could not retrieve VirusTotal analysis."
                }

            analysis = result.json()

            analysis_status = (
                analysis
                .get("data", {})
                .get("attributes", {})
                .get("status")
            )

            if analysis_status == "completed":
                break

            time.sleep(2)

        # -----------------------------
        # 5. Get Security Statistics
        # -----------------------------

        attributes = (
            analysis
            .get("data", {})
            .get("attributes", {})
        )

        stats = attributes.get("stats", {})

        malicious = stats.get("malicious", 0)
        suspicious = stats.get("suspicious", 0)
        harmless = stats.get("harmless", 0)
        undetected = stats.get("undetected", 0)

        # -----------------------------
        # 6. Calculate Risk Score
        # -----------------------------

        total_engines = (
            malicious
            + suspicious
            + harmless
            + undetected
        )

        if total_engines > 0:

            risk_score = round(
                (
                    (malicious * 100)
                    + (suspicious * 50)
                )
                / total_engines
            )

        else:

            risk_score = 0

        # Keep score between 0 and 100
        risk_score = max(0, min(risk_score, 100))

        # -----------------------------
        # 7. Determine Security Status
        # -----------------------------

        if malicious > 0:

            security_status = "dangerous"

            message = (
                "This URL was flagged as malicious "
                "by one or more security engines."
            )

        elif suspicious > 0:

            security_status = "suspicious"

            message = (
                "This URL has suspicious indicators. "
                "Proceed with caution."
            )

        else:

            security_status = "safe"

            message = (
                "No major threats were detected "
                "by the available security engines."
            )

        # -----------------------------
        # 8. Send Result to React
        # -----------------------------

        return {
            "status": security_status,
            "url": url,
            "riskScore": risk_score,
            "malicious": malicious,
            "suspicious": suspicious,
            "harmless": harmless,
            "undetected": undetected,
            "analysisId": analysis_id,
            "message": message
        }

    # -----------------------------
    # Network Error
    # -----------------------------

    except requests.RequestException:

        return {
            "status": "error",
            "message": "Unable to connect to VirusTotal."
        }

    # -----------------------------
    # Unexpected Error
    # -----------------------------

    except Exception as e:

        return {
            "status": "error",
            "message": "Something went wrong while scanning the URL.",
            "details": str(e)
        }
        # -----------------------------
# AI Assistant
# -----------------------------

class ChatRequest(BaseModel):
    message: str


@app.post("/api/ai/chat")
def ai_chat(request: ChatRequest):

    message = request.message.strip()

    if not message:
        return {
            "success": False,
            "message": "Please enter a message."
        }

    # Temporary AI response
    return {
        "success": True,
        "message": (
            "Cyber Shield AI: I received your message. "
            "Your cybersecurity assistant is working."
        )
    }