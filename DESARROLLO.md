# Orden de desarrollo del sistema (SIAC)

Este documento organiza el desarrollo del sistema en **fases** y **prioridades**, de más prioritario a menos prioritario dentro de la Fase 1.

---

## Fase 1.1 – Base técnica y seguridad

> Estos módulos van primero porque todo lo demás depende de ellos.

### 1. Seguridad y acceso
Debe incluir:
- usuarios
- roles
- permisos
- asignación de roles
- validación de acceso
- bitácora básica

### 2. Configuración de empresa
Debe incluir:
- datos de empresa
- parámetros generales
- moneda base
- zona horaria
- formato de pólizas
- reglas base del sistema

### 3. Catálogos maestros del sistema
Debe incluir:
- tipos de cuenta
- tipos de póliza
- estados de póliza
- tipos de documento fuente

> Esto se desarrolla primero porque alimenta muchos formularios del sistema.

---

## Fase 1.2 – Núcleo contable

> Aquí ya empieza el corazón del sistema.

### 4. Ejercicio fiscal y períodos contables
Debe incluir:
- creación de ejercicio fiscal
- períodos mensuales
- apertura y cierre
- validación de períodos abiertos

### 5. Catálogo de cuentas
Debe incluir:
- árbol jerárquico de cuentas
- cuentas padre e hijas
- cuentas de movimiento y agrupación
- naturaleza de cuenta
- estado de cuenta

### 6. Terceros y documentos fuente
Debe incluir:
- terceros
- documentos de respaldo
- vinculación con pólizas

> Aunque parezca secundario, esto ayuda mucho a que el sistema quede listo para crecer a cuentas por cobrar y pagar.

---

## Fase 1.3 – Operación contable

> Cuando ya existe la estructura contable, se desarrolla la operación.

### 7. Registro de pólizas
Debe incluir:
- encabezado de póliza
- detalle de póliza
- numeración
- cuadratura débito/crédito
- borrador, aprobada y anulada

### 8. Validaciones contables
Debe incluir:
- no registrar en período cerrado
- no usar cuentas inactivas
- no usar cuentas de agrupación para movimientos
- validación de tercero obligatorio si aplica
- validación de póliza cuadrada

---

## Fase 1.4 – Cierres, consulta y auditoría

> Ya con pólizas funcionando, se construye lo administrativo.

### 9. Cierre contable
Debe incluir:
- cierre de períodos
- bloqueo de modificaciones
- registro de usuario que cerró
- observaciones

### 10. Auditoría completa
Debe incluir:
- inserciones
- actualizaciones
- anulaciones
- tabla afectada
- usuario
- valores anteriores y nuevos

### 11. Consultas y reportes base
Debe incluir:
- libro diario
- libro mayor
- balanza de comprobación
- consulta de pólizas
- auxiliares por cuenta

---

## 2. División entre programadores

Si van a trabajar varios programadores, se puede repartir así:

- **Programador 1 – Seguridad y administración**
  - usuarios
  - roles
  - permisos
  - login
  - bitácora
  - configuración general

- **Programador 2 – Estructura contable**
  - empresa
  - ejercicio fiscal
  - períodos
  - catálogo de cuentas
  - tipos contables

- **Programador 3 – Operación contable**
  - pólizas
  - detalle de póliza
  - documentos fuente
  - terceros
  - validaciones contables

- **Programador 4 – Reportes y cierres**
  - cierre de período
  - consultas contables
  - libro diario
  - libro mayor
  - balanza
  - panel administrativo contable

---

## 3. Prioridad final resumida

### Prioridad alta
- Seguridad y acceso
- Empresa y configuración general
- Catálogos maestros
- Ejercicio fiscal y períodos
- Catálogo de cuentas

### Prioridad media
- Terceros
- Documentos fuente
- Pólizas
- Detalle de pólizas
- Validaciones contables

### Prioridad baja dentro de Fase 1
- Cierre contable
- Bitácora avanzada
- Reportes contables base
