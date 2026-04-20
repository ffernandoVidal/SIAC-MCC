export const formatCurrency = (value, moneda = 'GTQ') =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: moneda }).format(
    Number(value) || 0
  );

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-GT');
};

export const formatAccountCode = (code) => code;
