import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IScraperProvider } from '../interface/scraper-provider.interface';
import { ScraperManufacturerListEnum } from '../enum/scraper.enum';
import { AsusProvider } from '../provider/asus.provider';
import { LgProvider } from '../provider/lg.provider';
import { LenovoProvider } from '../provider/lenovo.provider';

@Injectable()
export class ScraperProviderFactory {
  constructor(private moduleRef: ModuleRef) {}

  async getProvider(manufacturer: string): Promise<IScraperProvider> {
    switch (manufacturer) {
      case ScraperManufacturerListEnum.Asus:
        return await this.moduleRef.resolve(AsusProvider);
      case ScraperManufacturerListEnum.LG:
        return await this.moduleRef.resolve(LgProvider);
      case ScraperManufacturerListEnum.Lenovo:
        return await this.moduleRef.resolve(LenovoProvider);
      default:
        return null;
    }
  }
}
