import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-sports.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigate = (path: string) => {
    if (user) {
      navigate(path);
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* Hero Background */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={heroImage}
          alt="Gimnasio universitario DEFIDER"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 gradient-hero opacity-20"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              Unifica tu
              <span className="block gradient-hero bg-clip-text text-transparent">
                Experiencia Deportiva
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              La plataforma completa del DEFIDER para talleres, reservas de gimnasio, 
              horarios personalizados y todo lo que necesitas para tu actividad física universitaria.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => handleNavigate('/talleres')}
            >
              Explorar Talleres
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 border-2"
              onClick={() => handleNavigate('/gym')}
            >
              Reservar Gimnasio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
