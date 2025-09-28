import React from 'react';
import { motion } from 'framer-motion';
import { X, Download, Share2, QrCode, Award, Trophy, Star } from 'lucide-react';
import DonorCard from './DonorCard';


const DonorCardModal = ({ isOpen, onClose, userProfile, donations = [] }) => {
  if (!isOpen) return null;

  const totalDonations = donations.length;
  
  // Calcular conquistas baseadas no número de doações
  const getAchievements = (donations) => {
    const achievements = [];
    
    if (donations >= 1) {
      achievements.push({
        icon: <Star className="h-6 w-6 text-yellow-500" />,
        title: 'Primeira Doação',
        description: 'Você deu o primeiro passo para salvar vidas!',
        unlocked: true
      });
    }
    
    if (donations >= 3) {
      achievements.push({
        icon: <Award className="h-6 w-6 text-blue-500" />,
        title: 'Doador Frequente',
        description: '3 doações realizadas! Continue assim!',
        unlocked: true
      });
    }
    
    if (donations >= 5) {
      achievements.push({
        icon: <Trophy className="h-6 w-6 text-orange-500" />,
        title: 'Herói da Vida',
        description: '5 doações! Você é um verdadeiro herói!',
        unlocked: true
      });
    }
    
    if (donations >= 10) {
      achievements.push({
        icon: <Trophy className="h-6 w-6 text-yellow-500" />,
        title: 'Lenda do Hemolink',
        description: '10 doações! Você é uma lenda!',
        unlocked: true
      });
    }
    
    return achievements;
  };

  const achievements = getAchievements(totalDonations);

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
            <QrCode className="h-6 w-6 mr-2 text-primary-600" />
            Minha Carteirinha Digital
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Carteirinha */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sua Carteirinha</h3>
              <DonorCard userProfile={userProfile} donations={donations} />
            </div>

            {/* Conquistas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Suas Conquistas</h3>
              
              {achievements.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Nenhuma conquista ainda</p>
                  <p className="text-sm text-gray-500">
                    Realize sua primeira doação para desbloquear conquistas!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {achievement.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {achievement.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Desbloqueada
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Próximas Conquistas */}
              <div className="mt-8">
                <h4 className="text-md font-semibold text-gray-700 mb-3">Próximas Conquistas</h4>
                <div className="space-y-3">
                  {totalDonations < 3 && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Award className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Doador Frequente</p>
                          <p className="text-xs text-gray-500">3 doações (faltam {3 - totalDonations})</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {totalDonations < 5 && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Trophy className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Herói da Vida</p>
                          <p className="text-xs text-gray-500">5 doações (faltam {5 - totalDonations})</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {totalDonations < 10 && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Trophy className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Lenda do Hemolink</p>
                          <p className="text-xs text-gray-500">10 doações (faltam {10 - totalDonations})</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DonorCardModal;

