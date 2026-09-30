import { PrismaClient } from '@prisma/client';
import { ENV } from './env.js';

// Initialize single PrismaClient instance
const prismaGlobal = global as typeof global & {
  prisma?: PrismaClient;
};

export const prisma =
  prismaGlobal.prisma ||
  new PrismaClient({
    log: ENV.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (ENV.NODE_ENV !== 'production') {
  prismaGlobal.prisma = prisma;
}

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL Database connected successfully via Prisma');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    console.warn('⚠️ Please ensure DATABASE_URL in server/.env is pointing to a live PostgreSQL database (Neon / Supabase / Local PostgreSQL)');
  }
}
