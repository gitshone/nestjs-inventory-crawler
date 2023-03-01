import { CacheModule, Module } from '@nestjs/common';
import { scraperProviders } from './provider/scraper.provider';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScraperProcessor } from './processor/scraper.processor';
import { ScraperProviderFactory } from './factory/scraper-provider.factory';

@Module({
  imports: [
    CacheModule.register(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'scraper',
    }),
  ],
  controllers: [ScraperController],
  providers: [
    ScraperService,
    ScraperProcessor,
    ScraperProviderFactory,
    ...scraperProviders,
  ],
})
export class ScraperModule {}
