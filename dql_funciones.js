// Funciones JavaScript (UDF - Simuladas) para MongoDB

// 1. Función para calcular el inventario total de medicamentos por hospital
function calcularInventarioTotalPorHospital(hospitalId) {
  return db.medicamentos.aggregate([
    { $unwind: "$inventario_por_hospital" },
    { $match: { "inventario_por_hospital.hospital_id": hospitalId } },
    { 
      $group: {
        _id: null,
        totalMedicamentos: { $sum: "$inventario_por_hospital.disponibilidad" },
        cantidadTipos: { $sum: 1 }
      }
    },
    { 
      $project: {
        _id: 0,
        hospital: hospitalId,
        totalMedicamentos: 1,
        cantidadTipos: 1
      }
    }
  ]).toArray();
}

// 2. Función para generar reporte de visitas médicas por diagnóstico

function generarReporteVisitasPorDiagnostico(fechaInicio, fechaFin) {
  return db.visitasMedicas.aggregate([
    { 
      $match: { 
        fecha: { 
          $gte: new Date(fechaInicio), 
          $lte: new Date(fechaFin) 
        } 
      } 
    },
    { 
      $group: { 
        _id: "$diagnostico", 
        totalVisitas: { $sum: 1 },
        primeros10Pacientes: { $push: { $slice: ["$paciente_id", 10] } }
      } 
    },
    { $sort: { totalVisitas: -1 } },
    { $limit: 20 }
  ]).toArray();
}

// 3. Función para obtener estadísticas de tratamientos por hospital

function obtenerEstadisticasTratamientosPorHospital() {
  return db.visitasMedicas.aggregate([
    {
      $lookup: {
        from: "tratamientos",
        localField: "tratamiento_id",
        foreignField: "_id",
        as: "tratamiento"
      }
    },
    { $unwind: "$tratamiento" },
    {
      $group: {
        _id: "$hospital_id",
        totalTratamientos: { $sum: 1 },
        costoPromedio: { $avg: "$tratamiento.costo" },
        costoTotal: { $sum: "$tratamiento.costo" }
      }
    },
    {
      $lookup: {
        from: "hospitales",
        localField: "_id",
        foreignField: "_id",
        as: "hospital"
      }
    },
    { $unwind: "$hospital" },
    {
      $project: {
        _id: 0,
        nombreHospital: "$hospital.nombre",
        totalTratamientos: 1,
        costoPromedio: { $round: ["$costoPromedio", 2] },
        costoTotal: 1
      }
    }
  ]).toArray();
}

// 4. Función para calcular la ocupación de médicos (visitas por médico)
javascript
function calcularOcupacionMedicos(fechaInicio, fechaFin) {
  return db.visitasMedicas.aggregate([
    { 
      $match: { 
        fecha: { 
          $gte: new Date(fechaInicio), 
          $lte: new Date(fechaFin) 
        } 
      } 
    },
    { 
      $group: { 
        _id: "$medico_id", 
        totalVisitas: { $sum: 1 } 
      } 
    },
    { $sort: { totalVisitas: -1 } },
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
        totalVisitas: 1
      }
    }
  ]).toArray();
}

// 5. Función para encontrar pacientes con tratamientos costosos

function encontrarPacientesConTratamientosCostosos(umbralCosto) {
  return db.pacientes.aggregate([
    { $unwind: "$historial" },
    {
      $lookup: {
        from: "tratamientos",
        localField: "historial.tratamiento_id",
        foreignField: "_id",
        as: "tratamiento"
      }
    },
    { $unwind: "$tratamiento" },
    { $match: { "tratamiento.costo": { $gt: umbralCosto } } },
    {
      $group: {
        _id: "$_id",
        nombre: { $first: "$nombre" },
        totalGastado: { $sum: "$tratamiento.costo" },
        tratamientosCostosos: { $push: "$tratamiento.nombre" }
      }
    },
    { $sort: { totalGastado: -1 } }
  ]).toArray();
}
// 6. Función para generar reporte de medicamentos por debajo del stock mínimo

function reporteMedicamentosBajoStock(stockMinimo) {
  return db.medicamentos.aggregate([
    { $unwind: "$inventario_por_hospital" },
    { $match: { "inventario_por_hospital.disponibilidad": { $lt: stockMinimo } } },
    {
      $lookup: {
        from: "hospitales",
        localField: "inventario_por_hospital.hospital_id",
        foreignField: "_id",
        as: "hospital"
      }
    },
    { $unwind: "$hospital" },
    {
      $project: {
        _id: 0,
        medicamento: "$nombre",
        hospital: "$hospital.nombre",
        stockActual: "$inventario_por_hospital.disponibilidad",
        stockMinimo: stockMinimo
      }
    }
  ]).toArray();
}
// 7. Función para calcular el promedio de visitas por paciente

function calcularPromedioVisitasPorPaciente() {
  return db.visitasMedicas.aggregate([
    { 
      $group: { 
        _id: "$paciente_id", 
        totalVisitas: { $sum: 1 } 
      } 
    },
    { 
      $group: { 
        _id: null, 
        promedioVisitas: { $avg: "$totalVisitas" },
        pacientesConMasVisitas: { 
          $push: { 
            paciente_id: "$_id", 
            visitas: "$totalVisitas" 
          } 
        }
      } 
    },
    { 
      $project: { 
        _id: 0, 
        promedioVisitas: { $round: ["$promedioVisitas", 2] },
        topPacientes: { $slice: ["$pacientesConMasVisitas", 5] }
      } 
    }
  ]).toArray();
}
// 8. Función para encontrar médicos con especialidades no ofrecidas por su hospital

function encontrarMedicosConEspecialidadesNoOfrecidas() {
  return db.personal.aggregate([
    { $match: { "rol.descripcion": "Médico Especialista" } },
    {
      $lookup: {
        from: "hospitales",
        localField: "hospital_id",
        foreignField: "_id",
        as: "hospital"
      }
    },
    { $unwind: "$hospital" },
    {
      $project: {
        _id: 0,
        nombreMedico: "$nombre",
        especialidad: "$especialidad",
        nombreHospital: "$hospital.nombre",
        especialidadesHospital: "$hospital.especialidades",
        coincide: { $in: ["$especialidad", "$hospital.especialidades"] }
      }
    },
    { $match: { coincide: false } }
  ]).toArray();
}
// 9. Función para calcular la distribución de pacientes por EPS y ciudad

function calcularDistribucionPacientesPorEPSYCiudad() {
  return db.pacientes.aggregate([
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
        from: "hospitales",
        localField: "visitas.hospital_id",
        foreignField: "_id",
        as: "hospital"
      }
    },
    { $unwind: "$hospital" },
    {
      $group: {
        _id: {
          eps: "$seguro",
          ciudad: "$hospital.ciudad"
        },
        totalPacientes: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        eps: "$_id.eps",
        ciudad: "$_id.ciudad",
        totalPacientes: 1
      }
    },
    { $sort: { totalPacientes: -1 } }
  ]).toArray();
}

// 10. Función para generar reporte de tratamientos más comunes por especialidad

function generarReporteTratamientosComunesPorEspecialidad() {
  return db.visitasMedicas.aggregate([
    {
      $lookup: {
        from: "personal",
        localField: "medico_id",
        foreignField: "_id",
        as: "medico"
      }
    },
    { $unwind: "$medico" },
    {
      $lookup: {
        from: "tratamientos",
        localField: "tratamiento_id",
        foreignField: "_id",
        as: "tratamiento"
      }
    },
    { $unwind: "$tratamiento" },
    {
      $group: {
        _id: {
          especialidad: "$medico.especialidad",
          tratamiento: "$tratamiento.nombre"
        },
        total: { $sum: 1 }
      }
    },
    { $sort: { "_id.especialidad": 1, "total": -1 } },
    {
      $group: {
        _id: "$_id.especialidad",
        tratamientos: {
          $push: {
            tratamiento: "$_id.tratamiento",
            total: "$total"
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        especialidad: "$_id",
        tratamientos: { $slice: ["$tratamientos", 5] }
      }
    }
  ]).toArray();
}

// 11. Función para calcular la rotación de medicamentos por hospital

function calcularRotacionMedicamentosPorHospital() {
  return db.medicamentos.aggregate([
    { $unwind: "$inventario_por_hospital" },
    {
      $lookup: {
        from: "hospitales",
        localField: "inventario_por_hospital.hospital_id",
        foreignField: "_id",
        as: "hospital"
      }
    },
    { $unwind: "$hospital" },
    {
      $group: {
        _id: "$hospital.nombre",
        medicamentos: { $sum: 1 },
        stockTotal: { $sum: "$inventario_por_hospital.disponibilidad" },
        stockPromedio: { $avg: "$inventario_por_hospital.disponibilidad" }
      }
    },
    {
      $project: {
        _id: 0,
        hospital: "$_id",
        medicamentos: 1,
        stockTotal: 1,
        stockPromedio: { $round: ["$stockPromedio", 2] }
      }
    },
    { $sort: { stockTotal: -1 } }
  ]).toArray();
}

// 12. Función para encontrar pacientes con múltiples diagnósticos

function encontrarPacientesConMultiplesDiagnosticos(limiteDiagnosticos) {
  return db.pacientes.aggregate([
    {
      $project: {
        nombre: 1,
        seguro: 1,
        totalDiagnosticos: { $size: "$historial" }
      }
    },
    { $match: { totalDiagnosticos: { $gt: limiteDiagnosticos } } },
    { $sort: { totalDiagnosticos: -1 } }
  ]).toArray();
}

// 13. Función para calcular el tiempo promedio entre visitas por paciente

function calcularTiempoPromedioEntreVisitas() {
  return db.visitasMedicas.aggregate([
    { $sort: { paciente_id: 1, fecha: 1 } },
    {
      $group: {
        _id: "$paciente_id",
        fechas: { $push: "$fecha" }
      }
    },
    {
      $project: {
        _id: 0,
        paciente_id: "$_id",
        diferencias: {
          $map: {
            input: { $range: [1, { $size: "$fechas" }] },
            as: "idx",
            in: {
              $divide: [
                { $subtract: [
                  { $arrayElemAt: ["$fechas", "$$idx"] },
                  { $arrayElemAt: ["$fechas", { $subtract: ["$$idx", 1] }] }
                ]},
                1000 * 60 * 60 * 24 // Convertir a días
              ]
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: "pacientes",
        localField: "paciente_id",
        foreignField: "_id",
        as: "paciente"
      }
    },
    { $unwind: "$paciente" },
    {
      $project: {
        _id: 0,
        nombrePaciente: "$paciente.nombre",
        promedioDiasEntreVisitas: { $avg: "$diferencias" },
        totalVisitas: { $size: "$diferencias" },
        diferencias: 1
      }
    },
    { $match: { totalVisitas: { $gt: 1 } } },
    { $sort: { promedioDiasEntreVisitas: 1 } }
  ]).toArray();
}

// 14. Función para generar reporte de eficiencia médica

function generarReporteEficienciaMedica() {
  return db.visitasMedicas.aggregate([
    {
      $lookup: {
        from: "personal",
        localField: "medico_id",
        foreignField: "_id",
        as: "medico"
      }
    },
    { $unwind: "$medico" },
    {
      $group: {
        _id: "$medico_id",
        nombreMedico: { $first: "$medico.nombre" },
        especialidad: { $first: "$medico.especialidad" },
        totalVisitas: { $sum: 1 },
        diagnosticosUnicos: { $addToSet: "$diagnostico" }
      }
    },
    {
      $project: {
        _id: 0,
        nombreMedico: 1,
        especialidad: 1,
        totalVisitas: 1,
        diagnosticosUnicos: { $size: "$diagnosticosUnicos" },
        ratioEficiencia: {
          $divide: [
            { $size: "$diagnosticosUnicos" },
            "$totalVisitas"
          ]
        }
      }
    },
    { $sort: { ratioEficiencia: -1 } }
  ]).toArray();
}

// 15. Función para encontrar pacientes con tratamientos incompletos

function encontrarPacientesConTratamientosIncompletos() {
  return db.pacientes.aggregate([
    { $unwind: "$historial" },
    {
      $lookup: {
        from: "tratamientos",
        localField: "historial.tratamiento_id",
        foreignField: "_id",
        as: "tratamiento"
      }
    },
    { $unwind: "$tratamiento" },
    {
      $match: {
        "historial.resultados": { $nin: ["Completado", "Finalizado", "Exitoso"] }
      }
    },
    {
      $group: {
        _id: "$_id",
        nombre: { $first: "$nombre" },
        tratamientosIncompletos: {
          $push: {
            tratamiento: "$tratamiento.nombre",
            diagnostico: "$historial.diagnostico",
            resultados: "$historial.resultados"
          }
        }
      }
    },
    { $sort: { nombre: 1 } }
  ]).toArray();
}

// 16. Función para calcular la distribución de edades de pacientes

function calcularDistribucionEdadesPacientes() {
  // Suponiendo que tenemos un campo fechaNacimiento en los pacientes
  return db.pacientes.aggregate([
    {
      $project: {
        nombre: 1,
        edad: {
          $divide: [
            { $subtract: [new Date(), "$fechaNacimiento"] },
            1000 * 60 * 60 * 24 * 365.25 // Convertir a años
          ]
        }
      }
    },
    {
      $bucket: {
        groupBy: "$edad",
        boundaries: [0, 18, 30, 45, 60, 75, 90, 120],
        default: "Desconocido",
        output: {
          count: { $sum: 1 },
          pacientes: { $push: "$nombre" }
        }
      }
    }
  ]).toArray();
}

// 17. Función para predecir necesidades de medicamentos

function predecirNecesidadesMedicamentos(diasProyeccion) {
  return db.visitasMedicas.aggregate([
    {
      $lookup: {
        from: "tratamientos",
        localField: "tratamiento_id",
        foreignField: "_id",
        as: "tratamiento"
      }
    },
    { $unwind: "$tratamiento" },
    {
      $lookup: {
        from: "medicamentos",
        localField: "tratamiento.medicamentos",
        foreignField: "_id",
        as: "medicamentos"
      }
    },
    { $unwind: "$medicamentos" },
    {
      $group: {
        _id: {
          medicamento: "$medicamentos.nombre",
          hospital: "$hospital_id"
        },
        usoDiarioPromedio: { $avg: "$medicamentos.dosisDiaria" },
        totalUsos: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "hospitales",
        localField: "_id.hospital",
        foreignField: "_id",
        as: "hospital"
      }
    },
    { $unwind: "$hospital" },
    {
      $lookup: {
        from: "medicamentos",
        localField: "_id.medicamento",
        foreignField: "nombre",
        as: "medicamentoInfo"
      }
    },
    { $unwind: "$medicamentoInfo" },
    { $unwind: "$medicamentoInfo.inventario_por_hospital" },
    {
      $match: {
        "medicamentoInfo.inventario_por_hospital.hospital_id": "$_id.hospital"
      }
    },
    {
      $project: {
        _id: 0,
        medicamento: "$_id.medicamento",
        hospital: "$hospital.nombre",
        stockActual: "$medicamentoInfo.inventario_por_hospital.disponibilidad",
        usoDiarioPromedio: 1,
        diasRestantes: {
          $divide: [
            "$medicamentoInfo.inventario_por_hospital.disponibilidad",
            "$usoDiarioPromedio"
          ]
        },
        necesarioReponer: {
          $lt: [
            {
              $divide: [
                "$medicamentoInfo.inventario_por_hospital.disponibilidad",
                "$usoDiarioPromedio"
              ]
            },
            diasProyeccion
          ]
        }
      }
    },
    { $sort: { diasRestantes: 1 } }
  ]).toArray();
}

// 18. Función para generar reporte de ingresos por tratamiento

function generarReporteIngresosPorTratamiento(fechaInicio, fechaFin) {
  return db.visitasMedicas.aggregate([
    { 
      $match: { 
        fecha: { 
          $gte: new Date(fechaInicio), 
          $lte: new Date(fechaFin) 
        } 
      } 
    },
    {
      $lookup: {
        from: "tratamientos",
        localField: "tratamiento_id",
        foreignField: "_id",
        as: "tratamiento"
      }
    },
    { $unwind: "$tratamiento" },
    {
      $group: {
        _id: "$tratamiento.nombre",
        areaMedica: { $first: "$tratamiento.areaMedica" },
        totalIngresos: { $sum: "$tratamiento.costo" },
        totalVisitas: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        tratamiento: "$_id",
        areaMedica: 1,
        totalIngresos: 1,
        totalVisitas: 1,
        ingresoPromedio: { $divide: ["$totalIngresos", "$totalVisitas"] }
      }
    },
    { $sort: { totalIngresos: -1 } }
  ]).toArray();
}

// 19. Función para encontrar correlaciones entre diagnósticos y tratamientos

function encontrarCorrelacionesDiagnosticosTratamientos() {
  return db.pacientes.aggregate([
    { $unwind: "$historial" },
    {
      $lookup: {
        from: "tratamientos",
        localField: "historial.tratamiento_id",
        foreignField: "_id",
        as: "tratamiento"
      }
    },
    { $unwind: "$tratamiento" },
    {
      $group: {
        _id: {
          diagnostico: "$historial.diagnostico",
          tratamiento: "$tratamiento.nombre"
        },
        frecuencia: { $sum: 1 }
      }
    },
    { $sort: { frecuencia: -1 } },
    {
      $group: {
        _id: "$_id.diagnostico",
        tratamientosComunes: {
          $push: {
            tratamiento: "$_id.tratamiento",
            frecuencia: "$frecuencia"
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        diagnostico: "$_id",
        tratamientosComunes: { $slice: ["$tratamientosComunes", 3] }
      }
    }
  ]).toArray();
}
// 20. Función para generar reporte de desempeño hospitalario

function generarReporteDesempenoHospitalario() {
  return db.hospitales.aggregate([
    {
      $lookup: {
        from: "visitasMedicas",
        localField: "_id",
        foreignField: "hospital_id",
        as: "visitas"
      }
    },
    {
      $lookup: {
        from: "personal",
        localField: "_id",
        foreignField: "hospital_id",
        as: "personal"
      }
    },
    {
      $project: {
        _id: 0,
        nombre: 1,
        ciudad: 1,
        totalVisitas: { $size: "$visitas" },
        totalMedicos: {
          $size: {
            $filter: {
              input: "$personal",
              as: "empleado",
              cond: { $eq: ["$$empleado.rol.descripcion", "Médico Especialista"] }
            }
          }
        },
        totalEnfermeros: {
          $size: {
            $filter: {
              input: "$personal",
              as: "empleado",
              cond: { $eq: ["$$empleado.rol.descripcion", "Enfermero/a"] }
            }
          }
        },
        ratioVisitasPorMedico: {
          $divide: [
            { $size: "$visitas" },
            {
              $size: {
                $filter: {
                  input: "$personal",
                  as: "empleado",
                  cond: { $eq: ["$$empleado.rol.descripcion", "Médico Especialista"] }
                }
              }
            }
          ]
        }
      }
    },
    { $sort: { ratioVisitasPorMedico: -1 } }
  ]).toArray();
}

// Para implementar en MongoDb, realizar el siguiente comando
// Ejemplo de cómo guardarla
db.system.js.save({
  _id: "calcularInventarioTotalPorHospital",
  value: function(hospitalId) {
    return db.medicamentos.aggregate([
      // Función...
    ]).toArray();
  }
});

// Para llamar a la función
db.eval("calcularInventarioTotalPorHospital(ObjectId('...'))");