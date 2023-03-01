import { ProductDTO } from '../dto/product.dto';

export interface IScraperProvider {
  retrieveProducts(): Promise<ProductDTO[]>;
}
