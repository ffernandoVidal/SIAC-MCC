function resolverPaginacion(entrada = {}, total = 0) {
  const page = Math.max(Number(entrada.page) || 1, 1);
  const limit = Math.min(Math.max(Number(entrada.limit) || 20, 1), 100);
  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;
  const offset = (page - 1) * limit;

  return { page, limit, offset, total, totalPages };
}

module.exports = { resolverPaginacion };
