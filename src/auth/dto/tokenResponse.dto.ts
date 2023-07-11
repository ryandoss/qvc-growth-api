import { ApiProperty } from '@nestjs/swagger';

export class TokensResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzZnNmMjNyMjM0MjNmZHdlZncyMzI0IiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.VnyvZ6INABHGYqdBRsy1A4g3fA44Pp5w-l00lLdIVcY',
  })
  accessToken!: string;
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzZnNmMjNyMjM0MjNmZHdlZncyMzI0IiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.VnyvZ6INABHGYqdBRsy1A4g3fA44Pp5w-l00lLdIVcY',
  })
  refreshToken!: string;
}
