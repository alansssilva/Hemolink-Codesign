import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, BarChart3, TrendingUp, Users, Calendar, Filter } from 'lucide-react';

const ReportsModal = ({ isOpen, onClose, reportsData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedReport, setSelectedReport] = useState('overview');

  if (!isOpen) return null;

  const generateReport = () => {
    // Simular geração de relatório
    const mockData = {
      overview: {
        title: 'Relatório Geral',
        data: {
          totalDonations: 156,
          totalDonors: 89,
          averageDonations: 1.75,
          criticalStock: 2
        }
      },
      donations: {
        title: 'Relatório de Doações',
        data: {
          daily: [12, 15, 8, 20, 18, 14, 16],
          weekly: [85, 92, 78, 105, 98, 87, 95],
          monthly: [156, 142, 168, 189, 175, 198]
        }
      },
      stock: {
        title: 'Relatório de Estoque',
        data: {
          critical: ['O-', 'B-'],
          low: ['O+', 'A-'],
          stable: ['A+', 'AB+', 'AB-'],
          high: ['B+']
        }
      }
    };

    return mockData[selectedReport] || mockData.overview;
  };

  const currentReport = generateReport();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-primary-600" />
            Relatórios
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="overview">Visão Geral</option>
                <option value="donations">Doações</option>
                <option value="stock">Estoque</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="365">Último ano</option>
              </select>
            </div>
          </div>

          {/* Conteúdo do Relatório */}
          <div className="space-y-6">
            {selectedReport === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total de Doações</p>
                      <p className="text-2xl font-bold text-blue-900">{currentReport.data.totalDonations}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Doadores Únicos</p>
                      <p className="text-2xl font-bold text-green-900">{currentReport.data.totalDonors}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Média por Doador</p>
                      <p className="text-2xl font-bold text-purple-900">{currentReport.data.averageDonations}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">Estoque Crítico</p>
                      <p className="text-2xl font-bold text-red-900">{currentReport.data.criticalStock}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-red-500" />
                  </div>
                </div>
              </div>
            )}

            {selectedReport === 'donations' && (
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Doações por Dia</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {currentReport.data.daily.map((count, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][index]}
                        </div>
                        <div className="bg-primary-100 rounded p-2">
                          <div className="text-sm font-semibold text-primary-900">{count}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedReport === 'stock' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Crítico</h4>
                  <div className="space-y-1">
                    {currentReport.data.critical.map(type => (
                      <div key={type} className="text-sm text-red-700">• {type}</div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Baixo</h4>
                  <div className="space-y-1">
                    {currentReport.data.low.map(type => (
                      <div key={type} className="text-sm text-yellow-700">• {type}</div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Estável</h4>
                  <div className="space-y-1">
                    {currentReport.data.stable.map(type => (
                      <div key={type} className="text-sm text-green-700">• {type}</div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Alto</h4>
                  <div className="space-y-1">
                    {currentReport.data.high.map(type => (
                      <div key={type} className="text-sm text-blue-700">• {type}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                // Simular download
                alert('Relatório baixado com sucesso!');
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportsModal;

