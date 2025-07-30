// --- INICIO DEL SCRIPT PARA POBLAR LA BASE DE DATOS CON DATOS EXPANDIDOS ---

print("🚀 Empezando el proceso de población masiva de la base de datos...");
print("Este proceso puede tardar unos segundos...");

// --- BORRADO DE COLECCIONES ---
print("🗑️ Limpiando colecciones existentes...");
db.hospitales.drop();
db.personal.drop();
db.pacientes.drop();
db.tratamientos.drop();
db.medicamentos.drop();
db.visitasMedicas.drop();
db.tareasMantenimiento.drop();
print("Limpieza completada.");

// --- DATOS Y FUNCIONES DE AYUDA PARA GENERACIÓN ---
const NOMBRES = ["Juan", "Carlos", "Andrés", "Javier", "Luis", "David", "Miguel", "José", "Pedro", "Manuel", "María", "Sofía", "Laura", "Ana", "Valentina", "Camila", "Isabella", "Luciana", "Mariana", "Daniela"];
const APELLIDOS = ["Rodríguez", "Gómez", "Pérez", "González", "Martínez", "López", "Díaz", "Hernández", "García", "Torres", "Ramírez", "Sánchez", "Rojas", "Castro", "Vargas"];
const SEGUROS = ["Sura EPS", "Sanitas", "Compensar", "Nueva EPS", "Coomeva EPS", "Salud Total", "Famisanar"];
const CIUDADES = ["Cali", "Bogotá", "Medellín", "Barranquilla"];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// --- 1. CREACIÓN DE HOSPITALES ---
print("\n--- 🏥 Creando Hospitales ---");
const hospitalesData = [
  { nombre: "Hospital Universitario del Valle", ciudad: "Cali", especialidades: ["Oncología", "Cardiología", "Neurología"] },
  { nombre: "Hospital Universitario San Ignacio", ciudad: "Bogotá", especialidades: ["Pediatría", "Ginecología", "Ortopedia"] },
  { nombre: "Hospital Pablo Tobón Uribe", ciudad: "Medellín", especialidades: ["Trasplantes", "Nefrología", "Hepatología"] },
  { nombre: "Clínica Portoazul", ciudad: "Barranquilla", especialidades: ["Dermatología", "Cirugía Plástica", "Medicina Deportiva"] }
];
const hospitalesResult = db.hospitales.insertMany(hospitalesData);
const hospitalIds = Object.values(hospitalesResult.insertedIds);
print(`✅ ${hospitalIds.length} hospitales han sido creados.`);

// --- 2. CREACIÓN DE TRATAMIENTOS ---
print("\n--- 💊 Creando Tratamientos ---");
const tratamientosData = [
    { nombre: "Quimioterapia Estándar", descripcion: "Ciclo de medicamentos para tratar células cancerígenas.", areaMedica: "Oncología", costo: 1500000 },
    { nombre: "Angioplastia Coronaria", descripcion: "Procedimiento para abrir arterias coronarias bloqueadas.", areaMedica: "Cardiología", costo: 12000000 },
    { nombre: "Terapia de Lenguaje", descripcion: "Sesiones para rehabilitar el habla post-ACV.", areaMedica: "Neurología", costo: 120000 },
    { nombre: "Control Pediátrico", descripcion: "Revisión de crecimiento y desarrollo para infantes.", areaMedica: "Pediatría", costo: 80000 },
    { nombre: "Fisioterapia Post-fractura", descripcion: "Rehabilitación física para recuperar movilidad.", areaMedica: "Ortopedia", costo: 95000 },
    { nombre: "Diálisis Peritoneal", descripcion: "Tratamiento para la insuficiencia renal.", areaMedica: "Nefrología", costo: 800000 },
    { nombre: "Trasplante de Riñón", descripcion: "Cirugía mayor para reemplazar un riñón.", areaMedica: "Trasplantes", costo: 50000000 },
    { nombre: "Biopsia de Piel", descripcion: "Extracción de muestra de piel para análisis.", areaMedica: "Dermatología", costo: 250000 },
    { nombre: "Rinoplastia", descripcion: "Cirugía estética y funcional de la nariz.", areaMedica: "Cirugía Plástica", costo: 8000000 },
    { nombre: "Artroscopia de Rodilla", descripcion: "Procedimiento para lesiones de meniscos y ligamentos.", areaMedica: "Medicina Deportiva", costo: 6000000 }
];
const tratamientosResult = db.tratamientos.insertMany(tratamientosData);
const tratamientoIds = Object.values(tratamientosResult.insertedIds);
print(`✅ ${tratamientoIds.length} tratamientos han sido creados.`);


// --- 3. CREACIÓN DE MEDICAMENTOS ---
print("\n--- 📦 Creando Medicamentos ---");
const medicamentosData = [
  { nombre: "Acetaminofén 500mg", fabricante: "Genfar", tipo: "Tableta" }, { nombre: "Ibuprofeno 400mg", fabricante: "MK", tipo: "Tableta" },
  { nombre: "Amoxicilina 500mg", fabricante: "La Santé", tipo: "Cápsula" }, { nombre: "Azitromicina 500mg", fabricante: "Pfizer", tipo: "Tableta" },
  { nombre: "Losartán 50mg", fabricante: "Coaspharma", tipo: "Tableta" }, { nombre: "Amlodipino 5mg", fabricante: "Genfar", tipo: "Tableta" },
  { nombre: "Metformina 850mg", fabricante: "MK", tipo: "Tableta" }, { nombre: "Insulina Glargina", fabricante: "Sanofi", tipo: "Inyección" },
  { nombre: "Salbutamol Inhalador", fabricante: "GSK", tipo: "Inhalador" }, { nombre: "Loratadina 10mg", fabricante: "La Santé", tipo: "Tableta" },
  { nombre: "Omeprazol 20mg", fabricante: "Procaps", tipo: "Cápsula" }, { nombre: "Warfarina 5mg", fabricante: "Bristol-Myers Squibb", tipo: "Tableta" },
  { nombre: "Clonazepam 2mg", fabricante: "Roche", tipo: "Tableta" }, { nombre: "Sertralina 50mg", fabricante: "Pfizer", tipo: "Tableta" },
  { nombre: "Ciclosporina 100mg", fabricante: "Novartis", tipo: "Cápsula" }
];
medicamentosData.forEach(med => {
  med.inventario_por_hospital = [];
  hospitalIds.forEach(hId => {
    // No todos los hospitales tienen todos los medicamentos
    if (Math.random() > 0.2) {
      med.inventario_por_hospital.push({ hospital_id: hId, disponibilidad: getRandomElement([50, 100, 200, 500, 1000, 2000]) });
    }
  });
});
db.medicamentos.insertMany(medicamentosData);
print(`✅ ${medicamentosData.length} medicamentos creados con inventario distribuido.`);


// --- 4. CREACIÓN DE PERSONAL ---
print("\n--- 🧑‍⚕️ Creando Personal ---");
let personalParaInsertar = [];
let medicosPorHospital = {};
hospitalIds.forEach(id => medicosPorHospital[id] = []);

// Directores (1 por hospital)
for (let i = 0; i < hospitalIds.length; i++) {
    personalParaInsertar.push({
        nombre: `${getRandomElement(NOMBRES)} ${getRandomElement(APELLIDOS)}`,
        telefono: `310${String(Math.random()).substring(2, 9)}`,
        correo: `director.hosp${i+1}@hospitales.com`,
        salario: 12000000 + (i * 500000),
        hospital_id: hospitalIds[i],
        rol: { codigo: "001", descripcion: "Director General" }
    });
}

// Médicos (40 en total, 10 por hospital)
let colegiaturaNum = 10001;
for (let i = 0; i < 40; i++) {
    const hospIndex = i % hospitalIds.length;
    const hospitalId = hospitalIds[hospIndex];
    const especialidad = getRandomElement(hospitalesData[hospIndex].especialidades);
    const medico = {
        nombre: `${getRandomElement(NOMBRES)} ${getRandomElement(APELLIDOS)}`,
        numeroColegiatura: String(colegiaturaNum++),
        especialidad: especialidad,
        telefono: `311${String(Math.random()).substring(2, 9)}`,
        correo: `medico${colegiaturaNum}@hospitales.com`,
        salario: 6000000 + Math.floor(Math.random() * 40) * 100000,
        hospital_id: hospitalId,
        rol: { codigo: "002", descripcion: "Médico Especialista" }
    };
    personalParaInsertar.push(medico);
    medicosPorHospital[hospitalId].push(medico);
}

// Enfermeros (20 en total, 5 por hospital)
for (let i = 0; i < 20; i++) {
    const hospIndex = i % hospitalIds.length;
    const hospitalId = hospitalIds[hospIndex];
    personalParaInsertar.push({
        nombre: `${getRandomElement(NOMBRES)} ${getRandomElement(APELLIDOS)}`,
        telefono: `312${String(Math.random()).substring(2, 9)}`,
        correo: `enfermero${i}@hospitales.com`,
        salario: 2500000 + Math.floor(Math.random() * 10) * 100000,
        hospital_id: hospitalId,
        rol: { codigo: "003", descripcion: "Enfermero/a" }
    });
}
db.personal.insertMany(personalParaInsertar);
const medicosIds = personalParaInsertar.filter(p => p.rol.codigo === '002').map(p => p._id);
print(`✅ ${personalParaInsertar.length} miembros del personal han sido creados.`);

// --- 5. CREACIÓN DE PACIENTES ---
print("\n--- 🤒 Creando Pacientes ---");
let pacientesParaInsertar = [];
for (let i = 0; i < 100; i++) {
    let historial = [];
    const numHistorial = getRandomElement([1,1,1,2,2,3]); // Más probable que tengan 1
    for (let j = 0; j < numHistorial; j++) {
        historial.push({
            fecha: getRandomDate(new Date(2024, 0, 1), new Date(2025, 6, 28)),
            diagnostico: getRandomElement(["Hipertensión", "Diabetes Tipo 2", "Gripe Común", "Migraña Crónica", "Artritis", "Asma", "Depresión", "Fractura de Tobillo", "Infección Urinaria"]),
            tratamiento_id: getRandomElement(tratamientoIds),
            resultados: getRandomElement(["En progreso", "Estable", "Mejoría leve", "Sin cambios", "Complicaciones menores"])
        });
    }

    pacientesParaInsertar.push({
        numeroHistoriaClinica: 300 + i,
        nombre: `${getRandomElement(NOMBRES)} ${getRandomElement(APELLIDOS)}`,
        direccion: `Calle ${Math.floor(Math.random()*150)} # ${Math.floor(Math.random()*80)}-${Math.floor(Math.random()*80)}, ${getRandomElement(CIUDADES)}`,
        telefono: `300${String(Math.random()).substring(2, 9)}`,
        correo: `paciente${i}@email.com`,
        seguro: getRandomElement(SEGUROS),
        historial: historial
    });
}
const pacientesResult = db.pacientes.insertMany(pacientesParaInsertar);
const pacienteIds = Object.values(pacientesResult.insertedIds);
print(`✅ ${pacienteIds.length} pacientes han sido creados.`);


// --- 6. CREACIÓN DE VISITAS MÉDICAS ---
print("\n--- 📅 Creando Visitas Médicas ---");
let visitasParaInsertar = [];
for (let i = 0; i < 250; i++) {
    const hospitalId = getRandomElement(hospitalIds);
    const medicosDelHospital = personalParaInsertar.filter(p => p.hospital_id === hospitalId && p.rol.codigo === "002");
    
    if (medicosDelHospital.length > 0) {
        visitasParaInsertar.push({
            fecha: getRandomDate(new Date(2025, 0, 1), new Date()),
            paciente_id: getRandomElement(pacienteIds),
            medico_id: getRandomElement(medicosDelHospital)._id,
            hospital_id: hospitalId,
            diagnostico: getRandomElement(["Control de Hipertensión", "Seguimiento Diabetes", "Consulta General", "Dolor de Cabeza", "Revisión Post-operatoria", "Chequeo Pediátrico", "Consulta Ginecológica"]),
            observaciones: "Paciente refiere síntomas leves. Se ajusta medicación."
        });
    }
}
db.visitasMedicas.insertMany(visitasParaInsertar);
print(`✅ ${visitasParaInsertar.length} visitas médicas han sido creadas.`);

print("\n\n🎉 ¡Proceso de inserción de datos masivos completado exitosamente! 🎉");

// Insercion de datos creada con ayuda de IA para agilizar el proceso.