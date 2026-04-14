import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('viagens');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const tableMap: Record<string, string> = {
      'viagens': 'active_matches',
      'pedidos': 'active_matches', // Mapeando para active_matches temporariamente
      'rotas': 'user_routes',
      'passageiros': 'passageiros',
      'motoristas': 'motoristas'
    };

    const tableName = tableMap[activeTab] || activeTab;
    
    const { data: fetchedData, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(50);

    if (error) {
      console.error(`Erro ao buscar ${tableName}:`, error);
      setData([]);
    } else {
      setData(fetchedData || []);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (row: any) => {
    const tableMap: Record<string, string> = {
      'passageiros': 'passageiros',
      'motoristas': 'motoristas'
    };
    const tableName = tableMap[activeTab];
    if (!tableName) return;

    const newStatus = row.validation_status === 'ativo' ? 'bloqueado' : 'ativo';
    
    const { error } = await supabase
      .from(tableName)
      .update({ validation_status: newStatus })
      .eq('id', row.id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status.');
    } else {
      await fetchData(); // Recarrega os dados
      alert('Status atualizado com sucesso!');
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  if (authLoading) return <div>Carregando autenticação...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.email !== 'niopassinho@gmail.com') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Painel Administrativo NEXUS</h1>
        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = '/login';
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Sair
        </button>
      </div>
      
      <div className="flex gap-4 mb-6">
        {['viagens', 'pedidos', 'rotas', 'passageiros', 'motoristas'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-emerald-600 text-white' : 'bg-white'}`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded shadow overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">{activeTab.toUpperCase()}</h2>
        {loading ? (
          <p>Carregando dados...</p>
        ) : data.length === 0 ? (
          <p>Nenhum dado encontrado.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(data[0]).map(key => (
                  <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {key}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val: any, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {(activeTab === 'passageiros' || activeTab === 'motoristas') && (
                      <button 
                        onClick={() => handleToggleStatus(row)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Alternar Status
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
