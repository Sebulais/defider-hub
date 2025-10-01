import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Calendar, Plus, Edit2, Save, Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TallerInscription {
  id: string;
  taller_id: string;
  talleres: {
    name: string;
    schedule: string;
    location: string;
    color: string;
  };
}

interface GymReservation {
  id: string;
  horario_gym_id: string;
  horarios_gym: {
    dia: string;
    bloque: string;
  };
}

interface RamoPersonal {
  id: string;
  nombre_ramo: string;
  sala: string;
  dia: string;
  bloque_inicio: number;
  bloque_fin: number;
  color: string;
}

interface ScheduleEvent {
  type: 'taller' | 'gym' | 'ramo';
  id: string;
  name: string;
  sala?: string;
  color: string;
  canDelete: boolean;
}

const BLOQUES = [
  { num: '1-2', hora: '08:15-09:25' },
  { num: '3-4', hora: '09:40-10:50' },
  { num: '5-6', hora: '11:05-12:15' },
  { num: '7-8', hora: '12:30-13:40' },
  { num: '9-10', hora: '14:40-15:50' },
  { num: '11-12', hora: '16:05-17:15' },
  { num: '13-14', hora: '17:30-18:40' },
];

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const COLORES_RAMOS = [
  { value: 'bg-purple-500', label: 'Morado' },
  { value: 'bg-pink-500', label: 'Rosado' },
  { value: 'bg-indigo-500', label: 'Índigo' },
  { value: 'bg-cyan-500', label: 'Cyan' },
  { value: 'bg-teal-500', label: 'Verde Azulado' },
  { value: 'bg-orange-500', label: 'Naranja' },
];

const Schedule = () => {
  const [talleres, setTalleres] = useState<TallerInscription[]>([]);
  const [gymReservations, setGymReservations] = useState<GymReservation[]>([]);
  const [ramos, setRamos] = useState<RamoPersonal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ dia: string; bloque: string } | null>(null);
  
  // Backup states para cancelar cambios
  const [backupRamos, setBackupRamos] = useState<RamoPersonal[]>([]);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    nombre_ramo: '',
    sala: '',
    dia: '',
    bloque: '', // Solo un campo para el par de bloques
    color: 'bg-purple-500',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchScheduleData();

    // Real-time subscriptions
    const channel = supabase
      .channel('schedule-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inscripciones_talleres' }, () => fetchScheduleData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservas_gym' }, () => fetchScheduleData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ramos_personales' }, () => fetchScheduleData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const fetchScheduleData = async () => {
    if (!user) return;

    try {
      const [talleresRes, gymRes, ramosRes] = await Promise.all([
        supabase
          .from('inscripciones_talleres')
          .select('id, taller_id, talleres(name, schedule, location, color)')
          .eq('user_id', user.id),
        supabase
          .from('reservas_gym')
          .select('id, horario_gym_id, horarios_gym(dia, bloque)')
          .eq('user_id', user.id),
        supabase
          .from('ramos_personales')
          .select('*')
          .eq('user_id', user.id),
      ]);

      if (talleresRes.error) throw talleresRes.error;
      if (gymRes.error) throw gymRes.error;
      if (ramosRes.error) throw ramosRes.error;

      setTalleres(talleresRes.data || []);
      setGymReservations(gymRes.data || []);
      setRamos(ramosRes.data || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Error al cargar horario');
    } finally {
      setLoading(false);
    }
  };

  const parseScheduleToSlots = (schedule: string): { dia: string; bloques: string[] }[] => {
    const diasMatch = schedule.match(/([A-Za-zé]+)(?:-([A-Za-zé]+))?(?:-([A-Za-zé]+))?/);
    const bloquesMatch = schedule.match(/Bloque (\d+)-(\d+)/);

    if (!diasMatch || !bloquesMatch) return [];

    const diasMap: { [key: string]: string } = {
      'Lun': 'Lunes', 'Mar': 'Martes', 'Mié': 'Miércoles', 'Jue': 'Jueves', 'Vie': 'Viernes'
    };

    const dias = [diasMatch[1], diasMatch[2], diasMatch[3]]
      .filter(Boolean)
      .map(d => diasMap[d] || d);
    
    const bloqueInicio = bloquesMatch[1];
    const bloqueFin = bloquesMatch[2];
    const bloquePar = `${bloqueInicio}-${bloqueFin}`;

    return dias.map(dia => ({ dia, bloques: [bloquePar] }));
  };

  const getEventForSlot = (dia: string, bloquePar: string): ScheduleEvent | null => {
    // Check talleres
    for (const taller of talleres) {
      const slots = parseScheduleToSlots(taller.talleres.schedule);
      for (const slot of slots) {
        if (slot.dia === dia && slot.bloques.includes(bloquePar)) {
          return {
            type: 'taller',
            id: taller.id,
            name: taller.talleres.name,
            sala: taller.talleres.location,
            color: taller.talleres.color,
            canDelete: true,
          };
        }
      }
    }

    // Check gym
    for (const gym of gymReservations) {
      if (gym.horarios_gym.dia === dia && gym.horarios_gym.bloque === `Bloque ${bloquePar}`) {
        return {
          type: 'gym',
          id: gym.id,
          name: 'Gimnasio',
          sala: gym.horarios_gym.bloque,
          color: 'bg-primary',
          canDelete: true,
        };
      }
    }
  
    // Check ramos
    for (const ramo of ramos) {
      const ramoPar = `${ramo.bloque_inicio}-${ramo.bloque_fin}`;
      if (ramo.dia === dia && ramoPar === bloquePar) {
        return {
          type: 'ramo',
          id: ramo.id,
          name: ramo.nombre_ramo,
          sala: ramo.sala,
          color: ramo.color,
          canDelete: true,
        };
      }
    }
  
    return null;
  };

  const handleAddRamo = async () => {
    if (!user || !formData.nombre_ramo || !formData.dia || !formData.bloque) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    const [bloqueInicio, bloqueFin] = formData.bloque.split('-').map(Number);

    // Check conflicts
    const existing = getEventForSlot(formData.dia, formData.bloque);
    if (existing) {
      toast.error(`Conflicto detectado en ${formData.dia} bloque ${formData.bloque}`);
      return;
    }

    try {
      const { error } = await supabase.from('ramos_personales').insert({
        user_id: user.id,
        nombre_ramo: formData.nombre_ramo,
        sala: formData.sala || '',
        dia: formData.dia,
        bloque_inicio: bloqueInicio,
        bloque_fin: bloqueFin,
        color: formData.color,
      });

      if (error) throw error;

      toast.success('Ramo agregado exitosamente');
      setShowAddDialog(false);
      setFormData({
        nombre_ramo: '',
        sala: '',
        dia: '',
        bloque: '',
        color: 'bg-purple-500',
      });
      fetchScheduleData();
    } catch (error) {
      console.error('Error adding ramo:', error);
      toast.error('Error al agregar ramo');
    }
  };

  const handleDelete = async (event: ScheduleEvent) => {
    try {
      if (event.type === 'ramo') {
        const { error } = await supabase.from('ramos_personales').delete().eq('id', event.id);
        if (error) throw error;
        toast.success('Ramo eliminado');
      } else if (event.type === 'taller') {
        const { error } = await supabase.from('inscripciones_talleres').delete().eq('id', event.id);
        if (error) throw error;
        toast.success('Taller eliminado del horario');
      } else if (event.type === 'gym') {
        const { error } = await supabase.from('reservas_gym').delete().eq('id', event.id);
        if (error) throw error;
        toast.success('Reserva de gimnasio cancelada');
      }
      fetchScheduleData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Error al eliminar');
    }
  };

  const handleEnterEditMode = () => {
    // Crear backup del estado actual
    setBackupRamos(JSON.parse(JSON.stringify(ramos)));
    setEditMode(true);
  };

  const handleSaveChanges = () => {
    setEditMode(false);
    toast.success('Cambios guardados');
  };

  const handleCancelEdit = async () => {
    if (!user) return;

    try {
      // Obtener IDs actuales y del backup
      const currentRamoIds = new Set(ramos.map(r => r.id));
      const backupRamoIds = new Set(backupRamos.map(r => r.id));

      // Eliminar ramos que fueron agregados durante la edición
      const ramosToDelete = ramos.filter(r => !backupRamoIds.has(r.id));
      for (const ramo of ramosToDelete) {
        await supabase.from('ramos_personales').delete().eq('id', ramo.id);
      }

      // Re-agregar ramos que fueron eliminados durante la edición
      const ramosToRestore = backupRamos.filter(r => !currentRamoIds.has(r.id));
      for (const ramo of ramosToRestore) {
        await supabase.from('ramos_personales').insert({
          user_id: user.id,
          nombre_ramo: ramo.nombre_ramo,
          sala: ramo.sala,
          dia: ramo.dia,
          bloque_inicio: ramo.bloque_inicio,
          bloque_fin: ramo.bloque_fin,
          color: ramo.color,
        });
      }

      // Refrescar datos
      await fetchScheduleData();
      setEditMode(false);
      toast.info('Cambios descartados');
    } catch (error) {
      console.error('Error canceling changes:', error);
      toast.error('Error al cancelar cambios');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando horario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                <Calendar className="h-8 w-8" />
                Mi Horario Personal
              </h1>
              <p className="text-lg opacity-90">Visualiza y gestiona tu horario completo</p>
            </div>
            <div className="flex gap-2">
              {editMode ? (
                <>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="gap-2 bg-white/10 hover:bg-white/20 border-white/30"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    variant="secondary"
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Guardar
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleEnterEditMode}
                  variant="default"
                  className="gap-2 bg-white text-primary hover:bg-white/90"
                >
                  <Edit2 className="h-4 w-4" />
                  Editar Horario
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left font-semibold bg-muted/50">Bloque</th>
                {DIAS.map(dia => (
                  <th key={dia} className="p-3 text-center font-semibold bg-muted/50 min-w-[150px]">{dia}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BLOQUES.map(({ num, hora }) => (
                <tr key={num} className="border-b hover:bg-muted/20">
                  <td className="p-3 font-medium text-sm">
                    <div className="flex flex-col">
                      <span className="font-bold">Bloque {num}</span>
                      <span className="text-xs text-muted-foreground">{hora}</span>
                    </div>
                  </td>
                  {DIAS.map(dia => {
                    const event = getEventForSlot(dia, num);
                    
                    return (
                      <td key={`${dia}-${num}`} className="p-1 text-center align-top">
                        {event ? (
                          <div className={`${event.color} text-white rounded p-2 text-xs relative group`}>
                            <div className="font-semibold">{event.name}</div>
                            {event.sala && <div className="text-xs opacity-90">{event.sala}</div>}
                            {editMode && event.canDelete && (
                              <button
                                onClick={() => handleDelete(event)}
                                className="absolute top-1 right-1 bg-destructive rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ) : editMode ? (
                          <button
                            onClick={() => {
                              setSelectedSlot({ dia, bloque: num });
                              setFormData({ 
                                ...formData, 
                                dia, 
                                bloque: num
                              });
                              setShowAddDialog(true);
                            }}
                            className="w-full h-full min-h-[60px] border-2 border-dashed border-muted-foreground/30 rounded hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center"
                          >
                            <Plus className="h-5 w-5 text-muted-foreground" />
                          </button>
                        ) : (
                          <div className="min-h-[60px]" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Legend */}
        <div className="mt-6 flex gap-6 justify-center flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-secondary rounded" />
            <span className="text-sm">Talleres DEFIDER</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded" />
            <span className="text-sm">Gimnasio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded" />
            <span className="text-sm">Ramos Académicos</span>
          </div>
        </div>
      </div>

      {/* Add Ramo Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Ramo Académico</DialogTitle>
            <DialogDescription>Completa la información del ramo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre_ramo">Nombre del Ramo *</Label>
              <Input
                id="nombre_ramo"
                value={formData.nombre_ramo}
                onChange={(e) => setFormData({ ...formData, nombre_ramo: e.target.value })}
                placeholder="Ej: Cálculo I"
              />
            </div>
            <div>
              <Label htmlFor="sala">Sala</Label>
              <Input
                id="sala"
                value={formData.sala}
                onChange={(e) => setFormData({ ...formData, sala: e.target.value })}
                placeholder="Ej: E201"
              />
            </div>
            <div>
              <Label htmlFor="dia">Día *</Label>
              <Select value={formData.dia} onValueChange={(v) => setFormData({ ...formData, dia: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona día" />
                </SelectTrigger>
                <SelectContent>
                  {DIAS.map(dia => <SelectItem key={dia} value={dia}>{dia}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bloque">Bloque *</Label>
              <Select value={formData.bloque} onValueChange={(v) => setFormData({ ...formData, bloque: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona bloque" />
                </SelectTrigger>
                <SelectContent>
                  {BLOQUES.map(b => (
                    <SelectItem key={b.num} value={b.num}>
                      Bloque {b.num} ({b.hora})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLORES_RAMOS.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 ${c.value} rounded`} />
                        {c.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddRamo}>
                Agregar Ramo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;
