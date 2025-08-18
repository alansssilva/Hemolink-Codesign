import React from 'react';
import { Droplets, AlertTriangle } from 'lucide-react';
import { BloodType } from '../types';

interface BloodTypeCardProps {
  bloodData: BloodType;
}

export const BloodTypeCard: React.FC<BloodTypeCardProps> = ({ bloodData }) => {
  const { type, quantity, minQuantity } = bloodData;
  
  const getStatusColor = () => {
    if (quantity <= minQuantity * 0.5) return 'text-red-600 bg-red-50 border-red-200';
    if (quantity <= minQuantity) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusText = () => {
    if (quantity <= minQuantity * 0.5) return 'Crítico';
    if (quantity <= minQuantity) return 'Baixo';
    return 'Normal';
  };

  const needsAttention = quantity <= minQuantity;

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 border-2 transition-all hover:shadow-lg ${
      needsAttention ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${
            needsAttention ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            <Droplets className={`h-6 w-6 ${
              needsAttention ? 'text-red-600' : 'text-blue-600'
            }`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{type}</h3>
            <p className="text-sm text-gray-600">Tipo Sanguíneo</p>
          </div>
        </div>
        {needsAttention && (
          <AlertTriangle className="h-5 w-5 text-red-500" />
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Estoque atual:</span>
          <span className="font-semibold text-lg">{quantity}L</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Mínimo necessário:</span>
          <span className="font-medium">{minQuantity}L</span>
        </div>

        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Nível:</span>
            <span className={`text-sm font-medium px-2 py-1 rounded-full border ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                quantity <= minQuantity * 0.5 ? 'bg-red-500' :
                quantity <= minQuantity ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ 
                width: `${Math.min(100, (quantity / (minQuantity * 2)) * 100)}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};