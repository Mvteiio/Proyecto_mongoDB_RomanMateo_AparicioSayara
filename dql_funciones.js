// Funciones JavaScript (UDF - Simuladas) para MongoDB

// 1. Función para calcular el inventario total de medicamentos por hospital
function calcularInventarioTotalPorHospital(hospitalIdString) {
  
  const hospitalObjectId = new ObjectId(hospitalIdString);

  return db.medicamentos.aggregate([
    { $unwind: "$inventario_por_hospital" },
    
    { $match: { "inventario_por_hospital.hospital_id": hospitalObjectId } },
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
        hospital: hospitalObjectId,
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
        pacientes: { $addToSet: "$paciente_id" }
      } 
    },
    { $sort: { totalVisitas: -1 } },
    { $limit: 20 },
    {
      $project: {
        _id: 0,
        diagnostico: "$_id",
        totalVisitas: 1,
        primeros10Pacientes: { $slice: ["$pacientes", 10] }
      }
    }
  ]).toArray();
}

// 3. Función para obtener estadísticas de tratamientos por hospital

function obtenerEstadisticasTratamientosPorHospital() {
  return db.pacientes.aggregate([
    { $unwind: "$historial" },
    
    {
      $lookup: {
        from: "tratamientos",
        localField: "historial.tratamiento_id",
        foreignField: "_id",
        as: "infoTratamiento"
      }
    },
    { $unwind: "$infoTratamiento" },


    {
      $lookup: {
        from: "visitasMedicas",
        localField: "_id", // El _id del paciente
        foreignField: "paciente_id",
        as: "visitas"
      }
    },
    { $unwind: "$visitas" },

    {
      $group: {
        _id: "$visitas.hospital_id",
        totalTratamientos: { $sum: 1 },
        costoPromedio: { $avg: "$infoTratamiento.costo" },
        costoTotal: { $sum: "$infoTratamiento.costo" }
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
        totalTratamientosAplicados: "$totalTratamientos",
        costoPromedioPorTratamiento: { $round: ["$costoPromedio", 2] },
        costoTotalAcumulado: "$costoTotal"
      }
    },
    { $sort: { costoTotalAcumulado: -1 } }
  ]).toArray();
}

// 4. Función para calcular la ocupación de médicos (visitas por médico)

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
        totalGastadoEnTratamientosCaros: { $sum: "$tratamiento.costo" },
        tratamientosCostosos: { $push: "$tratamiento.nombre" }
      }
    },
    { $sort: { totalGastadoEnTratamientosCaros: -1 } }
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
    { $sort: { totalVisitas: -1 } },

    { 
      $group: { 
        _id: null, 
        promedioVisitas: { $avg: "$totalVisitas" },
        pacientesOrdenados: { 
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
        promedioVisitasGeneral: { $round: ["$promedioVisitas", 2] },
        top5Pacientes: { $slice: ["$pacientesOrdenados", 5] }
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
    { $match: { "visitas.0": { $exists: true } } }, 
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
        pacientesUnicos: { $addToSet: "$_id" }
      }
    },
    {
      $project: {
        _id: 0,
        eps: "$_id.eps",
        ciudad: "$_id.ciudad",
        totalPacientes: { $size: "$pacientesUnicos" }
      }
    },
    { $sort: { ciudad: 1, totalPacientes: -1 } }
  ]).toArray();
}

// 10. Función para generar reporte de tratamientos más comunes por especialidad

function generarReporteTratamientosComunesPorEspecialidad() {
  return db.pacientes.aggregate([
    { $unwind: "$historial" },
    
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
        top5Tratamientos: { $slice: ["$tratamientos", 5] } 
      }
    },
    { $sort: { especialidad: 1 } }
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
      $match: { 
        "fechas.1": { $exists: true } 
      } 
    },
    {
      $project: {
        paciente_id: "$_id",
        fechas: 1,
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
                1000 * 60 * 60 * 24 
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
        promedioDiasEntreVisitas: { $round: [{ $avg: "$diferencias" }, 2] },
        totalVisitas: { $size: "$fechas" },
        diferenciasEnDias: "$diferencias"
      }
    },
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

// 16. Función para predecir necesidades de medicamentos

function generarReporteNivelDeStock(diasDeStockDeseados) {

  const CONSUMO_DIARIO_ASUMIDO = 5;

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
      $project: {
        _id: 0,
        medicamento: "$nombre",
        hospital: "$hospital.nombre",
        stockActual: "$inventario_por_hospital.disponibilidad",
        diasRestantes: {
          $round: [{ $divide: ["$inventario_por_hospital.disponibilidad", CONSUMO_DIARIO_ASUMIDO] }, 0]
        }
      }
    },
    {
      $match: {
        diasRestantes: { $lt: diasDeStockDeseados }
      }
    },
    { $sort: { diasRestantes: 1 } }
  ]).toArray();
}

// 17. Ingresos Totales Potenciales por Área Médica

function reporteIngresosPotencialesPorArea() {
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
        _id: "$tratamiento.areaMedica",
        ingresosTotales: { $sum: "$tratamiento.costo" },
        numeroDeTratamientos: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        areaMedica: "$_id",
        ingresosTotales: 1,
        numeroDeTratamientos: 1
      }
    },
    { $sort: { ingresosTotales: -1 } }
  ]).toArray();
}

// 18. Función para encontrar correlaciones entre diagnósticos y tratamientos

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

    { $sort: { "_id.diagnostico": 1, "frecuencia": -1 } },


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
        top3Tratamientos: { $slice: ["$tratamientosComunes", 3] }
      }
    }
  ]).toArray();
}
// 19. Función para generar reporte de desempeño hospitalario

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
          $cond: {
            if: { $gt: [
              { $size: {
                  $filter: {
                    input: "$personal",
                    cond: { $eq: ["$$this.rol.descripcion", "Médico Especialista"] }
                  }
              }}, 0]
            },
            then: {
              $round: [ 
                { $divide: [
                    { $size: "$visitas" },
                    { $size: {
                        $filter: {
                          input: "$personal",
                          cond: { $eq: ["$$this.rol.descripcion", "Médico Especialista"] }
                        }
                    }}
                ]}, 2]
            },
            else: 0 
          }
        }
      }
    },
    { $sort: { ratioVisitasPorMedico: -1 } }
  ]).toArray();
}

// 20. Funcion para tener un Dashboard general

function obtenerDashboardGeneral() {
  return db.visitasMedicas.aggregate([
    {
      $facet: {
        "resumenGeneral": [
          {
            $group: {
              _id: null,
              totalVisitas: { $sum: 1 },
              pacientesUnicos: { $addToSet: "$paciente_id" }
            }
          },
          {
            $project: {
              _id: 0,
              totalVisitas: 1,
              totalPacientesAtendidos: { $size: "$pacientesUnicos" }
            }
          }
        ],

        "topDiagnosticos": [
          { $group: { _id: "$diagnostico", frecuencia: { $sum: 1 } } },
          { $sort: { frecuencia: -1 } },
          { $limit: 5 }
        ],


        "rendimientoHospitales": [
          { $group: { _id: "$hospital_id", totalVisitas: { $sum: 1 } } },
          { $sort: { totalVisitas: -1 } },
          {
            $lookup: {
              from: "hospitales",
              localField: "_id",
              foreignField: "_id",
              as: "hospital"
            }
          },
          { $unwind: "$hospital" },
          { $project: { _id: 0, hospital: "$hospital.nombre", totalVisitas: 1 } }
        ]
      }
    },

    {
      $project: {
        totalVisitas: { $arrayElemAt: ["$resumenGeneral.totalVisitas", 0] },
        totalPacientesAtendidos: { $arrayElemAt: ["$resumenGeneral.totalPacientesAtendidos", 0] },
        topDiagnosticos: "$topDiagnosticos",
        rendimientoHospitales: "$rendimientoHospitales"
      }
    }

  ]).toArray();
}

