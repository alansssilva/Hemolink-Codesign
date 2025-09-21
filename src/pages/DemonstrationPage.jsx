import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const demoImages = [
  {
    src: '/demo-dashboard.png', // Substitua pelo caminho real da imagem
    alt: 'Dashboard do Hemocentro',
    caption: 'Dashboard de Gestão de Estoque em Tempo Real'
  },
  {
    src: '/demo-campanha.png', // Substitua pelo caminho real da imagem
    alt: 'Campanha de Doação',
    caption: 'Gestão de Campanhas de Doação'
  },
  {
    src: '/demo-doadores.png', // Substitua pelo caminho real da imagem
    alt: 'Lista de Doadores',
    caption: 'Consulta de Doadores e Histórico de Doações'
  }
];

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const DemonstrationPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-medical-50">
      <Header />

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 py-16">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Demonstração do Hemolink
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Veja como a plataforma Hemolink pode transformar a gestão do seu hemocentro e facilitar a conexão com doadores. Explore abaixo algumas telas e funcionalidades principais do sistema.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {demoImages.map((img, idx) => (
              <motion.div
                key={img.src}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="rounded-lg mb-4 w-full h-48 object-cover border border-gray-100"
                  style={{ background: '#f3f4f6' }}
                />
                <span className="text-gray-800 font-medium text-center">{img.caption}</span>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeInUp} className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-primary-600 mb-2">Pronto para modernizar seu hemocentro?</h2>
            <p className="text-gray-700 mb-6">
              Entre em contato conosco para uma demonstração personalizada e descubra todos os benefícios do Hemolink para sua equipe e para os doadores.
            </p>
            <a
              href="#contato"
              className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors"
            >
              Solicitar Demonstração
            </a>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DemonstrationPage;