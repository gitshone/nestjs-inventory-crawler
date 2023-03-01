import { IScraperProvider } from '../interface/scraper-provider.interface';
import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { ConfigService } from '@nestjs/config';
import { ProductDTO } from '../dto/product.dto';

@Injectable()
export class AsusProvider implements IScraperProvider {
  private readonly logger = new Logger(AsusProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async retrieveProducts(): Promise<ProductDTO[]> {
    try {
      const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser',
        headless: true,
        args: ['--no-sandbox'],
      });
      const page = await browser.newPage();

      await page.goto(
        'https://www.asus.com/us/laptops/for-home/proart-studiobook/filter?Series=ProArt-Studiobook',
        { waitUntil: 'networkidle2' },
      );

      const productListSelector = '.filter_product_list';
      await page.waitForSelector(productListSelector);

      const products = await page.evaluate(() => {
        const productElements = Array.from(
          document.querySelectorAll('.filter_product_list'),
        );
        return productElements.map((productElement) => {
          const titleElement = productElement.querySelector(
            '.ProductCardNormalStore__headingRow__33zg8 h2',
          );
          const imageElement = productElement.querySelector(
            '.ProductCardNormalStore__imageWrapper__3kSit img',
          );
          const priceElement = productElement.querySelector(
            '.ProductCardNormalStore__price__1-alX',
          );
          const specificationElement =
            productElement.querySelector('.itemModelSpec');

          const title = titleElement ? titleElement.textContent.trim() : null;
          const image = imageElement ? imageElement.getAttribute('src') : null;
          const price = priceElement ? priceElement.textContent.trim() : null;
          const specification = specificationElement
            ? specificationElement.textContent.trim()
            : null;

          return { title, image, price, specification };
        });
      });

      await browser.close();

      return products;
    } catch (err) {
      this.logger.error('There was an issue while scraping data', err);
      return null;
    }
  }
}
