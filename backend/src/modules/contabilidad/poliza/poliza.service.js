const { getClient } = require('../../../config/db');
const repositorioPoliza = require('./poliza.repository');
const { resolverPaginacion } = require('../../../shared/helpers/pagination');
const { insertarBitacora } = require('../../../shared/helpers/auditoria');

/* ──────────── Listar ──────────── */

async function listarPolizas({ idEmpresa, parametros }) {
  const paginacionBase = resolverPaginacion(parametros);
  const { filas, total } = await repositorioPoliza.buscarPolizasPorEmpresa({
    idEmpresa,
    filtros: {
      id_periodo: parametros.id_periodo,
      id_tipo_poliza: parametros.id_tipo_poliza,
      estado: parametros.estado,
      fecha_desde: parametros.fecha_desde,
      fecha_hasta: parametros.fecha_hasta,
      numero_poliza: parametros.numero_poliza,
    },
    paginacion: paginacionBase,
  });

  const paginacion = resolverPaginacion(parametros, total);
  return {
    filas,
    paginacion: { page: paginacion.page, limit: paginacion.limit, total: paginacion.total },
  };
}

/* ──────────── Obtener por ID ──────────── */

async function obtenerPoliza({ idPoliza, idEmpresa }) {
  const datos = await repositorioPoliza.buscarPolizaConDetalle(idPoliza, idEmpresa);
  if (!datos) {
    const err = new Error('Póliza no encontrada');
    err.status = 404;
    err.code = 'POLIZA_NO_ENCONTRADA';
    throw err;
  }
  return datos;
}

/* ──────────── Generar número de póliza ──────────── */

async function generarNumeroPoliza(cliente, idEmpresa, idTipoPoliza, fechaPoliza) {
  const cfgResultado = await cliente.query(
    `SELECT formato_numero_poliza
     FROM scc.configuracion_general
     WHERE id_empresa = $1`,
    [idEmpresa]
  );
  const formato = cfgResultado.rows[0]?.formato_numero_poliza || 'TP-AAAA-MM-000001';

  const tipoResultado = await cliente.query(
    'SELECT codigo FROM scc.tipo_poliza WHERE id_tipo_poliza = $1',
    [idTipoPoliza]
  );
  const codigoTipo = tipoResultado.rows[0]?.codigo || 'DI';

  const fecha = new Date(fechaPoliza);
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');

  // Consecutivo por empresa + tipo + año + mes
  const consecutivoResultado = await cliente.query(
    `SELECT COUNT(*)::int + 1 AS siguiente
     FROM scc.poliza
     WHERE id_empresa = $1
       AND id_tipo_poliza = $2
       AND EXTRACT(YEAR FROM fecha_poliza) = $3
       AND EXTRACT(MONTH FROM fecha_poliza) = $4`,
    [idEmpresa, idTipoPoliza, anio, fecha.getMonth() + 1]
  );
  const siguiente = consecutivoResultado.rows[0]?.siguiente || 1;

  const numero = formato
    .replace('TP', codigoTipo.substring(0, 2).toUpperCase())
    .replace('AAAA', String(anio))
    .replace('MM', mes)
    .replace('000001', String(siguiente).padStart(6, '0'));

  return numero;
}

/* ──────────── Crear ──────────── */

async function crearPoliza({ idEmpresa, idUsuario, cuerpo, meta }) {
  const cliente = await getClient();

  try {
    await cliente.query('BEGIN');

    // Estado BORRADOR
    const estadoResultado = await cliente.query(
      "SELECT id_estado_poliza FROM scc.estado_poliza WHERE codigo = 'BORRADOR' LIMIT 1"
    );

    const numeroPoliza = await generarNumeroPoliza(
      cliente, idEmpresa, cuerpo.id_tipo_poliza, cuerpo.fecha_poliza
    );

    // 1. INSERT en scc.poliza
    const polizaResultado = await cliente.query(
      `INSERT INTO scc.poliza (
        id_empresa, id_periodo, id_tipo_poliza, id_estado_poliza,
        id_usuario_creador, id_documento_fuente, numero_poliza,
        fecha_poliza, concepto, referencia_general
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        idEmpresa,
        cuerpo.id_periodo,
        cuerpo.id_tipo_poliza,
        estadoResultado.rows[0].id_estado_poliza,
        idUsuario,
        cuerpo.id_documento_fuente || null,
        numeroPoliza,
        cuerpo.fecha_poliza,
        cuerpo.concepto,
        cuerpo.referencia_general || null,
      ]
    );
    const poliza = polizaResultado.rows[0];

    // 2. INSERT múltiple en scc.detalle_poliza (los triggers validan y recalculan)
    for (let i = 0; i < cuerpo.renglones.length; i += 1) {
      const r = cuerpo.renglones[i];
      await cliente.query(
        `INSERT INTO scc.detalle_poliza (
          id_poliza, linea, id_cuenta, id_tercero,
          descripcion, referencia_detalle, debito, credito
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          poliza.id_poliza,
          i + 1,
          r.id_cuenta,
          r.id_tercero || null,
          r.descripcion || null,
          r.referencia_detalle || null,
          Number(r.debito || 0),
          Number(r.credito || 0),
        ]
      );
    }

    // 3. INSERT en scc.bitacora_auditoria
    await insertarBitacora(cliente, {
      idEmpresa,
      idUsuario,
      tablaAfectada: 'poliza',
      idRegistroAfectado: String(poliza.id_poliza),
      accion: 'INSERT',
      valorNuevo: poliza,
      direccionIp: meta.ip,
      userAgent: meta.userAgent,
    });

    await cliente.query('COMMIT');
    return obtenerPoliza({ idPoliza: poliza.id_poliza, idEmpresa });
  } catch (err) {
    await cliente.query('ROLLBACK');
    throw err;
  } finally {
    cliente.release();
  }
}

/* ──────────── Editar (solo BORRADOR) ──────────── */

async function editarPoliza({ idPoliza, idEmpresa, idUsuario, cuerpo, meta }) {
  const cliente = await getClient();

  try {
    await cliente.query('BEGIN');

    const previo = await repositorioPoliza.buscarPolizaConDetalle(idPoliza, idEmpresa);
    if (!previo) {
      const err = new Error('Póliza no encontrada');
      err.status = 404;
      err.code = 'POLIZA_NO_ENCONTRADA';
      throw err;
    }

    if (previo.poliza.estado_poliza !== 'BORRADOR') {
      const err = new Error('Solo se pueden editar pólizas en estado BORRADOR');
      err.status = 409;
      err.code = 'ESTADO_INVALIDO';
      throw err;
    }

    // Actualizar cabecera
    await cliente.query(
      `UPDATE scc.poliza
       SET fecha_poliza = COALESCE($1, fecha_poliza),
           concepto = COALESCE($2, concepto),
           referencia_general = COALESCE($3, referencia_general),
           id_documento_fuente = COALESCE($4, id_documento_fuente)
       WHERE id_poliza = $5 AND id_empresa = $6`,
      [
        cuerpo.fecha_poliza || null,
        cuerpo.concepto || null,
        cuerpo.referencia_general || null,
        cuerpo.id_documento_fuente || null,
        idPoliza,
        idEmpresa,
      ]
    );

    // Reemplazar renglones: DELETE + INSERT en transacción
    if (Array.isArray(cuerpo.renglones) && cuerpo.renglones.length >= 2) {
      await cliente.query('DELETE FROM scc.detalle_poliza WHERE id_poliza = $1', [idPoliza]);

      for (let i = 0; i < cuerpo.renglones.length; i += 1) {
        const r = cuerpo.renglones[i];
        await cliente.query(
          `INSERT INTO scc.detalle_poliza (
            id_poliza, linea, id_cuenta, id_tercero,
            descripcion, referencia_detalle, debito, credito
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            idPoliza,
            i + 1,
            r.id_cuenta,
            r.id_tercero || null,
            r.descripcion || null,
            r.referencia_detalle || null,
            Number(r.debito || 0),
            Number(r.credito || 0),
          ]
        );
      }
    }

    // Auditoría
    await insertarBitacora(cliente, {
      idEmpresa,
      idUsuario,
      tablaAfectada: 'poliza',
      idRegistroAfectado: String(idPoliza),
      accion: 'UPDATE',
      valorAnterior: previo.poliza,
      valorNuevo: cuerpo,
      direccionIp: meta.ip,
      userAgent: meta.userAgent,
    });

    await cliente.query('COMMIT');
    return obtenerPoliza({ idPoliza, idEmpresa });
  } catch (err) {
    await cliente.query('ROLLBACK');
    throw err;
  } finally {
    cliente.release();
  }
}

/* ──────────── Aprobar ──────────── */

async function aprobarPoliza({ idPoliza, idEmpresa, idUsuario, meta }) {
  const cliente = await getClient();

  try {
    await cliente.query('BEGIN');

    const previo = await repositorioPoliza.buscarPolizaConDetalle(idPoliza, idEmpresa);
    if (!previo) {
      const err = new Error('Póliza no encontrada');
      err.status = 404;
      err.code = 'POLIZA_NO_ENCONTRADA';
      throw err;
    }

    if (previo.poliza.estado_poliza !== 'BORRADOR') {
      const err = new Error('Solo se pueden aprobar pólizas en estado BORRADOR');
      err.status = 409;
      err.code = 'ESTADO_INVALIDO';
      throw err;
    }

    // Verificar que esta_cuadrada = true antes de aprobar
    if (!previo.poliza.esta_cuadrada) {
      const err = new Error('La póliza no está cuadrada (débitos ≠ créditos). No se puede aprobar.');
      err.status = 409;
      err.code = 'POLIZA_NO_CUADRADA';
      throw err;
    }

    const estadoAprobada = await cliente.query(
      "SELECT id_estado_poliza FROM scc.estado_poliza WHERE codigo = 'APROBADA' LIMIT 1"
    );

    await cliente.query(
      `UPDATE scc.poliza
       SET id_estado_poliza = $1,
           id_usuario_aprobador = $2,
           fecha_aprobacion = CURRENT_TIMESTAMP
       WHERE id_poliza = $3 AND id_empresa = $4`,
      [estadoAprobada.rows[0].id_estado_poliza, idUsuario, idPoliza, idEmpresa]
    );

    await insertarBitacora(cliente, {
      idEmpresa,
      idUsuario,
      tablaAfectada: 'poliza',
      idRegistroAfectado: String(idPoliza),
      accion: 'APROBAR',
      valorAnterior: previo.poliza,
      valorNuevo: { estado: 'APROBADA' },
      direccionIp: meta.ip,
      userAgent: meta.userAgent,
    });

    await cliente.query('COMMIT');
    return obtenerPoliza({ idPoliza, idEmpresa });
  } catch (err) {
    await cliente.query('ROLLBACK');
    throw err;
  } finally {
    cliente.release();
  }
}

/* ──────────── Anular ──────────── */

async function anularPoliza({ idPoliza, idEmpresa, idUsuario, motivo, meta }) {
  const cliente = await getClient();

  try {
    await cliente.query('BEGIN');

    const previo = await repositorioPoliza.buscarPolizaConDetalle(idPoliza, idEmpresa);
    if (!previo) {
      const err = new Error('Póliza no encontrada');
      err.status = 404;
      err.code = 'POLIZA_NO_ENCONTRADA';
      throw err;
    }

    if (previo.poliza.estado_poliza === 'ANULADA') {
      const err = new Error('La póliza ya está anulada');
      err.status = 409;
      err.code = 'ESTADO_INVALIDO';
      throw err;
    }

    const estadoAnulada = await cliente.query(
      "SELECT id_estado_poliza FROM scc.estado_poliza WHERE codigo = 'ANULADA' LIMIT 1"
    );

    await cliente.query(
      `UPDATE scc.poliza
       SET id_estado_poliza = $1,
           fecha_anulacion = CURRENT_TIMESTAMP,
           motivo_anulacion = $2
       WHERE id_poliza = $3 AND id_empresa = $4`,
      [estadoAnulada.rows[0].id_estado_poliza, motivo || 'Anulación manual', idPoliza, idEmpresa]
    );

    await insertarBitacora(cliente, {
      idEmpresa,
      idUsuario,
      tablaAfectada: 'poliza',
      idRegistroAfectado: String(idPoliza),
      accion: 'ANULAR',
      valorAnterior: previo.poliza,
      valorNuevo: { estado: 'ANULADA', motivo },
      direccionIp: meta.ip,
      userAgent: meta.userAgent,
    });

    await cliente.query('COMMIT');
    return obtenerPoliza({ idPoliza, idEmpresa });
  } catch (err) {
    await cliente.query('ROLLBACK');
    throw err;
  } finally {
    cliente.release();
  }
}

module.exports = {
  listarPolizas,
  obtenerPoliza,
  crearPoliza,
  editarPoliza,
  aprobarPoliza,
  anularPoliza,
};
