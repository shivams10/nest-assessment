import { IsBoolean } from 'class-validator';

export class ToggleNextRoundDto {
  @IsBoolean()
  selectedForNextRound: boolean;
}
