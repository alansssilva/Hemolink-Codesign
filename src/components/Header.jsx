import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Droplets, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative">
              <Droplets className="h-8 w-8 text-primary-600 group-hover:text-primary-700 transition-colors" />
              <Heart className="h-4 w-4 text-primary-500 absolute -bottom-1 -right-1 group-hover:text-primary-600 transition-colors" />
            </div>
            <span className="text-xl font-bold text-gray-900">Hemolink</span>
            <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">SaaS</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
  <Link
    to={{ pathname: "/", hash: "#como-funciona" }}
    className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
  >
    Como Funciona
  </Link>
  <Link
    to={{ pathname: "/", hash: "#beneficios" }}
    className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
  >
    Benefícios
  </Link>
  <Link
    to={{ pathname: "/", hash: "#contato" }}
    className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
  >
    Contato
  </Link>
  <Link 
    to="/login/type" 
    className="text-primary-600 hover:text-primary-700 transition-colors font-medium"
  >
    Login
  </Link>
  <Link 
    to="/register" 
    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
  >
    Cadastrar
  </Link>
</nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 py-4"
            >
              <nav className="flex flex-col space-y-4">
                <a 
                  href="#como-funciona" 
                  className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Como Funciona
                </a>
                <a 
                  href="#beneficios" 
                  className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Benefícios
                </a>
                <a 
                  href="#contato" 
                  className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contato
                </a>
                <Link 
                  to="/login/type" 
                  className="text-primary-600 hover:text-primary-700 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cadastrar
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
