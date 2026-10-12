-- =====================================================================
-- Sistema de Gestión de Taller de Mecánica (SGTM / TallerGest)
-- Script de creación de base de datos
-- =====================================================================

CREATE DATABASE IF NOT EXISTS taller_mecanica
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE taller_mecanica;

-- ---------------------------------------------------------------------
-- Módulo: Clientes
-- ---------------------------------------------------------------------
CREATE TABLE clientes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(120) NOT NULL,
  telefono        VARCHAR(30),
  correo          VARCHAR(120),
  direccion       VARCHAR(200),
  fecha_creacion  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Módulo: Vehículos
-- ---------------------------------------------------------------------
CREATE TABLE vehiculos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id      INT NOT NULL,
  placa           VARCHAR(20) NOT NULL UNIQUE,
  marca           VARCHAR(60),
  modelo          VARCHAR(60),
  anio            INT,
  fecha_creacion  DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vehiculo_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE RESTRICT
);

-- ---------------------------------------------------------------------
-- Módulo: Historial de mantenimiento
-- ---------------------------------------------------------------------
CREATE TABLE historial_mantenimiento (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  vehiculo_id     INT NOT NULL,
  fecha           DATETIME DEFAULT CURRENT_TIMESTAMP,
  descripcion     VARCHAR(300),
  CONSTRAINT fk_historial_vehiculo
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id)
    ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Módulo: Mecánicos (usado por Asignación de mecánicos)
-- ---------------------------------------------------------------------
CREATE TABLE mecanicos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(120) NOT NULL,
  especialidad    VARCHAR(80),
  disponible      BOOLEAN DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- Módulo: Recepción del vehículo
-- ---------------------------------------------------------------------
CREATE TABLE recepciones (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  vehiculo_id       INT NOT NULL,
  fecha_recepcion   DATETIME DEFAULT CURRENT_TIMESTAMP,
  observaciones     VARCHAR(300),
  CONSTRAINT fk_recepcion_vehiculo
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id)
    ON DELETE RESTRICT
);

-- ---------------------------------------------------------------------
-- Módulo: Diagnóstico
-- ---------------------------------------------------------------------
CREATE TABLE diagnosticos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  recepcion_id    INT NOT NULL,
  mecanico_id     INT,
  hallazgos       VARCHAR(500),
  fecha           DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_diagnostico_recepcion
    FOREIGN KEY (recepcion_id) REFERENCES recepciones(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_diagnostico_mecanico
    FOREIGN KEY (mecanico_id) REFERENCES mecanicos(id)
    ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- Módulo: Gestión de servicios
-- ---------------------------------------------------------------------
CREATE TABLE servicios (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  nombre            VARCHAR(120) NOT NULL,
  costo_mano_obra   DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------
-- Módulo: Gestión de repuestos
-- ---------------------------------------------------------------------
CREATE TABLE repuestos (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  nombre            VARCHAR(120) NOT NULL,
  existencia        INT NOT NULL DEFAULT 0,
  precio_unitario   DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------
-- Módulo: Órdenes de Trabajo
-- (Creación de órdenes, Asignación de mecánicos, Ejecución del
--  trabajo y Control de estados)
-- ---------------------------------------------------------------------
CREATE TABLE ordenes_trabajo (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  vehiculo_id     INT NOT NULL,
  diagnostico_id  INT NULL,
  mecanico_id     INT,
  estado          ENUM(
                    'recibida',
                    'diagnosticada',
                    'cotizada',
                    'aprobada',
                    'en_ejecucion',
                    'finalizada',
                    'facturada'
                  ) NOT NULL DEFAULT 'recibida',
  fecha_creacion  DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_cierre    DATETIME NULL,
  CONSTRAINT fk_orden_vehiculo
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_orden_diagnostico
    FOREIGN KEY (diagnostico_id) REFERENCES diagnosticos(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_orden_mecanico
    FOREIGN KEY (mecanico_id) REFERENCES mecanicos(id)
    ON DELETE SET NULL
);

-- Detalle: servicios incluidos en una orden de trabajo
CREATE TABLE orden_servicios (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  orden_id        INT NOT NULL,
  servicio_id     INT NOT NULL,
  cantidad        INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_os_orden
    FOREIGN KEY (orden_id) REFERENCES ordenes_trabajo(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_os_servicio
    FOREIGN KEY (servicio_id) REFERENCES servicios(id)
    ON DELETE RESTRICT
);

-- Detalle: repuestos usados en una orden de trabajo
CREATE TABLE orden_repuestos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  orden_id        INT NOT NULL,
  repuesto_id     INT NOT NULL,
  cantidad        INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_or_orden
    FOREIGN KEY (orden_id) REFERENCES ordenes_trabajo(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_or_repuesto
    FOREIGN KEY (repuesto_id) REFERENCES repuestos(id)
    ON DELETE RESTRICT
);

-- ---------------------------------------------------------------------
-- Módulo: Cotizaciones y Aprobación del cliente
-- ---------------------------------------------------------------------
CREATE TABLE cotizaciones (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  orden_id        INT NOT NULL,
  total           DECIMAL(10,2) NOT NULL DEFAULT 0,
  vigencia        DATE,
  fecha_creacion  DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cotizacion_orden
    FOREIGN KEY (orden_id) REFERENCES ordenes_trabajo(id)
    ON DELETE CASCADE
);

CREATE TABLE aprobaciones_cliente (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  cotizacion_id   INT NOT NULL,
  aprobado        BOOLEAN NOT NULL DEFAULT FALSE,
  fecha           DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_aprobacion_cotizacion
    FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id)
    ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Módulo: Facturación y Pagos
-- ---------------------------------------------------------------------
CREATE TABLE facturas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  orden_id        INT NOT NULL,
  total           DECIMAL(10,2) NOT NULL DEFAULT 0,
  fecha           DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_factura_orden
    FOREIGN KEY (orden_id) REFERENCES ordenes_trabajo(id)
    ON DELETE RESTRICT
);

CREATE TABLE pagos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  factura_id      INT NOT NULL,
  monto           DECIMAL(10,2) NOT NULL,
  metodo          VARCHAR(50),
  fecha           DATETIME DEFAULT CURRENT_TIMESTAMP,
  referencia      VARCHAR(100),
  CONSTRAINT fk_pago_factura
    FOREIGN KEY (factura_id) REFERENCES facturas(id)
    ON DELETE RESTRICT
);
-- ---------------------------------------------------------------------
-- Módulo: Usuarios y roles
-- ---------------------------------------------------------------------
CREATE TABLE roles (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(50) NOT NULL UNIQUE,
  permisos        JSON
);

CREATE TABLE usuarios (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario      VARCHAR(60) NOT NULL UNIQUE,
  clave_hash          VARCHAR(255) NOT NULL,
  rol_id              INT,
  fecha_creacion      DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_rol
    FOREIGN KEY (rol_id) REFERENCES roles(id)
    ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- Núcleo común: Auditoría
-- ---------------------------------------------------------------------
CREATE TABLE log_auditoria (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT,
  accion          VARCHAR(100) NOT NULL,
  entidad         VARCHAR(100),
  fecha           DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL
);

-- =====================================================================
-- Datos iniciales mínimos (opcional, útil para pruebas)
-- =====================================================================
/* INSERT INTO roles (nombre, permisos) VALUES
  ('admin', JSON_ARRAY('*')),
  ('recepcionista', JSON_ARRAY('clientes', 'vehiculos', 'recepciones')),
  ('mecanico', JSON_ARRAY('diagnosticos', 'ordenes_trabajo')); */

-- =====================================================================
-- Migración para el módulo Facturación y Pagos
-- =====================================================================
USE taller_mecanica;

-- facturas: faltaban cliente_id, estado y fecha_creacion
ALTER TABLE facturas
  ADD COLUMN cliente_id INT NULL AFTER orden_id,
  ADD COLUMN estado ENUM('pendiente','pagada','anulada') NOT NULL DEFAULT 'pendiente' AFTER total,
  ADD COLUMN fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  ADD INDEX idx_facturas_estado (estado),
  ADD INDEX idx_facturas_orden (orden_id);

-- Si ya tenías facturas, completa su cliente a partir de la orden -> vehículo
UPDATE facturas f
JOIN ordenes_trabajo o ON o.id = f.orden_id
JOIN vehiculos v ON v.id = o.vehiculo_id
SET f.cliente_id = v.cliente_id
WHERE f.cliente_id IS NULL;

ALTER TABLE facturas
  MODIFY COLUMN cliente_id INT NOT NULL,
  ADD CONSTRAINT fk_factura_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT;

-- pagos: el modelo también guarda fecha_creacion (viene de EntidadBase)
ALTER TABLE pagos
  ADD COLUMN fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  ADD INDEX idx_pagos_factura (factura_id);