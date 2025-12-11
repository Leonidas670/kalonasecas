import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Prisma shutdown
  const prisma = app.get(PrismaService);
  prisma.enableShutdownHooks(app);
  
  // CORS - Configuración para producción
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://kalonasecas.vercel.app',
      'https://kalonitinere.site',
      'kalonasecas-2jlg.vercel.app',
      /\.vercel\.app$/, // Permite todos los subdominios de vercel.app (para preview deployments)
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  
  // Static /uploads
  const uploadsPath = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsPath)) mkdirSync(uploadsPath, { recursive: true });
  app.useStaticAssets(uploadsPath, { prefix: '/uploads/' });
  
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || '0.0.0.0';
  
  await app.listen(PORT, HOST);
  const url = await app.getUrl();
  console.log(`🚀 Backend corriendo en ${url}`);
}

bootstrap();
