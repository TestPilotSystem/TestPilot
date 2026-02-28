'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <main className="min-h-screen bg-[#0F172A] pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-16">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center relative"
        >
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand/20 rounded-full blur-[100px] -z-10" />

          <h1 className="text-5xl font-extrabold pb-2 bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent-light sm:text-6xl mb-6 tracking-tight">
            Sobre TestPilot
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Innovando en la educación vial con <span className="text-brand-light font-semibold">inteligencia artificial</span> para un futuro más seguro.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-surface/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-700/50 p-8 md:p-12 hover:border-slate-600 transition-all duration-300 group"
        >
          <div className="prose prose-lg max-w-none text-slate-400">
            <p className="leading-relaxed group-hover:text-slate-300 transition-colors">
              TestPilot es un sistema diseñado para demostrar cómo se pueden usar de manera inteligente las nuevas herramientas de generación basadas en inteligencia artificial para hacer el estudio más <span className="font-semibold text-brand-light">ameno, eficiente y efectivo</span>.
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
            <p className="text-slate-500 text-sm font-medium">
              Diseñado como TFG para uso académico
            </p>
         </motion.div>

      </div>
    </main>
  );
};

export default AboutPage;
