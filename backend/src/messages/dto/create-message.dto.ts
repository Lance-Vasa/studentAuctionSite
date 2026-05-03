import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  receiver_id?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;
}
