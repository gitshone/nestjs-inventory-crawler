import { IScraperProvider } from '../interface/scraper-provider.interface';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import { ProductDTO } from '../dto/product.dto';

@Injectable()
export class LenovoProvider implements IScraperProvider {
  private readonly logger = new Logger(LenovoProvider.name);

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
        'https://www.lenovo.com/us/en/p/laptops/thinkpad/thinkpadt/thinkpad-t14s-g2/22tpt14t4s2',
        { waitUntil: 'networkidle2' },
      );

      const productListSelector = '.product_item';
      await page.waitForSelector(productListSelector);

      const products = await page.evaluate(() => {
        const productElements = Array.from(
          document.querySelectorAll('.product_item'),
        );
        return productElements.map((productElement) => {
          const titleElement = productElement.querySelector('.product_title');
          const imageElement = productElement.querySelector(
            '.card_product_image img',
          );
          const priceElement = productElement.querySelector('.final-price');
          const specificationElement =
            productElement.querySelector('.key_details');

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
