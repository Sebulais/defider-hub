import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Calendar, Plus, Edit2, Save, Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';


type RamoPersonalRow = {
  id: string;
  user_id: string;
  nombre_ramo: string;
  sala: string | null;
  dia: string;
  bloque_ramo: string;
  color: string | null;
  created_at?: string | null;
};

type TallerInscritoRow = {
  id: string;
  taller_id: string;
  talleres: {
    id?: string;
    name: string;
    instructor?: string;
    schedule?: string;
    location?: string;
    color?: string | null;
  };
};

type ReservaGymRow = {
  id: string;
  horario_gym_id: string;
  horarios_gym: {
    dia: string;
    bloque: string;
    hora_inicio?: string;
    hora_fin?: string;
  };
};

type ScheduleEvent =
  | ({ type: "ramo" } & RamoPersonalRow)
  | ({ type: "taller" } & TallerInscritoRow)
  | ({ type: "gym" } & ReservaGymRow);

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const BLOQUES = [
  { num: "1-2", hora: "08:15-09:25" },
  { num: "3-4", hora: "09:40-10:50" },
  { num: "5-6", hora: "11:05-12:15" },
  { num: "7-8", hora: "12:30-13:40" },
  { num: "9-10", hora: "14:40-15:50" },
  { num: "11-12", hora: "16:05-17:15" },
  { num: "13-14", hora: "17:30-18:40" },
  { num: "15-16", hora: "18:50-20:00"},
  { num: "17-18", hora: "20:10-21:20"},
];

const COLORES_RAMOS = [
  { value: "bg-purple-500", label: "Morado" },
  { value: "bg-pink-500", label: "Rosado" },
  { value: "bg-indigo-500", label: "Índigo" },
  { value: "bg-cyan-500", label: "Cyan" },
  { value: "bg-teal-500", label: "Verde Azulado" },
  { value: "bg-orange-500", label: "Naranja" },
];

const Schedule: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [ramos, setRamos] = useState<RamoPersonalRow[]>([]);
  const [talleres, setTalleres] = useState<TallerInscritoRow[]>([]);
  const [reservasGym, setReservasGym] = useState<ReservaGymRow[]>([]);

  // Modal & editing
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ dia: string; bloque: string } | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  

  // Form data for editing ramo (mirrors selectedEvent when editing)
  const [formData, setFormData] = useState({
    nombre_ramo: "",
    sala: "",
    dia: "",
    bloque_ramo: "",
    color: "bg-purple-500",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchScheduleData();

    // real-time updates (optional)
    const channel = supabase
      .channel("schedule-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "ramos_personales" }, () => fetchScheduleData())
      .on("postgres_changes", { event: "*", schema: "public", table: "inscripciones_talleres" }, () => fetchScheduleData())
      .on("postgres_changes", { event: "*", schema: "public", table: "reservas_gym" }, () => fetchScheduleData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  // Fetch data
  const fetchScheduleData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [ramosRes, talleresRes, reservasRes] = await Promise.all([
        supabase
          .from("ramos_personales")
          .select("*")
          .eq("user_id", user.id),
        supabase
          .from("inscripciones_talleres")
          .select("id, taller_id, talleres(name, instructor, schedule, location, color)")
          .eq("user_id", user.id),
        supabase
          .from("reservas_gym")
          .select("id, horario_gym_id, horarios_gym(dia, bloque, hora_inicio, hora_fin)")
          .eq("user_id", user.id),
      ]);

      if (ramosRes.error) throw ramosRes.error;
      if (talleresRes.error) throw talleresRes.error;
      if (reservasRes.error) throw reservasRes.error;

      setRamos((ramosRes.data || []) as RamoPersonalRow[]);
      setTalleres((talleresRes.data || []) as TallerInscritoRow[]);
      setReservasGym((reservasRes.data || []) as ReservaGymRow[]);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast.error("Error al cargar horario");
    } finally {
      setLoading(false);
    }
  };

  // Helper: parse schedule string of a taller -> array of { dia, bloques: ['1-2'] }
  const parseScheduleToSlots = (schedule: string): { dia: string; bloques: string[] }[] => {
    if (!schedule) return [];
    
    // Match days (Lun/Mar/Mié/Jue/Vie) optionally separated by -
    const diasMatch = schedule.match(/([A-Za-zé]+)(?:-([A-Za-zé]+))?(?:-([A-Za-zé]+))?/);
    // Match "Bloque 1-2" or "1-2"
    const bloquesMatch = schedule.match(/Bloque\s*(\d+)-(\d+)|(\d+)-(\d+)/);
    if (!diasMatch || !bloquesMatch) return [];

    const diasMap: Record<string, string> = {
      "Lun": "Lunes",
      "Mar": "Martes",
      "Mié": "Miércoles",
      "Mie": "Miércoles",
      "Jue": "Jueves",
      "Vie": "Viernes",
    };

    const dias = [diasMatch[1], diasMatch[2], diasMatch[3]].filter(Boolean).map(d => diasMap[d] || d);
    // bloquesMatch may capture either group 1-2 or group 3-4 depending on regex branch
    const inicio = bloquesMatch[1] ?? bloquesMatch[3];
    const fin = bloquesMatch[2] ?? bloquesMatch[4];
    const bloquePar = `${inicio}-${fin}`;

    return dias.map(dia => ({ dia, bloques: [bloquePar] }));
  };

  // Utility to get event occupying a slot (used when rendering grid). Returns ScheduleEvent or null
  const getEventForSlot = (dia: string, bloquePar: string): ScheduleEvent | null => {
    // check ramos (they have dia + bloque_ramo)
    for (const r of ramos) {
      if (r.dia === dia && r.bloque_ramo === bloquePar) {
        return { type: "ramo", ...r } as ScheduleEvent;
      }
    }

    // check talleres (use parseScheduleToSlots on talleres.schedule)
    for (const t of talleres) {
      const schedule = t.talleres?.schedule ?? "";
      const slots = parseScheduleToSlots(schedule);
      for (const s of slots) {
        if (s.dia === dia && s.bloques.includes(bloquePar)) {
          // Return the taller object annotated with type
          return { type: "taller", ...t } as ScheduleEvent;
        }
      }
    }

    // check gym
    for (const g of reservasGym) {
      if (g.horarios_gym.dia === dia && g.horarios_gym.bloque === `Bloque ${bloquePar}`) {
        return { type: "gym", ...g } as ScheduleEvent;
      }
    }

    return null;
  };

  const handleAddRamo = async () => {
    if (!user || !formData.nombre_ramo || !formData.dia || !formData.bloque_ramo) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    // Check conflicts
    const existing = getEventForSlot(formData.dia, formData.bloque_ramo);
    if (existing) {
      toast.error(`Conflicto detectado en ${formData.dia} bloque ${formData.bloque_ramo} con ${existing.type === "ramo" ? existing.nombre_ramo : existing.type === "taller" ? existing.talleres.name : "Gimnasio"}`);
      return;
    }

    try {
      const { error } = await supabase.from("ramos_personales").insert({
        user_id: user.id,
        nombre_ramo: formData.nombre_ramo,
        sala: formData.sala,
        dia: formData.dia,
        bloque_ramo: formData.bloque_ramo, 
        color: formData.color,
      });

      if (error) throw error;

      toast.success("Ramo agregado exitosamente");
      setShowAddDialog(false);
      setFormData({ nombre_ramo: "", sala: "", dia: "", bloque_ramo: "", color: "bg-purple-500" });
      fetchScheduleData();
    } catch {
      toast.error("Error al agregar Ramo");
    }
  };

  // Open modal for an event (clicked in grid)
  const openEventModal = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setIsEditing(false);
    // if it's a ramo, preload formData for editing
    if (event.type === "ramo") {
      setFormData({
        nombre_ramo: event.nombre_ramo,
        sala: event.sala ?? "",
        dia: event.dia,
        bloque_ramo: event.bloque_ramo,
        color: event.color ?? "bg-purple-500",
      });
    }
    setShowEventModal(true);
  };

  // Delete handler for any type
  const handleDelete = async (event: ScheduleEvent | null) => {
    if (!event) return;
    try {
      if (event.type === "ramo") {
        const { error } = await supabase.from("ramos_personales").delete().eq("id", event.id);
        if (error) throw error;
        // locally remove
        setRamos(prev => prev.filter(r => r.id !== event.id));
        toast.success("Ramo eliminado");
      } else if (event.type === "taller") {
        // delete the inscription row by id (inscripciones_talleres.id)
        const { error } = await supabase.from("inscripciones_talleres").delete().eq("id", event.id);
        if (error) throw error;
        setTalleres(prev => prev.filter(t => t.id !== event.id));
        toast.success("Inscripción de taller eliminada");
      } else if (event.type === "gym") {
        const { error } = await supabase.from("reservas_gym").delete().eq("id", event.id);
        if (error) throw error;
        setReservasGym(prev => prev.filter(g => g.id !== event.id));
        toast.success("Reserva de gimnasio cancelada");
      }
      setShowEventModal(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error("Error al eliminar evento");
    }
  };

  // Save edits for ramo
  const handleSaveEditRamo = async () => {
    if (!selectedEvent || selectedEvent.type !== "ramo") return;
    const updates = {
      nombre_ramo: formData.nombre_ramo,
      sala: formData.sala || null,
      dia: formData.dia,
      bloque_ramo: formData.bloque_ramo,
      color: formData.color || null,
    };
    try {
      const { error } = await supabase.from("ramos_personales").update(updates).eq("id", selectedEvent.id);
      if (error) throw error;
      // update local state immediately
      setRamos(prev => prev.map(r => (r.id === selectedEvent.id ? { ...r, ...updates } as RamoPersonalRow : r)));
      toast.success("Ramo actualizado");
      setIsEditing(false);
      setShowEventModal(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error("Error updating ramo:", err);
      toast.error("Error al actualizar ramo");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando horario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Mi Horario
            </h1>
            <p className="opacity-90">Visualiza y gestiona tu horario completo</p>
          </div>
          <Button
            onClick={() => setEditMode((prev) => !prev)}
            variant="default"
            className="gap-2 bg-white text-primary hover:bg-white/90"
          >
            {editMode ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
            {editMode ? "Salir del modo edición" : "Agregar Ramos"}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <Card className="overflow-x-auto mx-auto mt-10 mb-10 max-w-5xl px-6">
          <table className="w-full border-collapse mt-3 mb-3">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-semibold">Bloque</th>
                {DIAS.map(d => (
                  <th key={d} className="p-3 text-center font-semibold min-w-[150px]">{d}</th>
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
                      <td key={`${dia}-${num}`} className="p-2 text-center align-top">
                        {event ? (
                          <div
                            className={`${(event.type === "ramo" ? event.color : event.type === "taller" ? event.talleres.color : "bg-primary") || "bg-primary"} text-white rounded p-2 text-xs relative group cursor-pointer`}
                            onClick={() => openEventModal(event)}
                          >
                            <div className="font-semibold">
                              {event.type === "ramo" ? event.nombre_ramo : event.type === "taller" ? event.talleres.name : "Gimnasio"}
                            </div>
                            {event.type === "ramo" && event.sala && <div className="text-xs opacity-90">{event.sala}</div>}
                            {event.type === "taller" && event.talleres.location && <div className="text-xs opacity-90">{event.talleres.location}</div>}
                            {event.type === "gym" && <div className="text-xs opacity-90">{event.horarios_gym.bloque}</div>}
                            {/* small delete button in edit mode could be added here */}
                          </div>
                        ) : editMode ? (
                          <button
                            onClick={() => {
                              setSelectedSlot({ dia, bloque: num });
                              setFormData({ ...formData, dia, bloque_ramo: num });
                              setShowAddDialog(true);
                            }}
                            className="w-full h-full min-h-[60px] border-2 border-dashed border-muted-foreground/30 rounded hover:border-primary hover:bg-primary/5 transition flex items-center justify-center"
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
            <DialogTitle>Agregar Ramo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Nombre del Ramo *</Label>
            <Input
              value={formData.nombre_ramo}
              onChange={(e) => setFormData({ ...formData, nombre_ramo: e.target.value })}
            />
            <Label>Sala</Label>
            <Input
              value={formData.sala}
              onChange={(e) => setFormData({ ...formData, sala: e.target.value })}
            />
            <Label>Día *</Label>
            <Select
              value={formData.dia}
              onValueChange={(v) => setFormData({ ...formData, dia: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona día" />
              </SelectTrigger>
              <SelectContent>
                {DIAS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Label>Bloque *</Label>
            <Select
              value={formData.bloque_ramo}
              onValueChange={(v) => setFormData({ ...formData, bloque_ramo: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona bloque" />
              </SelectTrigger>
              <SelectContent>
                {BLOQUES.map((b) => (
                  <SelectItem key={b.num} value={b.num}>
                    Bloque {b.num} ({b.hora})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label>Color</Label>
            <Select
              value={formData.color}
              onValueChange={(v) => setFormData({ ...formData, color: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COLORES_RAMOS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 ${c.value} rounded`} />
                      {c.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddRamo}>Agregar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Modal (and edit for ramos) */}
      <Dialog
        open={showEventModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowEventModal(false);
            setSelectedEvent(null);
            setIsEditing(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEvent
                ? selectedEvent.type === "ramo"
                  ? selectedEvent.nombre_ramo
                  : selectedEvent.type === "taller"
                  ? selectedEvent.talleres.name
                  : "Reserva de Gimnasio"
                : "Detalle"}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent?.type === "ramo"
                ? isEditing
                  ? "Edita los datos del ramo y guarda los cambios."
                  : "Detalles del ramo académico."
                : selectedEvent?.type === "taller"
                ? "Información del taller inscrito."
                : "Información de la reserva de gimnasio."}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4 mt-3">
              {selectedEvent.type === "ramo" ? (
                <>
                  {/* Vista normal (no edición) */}
                  {!isEditing ? (
                    <>
                      <p>
                        <strong>Nombre:</strong> {selectedEvent.nombre_ramo}
                      </p>
                      <p>
                        <strong>Día:</strong> {selectedEvent.dia}
                      </p>
                      <p>
                        <strong>Bloque:</strong> {selectedEvent.bloque_ramo}
                      </p>
                      <p>
                        <strong>Sala:</strong> {selectedEvent.sala || "Sin asignar"}
                      </p>
                      <p className="flex items-center gap-2">
                        <strong>Color:</strong>
                        <span
                          className={`inline-block w-4 h-4 rounded ${selectedEvent.color ?? "bg-purple-500"}`}
                        />
                      </p>
                    </>
                  ) : (
                    <>
                      {/* Edición */}
                      <div>
                        <Label>Nombre del Ramo</Label>
                        <Input
                          value={formData.nombre_ramo}
                          onChange={(e) =>
                            setFormData({ ...formData, nombre_ramo: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Día</Label>
                        <Select
                          value={formData.dia}
                          onValueChange={(v) =>
                            setFormData({ ...formData, dia: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona día" />
                          </SelectTrigger>
                          <SelectContent>
                            {DIAS.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Bloque</Label>
                        <Select
                          value={formData.bloque_ramo}
                          onValueChange={(v) =>
                            setFormData({ ...formData, bloque_ramo: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona bloque" />
                          </SelectTrigger>
                          <SelectContent>
                            {BLOQUES.map((b) => (
                              <SelectItem key={b.num} value={b.num}>
                                Bloque {b.num} ({b.hora})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Sala</Label>
                        <Input
                          value={formData.sala}
                          onChange={(e) =>
                            setFormData({ ...formData, sala: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Color</Label>
                        <Select
                          value={formData.color}
                          onValueChange={(v) =>
                            setFormData({ ...formData, color: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COLORES_RAMOS.map((c) => (
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
                    </>
                  )}
                </>
              ) : selectedEvent.type === "taller" ? (
                <>
                  <p>
                    <strong>Nombre:</strong> {selectedEvent.talleres.name}
                  </p>
                  <p>
                    <strong>Instructor:</strong>{" "}
                    {selectedEvent.talleres.instructor || "No especificado"}
                  </p>
                  <p>
                    <strong>Horario:</strong> {selectedEvent.talleres.schedule}
                  </p>
                  <p>
                    <strong>Ubicación:</strong> {selectedEvent.talleres.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <strong>Color:</strong>
                    <span
                      className={`inline-block w-4 h-4 rounded ${
                        selectedEvent.talleres.color ?? "bg-primary"
                      }`}
                    />
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Día:</strong> {selectedEvent.horarios_gym.dia}
                  </p>
                  <p>
                    <strong>Bloque:</strong> {selectedEvent.horarios_gym.bloque}
                  </p>
                </>
              )}

              {/* Botones de acción */}
              <div className="flex justify-end gap-2 mt-6">
                {selectedEvent.type === "ramo" && (
                  <>
                    {!isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="default"
                      >
                        Editar
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              nombre_ramo: selectedEvent.nombre_ramo,
                              sala: selectedEvent.sala ?? "",
                              dia: selectedEvent.dia,
                              bloque_ramo: selectedEvent.bloque_ramo,
                              color: selectedEvent.color ?? "bg-purple-500",
                            });
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveEditRamo}>Guardar</Button>
                      </>
                    )}
                  </>
                )}

                <Button
                  variant="destructive"
                  onClick={() => setShowConfirmDelete(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Modal */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Seguro que deseas eliminar este evento?
              <br />
              <span className="font-semibold">
                {selectedEvent?.type === "ramo"
                  ? selectedEvent?.nombre_ramo
                  : selectedEvent?.type === "taller"
                  ? selectedEvent?.talleres.name
                  : "Reserva de gimnasio"}
              </span>
              {" "} será eliminado permanentemente.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDelete(false)}
            >
              Cancelar
            </Button>

            <Button
              variant="destructive"
              onClick={() => {
                if (selectedEvent) {
                  handleDelete(selectedEvent);
                }
                setShowConfirmDelete(false);
                setShowEventModal(false);
              }}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Schedule;
