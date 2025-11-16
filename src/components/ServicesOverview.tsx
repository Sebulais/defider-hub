mport { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  Trophy,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const ServicesOverview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const services = [
    {
      icon: Users,
      title: "Talleres Deportivos",
      description: "Inscríbete en talleres de yoga, CrossFit, natación, fútbol y más. Horarios flexibles con instructores certificados.",
      color: "gradient-primary",
      href: "/talleres"
    },
    {
      icon: Trophy,
      title: "Reserva de Gimnasio",
      description: "Reserva espacios en nuestros gimnasios equipados. Sistema en línea con horarios extendidos.",
      color: "gradient-secondary",
      href: "/gym"
    },
    {
      icon: Calendar,
      title: "Horario Personal",
      description: "Gestiona tus talleres, reservas y ramos académicos. Visualiza todo tu horario en un solo lugar.",
      color: "gradient-accent",
      href: "/schedule"
    }
  ];

  const handleNavigate = (path: string) => {
    if (user) {
      navigate(path);
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Todo en un Solo Lugar
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Gestiona tu vida deportiva universitaria de forma simple y eficiente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index} 
                className="relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                onClick={() => handleNavigate(service.href)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                  <div className={`w-full h-full ${service.color} rounded-full blur-2xl`}></div>
                </div>
                
                <div className="relative z-10 p-8">
                  <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {service.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed min-h-[72px]">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center text-primary font-semibold group-hover:gap-3 gap-2 transition-all">
                    <span>Explorar</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Simple CTA */}
        <div className="text-center">
          <Card className="inline-block p-8 shadow-sport">
            <h3 className="text-2xl font-bold text-foreground mb-3">
              ¿Listo para comenzar?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Únete a la comunidad deportiva DEFIDER
            </p>
            <Button 
              variant="energy" 
              size="lg"
              onClick={() => handleNavigate('/talleres')}
            >
              Comenzar Ahora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;