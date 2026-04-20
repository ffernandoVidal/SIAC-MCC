-- =========================================================
-- SCC - SISTEMA CONTABLE CENTRAL
-- FASE 1 - BASE DE DATOS COMPLETA
-- MOTOR: PostgreSQL
-- =========================================================

DROP SCHEMA IF EXISTS scc CASCADE;
CREATE SCHEMA scc;
SET search_path TO scc;

-- =========================================================
-- FUNCIONES GENERALES
-- =========================================================

CREATE OR REPLACE FUNCTION fn_actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- TABLAS BASE
-- =========================================================

CREATE TABLE empresa (
    id_empresa              BIGSERIAL PRIMARY KEY,
    nombre_legal            VARCHAR(200) NOT NULL,
    nombre_comercial        VARCHAR(200),
    nit                     VARCHAR(50) NOT NULL UNIQUE,
    direccion               TEXT,
    telefono                VARCHAR(30),
    correo_electronico      VARCHAR(150),
    moneda_base             VARCHAR(10) NOT NULL DEFAULT 'GTQ',
    zona_horaria            VARCHAR(100) NOT NULL DEFAULT 'America/Guatemala',
    estado                  VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
        CHECK (estado IN ('ACTIVO', 'INACTIVO')),
    fecha_creacion          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE configuracion_general (
    id_configuracion                BIGSERIAL PRIMARY KEY,
    id_empresa                      BIGINT NOT NULL UNIQUE,
    anio_inicio_operacion           INTEGER NOT NULL CHECK (anio_inicio_operacion >= 2000),
    maneja_centros_costo            BOOLEAN NOT NULL DEFAULT FALSE,
    permite_edicion_poliza_aprobada BOOLEAN NOT NULL DEFAULT FALSE,
    maximo_decimales                INTEGER NOT NULL DEFAULT 2 CHECK (maximo_decimales BETWEEN 2 AND 6),
    formato_numero_poliza           VARCHAR(50) NOT NULL DEFAULT 'TP-AAAA-MM-000001',
    requiere_documento_fuente       BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_configuracion_empresa
        FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

-- =========================================================
-- SEGURIDAD
-- =========================================================

CREATE TABLE rol (
    id_rol                   BIGSERIAL PRIMARY KEY,
    nombre_rol               VARCHAR(80) NOT NULL UNIQUE,
    descripcion              TEXT,
    estado                   VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
        CHECK (estado IN ('ACTIVO', 'INACTIVO')),
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permiso (
    id_permiso               BIGSERIAL PRIMARY KEY,
    codigo_permiso           VARCHAR(100) NOT NULL UNIQUE,
    nombre_permiso           VARCHAR(120) NOT NULL,
    descripcion              TEXT,
    modulo                   VARCHAR(80) NOT NULL,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuario (
    id_usuario               BIGSERIAL PRIMARY KEY,
    id_empresa               BIGINT NOT NULL,
    nombres                  VARCHAR(120) NOT NULL,
    apellidos                VARCHAR(120) NOT NULL,
    nombre_usuario           VARCHAR(80) NOT NULL UNIQUE,
    correo_electronico       VARCHAR(150) NOT NULL UNIQUE,
    contrasena_hash          TEXT NOT NULL,
    estado                   VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
        CHECK (estado IN ('ACTIVO', 'INACTIVO', 'BLOQUEADO')),
    ultimo_acceso            TIMESTAMP,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_empresa
        FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

CREATE TABLE rol_permiso (
    id_rol                   BIGINT NOT NULL,
    id_permiso               BIGINT NOT NULL,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_rol, id_permiso),
    CONSTRAINT fk_rol_permiso_rol
        FOREIGN KEY (id_rol) REFERENCES rol(id_rol) ON DELETE CASCADE,
    CONSTRAINT fk_rol_permiso_permiso
        FOREIGN KEY (id_permiso) REFERENCES permiso(id_permiso) ON DELETE CASCADE
);

CREATE TABLE usuario_rol (
    id_usuario               BIGINT NOT NULL,
    id_rol                   BIGINT NOT NULL,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_rol),
    CONSTRAINT fk_usuario_rol_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_rol_rol
        FOREIGN KEY (id_rol) REFERENCES rol(id_rol) ON DELETE CASCADE
);

-- =========================================================
-- ESTRUCTURA CONTABLE
-- =========================================================

CREATE TABLE tipo_cuenta (
    id_tipo_cuenta           BIGSERIAL PRIMARY KEY,
    codigo                   VARCHAR(20) NOT NULL UNIQUE,
    nombre                   VARCHAR(80) NOT NULL,
    naturaleza               VARCHAR(10) NOT NULL
        CHECK (naturaleza IN ('DEUDORA', 'ACREEDORA')),
    descripcion              TEXT,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ejercicio_fiscal (
    id_ejercicio             BIGSERIAL PRIMARY KEY,
    id_empresa               BIGINT NOT NULL,
    anio                     INTEGER NOT NULL CHECK (anio >= 2000),
    fecha_inicio             DATE NOT NULL,
    fecha_fin                DATE NOT NULL,
    estado                   VARCHAR(20) NOT NULL DEFAULT 'ABIERTO'
        CHECK (estado IN ('ABIERTO', 'CERRADO')),
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_ejercicio_empresa_anio UNIQUE (id_empresa, anio),
    CONSTRAINT chk_ejercicio_fechas CHECK (fecha_inicio < fecha_fin),
    CONSTRAINT fk_ejercicio_empresa
        FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

CREATE TABLE periodo_contable (
    id_periodo               BIGSERIAL PRIMARY KEY,
    id_ejercicio             BIGINT NOT NULL,
    numero_periodo           INTEGER NOT NULL CHECK (numero_periodo BETWEEN 1 AND 13),
    nombre_periodo           VARCHAR(50) NOT NULL,
    fecha_inicio             DATE NOT NULL,
    fecha_fin                DATE NOT NULL,
    estado                   VARCHAR(20) NOT NULL DEFAULT 'ABIERTO'
        CHECK (estado IN ('ABIERTO', 'CERRADO')),
    fecha_cierre             TIMESTAMP,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_periodo_ejercicio_numero UNIQUE (id_ejercicio, numero_periodo),
    CONSTRAINT chk_periodo_fechas CHECK (fecha_inicio <= fecha_fin),
    CONSTRAINT fk_periodo_ejercicio
        FOREIGN KEY (id_ejercicio) REFERENCES ejercicio_fiscal(id_ejercicio) ON DELETE CASCADE
);

CREATE TABLE catalogo_cuenta (
    id_cuenta                BIGSERIAL PRIMARY KEY,
    id_empresa               BIGINT NOT NULL,
    id_tipo_cuenta           BIGINT NOT NULL,
    id_cuenta_padre          BIGINT,
    codigo_cuenta            VARCHAR(30) NOT NULL,
    nombre_cuenta            VARCHAR(150) NOT NULL,
    descripcion              TEXT,
    nivel                    INTEGER NOT NULL CHECK (nivel >= 1),
    acepta_movimientos       BOOLEAN NOT NULL DEFAULT TRUE,
    requiere_tercero         BOOLEAN NOT NULL DEFAULT FALSE,
    naturaleza               VARCHAR(10) NOT NULL
        CHECK (naturaleza IN ('DEUDORA', 'ACREEDORA')),
    estado                   VARCHAR(20) NOT NULL DEFAULT 'ACTIVA'
        CHECK (estado IN ('ACTIVA', 'INACTIVA')),
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_catalogo_cuenta UNIQUE (id_empresa, codigo_cuenta),
    CONSTRAINT fk_catalogo_cuenta_empresa
        FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),
    CONSTRAINT fk_catalogo_cuenta_tipo
        FOREIGN KEY (id_tipo_cuenta) REFERENCES tipo_cuenta(id_tipo_cuenta),
    CONSTRAINT fk_catalogo_cuenta_padre
        FOREIGN KEY (id_cuenta_padre) REFERENCES catalogo_cuenta(id_cuenta)
);

-- =========================================================
-- CATALOGOS DE PÓLIZA
-- =========================================================

CREATE TABLE tipo_poliza (
    id_tipo_poliza           BIGSERIAL PRIMARY KEY,
    codigo                   VARCHAR(20) NOT NULL UNIQUE,
    nombre                   VARCHAR(80) NOT NULL,
    descripcion              TEXT,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE estado_poliza (
    id_estado_poliza         BIGSERIAL PRIMARY KEY,
    codigo                   VARCHAR(20) NOT NULL UNIQUE,
    nombre                   VARCHAR(80) NOT NULL,
    descripcion              TEXT,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tipo_documento_fuente (
    id_tipo_documento_fuente BIGSERIAL PRIMARY KEY,
    codigo                   VARCHAR(20) NOT NULL UNIQUE,
    nombre                   VARCHAR(80) NOT NULL,
    descripcion              TEXT,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- APOYOS CONTABLES
-- =========================================================

CREATE TABLE tercero (
    id_tercero               BIGSERIAL PRIMARY KEY,
    id_empresa               BIGINT NOT NULL,
    tipo_tercero             VARCHAR(30) NOT NULL
        CHECK (tipo_tercero IN ('CLIENTE', 'PROVEEDOR', 'EMPLEADO', 'BANCO', 'GENERAL')),
    nombre_razon_social      VARCHAR(200) NOT NULL,
    identificacion_fiscal    VARCHAR(50),
    direccion                TEXT,
    telefono                 VARCHAR(30),
    correo_electronico       VARCHAR(150),
    estado                   VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
        CHECK (estado IN ('ACTIVO', 'INACTIVO')),
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tercero_empresa
        FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

CREATE TABLE documento_fuente (
    id_documento_fuente      BIGSERIAL PRIMARY KEY,
    id_empresa               BIGINT NOT NULL,
    id_tipo_documento_fuente BIGINT NOT NULL,
    numero_documento         VARCHAR(100) NOT NULL,
    serie_documento          VARCHAR(50),
    fecha_documento          DATE NOT NULL,
    nombre_emisor            VARCHAR(200),
    identificacion_emisor    VARCHAR(50),
    monto_total              NUMERIC(18,2) CHECK (monto_total IS NULL OR monto_total >= 0),
    observaciones            TEXT,
    ruta_archivo             TEXT,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_documento_fuente_empresa
        FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),
    CONSTRAINT fk_documento_fuente_tipo
        FOREIGN KEY (id_tipo_documento_fuente) REFERENCES tipo_documento_fuente(id_tipo_documento_fuente)
);

-- =========================================================
-- OPERACIÓN CONTABLE
-- =========================================================

CREATE TABLE poliza (
    id_poliza                BIGSERIAL PRIMARY KEY,
    id_empresa               BIGINT NOT NULL,
    id_periodo               BIGINT NOT NULL,
    id_tipo_poliza           BIGINT NOT NULL,
    id_estado_poliza         BIGINT NOT NULL,
    id_usuario_creador       BIGINT NOT NULL,
    id_usuario_aprobador     BIGINT,
    id_documento_fuente      BIGINT,
    numero_poliza            VARCHAR(50) NOT NULL,
    fecha_poliza             DATE NOT NULL,
    concepto                 TEXT NOT NULL,
    referencia_general       VARCHAR(150),
    total_debito             NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (total_debito >= 0),
    total_credito            NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (total_credito >= 0),
    esta_cuadrada            BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_aprobacion         TIMESTAMP,
    fecha_anulacion          TIMESTAMP,
    motivo_anulacion         TEXT,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_poliza_empresa_numero UNIQUE (id_empresa, numero_poliza),
    CONSTRAINT fk_poliza_empresa
        FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),
    CONSTRAINT fk_poliza_periodo
        FOREIGN KEY (id_periodo) REFERENCES periodo_contable(id_periodo),
    CONSTRAINT fk_poliza_tipo
        FOREIGN KEY (id_tipo_poliza) REFERENCES tipo_poliza(id_tipo_poliza),
    CONSTRAINT fk_poliza_estado
        FOREIGN KEY (id_estado_poliza) REFERENCES estado_poliza(id_estado_poliza),
    CONSTRAINT fk_poliza_usuario_creador
        FOREIGN KEY (id_usuario_creador) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_poliza_usuario_aprobador
        FOREIGN KEY (id_usuario_aprobador) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_poliza_documento
        FOREIGN KEY (id_documento_fuente) REFERENCES documento_fuente(id_documento_fuente)
);

CREATE TABLE detalle_poliza (
    id_detalle_poliza        BIGSERIAL PRIMARY KEY,
    id_poliza                BIGINT NOT NULL,
    linea                    INTEGER NOT NULL CHECK (linea >= 1),
    id_cuenta                BIGINT NOT NULL,
    id_tercero               BIGINT,
    descripcion              TEXT,
    referencia_detalle       VARCHAR(150),
    debito                   NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (debito >= 0),
    credito                  NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (credito >= 0),
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_detalle_poliza_linea UNIQUE (id_poliza, linea),
    CONSTRAINT chk_detalle_poliza_valores
        CHECK (
            (debito > 0 AND credito = 0) OR
            (credito > 0 AND debito = 0)
        ),
    CONSTRAINT fk_detalle_poliza_poliza
        FOREIGN KEY (id_poliza) REFERENCES poliza(id_poliza) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_poliza_cuenta
        FOREIGN KEY (id_cuenta) REFERENCES catalogo_cuenta(id_cuenta),
    CONSTRAINT fk_detalle_poliza_tercero
        FOREIGN KEY (id_tercero) REFERENCES tercero(id_tercero)
);

-- =========================================================
-- CIERRE Y AUDITORÍA
-- =========================================================

CREATE TABLE cierre_periodo (
    id_cierre_periodo        BIGSERIAL PRIMARY KEY,
    id_periodo               BIGINT NOT NULL UNIQUE,
    id_usuario               BIGINT NOT NULL,
    fecha_cierre             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones            TEXT,
    estado                   VARCHAR(20) NOT NULL DEFAULT 'CERRADO'
        CHECK (estado IN ('CERRADO')),
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cierre_periodo_periodo
        FOREIGN KEY (id_periodo) REFERENCES periodo_contable(id_periodo),
    CONSTRAINT fk_cierre_periodo_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE bitacora_auditoria (
    id_bitacora              BIGSERIAL PRIMARY KEY,
    id_empresa               BIGINT NOT NULL,
    id_usuario               BIGINT,
    tabla_afectada           VARCHAR(100) NOT NULL,
    id_registro_afectado     VARCHAR(100),
    accion                   VARCHAR(30) NOT NULL
        CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE', 'ANULAR', 'APROBAR', 'CERRAR', 'LOGIN', 'LOGOUT')),
    valor_anterior           JSONB,
    valor_nuevo              JSONB,
    direccion_ip             VARCHAR(50),
    user_agent               TEXT,
    fecha_evento             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bitacora_empresa
        FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),
    CONSTRAINT fk_bitacora_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- =========================================================
-- ÍNDICES
-- =========================================================

CREATE INDEX idx_usuario_empresa ON usuario(id_empresa);
CREATE INDEX idx_ejercicio_empresa ON ejercicio_fiscal(id_empresa);
CREATE INDEX idx_periodo_ejercicio ON periodo_contable(id_ejercicio);
CREATE INDEX idx_catalogo_empresa ON catalogo_cuenta(id_empresa);
CREATE INDEX idx_catalogo_padre ON catalogo_cuenta(id_cuenta_padre);
CREATE INDEX idx_catalogo_codigo ON catalogo_cuenta(codigo_cuenta);
CREATE INDEX idx_tercero_empresa ON tercero(id_empresa);
CREATE INDEX idx_documento_fuente_empresa ON documento_fuente(id_empresa);
CREATE INDEX idx_poliza_empresa ON poliza(id_empresa);
CREATE INDEX idx_poliza_periodo ON poliza(id_periodo);
CREATE INDEX idx_poliza_fecha ON poliza(fecha_poliza);
CREATE INDEX idx_poliza_numero ON poliza(numero_poliza);
CREATE INDEX idx_detalle_poliza_poliza ON detalle_poliza(id_poliza);
CREATE INDEX idx_detalle_poliza_cuenta ON detalle_poliza(id_cuenta);
CREATE INDEX idx_bitacora_empresa ON bitacora_auditoria(id_empresa);
CREATE INDEX idx_bitacora_usuario ON bitacora_auditoria(id_usuario);
CREATE INDEX idx_bitacora_fecha ON bitacora_auditoria(fecha_evento);

-- =========================================================
-- TRIGGERS DE FECHA_ACTUALIZACION
-- =========================================================

CREATE TRIGGER trg_empresa_fecha_actualizacion
BEFORE UPDATE ON empresa
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_actualizacion();

CREATE TRIGGER trg_configuracion_general_fecha_actualizacion
BEFORE UPDATE ON configuracion_general
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_actualizacion();

CREATE TRIGGER trg_rol_fecha_actualizacion
BEFORE UPDATE ON rol
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_actualizacion();

CREATE TRIGGER trg_permiso_fecha_actualizacion
BEFORE UPDATE ON permiso
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_actualizacion();

CREATE TRIGGER trg_usuario_fecha_actualizacion
BEFORE UPDATE ON usuario
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_actualizacion();

CREATE TRIGGER trg_tipo_cuenta_fecha_actualizacion
BEFORE UPDATE ON tipo_cuenta
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_actualizacion();

CREATE TRIGGER trg_ejercicio_fiscal_fecha_actualizacion
BEFORE UPDATE ON ejercicio_fiscal
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_actualizacion();

CREATE TRIGGER trg_periodo_contable_fecha_actualizacion
BEFORE UPDATE ON periodo_contable
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_actualizacion();

CREATE TRIGGER trg_catalogo_cuenta_fecha_actualizacion
BEFORE UPDATE ON catalogo_cuenta
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_actualizacion();

CREATE TRIGGER trg_tipo_poliza_fecha_actualizacion
BEFORE UPDATE ON tipo_poliza
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_actualizacion();

CREATE TRIGGER trg_estado_poliza_fecha_actualizacion
BEFORE UPDATE ON estado_poliza
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_actualizacion();

CREATE TRIGGER trg_tipo_documento_fuente_fecha_actualizacion
BEFORE UPDATE ON tipo_documento_fuente
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_actualizacion();

CREATE TRIGGER trg_tercero_fecha_actualizacion
BEFORE UPDATE ON tercero
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_actualizacion();

CREATE TRIGGER trg_documento_fuente_fecha_actualizacion
BEFORE UPDATE ON documento_fuente
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_actualizacion();

CREATE TRIGGER trg_poliza_fecha_actualizacion
BEFORE UPDATE ON poliza
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_actualizacion();

CREATE TRIGGER trg_detalle_poliza_fecha_actualizacion
BEFORE UPDATE ON detalle_poliza
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_actualizacion();

CREATE TRIGGER trg_cierre_periodo_fecha_actualizacion
BEFORE UPDATE ON cierre_periodo
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_fecha_actualizacion();

-- =========================================================
-- VALIDAR QUE NO SE INGRESEN POLIZAS EN PERÍODOS CERRADOS
-- =========================================================

CREATE OR REPLACE FUNCTION fn_validar_periodo_abierto_poliza()
RETURNS TRIGGER AS $$
DECLARE
    v_estado_periodo VARCHAR(20);
BEGIN
    SELECT estado
    INTO v_estado_periodo
    FROM periodo_contable
    WHERE id_periodo = NEW.id_periodo;

    IF v_estado_periodo IS NULL THEN
        RAISE EXCEPTION 'El período contable no existe.';
    END IF;

    IF v_estado_periodo <> 'ABIERTO' THEN
        RAISE EXCEPTION 'No se puede registrar o modificar una póliza en un período cerrado.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_periodo_abierto_poliza
BEFORE INSERT OR UPDATE ON poliza
FOR EACH ROW
EXECUTE FUNCTION fn_validar_periodo_abierto_poliza();

-- =========================================================
-- RECALCULAR TOTALES DE PÓLIZA
-- =========================================================

CREATE OR REPLACE FUNCTION fn_recalcular_totales_poliza()
RETURNS TRIGGER AS $$
DECLARE
    v_id_poliza BIGINT;
BEGIN
    v_id_poliza := COALESCE(NEW.id_poliza, OLD.id_poliza);

    UPDATE poliza
       SET total_debito = COALESCE((
                SELECT SUM(debito)
                FROM detalle_poliza
                WHERE id_poliza = v_id_poliza
            ), 0),
           total_credito = COALESCE((
                SELECT SUM(credito)
                FROM detalle_poliza
                WHERE id_poliza = v_id_poliza
            ), 0),
           esta_cuadrada = (
                COALESCE((
                    SELECT SUM(debito)
                    FROM detalle_poliza
                    WHERE id_poliza = v_id_poliza
                ), 0)
                =
                COALESCE((
                    SELECT SUM(credito)
                    FROM detalle_poliza
                    WHERE id_poliza = v_id_poliza
                ), 0)
           ),
           fecha_actualizacion = CURRENT_TIMESTAMP
     WHERE id_poliza = v_id_poliza;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalcular_totales_poliza
AFTER INSERT OR UPDATE OR DELETE ON detalle_poliza
FOR EACH ROW
EXECUTE FUNCTION fn_recalcular_totales_poliza();

-- =========================================================
-- VALIDAR CUENTA DE MOVIMIENTO ACTIVA
-- =========================================================

CREATE OR REPLACE FUNCTION fn_validar_detalle_poliza()
RETURNS TRIGGER AS $$
DECLARE
    v_acepta_movimientos BOOLEAN;
    v_estado_cuenta VARCHAR(20);
    v_requiere_tercero BOOLEAN;
BEGIN
    SELECT acepta_movimientos, estado, requiere_tercero
      INTO v_acepta_movimientos, v_estado_cuenta, v_requiere_tercero
      FROM catalogo_cuenta
     WHERE id_cuenta = NEW.id_cuenta;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La cuenta contable no existe.';
    END IF;

    IF v_estado_cuenta <> 'ACTIVA' THEN
        RAISE EXCEPTION 'La cuenta contable está inactiva.';
    END IF;

    IF v_acepta_movimientos = FALSE THEN
        RAISE EXCEPTION 'La cuenta contable es de agrupación y no acepta movimientos.';
    END IF;

    IF v_requiere_tercero = TRUE AND NEW.id_tercero IS NULL THEN
        RAISE EXCEPTION 'La cuenta contable requiere un tercero asociado.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_detalle_poliza
BEFORE INSERT OR UPDATE ON detalle_poliza
FOR EACH ROW
EXECUTE FUNCTION fn_validar_detalle_poliza();

-- =========================================================
-- DATOS INICIALES
-- =========================================================

INSERT INTO tipo_cuenta (codigo, nombre, naturaleza, descripcion) VALUES
('ACTIVO', 'Activo', 'DEUDORA', 'Recursos y bienes de la empresa'),
('PASIVO', 'Pasivo', 'ACREEDORA', 'Obligaciones de la empresa'),
('CAPITAL', 'Capital', 'ACREEDORA', 'Patrimonio de la empresa'),
('INGRESO', 'Ingreso', 'ACREEDORA', 'Ingresos operativos y no operativos'),
('GASTO', 'Gasto', 'DEUDORA', 'Gastos operativos y administrativos'),
('COSTO', 'Costo', 'DEUDORA', 'Costos de operación o ventas'),
('ORDEN', 'Orden', 'DEUDORA', 'Cuentas de orden');

INSERT INTO tipo_poliza (codigo, nombre, descripcion) VALUES
('DIARIO', 'Diario', 'Póliza de diario'),
('INGRESO', 'Ingreso', 'Póliza de ingreso'),
('EGRESO', 'Egreso', 'Póliza de egreso'),
('AJUSTE', 'Ajuste', 'Póliza de ajuste'),
('APERTURA', 'Apertura', 'Póliza de apertura'),
('CIERRE', 'Cierre', 'Póliza de cierre');

INSERT INTO estado_poliza (codigo, nombre, descripcion) VALUES
('BORRADOR', 'Borrador', 'Póliza en edición'),
('APROBADA', 'Aprobada', 'Póliza validada y aprobada'),
('ANULADA', 'Anulada', 'Póliza anulada');

INSERT INTO tipo_documento_fuente (codigo, nombre, descripcion) VALUES
('FACTURA', 'Factura', 'Documento fiscal de compra o venta'),
('RECIBO', 'Recibo', 'Documento de recepción de pago'),
('CHEQUE', 'Cheque', 'Documento bancario'),
('NOTA_DEBITO', 'Nota de débito', 'Ajuste de cargo'),
('NOTA_CREDITO', 'Nota de crédito', 'Ajuste de abono'),
('OTRO', 'Otro', 'Otro tipo de documento fuente');

INSERT INTO rol (nombre_rol, descripcion) VALUES
('ADMINISTRADOR', 'Acceso total al sistema'),
('CONTADOR', 'Gestión contable y aprobación de pólizas'),
('AUXILIAR_CONTABLE', 'Registro y consulta de pólizas'),
('AUDITOR', 'Consulta y revisión de auditoría');

INSERT INTO permiso (codigo_permiso, nombre_permiso, descripcion, modulo) VALUES
('USUARIO_VER', 'Ver usuarios', 'Permite consultar usuarios', 'SEGURIDAD'),
('USUARIO_CREAR', 'Crear usuarios', 'Permite crear usuarios', 'SEGURIDAD'),
('USUARIO_EDITAR', 'Editar usuarios', 'Permite editar usuarios', 'SEGURIDAD'),
('ROL_VER', 'Ver roles', 'Permite consultar roles', 'SEGURIDAD'),
('ROL_ASIGNAR', 'Asignar roles', 'Permite asignar roles a usuarios', 'SEGURIDAD'),
('EMPRESA_VER', 'Ver empresa', 'Permite consultar datos de empresa', 'CONFIGURACION'),
('EMPRESA_EDITAR', 'Editar empresa', 'Permite editar datos de empresa', 'CONFIGURACION'),
('CUENTA_VER', 'Ver catálogo de cuentas', 'Permite consultar cuentas', 'CONTABILIDAD'),
('CUENTA_CREAR', 'Crear cuentas', 'Permite crear cuentas contables', 'CONTABILIDAD'),
('CUENTA_EDITAR', 'Editar cuentas', 'Permite modificar cuentas contables', 'CONTABILIDAD'),
('POLIZA_VER', 'Ver pólizas', 'Permite consultar pólizas', 'CONTABILIDAD'),
('POLIZA_CREAR', 'Crear pólizas', 'Permite crear pólizas', 'CONTABILIDAD'),
('POLIZA_EDITAR', 'Editar pólizas', 'Permite editar pólizas en borrador', 'CONTABILIDAD'),
('POLIZA_APROBAR', 'Aprobar pólizas', 'Permite aprobar pólizas', 'CONTABILIDAD'),
('POLIZA_ANULAR', 'Anular pólizas', 'Permite anular pólizas', 'CONTABILIDAD'),
('PERIODO_CERRAR', 'Cerrar períodos', 'Permite cerrar períodos contables', 'CONTABILIDAD'),
('BITACORA_VER', 'Ver bitácora', 'Permite consultar bitácora de auditoría', 'AUDITORIA'),
('REPORTE_VER', 'Ver reportes', 'Permite consultar reportes contables', 'REPORTES');

-- Relación de permisos básicos por rol
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM rol r
JOIN permiso p ON 1=1
WHERE r.nombre_rol = 'ADMINISTRADOR';

INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM rol r
JOIN permiso p
  ON p.codigo_permiso IN (
      'EMPRESA_VER','CUENTA_VER','CUENTA_CREAR','CUENTA_EDITAR',
      'POLIZA_VER','POLIZA_CREAR','POLIZA_EDITAR','POLIZA_APROBAR',
      'PERIODO_CERRAR','REPORTE_VER'
  )
WHERE r.nombre_rol = 'CONTADOR';

INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM rol r
JOIN permiso p
  ON p.codigo_permiso IN (
      'CUENTA_VER','POLIZA_VER','POLIZA_CREAR','POLIZA_EDITAR','REPORTE_VER'
  )
WHERE r.nombre_rol = 'AUXILIAR_CONTABLE';

INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM rol r
JOIN permiso p
  ON p.codigo_permiso IN (
      'POLIZA_VER','BITACORA_VER','REPORTE_VER','CUENTA_VER'
  )
WHERE r.nombre_rol = 'AUDITOR';