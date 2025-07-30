// 1. Rol de **Director General**

db.createRole({
  role: "rolDirectorGeneral",
  privileges: [
    {
      // En db: "" pondremos el nombre que hayamos asignado a la database. 
      resource: { db: "miHospitalDB", collection: "" },
      // anyAction es un privilegio que incluye todas las acciones posibles.
      actions: [ "anyAction" ]
    }
  ],
  roles: [] // No hereda de otros roles
});


// 2. Rol de **Medico Especialista**

db.createRole({
  role: "rolMedicoEspecialista",
  privileges: [
    {
      // Permisos de lectura y escritura para pacientes y visitas.
      resource: { db: "miHospitalDB", collection: "pacientes" },
      actions: [ "find", "update", "insert" ]
    },
    {
      resource: { db: "miHospitalDB", collection: "visitasMedicas" },
      actions: [ "find", "update", "insert" ]
    },
    {
      // Permisos de solo lectura para consultar tratamientos y medicamentos.
      resource: { db: "miHospitalDB", collection: "tratamientos" },
      actions: [ "find" ]
    },
    {
      resource: { db: "miHospitalDB", collection: "medicamentos" },
      actions: [ "find" ]
    }
  ],
  roles: []
});


// 3. Rol de **Enfermero**
db.createRole({
  role: "rolEnfermero",
  privileges: [
    {
      // Permisos para ver pacientes y actualizar partes de su historial 
      resource: { db: "miHospitalDB", collection: "pacientes" },
      actions: [ "find", "update" ]
    },
    {
      // Permisos para ver y registrar visitas.
      resource: { db: "miHospitalDB", collection: "visitasMedicas" },
      actions: [ "find", "insert" ]
    }
  ],
  roles: []
});

// 4. Rol de **Personal Administrativo**

db.createRole({
  role: "rolPersonalAdministrativo",
  privileges: [
    {
      // Control total sobre la colección de personal (contrataciones, salarios, etc.).
      resource: { db: "miHospitalDB", collection: "personal" },
      actions: [ "find", "update", "insert", "remove" ]
    },
    {
      // Control total sobre el inventario de medicamentos.
      resource: { db: "miHospitalDB", collection: "medicamentos" },
      actions: [ "find", "update", "insert", "remove" ]
    },
    {
        // Pueden ver información de los hospitales.
        resource: { db: "miHospitalDB", collection: "hospitales" },
        actions: [ "find" ]
    }
  ],
  roles: []
});

// 5. Rol de **Personal Mantenimiento**

// Primero, es buena práctica crear la colección si no existe.
db.createCollection("tareasMantenimiento");

db.createRole({
  role: "rolPersonalMantenimiento",
  privileges: [
    {
      // Solo pueden interactuar con su colección de tareas.
      resource: { db: "miHospitalDB", collection: "tareasMantenimiento" },
      actions: [ "find", "update", "insert" ]
    }
  ],
  roles: []
});