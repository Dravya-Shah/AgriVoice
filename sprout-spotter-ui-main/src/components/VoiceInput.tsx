import { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const VoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const toggleVoiceInput = () => {
    if (!isListening) {
      setIsListening(true);
      toast({
        title: "Voice input activated",
        description: "Listening for your query...",
      });
      
      // Simulate voice input - in production, this would use Web Speech API
      setTimeout(() => {
        setIsListening(false);
        toast({
          title: "Voice input received",
          description: "Processing your query...",
        });
      }, 3000);
    } else {
      setIsListening(false);
      toast({
        title: "Voice input stopped",
        description: "Recording cancelled",
      });
    }
  };

  return (
    <Button
      onClick={toggleVoiceInput}
      size="icon"
      variant={isListening ? "destructive" : "secondary"}
      className={`relative group ${
        isListening ? "animate-pulse" : ""
      }`}
    >
      {isListening ? (
        <MicOff className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
      )}
      {isListening && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-ping" />
      )}
    </Button>
  );
};

export default VoiceInput;