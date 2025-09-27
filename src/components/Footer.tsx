import { Link } from "react-router-dom";
import { 
  Dumbbell, 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center">
                <Dumbbell className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">DEFIDER</h3>
                <p className="text-sm text-muted-foreground">Educación Física</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Unificando todos los servicios del Departamento de Educación Física 
              en una plataforma moderna y accesible para toda la comunidad universitaria.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/talleres" className="text-muted-foreground hover:text-primary transition-colors">
                  Talleres Deportivos
                </Link>
              </li>
              <li>
                <Link to="/gimnasio" className="text-muted-foreground hover:text-primary transition-colors">
                  Reserva Gimnasio
                </Link>
              </li>
              <li>
                <Link to="/horario" className="text-muted-foreground hover:text-primary transition-colors">
                  Mi Horario
                </Link>
              </li>
              <li>
                <Link to="/equipamiento" className="text-muted-foreground hover:text-primary transition-colors">
                  Equipamiento Deportivo
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-muted-foreground">
                <Phone className="w-4 h-4 mr-3 text-primary" />
                <span className="text-sm">+57 (1) 234-5678</span>
              </li>
              <li className="flex items-center text-muted-foreground">
                <Mail className="w-4 h-4 mr-3 text-primary" />
                <span className="text-sm">defider@universidad.edu.co</span>
              </li>
              <li className="flex items-start text-muted-foreground">
                <MapPin className="w-4 h-4 mr-3 text-primary mt-1" />
                <span className="text-sm">
                  Campus Universitario<br />
                  Edificio de Deportes, Piso 2
                </span>
              </li>
            </ul>
          </div>

          {/* Hours & Social */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Horarios</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-3 text-primary" />
                <span>Lun-Vie: 6:00 AM - 10:00 PM</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-3 text-primary" />
                <span>Sáb-Dom: 8:00 AM - 8:00 PM</span>
              </div>
            </div>

            <div className="pt-4">
              <h5 className="text-sm font-semibold text-foreground mb-3">Síguenos</h5>
              <div className="flex space-x-3">
                <a href="#" className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center hover:shadow-sport transition-all">
                  <Facebook className="w-4 h-4 text-white" />
                </a>
                <a href="#" className="w-8 h-8 gradient-secondary rounded-lg flex items-center justify-center hover:shadow-sport transition-all">
                  <Instagram className="w-4 h-4 text-white" />
                </a>
                <a href="#" className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center hover:shadow-sport transition-all">
                  <Twitter className="w-4 h-4 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 DEFIDER - Departamento de Educación Física. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;