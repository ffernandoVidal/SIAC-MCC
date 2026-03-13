# Base de datos del proyecto SIAC

## Propósito

Este directorio contiene un esquema inicial de base de datos para apoyar el roadmap de Fase 1.

## Esquema principal

- `schema.sql` contiene las tablas básicas para:
  - Seguridad y acceso (usuarios, roles, permisos, bitácora)
  - Configuración de empresa
  - Catálogos maestros (tipos de cuenta, tipos de póliza, estados, documentos)
  - Núcleo contable (ejercicios fiscales, períodos, catálogo de cuentas)
  - Terceros y documentos fuente
  - Registro de pólizas y detalle de pólizas
  - Cierres contables y auditoría general

## Cómo usar

1. Elige tu motor (PostgreSQL, MySQL, SQLite, etc.).
2. Ajusta los tipos de datos y las cláusulas `SERIAL` conforme al motor.
3. Ejecuta el script para crear las tablas.

> Nota: para un flujo de desarrollo más avanzado, considera usar una herramienta de migraciones como Prisma Migrate, TypeORM, Knex, Flyway, Liquibase, etc.
