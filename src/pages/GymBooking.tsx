import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Calendar, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface HorarioGym {
  id: string;
  dia: string;
  bloque: string;
  hora_inicio: string;
  hora_fin: string;
  cupos_totales: number;
  cupos_ocupados: number;
}

const GymBooking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [horarios, setHorarios] = useState<HorarioGym[]>([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState<string | null>(null);
  const [userReservations, setUserReservations] = useState<Set<string>>(new Set());

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchHorarios();
    fetchUserReservations();
  }, [user]);

  const fetchHorarios = async () => {
    try {
      const { data, error } = await supabase
        .from('horarios_gym')
        .select('*')
        .order('dia', { ascending: true })
        .order('hora_inicio', { ascending: true });

      if (error) throw error;
      setHorarios(data || []);
    } catch (error) {
      console.error('Error fetching horarios:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los horarios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReservations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reservas_gym')
        .select('horario_gym_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const reservationIds = new Set(data?.map(r => r.horario_gym_id) || []);
      setUserReservations(reservationIds);
    } catch (error) {
      console.error('Error fetching user reservations:', error);
    }
  };

  const handleReservation = async (horarioId: string) => {
    if (!user) return;

    setReserving(horarioId);
    try {
      const { error } = await supabase
        .from('reservas_gym')
        .insert([
          {
            user_id: user.id,
            horario_gym_id: horarioId
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Ya reservado",
            description: "Ya tienes una reserva en este horario",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "¡Reservado!",
          description: "Has reservado exitosamente tu cupo en el gimnasio"
        });
        // Refresh data
        fetchHorarios();
        fetchUserReservations();
      }
    } catch (error) {
      console.error('Error making reservation:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la reserva",
        variant: "destructive"
      });
    } finally {
      setReserving(null);
    }
  };

  const handleCancelReservation = async (horarioId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reservas_gym')
        .delete()
        .eq('user_id', user.id)
        .eq('horario_gym_id', horarioId);

      if (error) throw error;

      toast({
        title: "Reserva cancelada",
        description: "Has cancelado tu reserva exitosamente"
      });
      
      // Refresh data
      fetchHorarios();
      fetchUserReservations();
    } catch (error) {
      console.error('Error canceling reservation:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la reserva",
        variant: "destructive"
      });
    }
  };

  const getCuposColor = (ocupados: number, totales: number) => {
    const disponibles = totales - ocupados;
    if (disponibles > 10) return "text-secondary";
    if (disponibles >= 5) return "text-accent";
    return "text-destructive";
  };

  const getCuposBadgeVariant = (ocupados: number, totales: number) => {
    const disponibles = totales - ocupados;
    if (disponibles > 10) return "secondary";
    if (disponibles >= 5) return "outline";
    return "destructive";
  };

  const groupedHorarios = horarios.reduce((acc, horario) => {
    if (!acc[horario.dia]) {
      acc[horario.dia] = [];
    }
    acc[horario.dia].push(horario);
    return acc;
  }, {} as Record<string, HorarioGym[]>);

  const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando horarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-hero text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Reserva de Gimnasio
            </h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Reserva tu cupo en el gimnasio universitario. Horarios por bloques académicos con 20 cupos disponibles por sesión.
            </p>
          </div>
        </div>
      </section>

      {/* Schedule Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {diasOrden.map((dia) => (
              <div key={dia} className="space-y-4">
                <h2 className="text-2xl font-bold text-center text-foreground bg-muted/30 rounded-lg py-3">
                  {dia}
                </h2>
                
                <div className="space-y-3">
                  {groupedHorarios[dia]?.map((horario) => {
                    const disponibles = horario.cupos_totales - horario.cupos_ocupados;
                    const isReserved = userReservations.has(horario.id);
                    const isFull = disponibles <= 0;
                    
                    return (
                      <Card key={horario.id} className="p-4 hover-scale">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-foreground">
                              {horario.bloque}
                            </div>
                            {isReserved && (
                              <CheckCircle className="w-4 h-4 text-secondary" />
                            )}
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2" />
                            {horario.hora_inicio.slice(0, 5)} - {horario.hora_fin.slice(0, 5)}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm">
                              <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                              <span className={getCuposColor(horario.cupos_ocupados, horario.cupos_totales)}>
                                {disponibles}/{horario.cupos_totales}
                              </span>
                            </div>
                            <Badge variant={getCuposBadgeVariant(horario.cupos_ocupados, horario.cupos_totales)}>
                              {disponibles > 0 ? `${disponibles} disponibles` : "Completo"}
                            </Badge>
                          </div>
                          
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-primary transition-all duration-300"
                              style={{ width: `${(horario.cupos_ocupados / horario.cupos_totales) * 100}%` }}
                            ></div>
                          </div>
                          
                          {isReserved ? (
                            <Button 
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => handleCancelReservation(horario.id)}
                            >
                              Cancelar Reserva
                            </Button>
                          ) : (
                            <Button 
                              variant={isFull ? "ghost" : "sport"}
                              size="sm"
                              className="w-full"
                              disabled={isFull || reserving === horario.id}
                              onClick={() => handleReservation(horario.id)}
                            >
                              {reserving === horario.id ? "Reservando..." :
                               isFull ? "Sin Cupos" : "Reservar"}
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-muted/30 rounded-lg p-6 max-w-2xl mx-auto">
              <Calendar className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Información Important</h3>
              <p className="text-muted-foreground text-sm">
                • Cada sesión tiene 20 cupos disponibles<br/>
                • Puedes reservar con hasta 24 horas de anticipación<br/>
                • Cancela tu reserva si no puedes asistir<br/>
                • Los horarios están basados en bloques académicos
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GymBooking;