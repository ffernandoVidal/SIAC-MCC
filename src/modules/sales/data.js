export const salesSummary = [
  {
    title: 'Ventas del dia',
    value: 'Q 12,480',
    detail: '+18% vs ayer',
    icon: 'bi-cash-stack',
    tone: 'success',
  },
  {
    title: 'Tickets emitidos',
    value: '34',
    detail: '5 pendientes de cobro',
    icon: 'bi-receipt-cutoff',
    tone: 'primary',
  },
  {
    title: 'Productos activos',
    value: '128',
    detail: '14 con bajo stock',
    icon: 'bi-box-seam',
    tone: 'warning',
  },
  {
    title: 'Clientes frecuentes',
    value: '52',
    detail: '8 compras repetidas hoy',
    icon: 'bi-people',
    tone: 'info',
  },
];

export const salesActions = [
  {
    title: 'Catalogo de productos',
    description: 'Alta de productos, control de existencias y definicion de precios.',
    href: '/Modulo de ventas/productos',
    icon: 'bi-grid-1x2',
  },
  {
    title: 'Registro de ventas',
    description: 'Creacion de tickets, seguimiento de pagos y resumen operativo.',
    href: '/Modulo de ventas/ventas',
    icon: 'bi-bag-check',
  },
];

export const productCatalog = [
  {
    id: 'SKU-001',
    nombre: 'Laptop Pro 14',
    categoria: 'Tecnologia',
    precio: 8450,
    stock: 6,
    estado: 'Bajo',
  },
  {
    id: 'SKU-002',
    nombre: 'Mouse Inalambrico',
    categoria: 'Accesorios',
    precio: 180,
    stock: 28,
    estado: 'Disponible',
  },
  {
    id: 'SKU-003',
    nombre: 'Monitor 27 Pulgadas',
    categoria: 'Tecnologia',
    precio: 2100,
    stock: 12,
    estado: 'Disponible',
  },
  {
    id: 'SKU-004',
    nombre: 'Teclado Mecanico',
    categoria: 'Accesorios',
    precio: 620,
    stock: 4,
    estado: 'Bajo',
  },
];

export const salesPipeline = [
  {
    id: 'VT-1001',
    cliente: 'Distribuidora Centro',
    fecha: '2026-04-09',
    estado: 'Facturada',
    total: 4580,
  },
  {
    id: 'VT-1002',
    cliente: 'Tienda Reforma',
    fecha: '2026-04-09',
    estado: 'Pendiente',
    total: 1320,
  },
  {
    id: 'VT-1003',
    cliente: 'Cliente de Mostrador',
    fecha: '2026-04-08',
    estado: 'Cobrada',
    total: 780,
  },
];

export const salesChecklist = [
  'Definir tablas para productos, listas de precio y detalle de ventas.',
  'Exponer APIs para CRUD de productos y generacion de ventas.',
  'Vincular ventas con terceros, documentos fuente e inventario.',
  'Agregar reportes de margen, rotacion y productos mas vendidos.',
];