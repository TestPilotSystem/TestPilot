echo "Esperando a que la base de datos esté lista..."

echo "Ejecutando instalación de base de datos..."
npm run db:install

echo "Arrancando Next.js..."
npm run dev