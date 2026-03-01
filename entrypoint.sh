#!/bin/sh
set -e

echo "Esperando a que la base de datos esté lista..."
MAX_RETRIES=30
RETRY_COUNT=0
until npx prisma migrate deploy 2>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "Error: No se pudo conectar a la base de datos después de $MAX_RETRIES intentos."
    exit 1
  fi
  echo "Base de datos no disponible (intento $RETRY_COUNT/$MAX_RETRIES). Reintentando en 2s..."
  sleep 2
done
echo "Migraciones aplicadas correctamente."

echo "Comprobando si la base de datos necesita seed..."
USER_COUNT=$(node -e "
  const { PrismaClient } = require('@prisma/client');
  const p = new PrismaClient();
  p.user.count().then(c => { console.log(c); p.\$disconnect(); });
" 2>/dev/null || echo "0")

if [ "$USER_COUNT" = "0" ]; then
  echo "Base de datos vacía. Ejecutando seed..."
  npm run db:seed
else
  echo "Base de datos ya tiene datos ($USER_COUNT usuarios). Omitiendo seed."
fi

echo "Arrancando Next.js..."
exec npm run dev