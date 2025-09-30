import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Calendar, Trophy, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-sports.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const stats = [
    { icon: Users, value: "15+", label: "Talleres Activos" },
    { icon: Trophy, value: "3", label: "Gimnasios Disponibles" },
    { icon: Calendar, value: "Lunes a Viernes", label: "Horarios Flexibles" },
    { icon: Clock, value: "70 min", label: "Duración de cada Taller" },
  ];

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
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              Unifica tu
              <span className="block gradient-hero bg-clip-text text-transparent">
                Experiencia Deportiva
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              La plataforma completa del DEFIDER para talleres, reservas de gimnasio, 
              horarios personalizados y todo lo que necesitas para tu actividad física universitaria.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => handleNavigate('/talleres')}
            >
              Explorar Talleres
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => handleNavigate('/gym')}
            >
              Reservar Gimnasio
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="card-sport text-center">
                  <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
