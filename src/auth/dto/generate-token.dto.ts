export class GenerateTokenDto {
  email: string;
  id: number;
  role: {
    id?: number;
    name?: string;
  };
}
