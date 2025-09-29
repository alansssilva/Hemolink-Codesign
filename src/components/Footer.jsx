import { Droplets, Facebook, Heart, Instagram, Mail, MapPin, Phone, Twitter, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import logoFaculdade from '../assets/logo-camposcentro-horizontal-branco.png';
import logoHemolink from '../assets/Logo Branca.png';

const termsText = `
**Termos de Uso**

Bem-vindo ao Hemolink! Ao utilizar nossa plataforma, você concorda com os seguintes termos:
- O Hemolink destina-se exclusivamente à gestão de doações de sangue e comunicação entre hemocentros e doadores.
- É proibido o uso da plataforma para fins ilícitos ou que violem leis vigentes.
- Os dados fornecidos devem ser verdadeiros e atualizados.
- Reservamo-nos o direito de suspender contas que violem estes termos.
- O uso contínuo da plataforma implica aceitação integral destes termos.
`;

const privacyText = `
**Política de Privacidade**

O Hemolink valoriza sua privacidade. Ao utilizar nossos serviços:
- Coletamos apenas dados necessários para cadastro, comunicação e gestão de doações.
- Seus dados não serão compartilhados com terceiros sem consentimento, exceto quando exigido por lei.
- Utilizamos medidas de segurança para proteger suas informações.
- Você pode solicitar a exclusão ou alteração de seus dados a qualquer momento.
- Ao continuar usando o Hemolink, você concorda com esta política.
`;

const Footer = () => {
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src={logoHemolink}
                alt="Hemolink"
                className="h-8 w-auto"
                style={{ maxWidth: 160 }}
              />
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Conexão através do sangue. Gestão inteligente para salvar vidas.
              Plataforma completa para hemocentros e doadores.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/hemolink_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
            <div className="flex justify-start mt-6">
              <img
                src={logoFaculdade}
                alt="Logo da Faculdade"
                className="h-12 w-auto opacity-80"
                style={{ maxWidth: 140 }}
              />
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to={{ pathname: "/", hash: "#como-funciona" }} className="text-gray-300 hover:text-white transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link to={{ pathname: "/", hash: "#beneficios" }} className="text-gray-300 hover:text-white transition-colors">
                  Benefícios
                </Link>
              </li>
              <li>
                <Link to="/login/type" className="text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
                  Cadastrar
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary-400" />
                <span className="text-gray-300">hemolink@gsuite.iff.edu.br</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary-400" />
                <span className="text-gray-300">(22) 9999-9999</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary-400" />
                <span className="text-gray-300">Campos do Goytacazes, RJ</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Hemolink SaaS. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button
              onClick={() => setModal('terms')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
              type="button"
            >
              Termos de Uso
            </button>
            <button
              onClick={() => setModal('privacy')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
              type="button"
            >
              Política de Privacidade
            </button>
          </div>
        </div>
      </div>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-8 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-primary-600 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {modal === 'terms' ? 'Termos de Uso' : 'Política de Privacidade'}
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700 whitespace-pre-line">
              {modal === 'terms' ? termsText : privacyText}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
