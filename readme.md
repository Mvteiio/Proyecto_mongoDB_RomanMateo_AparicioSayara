
# Proyecto: Sistema de Gestión Hospitalaria con MongoDB

Este proyecto consiste en el diseño, implementación y consulta de una base de datos NoSQL utilizando MongoDB para gestionar la información de un sistema hospitalario en Colombia. El sistema maneja entidades como hospitales, personal médico, pacientes, tratamientos, medicamentos y visitas médicas. Es un sistema que no es muy complejo, pero es necesario pensar de forma lógica para poder llevarlo a cabo.

## Tabla de Contenidos
1.  [Tecnologías Utilizadas](#tecnologías-utilizadas)
2.  [Requisitos Previos](#requisitos-previos)
3.  [Instalación y Puesta en Marcha](#instalación-y-puesta-en-marcha)
4.  [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
5.  [Consultas a la Base de Datos](#consultas-a-la-base-de-datos)
6.  [Autor](#autor)

---

## Tecnologías Utilizadas
* **MongoDB**: Base de datos NoSQL orientada a documentos.
* **MongoDB Shell (mongosh)**: Consola de comando propia de mongo, necesaria para ejecutar los scripts.
* **JavaScript**: Archivo para la inserción de datos.

---

## Requisitos Previos
Antes de empezar, asegúrate de tener instalado en tu sistema:
* MongoDB Compass
* MongoDB Shell (`mongosh`)

---

## Instalación y Puesta en Marcha

Sigue estos pasos para poner en funcionamiento el proyecto en tu entorno local:

1.  **Clonar el repositorio**:
    ```sh
    git clone https://github.com/Mvteiio/Proyecto_SistemaSalud_RomanMateo
    cd Proyecto_SistemaSalud_RomanMateo
    ```

2.  **Asegúrate de que el servicio de MongoDB esté corriendo** en tu máquina.

3.  **Cargar los datos de prueba**:
    Busca dónde está ubicado el archivo **JS**. Luego, abre `mongosh` desde MongoDB Compass, selecciona tu base de datos y carga el script:
    ```sh
    # En la terminal de mongosh
    use miHospitalDB
    load('ruta/a/tu/archivo/insercion_datos.js')
    ```
    Esto creará y poblará todas las colecciones necesarias.

---

## Estructura de la Base de Datos
El sistema utiliza un **modelo de datos híbrido**. Las entidades principales como `personal`, `pacientes` y `hospitales` están en colecciones separadas (normalizadas) para garantizar la integridad y escalabilidad. La información fuertemente acoplada, como el `historial` de un paciente, se mantiene incrustada (desnormalizada) para optimizar las lecturas.

A continuación se describe cada colección:

### `hospitales`
Almacena la información general de cada centro hospitalario.
```json
{
  "_id": "ObjectId(...)",
  "nombre": "Hospital Universitario del Valle",
  "ciudad": "Cali",
  "director_id": "ObjectId(...)",
  "especialidades": ["Oncología", "Cardiología", "Neurología"]
}
```

### `personal`
Contiene a todos los empleados del sistema, diferenciados por un rol.

```json
{
  "_id": "ObjectId(...)",
  "nombre": "Carlos Jaramillo",
  "numeroColegiatura": "76001",
  "especialidad": "Oncología",
  "salario": 7500000,
  "hospital_id": "ObjectId(...)",
  "rol": {
    "codigo": "002",
    "descripcion": "Médico Especialista"
  }
}
```

### `pacientes`
Guarda la información de los pacientes y su historial clínico (incrustado).


```json
{
  "_id": "ObjectId(...)",
  "numeroHistoriaClinica": 101,
  "nombre": "Juan Pérez",
  "seguro": "Sura EPS",
  "historial": [
    {
      "fecha": "ISODate(...)",
      "diagnostico": "Leucemia",
      "tratamiento_id": "ObjectId(...)",
      "resultados": "En progreso"
    }
  ]
}
```

### `tratamientos`
Catálogo central de los tratamientos disponibles.

```json
{
  "_id": "ObjectId(...)",
  "nombre": "Quimioterapia Estándar",
  "areaMedica": "Oncología",
  "costo": 1500000
}
```

### `medicamentos`
Inventario central de medicamentos, con stock detallado por hospital.

```json
{
  "_id": "ObjectId(...)",
  "nombre": "Acetaminofén 500mg",
  "fabricante": "Genfar",
  "inventario_por_hospital": [
    {
      "hospital_id": "ObjectId(...)",
      "disponibilidad": 2000
    }
  ]
}
```

### `visitasMedicas`
Registro de cada cita o visita, vinculando pacientes, médicos y hospitales.

```json
{
  "_id": "ObjectId(...)",
  "fecha": "ISODate(...)",
  "paciente_id": "ObjectId(...)",
  "medico_id": "ObjectId(...)",
  "hospital_id": "ObjectId(...)",
  "diagnostico": "Seguimiento Leucemia"
}
```

## Consultas a la base de datos
El objetivo es implementar **100 consultas** para analizar la información desde diferentes perspectivas. A continuación, se muestran las consultas implementadas.


### Consulta 1: Pacientes por EPS
Filtra a todos los pacientes que pertenecen a una EPS específica.
```javascript
db.pacientes.find({ seguro: "Sura EPS" })
```
---
### Consulta 2: Médicos por Especialidad
Busca a todo el personal médico que corresponde a una especialidad determinada.

```javascript
db.personal.find({
  "rol.descripcion": "Médico Especialista",
  "especialidad": "Cardiología"
});
```
---
### Consulta 3: Tratamientos de Alto Costo
Lista los tratamientos cuyo costo es superior a un valor determinado.

```javascript
db.tratamientos.find({ costo: { $gt: 5000000 } });
```
---
### Consulta 4: Conteo de Hospitales por Ciudad
Cuenta el número de hospitales registrados en una ciudad específica.

```javascript
db.hospitales.countDocuments({ ciudad: "Bogotá" });
```
---
### Consulta 5: Búsqueda de Medicamento por Nombre
Encuentra un medicamento utilizando su nombre comercial.

```javascript
db.medicamentos.findOne({ nombre: "Acetaminofén 500mg" });
```
---
### Consulta 6: Personal con Salario Elevado
Filtra al personal cuyo salario es mayor a una cifra específica.

```javascript
db.personal.find({ salario: { $gt: 8000000 } });
```
---
### Consulta 7: Búsqueda de Pacientes por Patrón de Nombre
Encuentra pacientes cuyo nombre comienza con una letra específica usando expresiones regulares.

```javascript
db.pacientes.find({ nombre: { $regex: /^A/ } });
```
---
### Consulta 8: Visitas Médicas por Fecha
Lista todas las visitas médicas que ocurrieron durante un día específico.

```javascript
db.visitasMedicas.find({
  fecha: {
    $gte: ISODate("2025-07-15T00:00:00Z"),
    $lt: ISODate("2025-07-16T00:00:00Z")
  }
});
```
---
### Consulta 9: Pacientes por Diagnóstico en Historial
Encuentra pacientes que tengan un diagnóstico particular en su historial clínico.

```javascript
db.pacientes.find({ "historial.diagnostico": "Fractura de tibia" });
```
---
### Consulta 10: Conteo Total de Médicos
Cuenta el número total de médicos registrados en el sistema.

```javascript
db.personal.countDocuments({ "rol.codigo": "002" });
```
---
### Consulta 11: Médicos Agrupados por Especialidad (Agregación)
Agrupa al personal médico y cuenta cuántos hay por cada especialidad.
```javascript
db.personal.aggregate([
  { $match: { "rol.descripcion": "Médico Especialista" } },
  { $group: { _id: "$especialidad", totalMedicos: { $sum: 1 } } },
  { $sort: { totalMedicos: -1 } }
]);
```
---
### Consulta 12: Salario Promedio por Especialidad (Agregación)
Calcula el salario promedio de los médicos, agrupado por su especialidad.
```javascript
db.personal.aggregate([
  { $match: { "rol.codigo": "002" } },
  { $group: {
      _id: "$especialidad",
      salarioPromedio: { $avg: "$salario" }
    }
  },
  { $project: {
      _id: 1,
      salarioPromedio: { $round: ["$salarioPromedio", 2] }
    }
  }
]);
```
---
### Consulta 13: Stock Total de Medicamentos (Agregación)
Suma el stock de cada medicamento a través de todos los hospitales.
```javascript
db.medicamentos.aggregate([
  { $unwind: "$inventario_por_hospital" },
  { $group: {
      _id: "$nombre",
      stockTotal: { $sum: "$inventario_por_hospital.disponibilidad" }
    }
  },
  { $sort: { stockTotal: 1 } }
]);
```
---
### Consulta 14: Número de Médicos por Hospital (Agregación)
Lista cada hospital junto con el número total de médicos que trabajan en él.
```javascript
db.personal.aggregate([
  { $match: { "rol.codigo": "002" } },
  { $group: { _id: "$hospital_id", numeroDeMedicos: { $sum: 1 } } },
  {
    $lookup: {
      from: "hospitales",
      localField: "_id",
      foreignField: "_id",
      as: "datosHospital"
    }
  },
  { $unwind: "$datosHospital" },
  {
    $project: {
      _id: 0,
      nombreHospital: "$datosHospital.nombre",
      ciudad: "$datosHospital.ciudad",
      numeroDeMedicos: 1
    }
  }
]);
```
---
### Consulta 15: Top 5 Pacientes con Más Visitas (Agregación)
Identifica a los cinco pacientes que han tenido la mayor cantidad de visitas médicas.
```javascript
db.visitasMedicas.aggregate([
  { $group: { _id: "$paciente_id", totalVisitas: { $sum: 1 } } },
  { $sort: { totalVisitas: -1 } },
  { $limit: 5 },
  {
    $lookup: {
      from: "pacientes",
      localField: "_id",
      foreignField: "_id",
      as: "infoPaciente"
    }
  },
  { $unwind: "$infoPaciente" },
  { $project: { _id: 0, nombrePaciente: "$infoPaciente.nombre", totalVisitas: 1 } }
]);
```
---
### Consulta 16: Popularidad de Tratamientos (Agregación)
Cuenta cuántos pacientes han recibido cada tipo de tratamiento disponible.
```javascript
db.pacientes.aggregate([
  { $unwind: "$historial" },
  { $group: { _id: "$historial.tratamiento_id", numeroPacientes: { $sum: 1 } } },
  {
    $lookup: {
      from: "tratamientos",
      localField: "_id",
      foreignField: "_id",
      as: "infoTratamiento"
    }
  },
  { $unwind: "$infoTratamiento" },
  {
    $project: {
      _id: 0,
      nombreTratamiento: "$infoTratamiento.nombre",
      areaMedica: "$infoTratamiento.areaMedica",
      numeroPacientes: 1
    }
  },
  { $sort: { numeroPacientes: -1 } }
]);
```
---
### Consulta 17: Pacientes Atendidos por un Médico Específico (Agregación)
Obtiene la lista de pacientes únicos que han sido atendidos por un médico en particular.
```javascript
// Primero, busca el ID del médico que quieres consultar
const medicoId = db.personal.findOne({ nombre: "Mariana Pajón" })._id;

// Luego, usa ese ID en la agregación
db.visitasMedicas.aggregate([
  { $match: { medico_id: medicoId } },
  {
    $lookup: {
      from: "pacientes",
      localField: "paciente_id",
      foreignField: "_id",
      as: "pacienteInfo"
    }
  },
  { $unwind: "$pacienteInfo" },
  {
    $group: {
      _id: "$pacienteInfo._id",
      nombre: { $first: "$pacienteInfo.nombre" },
      seguro: { $first: "$pacienteInfo.seguro" }
    }
  },
  { $project: { _id: 0, nombre: 1, seguro: 1 } }
]);
```
---
### Consulta 18: Disponibilidad de Medicamento por Hospital (Agregación)
Muestra el stock de un medicamento específico, desglosado por cada hospital.
```javascript
db.medicamentos.aggregate([
    { $match: { nombre: "Acetaminofén 500mg" } },
    { $unwind: "$inventario_por_hospital" },
    {
        $lookup: {
            from: "hospitales",
            localField: "inventario_por_hospital.hospital_id",
            foreignField: "_id",
            as: "hospitalInfo"
        }
    },
    { $unwind: "$hospitalInfo" },
    {
        $project: {
            _id: 0,
            medicamento: "$nombre",
            hospital: "$hospitalInfo.nombre",
            disponibilidad: "$inventario_por_hospital.disponibilidad"
        }
    }
]);
```
---
### Consulta 19: Diagnósticos Más Comunes (Agregación)
Calcula la frecuencia de cada diagnóstico registrado en las visitas para encontrar los más comunes.
```javascript
db.visitasMedicas.aggregate([
    { $group: { _id: "$diagnostico", frecuencia: { $sum: 1 } } },
    { $sort: { frecuencia: -1 } },
    { $limit: 10 }
]);
```
---
### Consulta 20: Médicos que Atienden a una EPS (Agregación)
Identifica qué médicos han tratado a pacientes afiliados a una EPS específica.
```javascript
db.pacientes.aggregate([
    { $match: { seguro: "Sura EPS" } },
    {
        $lookup: {
            from: "visitasMedicas",
            localField: "_id",
            foreignField: "paciente_id",
            as: "visitas"
        }
    },
    { $unwind: "$visitas" },
    {
        $lookup: {
            from: "personal",
            localField: "visitas.medico_id",
            foreignField: "_id",
            as: "medicoInfo"
        }
    },
    { $unwind: "$medicoInfo" },
    {
        $group: {
            _id: "$medicoInfo._id",
            nombreMedico: { $first: "$medicoInfo.nombre" },
            especialidad: { $first: "$medicoInfo.especialidad" }
        }
    },
    { $project: { _id: 0 } }
]);
```
---

### Consulta 21: Personal de Enfermería
Busca en la colección 'personal' a quienes tengan el rol de 'Enfermero/a'.
```javascript
db.personal.find({ "rol.descripcion": "Enfermero/a" });
```
---
### Consulta 22: Paciente por Número de Historia Clínica
Búsqueda precisa y rápida para obtener un único paciente.
```javascript
db.pacientes.findOne({ numeroHistoriaClinica: 101 });
```
---
### Consulta 23: Tratamientos del Área de Ortopedia
Filtra el catálogo de tratamientos por su área médica.
```javascript
db.tratamientos.find({ areaMedica: "Ortopedia" });
```
---
### Consulta 24: Medicamentos Fabricados por Genfar
Filtra el inventario de medicamentos por el nombre del fabricante.
```javascript
db.medicamentos.find({ fabricante: "Genfar" });
```
---
### Consulta 25: Hospitales con Especialidad en Pediatría
Busca un valor específico dentro de un campo de tipo array.
```javascript
db.hospitales.find({ especialidades: "Pediatría" });
```
---
### Consulta 26: Médicos con Salario en Rango Específico
Usa operadores para definir un rango salarial.
```javascript
db.personal.find({
  "rol.codigo": "002",
  "salario": { $gte: 7000000, $lte: 7800000 }
});
```
---
### Consulta 27: Pacientes con Dirección que Contiene 'Avenida'
Búsqueda por patrón de texto no sensible a mayúsculas/minúsculas.
```javascript
db.pacientes.find({ direccion: { $regex: /Avenida/i } });
```
---
### Consulta 28: Medicamentos con Bajo Stock en Hospital Específico
Busca disponibilidad baja en inventario de un hospital determinado.
```javascript
const hospitalValleId = db.hospitales.findOne({ nombre: "Hospital Universitario del Valle" })._id;

db.medicamentos.find({
  inventario_por_hospital: {
    $elemMatch: { hospital_id: hospitalValleId, disponibilidad: { $lt: 1000 } }
  }
});
```
---
### Consulta 29: Visitas Médicas en Julio de 2025
Usamos operadores de comparación sobre fechas.
```javascript
db.visitasMedicas.find({
  fecha: {
    $gte: ISODate("2025-07-01T00:00:00Z"),
    $lt: ISODate("2025-08-01T00:00:00Z")
  }
});
```
---
### Consulta 30: Pacientes sin Historial Clínico
Busca pacientes con historial vacío.
```javascript
db.pacientes.find({ historial: { $size: 0 } });
```

---

## Consultas de Agregación Avanzada

### Consulta 31: Número de Pacientes por EPS
Agrupa pacientes por seguro médico.
```javascript
db.pacientes.aggregate([
  { $group: { _id: "$seguro", totalPacientes: { $sum: 1 } } },
  { $sort: { totalPacientes: -1 } }
]);
```
---
### Consulta 32: Personal y su Hospital Ordenado por Salario
Une 'personal' con 'hospitales' y ordena por salario.
```javascript
db.personal.aggregate([
  { $sort: { salario: -1 } },
  {
    $lookup: {
      from: "hospitales",
      localField: "hospital_id",
      foreignField: "_id",
      as: "hospital"
    }
  },
  { $unwind: { path: "$hospital", preserveNullAndEmptyArrays: true } },
  {
    $project: {
      _id: 0,
      nombre: 1,
      rol: "$rol.descripcion",
      salario: 1,
      hospital: { $ifNull: [ "$hospital.nombre", "N/A" ] }
    }
  }
]);
```
---
### Consulta 33: Médicos Más Activos
Cuenta visitas por médico y recupera sus nombres.
```javascript
db.visitasMedicas.aggregate([
  { $group: { _id: "$medico_id", numeroVisitas: { $sum: 1 } } },
  { $sort: { numeroVisitas: -1 } },
  { $limit: 5 },
  {
    $lookup: {
      from: "personal",
      localField: "_id",
      foreignField: "_id",
      as: "medico"
    }
  },
  { $unwind: "$medico" },
  {
    $project: {
      _id: 0,
      nombreMedico: "$medico.nombre",
      especialidad: "$medico.especialidad",
      numeroVisitas: 1
    }
  }
]);
```
---
### Consulta 34: Número de Visitas por Mes
Agrupa visitas por mes y año.
```javascript
db.visitasMedicas.aggregate([
  {
    $group: {
      _id: {
        anio: { $year: "$fecha" },
        mes: { $month: "$fecha" }
      },
      totalVisitas: { $sum: 1 }
    }
  },
  { $sort: { "_id.anio": 1, "_id.mes": 1 } }
]);
```
---
### Consulta 35: Pacientes con Múltiples Diagnósticos
Filtra pacientes con más de un diagnóstico.
```javascript
db.pacientes.aggregate([
  {
    $project: {
      nombre: 1,
      seguro: 1,
      numeroDiagnosticos: { $size: "$historial" }
    }
  },
  { $match: { numeroDiagnosticos: { $gt: 1 } } }
]);
```
---
### Consulta 36: Diagnósticos Únicos
Agrupa todos los diagnósticos únicos.
```javascript
db.pacientes.aggregate([
  { $unwind: "$historial" },
  { $group: { _id: "$historial.diagnostico" } },
  { $project: { _id: 0, diagnostico: "$_id" } }
]);
```
---
### Consulta 37: Tratamiento Más Caro y Más Barato
Calcula el máximo y mínimo costo.
```javascript
db.tratamientos.aggregate([
  {
    $group: {
      _id: null,
      tratamientoMasCaro: { $max: "$costo" },
      tratamientoMasBarato: { $min: "$costo" }
    }
  }
]);
```
---
### Consulta 38: Pacientes sin Visitas Médicas
Filtra pacientes sin visitas usando `$lookup`.
```javascript
db.pacientes.aggregate([
  {
    $lookup: {
      from: "visitasMedicas",
      localField: "_id",
      foreignField: "paciente_id",
      as: "visitas"
    }
  },
  { $match: { visitas: { $size: 0 } } },
  { $project: { nombre: 1, telefono: 1, seguro: 1 } }
]);
```
---
### Consulta 39: Promedio de Especialidades por Hospital
Calcula el promedio del número de especialidades.
```javascript
db.hospitales.aggregate([
  {
    $project: {
      nombre: 1,
      numeroEspecialidades: { $size: "$especialidades" }
    }
  },
  {
    $group: {
      _id: "promedioGeneral",
      promedioEspecialidades: { $avg: "$numeroEspecialidades" }
    }
  }
]);
```
---
### Consulta 40: Médicos que Atendieron Casos de Leucemia
Une varias colecciones para identificar médicos por especialidad.
```javascript
db.pacientes.aggregate([
  { $match: { "historial.diagnostico": "Leucemia" } },
  {
    $lookup: {
      from: "visitasMedicas",
      localField: "_id",
      foreignField: "paciente_id",
      as: "visita"
    }
  },
  { $unwind: "$visita" },
  {
    $lookup: {
      from: "personal",
      localField: "visita.medico_id",
      foreignField: "_id",
      as: "medico"
    }
  },
  { $unwind: "$medico" },
  {
    $group: {
      _id: "$medico.especialidad",
      medicos: { $addToSet: "$medico.nombre" }
    }
  },
  {
    $project: {
      _id: 0,
      especialidad: "$_id",
      medicosQueAtendieron: "$medicos"
    }
  }
]);
```

## En proceso...

# Autor
- Mateo Román Camargo - [Linkedin](https://www.linkedin.com/in/mateo-roman-dev/) - [GitHub](https://github.com/Mvteiio) 
- Sayara Aparicio [GitHub](https://github.com/SayaraAparicio/)