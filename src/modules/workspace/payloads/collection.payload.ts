import {
  IsString,
  IsMongoId,
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsEnum,
  ValidateNested,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import {
  ItemTypeEnum,
  QueryParams,
  RequestBody,
} from "@src/modules/common/models/collection.model";
import { HTTPMethods } from "fastify";
import { Type } from "class-transformer";

export class collectionItemsRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  method: HTTPMethods;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;

  @ValidateNested({ each: true })
  @Type(() => RequestBody)
  @ApiProperty({ type: RequestBody })
  @IsOptional()
  body?: RequestBody;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QueryParams)
  @IsOptional()
  @ApiProperty({ isArray: true, type: QueryParams })
  queryParams?: QueryParams[];
}

export class createCollectionItemsDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsEnum(ItemTypeEnum)
  type: ItemTypeEnum;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => createCollectionItemsDto)
  @ApiProperty({ isArray: true, type: createCollectionItemsDto })
  @IsOptional()
  items?: createCollectionItemsDto[];

  @ValidateNested({ each: true })
  @Type(() => collectionItemsRequestDto)
  @ApiProperty({ type: collectionItemsRequestDto })
  @IsOptional()
  request?: collectionItemsRequestDto;
}
export class CreateCollectionDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  workspaceId: string;
}

export class UpdateCollectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class ImportCollectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;
}
