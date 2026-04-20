import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { usePolizaQuery, useCreatePoliza, useUpdatePoliza } from '../../hooks/contabilidad/usePolizas';
import PolizaEncabezado from '../../components/contabilidad/poliza/PolizaEncabezado';
import PolizaRenglonesGrid from '../../components/contabilidad/poliza/PolizaRenglonesGrid';
import PolizaTotales from '../../components/contabilidad/poliza/PolizaTotales';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import { useEffect } from 'react';

export default function PolizaFormPage() {
  const { id } = useParams();
  const esEdicion = !!id;
  const navigate = useNavigate();

  const { data: polizaExistente, isLoading: cargandoDetalle } = usePolizaQuery(id);
  const crearMut = useCreatePoliza();
  const editarMut = useUpdatePoliza();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [renglones, setRenglones] = useState([
    { cuenta: null, descripcion_renglon: '', monto_debito: 0, monto_credito: 0, referencia: '' },
    { cuenta: null, descripcion_renglon: '', monto_debito: 0, monto_credito: 0, referencia: '' },
  ]);

  // Cargar datos existentes al editar
  useEffect(() => {
    if (esEdicion && polizaExistente?.data) {
      const p = polizaExistente.data;
      reset({
        id_periodo: p.id_periodo,
        id_tipo_poliza: p.id_tipo_poliza,
        fecha_poliza: p.fecha_poliza?.split('T')[0],
        concepto: p.concepto,
        referencia_general: p.referencia_general,
      });
      if (p.renglones?.length) {
        setRenglones(p.renglones.map((r) => ({
          cuenta: { id_cuenta: r.id_cuenta, codigo_cuenta: r.codigo_cuenta, nombre_cuenta: r.nombre_cuenta },
          descripcion_renglon: r.descripcion_renglon || '',
          monto_debito: r.monto_debito || 0,
          monto_credito: r.monto_credito || 0,
          referencia: r.referencia || '',
        })));
      }
    }
  }, [esEdicion, polizaExistente, reset]);

  const onSubmit = async (encabezado) => {
    const payload = {
      ...encabezado,
      renglones: renglones
        .filter((r) => r.cuenta)
        .map((r) => ({
          id_cuenta: r.cuenta.id_cuenta,
          descripcion_renglon: r.descripcion_renglon,
          monto_debito: parseFloat(r.monto_debito) || 0,
          monto_credito: parseFloat(r.monto_credito) || 0,
          referencia: r.referencia,
        })),
    };

    if (esEdicion) {
      await editarMut.mutateAsync({ id, data: payload });
    } else {
      await crearMut.mutateAsync(payload);
    }
    navigate('/contabilidad/polizas');
  };

  if (esEdicion && cargandoDetalle) return <LoadingSpinner />;

  const guardando = crearMut.isPending || editarMut.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">
          {esEdicion ? 'Editar póliza' : 'Nueva póliza'}
        </h1>
        <button
          onClick={() => navigate('/contabilidad/polizas')}
          className="rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <PolizaEncabezado register={register} errors={errors} idEjercicio={1} />
        <PolizaRenglonesGrid renglones={renglones} setRenglones={setRenglones} />
        <PolizaTotales renglones={renglones} />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={guardando}
            className="rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : esEdicion ? 'Actualizar póliza' : 'Guardar póliza'}
          </button>
        </div>
      </form>
    </div>
  );
}
