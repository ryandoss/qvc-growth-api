import { ApiProperty } from '@nestjs/swagger';
import { Dto } from 'src/common/dto/dto';

export class JobResponseDto extends Dto<JobResponseDto> {
  @ApiProperty({ example: 'cldt7idk8000008l746tgdjce' })
  id!: string;
  @ApiProperty({ example: new Date() })
  createdAt!: Date;
  @ApiProperty({ example: new Date() })
  updatedAt!: Date;
  @ApiProperty({ example: true })
  published!: boolean;
  @ApiProperty({ example: 'Title' })
  title!: string;
  @ApiProperty({ example: 'Description' })
  description!: string | null;
  @ApiProperty({ example: 'cldt7idk8000008l746tgdjce' })
  ownerId!: string | null;
}
