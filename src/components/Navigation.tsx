import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  Dumbbell, 
  Calendar, 
  Users, 
  Trophy,
  Menu,
  X,
  LogOut,
  User
} from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navItems = [
    { name: "Inicio", path: "/", icon: Dumbbell, public: true },
    { name: "Talleres", path: "/talleres", icon: Users, public: false },
    { name: "Gimnasio", path: "/gym", icon: Trophy, public: false },
    { name: "Mi Horario", path: "/schedule", icon: Calendar, public: false },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

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
            {navItems
              .filter(item => item.public || user)
              .map((item) => {
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
            
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-muted-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                <span>Salir</span>
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="sport" size="sm" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Ingresar</span>
                </Button>
              </Link>
            )}
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
              {navItems
                .filter(item => item.public || user)
                .map((item) => {
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
              
              {user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start flex items-center space-x-2 text-muted-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Salir</span>
                </Button>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="sport" size="sm" className="w-full justify-start flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Ingresar</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;