// import { useState, useRef, useEffect } from "react";
// import { Send, Leaf, Menu } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Link } from "react-router-dom";
// import VoiceInput from "@/components/VoiceInput";

// interface Message {
//   id: number;
//   text: string;
//   sender: "user" | "bot";
//   timestamp: Date;
// }
// const ChatPage = () => {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: 1,
//       text: "Hello! I'm your coffee disease expert assistant. How can I help you today?",
//       sender: "bot",
//       timestamp: new Date(),
//     },
//   ]);
//   const [inputMessage, setInputMessage] = useState("");
//   const scrollRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const handleSendMessage = () => {
//     if (!inputMessage.trim()) return;

//     const newMessage: Message = {
//       id: messages.length + 1,
//       text: inputMessage,
//       sender: "user",
//       timestamp: new Date(),
//     };

//     setMessages([...messages, newMessage]);
//     setInputMessage("");

//     setTimeout(() => {
//       const botResponse: Message = {
//         id: messages.length + 2,
//         text: "I'm analyzing your query. In a production version, I would provide detailed information about coffee diseases, treatment recommendations, and preventive measures.",
//         sender: "bot",
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, botResponse]);
//     }, 1000);
//   };

//   return (
//     <div className="min-h-screen bg-background flex flex-col">
//       {/* Header */}
//       <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
//         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
//           <Link to="/" className="flex items-center gap-2">
//             <div className="p-2 bg-primary rounded-lg">
//               <Leaf className="w-6 h-6 text-primary-foreground" />
//             </div>
//             <span className="text-xl font-bold text-foreground">CoffeeLeaf AI</span>
//           </Link>
//           <Link to="/">
//             <Button variant="outline">
//               <Menu className="w-4 h-4 mr-2" />
//               Back to Home
//             </Button>
//           </Link>
//         </div>
//       </header>

//       {/* Chat Container */}
//       <div className="flex-1 container mx-auto px-4 py-8 flex flex-col max-w-4xl">
//         {/* Messages Area */}
//         <ScrollArea className="flex-1 pr-4 mb-6" ref={scrollRef}>
//           <div className="space-y-6">
//             {messages.map((message) => (
//               <div
//                 key={message.id}
//                 className={`flex ${
//                   message.sender === "user" ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`max-w-[70%] p-4 rounded-2xl ${
//                     message.sender === "user"
//                       ? "bg-primary text-primary-foreground"
//                       : "bg-card border border-border text-foreground"
//                   }`}
//                 >
//                   <p className="text-base leading-relaxed">{message.text}</p>
//                   <p className="text-xs opacity-70 mt-2">
//                     {message.timestamp.toLocaleTimeString([], {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </ScrollArea>

//         {/* Input Area */}
//         <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
//           <div className="flex gap-3 items-center">
//             <Input
//               value={inputMessage}
//               onChange={(e) => setInputMessage(e.target.value)}
//               onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
//               placeholder="Ask about coffee diseases..."
//               className="flex-1 text-base"
//             />
//             <VoiceInput />
//             <Button 
//               onClick={handleSendMessage} 
//               size="icon"
//             >
//               <Send className="w-5 h-5" />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatPage;
import { useState, useRef, useEffect } from "react";
import { Send, Leaf, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
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

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // stable ID generator using a ref (guaranteed unique on the client)
  const nextIdRef = useRef<number>(
  (initialMessages.length ? Math.max(...initialMessages.map((m) => m.id)) : 0) + 1
);


  const getNextId = () => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    return id;
  };

  // auto-scroll when messages change
  useEffect(() => {
    // ScrollArea may not forward ref to internal scrolling element in every implementation.
    // We try to scroll its content container if available.
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Parse the server->gradio response into text + optional image
  function parseGradioResponseBody(body: any) {
    const forwarded = body?.gradio ?? body ?? {};
    let text = "";
    let imageUrl: string | undefined;

    // Common pattern: result.data is an array of outputs
    if (Array.isArray(forwarded?.data) && forwarded.data.length > 0) {
      const parts: string[] = [];
      for (const el of forwarded.data) {
        if (!el && el !== 0) continue;

        if (typeof el === "string") {
          if (el.startsWith("data:image")) imageUrl = el;
          else parts.push(el);
        } else if (typeof el === "object") {
          // often Gradio returns objects like {name: ..., data: "data:image/..."}
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

    // fallback shapes
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

    // append user message optimistically
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

  // handle Enter key
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CoffeeLeaf AI</span>
          </Link>
          <Link to="/">
            <Button variant="outline">
              <Menu className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 container mx-auto px-4 py-8 flex flex-col max-w-4xl">
        {/* Messages Area */}
        {/* Note: some ScrollArea implementations don't forward ref to the inner scroll container.
            If you find auto-scroll not working, you can wrap the message list in a div and attach the ref there. */}
        <ScrollArea className="flex-1 pr-4 mb-6" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-2xl ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground"
                  }`}
                >
                  {message.text && <p className="text-base leading-relaxed">{message.text}</p>}

                  {message.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={message.imageUrl}
                        alt="assistant-output"
                        className="max-h-64 object-contain rounded-lg border"
                      />
                    </div>
                  )}

                  <p className="text-xs opacity-70 mt-2">
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

        {/* Input Area */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
          <div className="flex gap-3 items-center">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about coffee diseases..."
              className="flex-1 text-base"
            />
            <VoiceInput
              // If your VoiceInput exposes a callback to set text, pass it here.
              // Example: onTranscribe={(t) => setInputMessage((s) => (s ? s + " " + t : t))}
            />
            <Button onClick={handleSendMessage} size="icon" disabled={loading}>
              <Send className="w-5 h-5" />
            </Button>
          </div>
          {loading && <p className="text-xs opacity-60 mt-2 ml-1">Thinking...</p>}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
