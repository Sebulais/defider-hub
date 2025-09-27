import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Dumbbell, 
  Calendar, 
  Users, 
  Trophy,
  Menu,
  X
} from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Inicio", path: "/", icon: Dumbbell },
    { name: "Talleres", path: "/talleres", icon: Users },
    { name: "Gimnasio", path: "/gimnasio", icon: Trophy },
    { name: "Mi Horario", path: "/horario", icon: Calendar },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-card border-b border-border shadow-sport sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-hero rounded-lg flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">DEFIDER</span>
              <p className="text-xs text-muted-foreground">Educación Física</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "sport" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant={isActive(item.path) ? "sport" : "ghost"}
                      size="sm"
                      className="w-full justify-start flex items-center space-x-2"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;