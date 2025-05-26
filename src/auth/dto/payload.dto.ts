export class PayloadDto {
  userId: number;
  email: string;
  role: {
    id: number;
    name: string;
  };
}
