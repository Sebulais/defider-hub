import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar, Clock, Users, AlertCircle } from 'lucide-react';

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
  const [horarios, setHorarios] = useState<HorarioGym[]>([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState<string | null>(null);
  const [userReservations, setUserReservations] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchHorarios();
    fetchUserReservations();

    // Real-time subscription for gym schedules
    const channel = supabase
      .channel('gym-schedule-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'horarios_gym'
        },
        () => {
          fetchHorarios();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservas_gym'
        },
        () => {
          fetchHorarios();
          fetchUserReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

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
      console.error('Error fetching gym schedules:', error);
      toast.error('Error al cargar horarios del gimnasio');
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
    if (!user) {
      toast.error('Debes iniciar sesión para reservar');
      navigate('/auth');
      return;
    }

    setReserving(horarioId);

    try {
      const { error } = await supabase
        .from('reservas_gym')
        .insert({
          user_id: user.id,
          horario_gym_id: horarioId,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Ya tienes una reserva para este horario');
        } else {
          throw error;
        }
        return;
      }

      toast.success('¡Reserva realizada exitosamente!');
      await fetchHorarios();
      await fetchUserReservations();
    } catch (error) {
      console.error('Error making reservation:', error);
      toast.error('Error al realizar la reserva');
    } finally {
      setReserving(null);
    }
  };

  const handleCancelReservation = async (horarioId: string) => {
    if (!user) return;

    setReserving(horarioId);

    try {
      const { error } = await supabase
        .from('reservas_gym')
        .delete()
        .eq('user_id', user.id)
        .eq('horario_gym_id', horarioId);

      if (error) throw error;

      toast.success('Reserva cancelada exitosamente');
      await fetchHorarios();
      await fetchUserReservations();
    } catch (error) {
      console.error('Error canceling reservation:', error);
      toast.error('Error al cancelar la reserva');
    } finally {
      setReserving(null);
    }
  };

  const getCuposColor = (disponibles: number, totales: number) => {
    const porcentaje = (disponibles / totales) * 100;
    if (porcentaje > 50) return 'text-secondary';
    if (porcentaje > 25) return 'text-accent';
    return 'text-destructive';
  };

  const getCuposBadgeVariant = (disponibles: number, totales: number): "default" | "secondary" | "destructive" => {
    const porcentaje = (disponibles / totales) * 100;
    if (porcentaje > 50) return 'secondary';
    if (porcentaje > 25) return 'default';
    return 'destructive';
  };

  const groupedHorarios = horarios.reduce((acc, horario) => {
    if (!acc[horario.dia]) {
      acc[horario.dia] = [];
    }
    acc[horario.dia].push(horario);
    return acc;
  }, {} as Record<string, HorarioGym[]>);

  const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
      <div className="gradient-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Reserva de Gimnasio</h1>
          <p className="text-lg opacity-90">Reserva tu espacio en el gimnasio y entrena cuando quieras</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Schedules by Day */}
        <div className="space-y-8">
          {diasOrden.map((dia) => {
            const horariosDelDia = groupedHorarios[dia];
            if (!horariosDelDia || horariosDelDia.length === 0) return null;

            return (
              <div key={dia}>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  {dia}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {horariosDelDia.map((horario) => {
                    const cuposDisponibles = horario.cupos_totales - horario.cupos_ocupados;
                    const isReserved = userReservations.has(horario.id);
                    const isFull = cuposDisponibles <= 0;

                    return (
                      <Card key={horario.id} className="transition-sport hover:shadow-sport">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-primary" />
                              {horario.bloque}
                            </span>
                            <Badge variant={getCuposBadgeVariant(cuposDisponibles, horario.cupos_totales)}>
                              {cuposDisponibles}/{horario.cupos_totales}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {horario.hora_inicio.substring(0, 5)} - {horario.hora_fin.substring(0, 5)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Users className={`h-4 w-4 ${getCuposColor(cuposDisponibles, horario.cupos_totales)}`} />
                              <span className={`text-sm font-medium ${getCuposColor(cuposDisponibles, horario.cupos_totales)}`}>
                                {cuposDisponibles > 0 
                                  ? `${cuposDisponibles} cupos disponibles`
                                  : 'Sin cupos disponibles'}
                              </span>
                            </div>

                            {isReserved ? (
                              <Button
                                onClick={() => handleCancelReservation(horario.id)}
                                disabled={reserving === horario.id}
                                variant="destructive"
                                className="w-full"
                              >
                                {reserving === horario.id ? 'Cancelando...' : 'Cancelar Reserva'}
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleReservation(horario.id)}
                                disabled={isFull || reserving === horario.id}
                                className="w-full"
                              >
                                {reserving === horario.id 
                                  ? 'Reservando...' 
                                  : isFull 
                                  ? 'Sin cupos' 
                                  : 'Reservar'}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Important Information */}
        <Card className="mt-12 border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <AlertCircle className="h-5 w-5" />
              Información Importante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Las reservas se actualizan en tiempo real</p>
            <p>• Puedes cancelar tu reserva hasta 1 hora antes del horario</p>
            <p>• Máximo 3 reservas activas por persona</p>
            <p>• Recuerda llegar 10 minutos antes de tu horario reservado</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GymBooking;
