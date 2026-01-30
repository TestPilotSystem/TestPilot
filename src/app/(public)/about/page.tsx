'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-50 via-orange-50 to-yellow-50 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-16">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center relative"
        >
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-yellow-200/30 rounded-full blur-[100px] -z-10" />

          <h1 className="text-5xl font-extrabold pb-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-700 sm:text-6xl mb-6 tracking-tight">
            Sobre TestPilot
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Innovando en la educación vial con <span className="text-yellow-700 font-semibold">inteligencia artificial</span> para un futuro más seguro.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8 md:p-12 hover:shadow-2xl transition-all duration-300 group"
        >
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="leading-relaxed group-hover:text-gray-700 transition-colors">
              TestPilot es un sistema diseñado para demostrar cómo se pueden usar de manera inteligente las nuevas herramientas de generación basadas en inteligencia artificial para hacer el estudio más <span className="font-semibold text-yellow-700">ameno, eficiente y efectivo</span>.
            </p>
            <p className="mt-6 leading-relaxed">
              Se trata de un Trabajo de Fin de Grado diseñado en un entorno limitado que sirve como prototipo escalable, explorando el potencial de la IA generativa para transformar la formación de nuevos conductores.
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300"
        >
          <div className="md:flex items-center">
            <div className="md:shrink-0 p-10 md:w-72 flex items-center justify-center">
              <div className="relative h-48 w-48 shadow-xl rounded-full border-4 border-white overflow-hidden transform hover:scale-105 transition-transform duration-300">
                <Image 
                   src="/developerProfile.jpg" 
                   alt="Jesús Sánchez Quirós"
                   fill
                   className="object-cover"
                 />
              </div>
            </div>
            
            <div className="p-8 md:p-12 flex-1">
              <div className="uppercase tracking-wide text-sm text-yellow-600 font-bold mb-2">Desarrollador</div>
              <h2 className="block text-3xl leading-tight font-bold text-gray-900 mb-2">Jesús Sánchez Quirós</h2>
              <p className="text-gray-500 font-medium mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Estudiante de Ingeniería del Software (US)
              </p>
              
              <p className="mt-4 text-gray-600 leading-relaxed">
                Tengo 21 años y me apasiona el mundo del desarrollo. Estoy profundamente interesado en estudiar cómo podemos aplicar de manera efectiva y responsable las nuevas tecnologías para resolver problemas reales.
              </p>
            </div>
          </div>
        </motion.div>

         <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center pt-8"
         >
            <p className="text-gray-500 text-sm font-medium">
              Diseñado como TFG para uso académico
            </p>
         </motion.div>

      </div>
    </main>
  );
};

export default AboutPage;
