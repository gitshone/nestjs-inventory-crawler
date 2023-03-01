import {
  BadRequestException,
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ScraperManufacturerListEnum } from './enum/scraper.enum';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cache } from 'cache-manager';
import { ScraperProviderFactory } from './factory/scraper-provider.factory';
import { ProcessIdDTO, ProductDTO } from './dto/product.dto';

@Injectable()
export class ScraperService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue('scraper') private readonly scraperQueue: Queue,
    private moduleRef: ModuleRef,
    private scraperProviderFactory: ScraperProviderFactory,
  ) {}

  getManufacturers(): string[] {
    return Object.values(ScraperManufacturerListEnum).map((manufacturer) =>
      manufacturer.toString(),
    );
  }

  async getManufacturerProducts(
    manufacturer: string,
  ): Promise<ProductDTO[] | ProcessIdDTO> {
    const cachedResult: ProductDTO[] = await this.cacheManager.get(
      manufacturer,
    );

    if (cachedResult) {
      return cachedResult;
    }

    const provider = await this.scraperProviderFactory.getProvider(
      manufacturer,
    );

    if (!provider) {
      throw new NotFoundException(
        `Provider not found for manufacturer '${manufacturer}'`,
      );
    }

    const jobs = await this.scraperQueue.getJobs(['waiting', 'active']);
    const job = jobs.find((j) => j.data.manufacturer === manufacturer);

    if (job) {
      throw new BadRequestException(
        `There is already a job (id: ${job.id}) for ${manufacturer} scraping data, please wait for it to complete!`,
      );
    }

    const queue = await this.scraperQueue.add(
      {
        manufacturer,
        provider,
      },
      { priority: 1 },
    );

    return {
      processId: String(queue.id),
    };
  }
}
