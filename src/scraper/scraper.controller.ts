import { Controller, Get, Param } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
  refs,
} from '@nestjs/swagger';
import { ProcessIdDTO, ProductDTO } from './dto/product.dto';

@Controller()
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @ApiOperation({ summary: 'Returns a list of supported manufacturers' })
  @ApiOkResponse({
    description: 'Array of supported manufacturers',
    type: [String],
  })
  @Get('/manufacturers')
  getManufacturers() {
    return this.scraperService.getManufacturers();
  }

  @ApiOperation({ summary: 'Returns a list of supported manufacturers' })
  @ApiExtraModels(ProductDTO, ProcessIdDTO)
  @ApiBadRequestResponse({
    description:
      'If process of scraping is in progress this error will be thrown with the process id',
  })
  @ApiNotFoundResponse({
    description: 'If manufacturer is not supported this error will be thrown.',
  })
  @ApiOkResponse({
    description: 'Array of products or a process ID',
    schema: {
      anyOf: [
        {
          type: 'array',
          items: { $ref: getSchemaPath(ProductDTO) },
        },
        { $ref: getSchemaPath(ProcessIdDTO) },
      ],
    },
  })
  @Get('/manufacturer/:name')
  getManufacturer(@Param('name') name: string) {
    return this.scraperService.getManufacturerProducts(name);
  }
}
