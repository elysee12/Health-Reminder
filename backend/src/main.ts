import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  try {
    // Set timezone to Rwanda (CAT - UTC+2)
    process.env.TZ = 'Africa/Kigali';
    
    const app = await NestFactory.create(AppModule);
    
    app.setGlobalPrefix('api');
    
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    app.use((cookieParser as any).default ? (cookieParser as any).default() : cookieParser());

    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://health-reminder-td0u.onrender.com',
      'http://localhost:8080',
    ].filter(Boolean);

    app.enableCors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`CORS blocked for origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    await app.listen(process.env.PORT ?? 3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
    console.log(`Timezone: ${process.env.TZ || 'system default'}`);
  } catch (error) {
    console.error('Bootstrap failed:', error);
    process.exit(1);
  }
}
bootstrap();
