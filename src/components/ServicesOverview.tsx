import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  Trophy, 
  Bell,
  ArrowRight,
  Clock,
  MapPin,
  Star
} from "lucide-react";

const ServicesOverview = () => {
  const services = [
    {
      icon: Users,
      title: "Talleres Deportivos",
      description: "Inscríbete en más de 15 talleres diferentes: yoga, CrossFit, natación, fútbol y mucho más.",
      features: ["Horarios flexibles", "Instructores certificados", "Diferentes niveles"],
      color: "gradient-primary",
      href: "/talleres"
    },
    {
      icon: Trophy,
      title: "Reserva de Gimnasio",
      description: "Reserva espacios en nuestros 3 gimnasios equipados con tecnología de última generación.",
      features: ["Reservas en línea", "Equipamiento completo", "Horarios extendidos"],
      color: "gradient-secondary",
      href: "/gimnasio"
    },
    {
      icon: Calendar,
      title: "Horario Personal",
      description: "Visualiza y gestiona todos tus talleres inscritos y reservas desde un solo lugar.",
      features: ["Vista calendario", "Recordatorios", "Sincronización"],
      color: "gradient-accent",
      href: "/horario"
    },
    {
      icon: Bell,
      title: "Notificaciones",
      description: "Mantente conectado con tus instructores y recibe actualizaciones importantes.",
      features: ["Mensajes directos", "Alertas de horarios", "Comunicación grupal"],
      color: "gradient-energy",
      href: "/notificaciones"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Todo lo que Necesitas
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Una plataforma integral que unifica todos los servicios del DEFIDER 
            en una experiencia fluida y moderna.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="card-energy relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <div className={`w-full h-full ${service.color} rounded-full blur-xl`}></div>
                </div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {service.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-muted-foreground">
                        <Star className="w-4 h-4 text-accent mr-2 fill-current" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button variant="ghost" className="group">
                    Explorar
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4 bg-card rounded-2xl p-8 shadow-sport">
            <div className="flex items-center space-x-4">
              <Clock className="w-8 h-8 text-primary" />
              <div className="text-left">
                <h4 className="font-semibold text-foreground">¿Primera vez?</h4>
                <p className="text-sm text-muted-foreground">Descubre nuestros talleres</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <MapPin className="w-8 h-8 text-secondary" />
              <div className="text-left">
                <h4 className="font-semibold text-foreground">¿Necesitas ayuda?</h4>
                <p className="text-sm text-muted-foreground">Contacta a nuestro equipo</p>
              </div>
            </div>
            <Button variant="energy" size="lg">
              Comenzar Ahora
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;