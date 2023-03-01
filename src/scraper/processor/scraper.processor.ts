import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Cache } from 'cache-manager';
import { IScraperProvider } from '../interface/scraper-provider.interface';
import { CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { ScraperProviderFactory } from '../factory/scraper-provider.factory';

@Processor('scraper')
export class ScraperProcessor {
  private readonly logger = new Logger(ScraperProcessor.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private scraperProviderFactory: ScraperProviderFactory,
  ) {}

  @Process()
  async handleGetProducts(job: Job<{ manufacturer: string }>) {
    try {
      const { manufacturer } = job.data;

      const provider: IScraperProvider =
        await this.scraperProviderFactory.getProvider(manufacturer);

      if (provider) {
        const result = await provider.retrieveProducts();

        await this.cacheManager.set(manufacturer, result);

        return result;
      }
    } catch (err) {
      this.logger.error('Error while scraping products', err);
    }
  }
}
