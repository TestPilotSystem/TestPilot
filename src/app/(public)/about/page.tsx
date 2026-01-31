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
