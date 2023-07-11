export class JwtDto {
  userId!: string;
  /**
   * Issued at
   */
  iat!: number;
  /**
   * Expiration time
   */
  exp!: number;
}
