import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Stethoscope, Droplets, Heart, ArrowLeft } from 'lucide-react';

const LoginTypePage = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-medical-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center relative"
      >
        <Link to="/" className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>

        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="relative">
            <Droplets className="h-10 w-10 text-primary-600" />
            <Heart className="h-5 w-5 text-primary-500 absolute -bottom-1 -right-1" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Hemolink</h1>
        </div>

        <p className="text-gray-600 mb-8 text-lg">Selecione seu tipo de login</p>

        <div className="space-y-6">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <Link
              to="/login/donor"
              className="flex items-center justify-center p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-primary-50 hover:bg-primary-100 group"
            >
              <User className="h-7 w-7 text-primary-600 mr-4 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-semibold text-gray-800 group-hover:text-primary-700">Doador</span>
            </Link>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/login/professional"
              className="flex items-center justify-center p-5 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-medical-50 hover:bg-medical-100 group"
            >
              <Stethoscope className="h-7 w-7 text-medical-600 mr-4 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-semibold text-gray-800 group-hover:text-medical-700">Profissional</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginTypePage;

