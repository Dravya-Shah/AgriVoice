import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import VoiceInput from "@/components/VoiceInput";

interface Message {
  id: number;
  text?: string;
  imageUrl?: string; // optional image (data URI or absolute URL)
  sender: "user" | "bot";
  timestamp: Date;
}

const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:8000/ask";

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hello! I'm your coffee disease expert assistant. How can I help you today?",
    sender: "bot",
    timestamp: new Date(),
  },
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // stable ID generator
  const nextIdRef = useRef<number>(
    (initialMessages.length ? Math.max(...initialMessages.map((m) => m.id)) : 0) + 1
  );
  const getNextId = () => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    return id;
  };

  // scroll ref for messages area
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!isOpen) return; // don't try to scroll when closed
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // parse server/gradio response into text + optional image
  function parseGradioResponseBody(body: any) {
    const forwarded = body?.gradio ?? body ?? {};
    let text = "";
    let imageUrl: string | undefined;

    if (Array.isArray(forwarded?.data) && forwarded.data.length > 0) {
      const parts: string[] = [];
      for (const el of forwarded.data) {
        if (!el && el !== 0) continue;

        if (typeof el === "string") {
          if (el.startsWith("data:image")) imageUrl = el;
          else parts.push(el);
        } else if (typeof el === "object") {
          if (typeof el.data === "string") {
            if (el.data.startsWith("data:image")) imageUrl = el.data;
            else parts.push(String(el.data));
          } else if (typeof el.name === "string") {
            parts.push(el.name);
          } else {
            parts.push(JSON.stringify(el));
          }
        } else {
          parts.push(String(el));
        }
      }
      text = parts.join(" ").trim();
    }

    if (!text && typeof forwarded === "string") text = forwarded;
    if (!text && typeof forwarded?.output === "string") text = forwarded.output;
    if (!imageUrl && forwarded?.image) imageUrl = forwarded.image;
    if (!imageUrl && Array.isArray(forwarded?.data) && typeof forwarded.data[0] === "string" && forwarded.data[0].startsWith("data:image")) {
      imageUrl = forwarded.data[0];
    }

    if (!text && !imageUrl) {
      try {
        text = JSON.stringify(forwarded);
      } catch {
        text = String(forwarded);
      }
    }

    return { text, imageUrl };
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userId = getNextId();
    const userMsg: Message = {
      id: userId,
      text: inputMessage.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    // optimistic update
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg.text }),
      });

      if (!resp.ok) throw new Error(`Server responded with ${resp.status}`);

      const body = await resp.json();
      const parsed = parseGradioResponseBody(body);

      const botMsg: Message = {
        id: getNextId(),
        text: parsed.text || "No textual response from assistant.",
        imageUrl: parsed.imageUrl,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Error in handleSendMessage:", err);
      const errMsg: Message = {
        id: getNextId(),
        text: `Error: ${err instanceof Error ? err.message : String(err)}`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 hover:scale-110 transition-transform"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] z-50 shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Coffee Expert</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          {/* Note: some ScrollArea implementations don't forward ref to inner scroll node.
              If auto-scroll doesn't work, wrap the message list in a div and attach ref there. */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {message.text && <p className="text-sm">{message.text}</p>}

                    {message.imageUrl && (
                      <div className="mt-3">
                        <img
                          src={message.imageUrl}
                          alt="assistant-output"
                          className="max-h-48 object-contain rounded-md border"
                        />
                      </div>
                    )}

                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-muted/30">
            <div className="flex gap-2 items-center">
              <div className="shrink-0">
                {/* If you still want a Mic icon button alongside voice input, you can keep it */}
                <VoiceInput
                  // optionally accept a callback prop onTranscribe to insert transcribed text into input
                  // Example: onTranscribe={(t) => setInputMessage((s) => (s ? s + " " + t : t))}
                />
              </div>

              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about coffee diseases..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon" disabled={loading}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {loading && <p className="text-xs opacity-60 mt-2 ml-1">Thinking...</p>}
          </div>
        </Card>
      )}
    </>
  );
};

export default Chatbot;
