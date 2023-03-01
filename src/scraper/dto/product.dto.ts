import { ApiProperty } from '@nestjs/swagger';

export class ProductDTO {
  @ApiProperty()
  title: string;

  @ApiProperty()
  price?: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  specification?: string;
}

export class ProcessIdDTO {
  @ApiProperty()
  processId: string;
}
