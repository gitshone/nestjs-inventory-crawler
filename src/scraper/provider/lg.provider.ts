import { IScraperProvider } from '../interface/scraper-provider.interface';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import { ProductDTO } from '../dto/product.dto';

@Injectable()
export class LgProvider implements IScraperProvider {
  private readonly logger = new Logger(LgProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async retrieveProducts(): Promise<ProductDTO[]> {
    try {
      const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser',
        headless: true,
        args: ['--no-sandbox'],
      });
      const page = await browser.newPage();

      await page.goto('https://www.lg.com/us/tvs', {
        waitUntil: 'networkidle2',
      });

      page.setDefaultNavigationTimeout(60000);

      const productListSelector = '.list-box li';
      await page.waitForSelector(productListSelector);

      const products = await page.evaluate(() => {
        const productElements = Array.from(
          document.querySelectorAll('.list-box li'),
        );
        return productElements.map((productElement) => {
          const titleElement = productElement.querySelector('.model-name');
          const imageElement = productElement.querySelector('.visual img');
          const priceElement = productElement.querySelector('.price');
          const specificationElement = productElement.querySelector(
            '.series-item-card_points ',
          );

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
