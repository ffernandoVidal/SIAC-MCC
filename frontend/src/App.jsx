import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import PolizasPage from './pages/contabilidad/PolizasPage';
import PolizaFormPage from './pages/contabilidad/PolizaFormPage';
import PolizaDetallePage from './pages/contabilidad/PolizaDetallePage';
import LibroDiarioPage from './pages/contabilidad/LibroDiarioPage';
import MayorGeneralPage from './pages/contabilidad/MayorGeneralPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-3">
        <h2 className="text-lg font-bold text-gray-700">SIAC — Contabilidad</h2>
      </header>
      <nav className="border-b bg-white px-6 py-2">
        <div className="flex gap-4 text-sm">
          <a href="/contabilidad/polizas" className="text-blue-600 hover:underline">Pólizas</a>
          <a href="/contabilidad/libro-diario" className="text-blue-600 hover:underline">Libro Diario</a>
          <a href="/contabilidad/mayor-general" className="text-blue-600 hover:underline">Mayor General</a>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/contabilidad/polizas" replace />} />
            <Route path="/contabilidad/polizas" element={<PolizasPage />} />
            <Route path="/contabilidad/polizas/nueva" element={<PolizaFormPage />} />
            <Route path="/contabilidad/polizas/:id" element={<PolizaDetallePage />} />
            <Route path="/contabilidad/polizas/:id/editar" element={<PolizaFormPage />} />
            <Route path="/contabilidad/libro-diario" element={<LibroDiarioPage />} />
            <Route path="/contabilidad/mayor-general" element={<MayorGeneralPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
