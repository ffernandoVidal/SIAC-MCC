import Badge from '../../../shared/components/Badge';

const mapaColor = {
  BORRADOR: 'yellow',
  APROBADA: 'green',
  ANULADA: 'red',
};

export default function PolizaBadgeEstado({ estado }) {
  return <Badge color={mapaColor[estado] || 'gray'}>{estado}</Badge>;
}
