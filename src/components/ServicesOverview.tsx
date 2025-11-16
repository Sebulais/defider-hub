import { Card } from "@/components/ui/card";
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
      description: "Reserva espacios en nuestros gimnasios equipados. Sistema en línea con horarios extendidos y equipamiento completo.",
      color: "gradient-secondary",
      href: "/gym"
    },
    {
      icon: Calendar,
      title: "Horario Personal",
      description: "Gestiona todos tus talleres, reservas y ramos académicos desde un solo lugar. Sincronización automática y recordatorios.",
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
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Gestiona tu vida deportiva universitaria de forma simple y eficiente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index} 
                className="card-energy relative overflow-hidden group cursor-pointer"
                onClick={() => handleNavigate(service.href)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <div className={`w-full h-full ${service.color} rounded-full blur-xl`}></div>
                </div>
                
                <div className="relative z-10 p-8">
                  <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {service.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <Button 
                    variant="ghost" 
                    className="group/btn p-0 h-auto hover:bg-transparent"
                  >
                    <span className="text-primary font-semibold">Explorar</span>
                    <ArrowRight className="w-4 h-4 ml-2 text-primary group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col gap-4 bg-card rounded-2xl p-8 shadow-sport">
            <h3 className="text-2xl font-bold text-foreground">
              ¿Listo para comenzar?
            </h3>
            <p className="text-muted-foreground max-w-md">
              Únete a cientos de estudiantes que ya disfrutan de nuestra plataforma deportiva
            </p>
            <Button 
              variant="energy" 
              size="lg"
              onClick={() => handleNavigate('/talleres')}
              className="mt-2"
            >
              Comenzar Ahora
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;