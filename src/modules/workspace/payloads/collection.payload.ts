import {
  IsNumber,
  IsPositive,
  IsString,
  IsMongoId,
  IsOptional,
  IsNotEmpty,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class collectionItemQueryParamsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;
}
export class collectionItemsRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  method: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @ApiProperty({ isArray: true, type: collectionItemQueryParamsDto })
  queryParams?: collectionItemQueryParamsDto[];
}
export class createCollectionItemsObjDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ type: collectionItemsRequestDto })
  @IsNotEmpty()
  request: collectionItemsRequestDto;
}
export class createCollectionItemsDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty({ isArray: true, type: createCollectionItemsObjDto })
  @IsNotEmpty()
  items: createCollectionItemsObjDto[];
}
export class CreateCollectionDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  totalRequest: number;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  workspaceId: string;

  @ApiProperty({ isArray: true, type: createCollectionItemsDto })
  @IsNotEmpty()
  items: createCollectionItemsDto[];
}
