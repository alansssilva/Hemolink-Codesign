import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Heart, User, Calendar, MapPin, Download, Share2, QrCode } from 'lucide-react';

const DonorCard = ({ userProfile, donations = [] }) => {
  const totalDonations = donations.length;
  const lastDonation = donations.length > 0 ? donations[0] : null;
  const bloodType = userProfile?.donor_profiles?.[0]?.blood_type || 'Não informado';
  
  // Calcular nível de doador baseado no número de doações
  const getDonorLevel = (donations) => {
    if (donations >= 10) return { level: 'Ouro', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (donations >= 5) return { level: 'Prata', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    if (donations >= 1) return { level: 'Bronze', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { level: 'Iniciante', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  };

  const donorLevel = getDonorLevel(totalDonations);

  const handleDownload = () => {
    // Simular download da carteirinha
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 250;
    
    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, canvas.width, 60);
    
    // Logo area
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('HEMOLINK', 20, 35);
    
    // User info
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(userProfile?.name || 'Nome do Doador', 20, 90);
    
    ctx.font = '14px Arial';
    ctx.fillText(`Tipo Sanguíneo: ${bloodType}`, 20, 110);
    ctx.fillText(`Total de Doações: ${totalDonations}`, 20, 130);
    ctx.fillText(`Nível: ${donorLevel.level}`, 20, 150);
    
    if (lastDonation) {
      ctx.fillText(`Última Doação: ${new Date(lastDonation.date).toLocaleDateString('pt-BR')}`, 20, 170);
    }
    
    // QR Code placeholder
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(300, 80, 80, 80);
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px Arial';
    ctx.fillText('QR Code', 320, 125);
    
    // Download
    const link = document.createElement('a');
    link.download = `carteirinha-${userProfile?.name?.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Minha Carteirinha de Doador - Hemolink',
        text: `Sou doador de sangue tipo ${bloodType} e já realizei ${totalDonations} doações!`,
        url: window.location.href
      });
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-w-md mx-auto"
    >
      {/* Header da Carteirinha */}
      <div className="bg-gradient-to-r from-primary-600 to-red-600 p-6 text-white relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Droplets className="h-8 w-8" />
              <Heart className="h-4 w-4 absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h2 className="text-xl font-bold">HEMOLINK</h2>
              <p className="text-sm opacity-90">Carteirinha de Doador</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${donorLevel.bgColor} ${donorLevel.color}`}>
              {donorLevel.level}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo da Carteirinha */}
      <div className="p-6">
        {/* Informações do Doador */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{userProfile?.name}</h3>
              <p className="text-sm text-gray-600">Doador de Sangue</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Droplets className="h-4 w-4 text-red-500" />
                <span className="text-xs font-medium text-gray-600">Tipo Sanguíneo</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{bloodType}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-xs font-medium text-gray-600">Total de Doações</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{totalDonations}</p>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Estatísticas</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nível Atual</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${donorLevel.bgColor} ${donorLevel.color}`}>
                {donorLevel.level}
              </span>
            </div>
            
            {lastDonation && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Última Doação</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(lastDonation.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status</span>
              <span className="text-sm font-medium text-green-600">Ativo</span>
            </div>
          </div>
        </div>

        {/* QR Code Placeholder */}
        <div className="mb-6 text-center">
          <div className="bg-gray-100 rounded-lg p-4 inline-block">
            <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Código de Verificação</p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex space-x-3">
          <button
            onClick={handleDownload}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar
          </button>
          
          <button
            onClick={handleShare}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Esta carteirinha é válida em todos os hemocentros parceiros do Hemolink
        </p>
      </div>
    </motion.div>
  );
};

export default DonorCard;

