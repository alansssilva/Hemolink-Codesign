import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, AlertTriangle, Edit, Save, X, Droplets, Activity, RefreshCw, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/LocalAuthContext';
import { useNotification } from '../context/NotificationContext';

const StockManagementPage = () => {
  const { userProfile, stockLevels, updateStockLevel, getStockStatistics } = useAuth();
  const { addNotification } = useNotification();
  
  const [editingStock, setEditingStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [tempUnits, setTempUnits] = useState(0);

  const statistics = getStockStatistics();

  const handleEditStock = (stock) => {
    setEditingStock(stock);
    setTempUnits(stock.units);
  };

  const handleSaveStock = async () => {
    if (tempUnits < 0) {
      addNotification('O número de unidades não pode ser negativo.', 'error');
      return;
    }

    try {
      await updateStockLevel(editingStock.blood_type, tempUnits);
      addNotification(`Estoque de ${editingStock.blood_type} atualizado para ${tempUnits} unidades.`, 'success');
      setEditingStock(null);
      setTempUnits(0);
    } catch (error) {
      addNotification('Erro ao atualizar estoque.', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingStock(null);
    setTempUnits(0);
  };

  const handleQuickUpdate = async (bloodType, change) => {
    const currentStock = stockLevels.find(s => s.blood_type === bloodType);
    if (currentStock) {
      const newUnits = Math.max(0, currentStock.units + change);
      try {
        await updateStockLevel(bloodType, newUnits);
      } catch (error) {
        addNotification('Erro ao atualizar estoque.', 'error');
      }
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'low': return 'bg-yellow-500';
      case 'stable': return 'bg-green-500';
      case 'high': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'critical': return 'Crítico';
      case 'low': return 'Baixo';
      case 'stable': return 'Estável';
      case 'high': return 'Alto';
      default: return 'Desconhecido';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'low': return <TrendingDown className="h-5 w-5 text-yellow-500" />;
      case 'stable': return <Activity className="h-5 w-5 text-green-500" />;
      case 'high': return <TrendingUp className="h-5 w-5 text-blue-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredStock = filterStatus === 'all' 
    ? stockLevels 
    : stockLevels.filter(stock => stock.status === filterStatus);

  const criticalCount = statistics.critical;
  const lowCount = statistics.low;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                to="/professional/dashboard" 
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar ao Dashboard</span>
              </Link>
              <span className="text-gray-400">|</span>
              <div className="flex items-center space-x-2">
                <Droplets className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">Gestão de Estoque</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Última atualização: {new Date().toLocaleTimeString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alertas de Estoque Crítico */}
        {(criticalCount > 0 || lowCount > 0) && (
          <div className="mb-8">
            {criticalCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">
                      Estoque Crítico!
                    </h3>
                    <p className="text-red-700">
                      {criticalCount} tipo(s) sanguíneo(s) com estoque crítico. 
                      Ação imediata necessária!
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {lowCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <TrendingDown className="h-6 w-6 text-yellow-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-900">
                      Estoque Baixo
                    </h3>
                    <p className="text-yellow-700">
                      {lowCount} tipo(s) sanguíneo(s) com estoque baixo. 
                      Considere criar campanhas específicas.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Crítico</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Baixo</p>
                <p className="text-2xl font-bold text-yellow-600">{lowCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estável</p>
                <p className="text-2xl font-bold text-green-600">{statistics.stable}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Unidades</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.total}</p>
              </div>
            </div>
          </div>
          
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({stockLevels.length})
            </button>
            <button
              onClick={() => setFilterStatus('critical')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'critical' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Crítico ({criticalCount})
            </button>
            <button
              onClick={() => setFilterStatus('low')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'low' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Baixo ({lowCount})
            </button>
            <button
              onClick={() => setFilterStatus('stable')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'stable' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Estável ({stockLevels.filter(s => s.status === 'stable').length})
            </button>
            <button
              onClick={() => setFilterStatus('high')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'high' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Alto ({stockLevels.filter(s => s.status === 'high').length})
            </button>
          </div>
        </div>

        {/* Tabela de Estoque */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Estoque por Tipo Sanguíneo</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo Sanguíneo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidades
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Atualização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStock.map((stock) => (
                  <motion.tr
                    key={stock.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Droplets className="h-5 w-5 text-red-500 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          {stock.blood_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className={`h-2 rounded-full ${getStatusColor(stock.status)}`}
                            style={{ width: `${Math.min(100, (stock.units / 100) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">
                          {stock.units} unidades
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(stock.status)}
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {getStatusText(stock.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(stock.last_updated).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingStock === stock.blood_type ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="1000"
                            value={tempUnits}
                            onChange={(e) => setTempUnits(parseInt(e.target.value) || 0)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-sm text-gray-500">unidades</span>
                          <button
                            onClick={handleSaveStock}
                            className="text-green-600 hover:text-green-800"
                            title="Salvar"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-400 hover:text-gray-600"
                            title="Cancelar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditStock(stock)}
                            className="text-primary-600 hover:text-primary-900 flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleQuickUpdate(stock.blood_type, 1)}
                            className="text-green-600 hover:text-green-800"
                            title="Adicionar 1 unidade"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleQuickUpdate(stock.blood_type, -1)}
                            className="text-red-600 hover:text-red-800"
                            title="Remover 1 unidade"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StockManagementPage;
