import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  ShieldCheck,
  Sparkles,
  Link2,
  PhoneCall,
  MessageSquareWarning,
  Trash2,
  LockKeyhole,
  UserRound,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from "lucide-react";

// ==========================================
// BACKEND URL
// ==========================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const CHAT_ENDPOINT = `${API_BASE_URL}/api/ai/chat`;

function AIAssistant() {
  // ==========================================
  // STATES
  // ==========================================

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I'm your Cyber Guardian. I can help you identify suspicious links, calls, messages and online scams.",
      time: "Now",
    },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const [aiOnline, setAiOnline] = useState(true);

  const [threatLevel, setThreatLevel] = useState("Low Risk");

  const [threatDescription, setThreatDescription] = useState(
    "No active threats detected."
  );

  const messagesEndRef = useRef(null);

  // ==========================================
  // AUTO SCROLL
  // ==========================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

  // ==========================================
  // QUICK ACTIONS
  // ==========================================

  const quickActions = [
    {
      title: "Check a suspicious link",
      icon: Link2,
      prompt:
        "I received a suspicious link. Please explain how I can check whether the link is safe and what warning signs I should look for.",
    },
    {
      title: "Analyze a phone call",
      icon: PhoneCall,
      prompt:
        "I received a suspicious phone call. Please help me analyze whether it could be a scam and tell me what warning signs I should look for.",
    },
    {
      title: "Identify a scam message",
      icon: MessageSquareWarning,
      prompt:
        "I received a suspicious message. Please help me identify whether it is a scam and explain what I should check before responding or clicking anything.",
    },
  ];

  // ==========================================
  // CURRENT TIME
  // ==========================================

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // THREAT ANALYSIS
  // ==========================================

  const updateThreatLevel = (text) => {
    const lower = text.toLowerCase();

    const highRiskWords = [
      "otp",
      "password",
      "pin",
      "bank account",
      "banking",
      "send money",
      "payment",
      "transfer",
      "urgent",
      "phishing",
      "malware",
      "ransomware",
      "fraud",
      "scam",
      "remote access",
    ];

    const mediumRiskWords = [
      "suspicious",
      "unknown",
      "fake",
      "verify",
      "caller",
      "link",
      "message",
      "warning",
    ];

    const high = highRiskWords.some((word) =>
      lower.includes(word)
    );

    const medium = mediumRiskWords.some((word) =>
      lower.includes(word)
    );

    if (high) {
      setThreatLevel("High Risk");
      setThreatDescription(
        "Potential security risk detected. Avoid sharing OTPs, passwords or banking information."
      );
      return;
    }

    if (medium) {
      setThreatLevel("Caution");
      setThreatDescription(
        "Suspicious activity detected. Verify before taking any action."
      );
      return;
    }

    setThreatLevel("Low Risk");
    setThreatDescription(
      "No immediate high-risk indicators detected."
    );
  };

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage = async (messageText = input) => {
    const trimmed = messageText.trim();

    if (!trimmed || typing) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
      time: getCurrentTime(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setTyping(true);

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "AI response failed"
        );
      }

      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: data.message,
        time: getCurrentTime(),
      };

      setMessages((current) => [...current, aiMessage]);

      setAiOnline(true);

      updateThreatLevel(data.message);
    } catch (error) {
      console.error("AI CHAT ERROR:", error);

      setAiOnline(false);

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          sender: "ai",
          text:
            "Sorry, I'm unable to connect to Cyber Guardian right now. Please make sure the backend server is running.",
          time: getCurrentTime(),
          error: true,
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  // ==========================================
  // CLEAR CHAT
  // ==========================================

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: "ai",
        text:
          "Conversation cleared. How can I help protect you today?",
        time: getCurrentTime(),
      },
    ]);

    setThreatLevel("Low Risk");
    setThreatDescription("No active threats detected.");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* HEADER */}

      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

        <div>

          <div className="mb-2 flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Bot size={19} />
            </div>

            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
              <Sparkles size={11} />
              AI Powered
            </span>

          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            AI Cyber Guardian
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your intelligent assistant for detecting and understanding digital threats.
          </p>

        </div>

        <button
          onClick={clearChat}
          className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={14} />
          Clear Chat
        </button>

      </section>

      {/* AI STATUS */}

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-6 text-white shadow-xl">

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div className="flex items-center gap-4">

            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">

              <Bot size={28} />

              <span
                className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-blue-800 ${
                  aiOnline ? "bg-green-400" : "bg-red-400"
                }`}
              />

            </div>

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-sm font-bold">
                  Cyber Guardian AI
                </h2>

                <span className="rounded-full bg-white/10 px-2 py-1 text-[8px] font-bold">
                  {aiOnline ? "ACTIVE" : "OFFLINE"}
                </span>

              </div>

              <p className="mt-1 text-[10px] text-blue-200">
                {aiOnline
                  ? "AI threat assistance is ready."
                  : "Unable to connect to AI service."}
              </p>

            </div>

          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">

            <div className="rounded-xl bg-white/10 px-4 py-3">

              <p className="text-[9px] text-blue-200">
                Threat Detection
              </p>

              <p className="mt-1 text-xs font-bold">
                {aiOnline ? "Active" : "Unavailable"}
              </p>

            </div>

            <div className="rounded-xl bg-white/10 px-4 py-3">

              <p className="text-[9px] text-blue-200">
                AI Status
              </p>

              <p className="mt-1 text-xs font-bold">
                {aiOnline ? "Online" : "Offline"}
              </p>

            </div>

            <div className="hidden rounded-xl bg-white/10 px-4 py-3 sm:block">

              <p className="text-[9px] text-blue-200">
                Risk Level
              </p>

              <p
                className={`mt-1 text-xs font-bold ${
                  threatLevel === "High Risk"
                    ? "text-red-300"
                    : threatLevel === "Caution"
                    ? "text-yellow-300"
                    : "text-green-300"
                }`}
              >
                {threatLevel}
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* MAIN AREA */}

      <section className="grid gap-5 lg:grid-cols-[1fr_300px]">

        {/* CHAT */}

        <div className="flex min-h-[600px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <ShieldCheck size={18} />
              </div>

              <div>

                <p className="text-xs font-bold text-slate-800">
                  Security Assistant
                </p>

                <div className="mt-1 flex items-center gap-1">

                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      aiOnline ? "bg-green-500" : "bg-red-500"
                    }`}
                  />

                  <span className="text-[9px] text-slate-400">
                    {aiOnline ? "Online" : "Offline"}
                  </span>

                </div>

              </div>

            </div>

            <div className="flex items-center gap-1 text-[9px] text-slate-400">
              <LockKeyhole size={12} />
              Secure session
            </div>

          </div>

          {/* MESSAGES */}

          <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/60 p-5">

            {messages.map((message) => {

              const isUser = message.sender === "user";

              return (

                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >

                  {!isUser && (

                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl text-white ${
                        message.error
                          ? "bg-red-500"
                          : "bg-blue-700"
                      }`}
                    >
                      {message.error ? (
                        <AlertTriangle size={16} />
                      ) : (
                        <Bot size={16} />
                      )}
                    </div>

                  )}

                  <div className="max-w-[80%]">

                    <div
                      className={`rounded-2xl px-4 py-3 text-xs leading-5 shadow-sm whitespace-pre-wrap ${
                        isUser
                          ? "rounded-br-md bg-blue-700 text-white"
                          : message.error
                          ? "rounded-bl-md border border-red-200 bg-red-50 text-red-700"
                          : "rounded-bl-md border border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {message.text}
                    </div>

                    <p
                      className={`mt-1 text-[8px] text-slate-400 ${
                        isUser ? "text-right" : ""
                      }`}
                    >
                      {message.time}
                    </p>

                  </div>

                  {isUser && (

                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                      <UserRound size={15} />
                    </div>

                  )}

                </div>

              );

            })}

            {typing && (

              <div className="flex items-center gap-3">

                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-700 text-white">
                  <Bot size={16} />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">

                  <div className="flex gap-1">

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"/>

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]"/>

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]"/>

                  </div>

                </div>

              </div>

            )}

            <div ref={messagesEndRef}/>

          </div>

          {/* INPUT */}

          <div className="border-t border-slate-100 bg-white p-4">

            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">

              <textarea
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                onKeyDown={(e)=>{
                  if(e.key==="Enter" && !e.shiftKey){
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={typing}
                rows={1}
                placeholder="Ask Cyber Guardian about a suspicious activity..."
                className="min-h-[42px] flex-1 resize-none bg-transparent px-3 py-2 text-xs outline-none"
              />

              <button
                onClick={()=>sendMessage()}
                disabled={!input.trim() || typing}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white disabled:opacity-40"
              >
                <Send size={16}/>
              </button>

            </div>

          </div>

        </div>

        {/* RIGHT PANEL */}

        <aside className="space-y-4">

          {/* QUICK ACTIONS */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-2">

              <Zap size={16} className="text-blue-700"/>

              <h2 className="text-xs font-bold">
                Quick Security Actions
              </h2>

            </div>

            <div className="mt-4 space-y-2">

              {quickActions.map((action)=>{

                const Icon=action.icon;

                return(

                  <button
                    key={action.title}
                    onClick={()=>sendMessage(action.prompt)}
                    disabled={typing}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left hover:bg-blue-50 disabled:opacity-50"
                  >

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-700">
                      <Icon size={15}/>
                    </div>

                    <span className="text-[10px] font-semibold">
                      {action.title}
                    </span>

                  </button>

                )

              })}

            </div>

          </div>

          {/* THREAT STATUS */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <h2 className="text-xs font-bold">
                Current Threat Level
              </h2>

              <ShieldCheck
                size={17}
                className={
                  threatLevel==="High Risk"
                    ?"text-red-600"
                    :threatLevel==="Caution"
                    ?"text-yellow-600"
                    :"text-green-600"
                }
              />

            </div>

            <div
              className={`mt-5 rounded-2xl p-4 ${
                threatLevel==="High Risk"
                  ?"bg-red-50"
                  :threatLevel==="Caution"
                  ?"bg-yellow-50"
                  :"bg-green-50"
              }`}
            >

              <div className="flex items-center gap-3">

                <CheckCircle2
                  size={20}
                  className={
                    threatLevel==="High Risk"
                      ?"text-red-600"
                      :threatLevel==="Caution"
                      ?"text-yellow-600"
                      :"text-green-600"
                  }
                />

                <div>

                  <p className="text-sm font-bold">
                    {threatLevel}
                  </p>

                  <p className="mt-1 text-[9px]">
                    {threatDescription}
                  </p>

                </div>

              </div>

            </div>

            <div className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3">

              <AlertTriangle size={14} className="text-amber-600"/>

              <p className="text-[9px] text-amber-700">
                Stay cautious with unknown links, callers and unexpected payment requests.
              </p>

            </div>

          </div>

          {/* CAPABILITIES */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

            <h2 className="text-xs font-bold">
              AI Capabilities
            </h2>

            <div className="mt-4 space-y-3">

              {[
                "Scam Detection",
                "Link Risk Analysis",
                "Caller Analysis",
                "Security Guidance"
              ].map((item)=>(

                <div key={item} className="flex items-center gap-2">

                  <CheckCircle2
                    size={13}
                    className={aiOnline?"text-green-500":"text-slate-300"}
                  />

                  <span className="text-[10px] text-slate-500">
                    {item}
                  </span>

                </div>

              ))}

            </div>

          </div>

        </aside>

      </section>

      {/* FOOTER */}

      <div className="flex items-center justify-center gap-2 pb-4 text-[10px] text-slate-400">

        <ShieldCheck size={12}/>

        AI Cyber Guardian • Intelligent digital safety assistance

      </div>

    </div>
  );
}

export default AIAssistant;