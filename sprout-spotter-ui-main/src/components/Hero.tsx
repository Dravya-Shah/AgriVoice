import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf } from "lucide-react";
import heroImage from "@/assets/hero-coffee.jpg";

const Hero = () => {
  const scrollToDetector = () => {
    const detectorSection = document.getElementById('detector-section');
    detectorSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-secondary/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-accent-light px-4 py-2 rounded-full mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Leaf className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI-Powered Disease Detection</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Coffee Leaf Disease
          <br />
          <span className="text-accent">Detector & Diagnosis</span>
        </h1>

        <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Protect your coffee crops with instant AI-powered disease detection. Upload images, get real-time diagnosis, and access expert advice.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <Button 
            size="lg" 
            onClick={scrollToDetector}
            className="bg-white text-primary hover:bg-white/90 shadow-lg group"
          >
            Get Started
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="bg-transparent text-white border-white/30 hover:bg-white/10 hover:border-white/50"
          >
            Learn More
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
          {[
            { value: "99%", label: "Accuracy Rate" },
            { value: "24/7", label: "AI Assistance" },
            { value: "5", label: "Disease Types" }
          ].map((stat, idx) => (
            <div 
              key={idx}
              className="animate-in fade-in slide-in-from-bottom duration-700 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              style={{ animationDelay: `${400 + idx * 100}ms` }}
            >
              <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-white/80 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;