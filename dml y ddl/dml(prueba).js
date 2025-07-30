// --- INICIO DEL SCRIPT PARA POBLAR LA BASE DE DATOS ---

// Borramos las colecciones si ya existen para empezar de cero
print("Limpiaremos las colecciones existentes...");
db.hospitales.drop();
db.personal.drop();
db.pacientes.drop();
db.tratamientos.drop();
db.medicamentos.drop();
db.visitasMedicas.drop();
print("Limpieza completada");

// 1. Creación de Hospitales
print("\n--- 🏥 Creando Hospitales ---");
const hospitalValleId = db.hospitales.insertOne({
  nombre: "Hospital Universitario del Valle",
  ciudad: "Cali",
  especialidades: ["Oncología", "Cardiología", "Neurología"]
}).insertedId;

const hospitalSanIgnacioId = db.hospitales.insertOne({
  nombre: "Hospital Universitario San Ignacio",
  ciudad: "Bogotá",
  especialidades: ["Pediatría", "Ginecología", "Ortopedia"]
}).insertedId;
print(`✅ Hospitales creados. ID del Valle: ${hospitalValleId}, ID de San Ignacio: ${hospitalSanIgnacioId}`);

// 2. Creación de Tratamientos
print("\n--- 💊 Creando Tratamientos ---");
const tratamientosResult = db.tratamientos.insertMany([
  { nombre: "Quimioterapia Estándar", descripcion: "Ciclo de medicamentos para tratar células cancerígenas.", areaMedica: "Oncología", costo: 1500000 },
  { nombre: "Angioplastia Coronaria", descripcion: "Procedimiento para abrir arterias coronarias bloqueadas.", areaMedica: "Cardiología", costo: 12000000 },
  { nombre: "Terapia de Lenguaje", descripcion: "Sesiones para rehabilitar el habla post-ACV.", areaMedica: "Neurología", costo: 120000 },
  { nombre: "Control Pediátrico", descripcion: "Revisión de crecimiento y desarrollo para infantes.", areaMedica: "Pediatría", costo: 80000 },
  { nombre: "Fisioterapia Post-fractura", descripcion: "Rehabilitación física para recuperar movilidad.", areaMedica: "Ortopedia", costo: 95000 }
]);
const tratamientoIds = Object.values(tratamientosResult.insertedIds);
print(`✅ ${tratamientoIds.length} tratamientos han sido creados.`);

// 3. Creación de Medicamentos
print("\n--- 📦 Creando Medicamentos ---");
db.medicamentos.insertMany([
  { nombre: "Acetaminofén 500mg", fabricante: "Genfar", tipo: "Tableta", inventario_por_hospital: [{ hospital_id: hospitalValleId, disponibilidad: 2000 }, { hospital_id: hospitalSanIgnacioId, disponibilidad: 3500 }] },
  { nombre: "Amoxicilina 250mg", fabricante: "La Santé", tipo: "Suspensión", inventario_por_hospital: [{ hospital_id: hospitalValleId, disponibilidad: 800 }, { hospital_id: hospitalSanIgnacioId, disponibilidad: 1200 }] },
  { nombre: "Losartán 50mg", fabricante: "Pfizer", tipo: "Tableta", inventario_por_hospital: [{ hospital_id: hospitalValleId, disponibilidad: 1500 }] },
  { nombre: "Salbutamol Inhalador", fabricante: "GSK", tipo: "Inhalador", inventario_por_hospital: [{ hospital_id: hospitalSanIgnacioId, disponibilidad: 600 }] }
]);
print("✅ Inventario de medicamentos creado.");

// 4. Creación de Personal
print("\n--- 🧑‍⚕️ Creando Personal ---");
const directorId = db.personal.insertOne({
  nombre: "Lucía Fernández", telefono: "3101234567", correo: "lucia.fernandez@huv.com", salario: 12000000, rol: { codigo: "001", descripcion: "Director General" }
}).insertedId;
db.hospitales.updateOne({ _id: hospitalValleId }, { $set: { director_id: directorId } });
print("Director General creado y asignado.");

const medicosResult = db.personal.insertMany([
    // Personal para Hospital del Valle (Cali)
    { nombre: "Carlos Jaramillo", numeroColegiatura: "76001", especialidad: "Oncología", telefono: "3118765432", correo: "c.jaramillo@huv.com", salario: 7500000, hospital_id: hospitalValleId, rol: { codigo: "002", descripcion: "Médico Especialista" } },
    { nombre: "Sofia Vergara", numeroColegiatura: "76002", especialidad: "Cardiología", telefono: "3128765433", correo: "s.vergara@huv.com", salario: 8200000, hospital_id: hospitalValleId, rol: { codigo: "002", descripcion: "Médico Especialista" } },
    { nombre: "Andrés Cepeda", numeroColegiatura: "76003", especialidad: "Neurología", telefono: "3138765434", correo: "a.cepeda@huv.com", salario: 7800000, hospital_id: hospitalValleId, rol: { codigo: "002", descripcion: "Médico Especialista" } },
    { nombre: "Juan Valdez", numeroColegiatura: "76004", especialidad: "Medicina General", telefono: "3148765435", correo: "j.valdez@huv.com", salario: 4500000, hospital_id: hospitalValleId, rol: { codigo: "002", descripcion: "Médico Especialista" } },
    { nombre: "Catalina Sandino", numeroColegiatura: "76005", especialidad: "Cardiología", telefono: "3158765436", correo: "c.sandino@huv.com", salario: 8100000, hospital_id: hospitalValleId, rol: { codigo: "002", descripcion: "Médico Especialista" } },
    // Personal para Hospital San Ignacio (Bogotá)
    { nombre: "Mariana Pajón", numeroColegiatura: "11001", especialidad: "Pediatría", telefono: "3201234567", correo: "m.pajon@hsi.com", salario: 7200000, hospital_id: hospitalSanIgnacioId, rol: { codigo: "002", descripcion: "Médico Especialista" } },
    { nombre: "Egan Bernal", numeroColegiatura: "11002", especialidad: "Ortopedia", telefono: "3211234568", correo: "e.bernal@hsi.com", salario: 8500000, hospital_id: hospitalSanIgnacioId, rol: { codigo: "002", descripcion: "Médico Especialista" } },
    { nombre: "Shakira Mebarak", numeroColegiatura: "11003", especialidad: "Ginecología", telefono: "3221234569", correo: "s.mebarak@hsi.com", salario: 7900000, hospital_id: hospitalSanIgnacioId, rol: { codigo: "002", descripcion: "Médico Especialista" } },
    { nombre: "Nairo Quintana", numeroColegiatura: "11004", especialidad: "Ortopedia", telefono: "3231234560", correo: "n.quintana@hsi.com", salario: 8600000, hospital_id: hospitalSanIgnacioId, rol: { codigo: "002", descripcion: "Médico Especialista" } },
    { nombre: "Fernando Botero", numeroColegiatura: "11005", especialidad: "Pediatría", telefono: "3109876543", correo: "f.botero@hsi.com", salario: 7300000, hospital_id: hospitalSanIgnacioId, rol: { codigo: "002", descripcion: "Médico Especialista" } }
]);
const medicoIds = Object.values(medicosResult.insertedIds);
db.personal.insertMany([
    { nombre: "Elena Rojas", telefono: "3161112233", correo: "e.rojas@huv.com", salario: 2800000, hospital_id: hospitalValleId, rol: { codigo: "003", descripcion: "Enfermero/a" } },
    { nombre: "Pedro Pascal", telefono: "3173334455", correo: "p.pascal@hsi.com", salario: 3200000, hospital_id: hospitalSanIgnacioId, rol: { codigo: "003", descripcion: "Enfermero/a" } }
]);
print(`✅ ${medicoIds.length} médicos y 2 enfermeros han sido creados y asignados.`);

// 5. Creación de Pacientes
print("\n--- 🤒 Creando Pacientes ---");
const pacientesResult = db.pacientes.insertMany([
  { numeroHistoriaClinica: 101, nombre: "Juan Pérez", direccion: "Calle Falsa 123, Cali", telefono: "3001112233", correo: "juan.perez@email.com", seguro: "Sura EPS", historial: [{ fecha: new Date("2025-01-20T09:00:00Z"), diagnostico: "Leucemia", tratamiento_id: tratamientoIds[0], resultados: "En progreso" }] },
  { numeroHistoriaClinica: 102, nombre: "María García", direccion: "Av. Siempre Viva 45, Cali", telefono: "3002223344", correo: "maria.garcia@email.com", seguro: "Coomeva EPS", historial: [{ fecha: new Date("2025-02-15T11:30:00Z"), diagnostico: "Arritmia", tratamiento_id: tratamientoIds[1], resultados: "Estable" }] },
  { numeroHistoriaClinica: 103, nombre: "Pedro Rodriguez", direccion: "Carrera 7 # 8-90, Cali", telefono: "3003334455", correo: "pedro.r@email.com", seguro: "Sura EPS", historial: [] },
  { numeroHistoriaClinica: 104, nombre: "Ana Martínez", direccion: "Diagonal 20 # 30-40, Cali", telefono: "3004445566", correo: "ana.martinez@email.com", seguro: "Sanitas", historial: [{ fecha: new Date("2025-04-10T14:00:00Z"), diagnostico: "Afasia post-ACV", tratamiento_id: tratamientoIds[2], resultados: "Mejoría leve" }] },
  { numeroHistoriaClinica: 105, nombre: "Luis Hernandez", direccion: "Transversal 50 # 10-20, Cali", telefono: "3005556677", correo: "luis.h@email.com", seguro: "Compensar", historial: [] },
  { numeroHistoriaClinica: 201, nombre: "Laura Gómez", direccion: "Calle 100 # 15-20, Bogotá", telefono: "3011112233", correo: "laura.gomez@email.com", seguro: "Sanitas", historial: [] },
  { numeroHistoriaClinica: 202, nombre: "David López", direccion: "Carrera 15 # 85-30, Bogotá", telefono: "3012223344", correo: "david.lopez@email.com", seguro: "Compensar", historial: [{ fecha: new Date("2025-03-05T08:00:00Z"), diagnostico: "Fractura de tibia", tratamiento_id: tratamientoIds[4], resultados: "En recuperación" }] },
  { numeroHistoriaClinica: 203, nombre: "Sofía Castro", direccion: "Av. Chile # 70-10, Bogotá", telefono: "3013334455", correo: "sofia.castro@email.com", seguro: "Sura EPS", historial: [] },
  { numeroHistoriaClinica: 204, nombre: "Javier Díaz", direccion: "Calle 26 # 68-50, Bogotá", telefono: "3014445566", correo: "javier.diaz@email.com", seguro: "Nueva EPS", historial: [] },
  { numeroHistoriaClinica: 205, nombre: "Valentina Torres", direccion: "Carrera 9 # 110-1, Bogotá", telefono: "3015556677", correo: "valentina.t@email.com", seguro: "Sanitas", historial: [{ fecha: new Date("2025-06-01T16:00:00Z"), diagnostico: "Control de 6 meses", tratamiento_id: tratamientoIds[3], resultados: "Desarrollo normal" }] }
]);
const pacienteIds = Object.values(pacientesResult.insertedIds);
print(`✅ ${pacienteIds.length} pacientes han sido creados.`);

// 6. Creación de Visitas Médicas
print("\n--- 📅 Creando Visitas Médicas ---");
db.visitasMedicas.insertMany([
    { fecha: new Date("2025-07-10T09:30:00Z"), paciente_id: pacienteIds[0], medico_id: medicoIds[0], hospital_id: hospitalValleId, diagnostico: "Seguimiento Leucemia", observaciones: "Paciente responde bien al ciclo actual." },
    { fecha: new Date("2025-07-11T14:00:00Z"), paciente_id: pacienteIds[1], medico_id: medicoIds[1], hospital_id: hospitalValleId, diagnostico: "Control Cardiológico", observaciones: "EKG sin variaciones significativas." },
    { fecha: new Date("2025-07-12T10:00:00Z"), paciente_id: pacienteIds[3], medico_id: medicoIds[2], hospital_id: hospitalValleId, diagnostico: "Evaluación neurológica", observaciones: "Se recomienda continuar terapia de lenguaje." },
    { fecha: new Date("2025-07-14T11:00:00Z"), paciente_id: pacienteIds[2], medico_id: medicoIds[3], hospital_id: hospitalValleId, diagnostico: "Chequeo general", observaciones: "Paciente refiere tos seca." },
    { fecha: new Date("2025-07-18T15:00:00Z"), paciente_id: pacienteIds[1], medico_id: medicoIds[4], hospital_id: hospitalValleId, diagnostico: "Interconsulta Cardiología", observaciones: "Se confirma diagnóstico del Dr. Vergara." },
    { fecha: new Date("2025-07-15T08:45:00Z"), paciente_id: pacienteIds[5], medico_id: medicoIds[5], hospital_id: hospitalSanIgnacioId, diagnostico: "Control pediátrico", observaciones: "Vacunas al día." },
    { fecha: new Date("2025-07-16T12:00:00Z"), paciente_id: pacienteIds[6], medico_id: medicoIds[6], hospital_id: hospitalSanIgnacioId, diagnostico: "Revisión de fractura", observaciones: "Buena consolidación ósea visible en rayos X." },
    { fecha: new Date("2025-07-17T16:30:00Z"), paciente_id: pacienteIds[7], medico_id: medicoIds[7], hospital_id: hospitalSanIgnacioId, diagnostico: "Control ginecológico anual", observaciones: "Resultados de citología normales." },
    { fecha: new Date("2025-07-20T09:00:00Z"), paciente_id: pacienteIds[6], medico_id: medicoIds[8], hospital_id: hospitalSanIgnacioId, diagnostico: "Segunda opinión ortopédica", observaciones: "Se concuerda con plan de fisioterapia." },
    { fecha: new Date("2025-07-21T10:30:00Z"), paciente_id: pacienteIds[9], medico_id: medicoIds[9], hospital_id: hospitalSanIgnacioId, diagnostico: "Revisión de desarrollo", observaciones: "Curvas de crecimiento adecuadas." }
]);
print("✅ Registros de visitas médicas creados.");

print("\n\n🎉 ¡Proceso de inserción de datos completado exitosamente! 🎉");

// Insercion de datos creada con ayuda de IA para agilizar el proceso.