import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { HTTPMethods } from "fastify";
import { SchemaObject } from "@src/modules/common/models/openapi303.model";
import { ApiProperty } from "@nestjs/swagger";
import {
  BodyModeEnum,
  ItemTypeEnum,
} from "@src/modules/common/models/collection.model";

// eslint-disable-next-line @typescript-eslint/no-unused-vars

export class CollectionRequestBody {
  @ApiProperty()
  @IsEnum(BodyModeEnum)
  @IsNotEmpty()
  type: BodyModeEnum;

  @ApiProperty()
  @IsNotEmpty()
  schema?: SchemaObject;
}

export class Params {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  required: boolean;

  @ApiProperty()
  @IsNotEmpty()
  schema: SchemaObject;
}

export class CollectionRequestMetaData {
  @ApiProperty()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  method: HTTPMethods;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  operationId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ type: [CollectionRequestBody] })
  @Type(() => CollectionRequestBody)
  @ValidateNested({ each: true })
  @IsOptional()
  body?: CollectionRequestBody[];

  @ApiProperty({ type: [Params] })
  @IsArray()
  @Type(() => Params)
  @ValidateNested({ each: true })
  @IsOptional()
  queryParams?: Params[];

  @ApiProperty({ type: [Params] })
  @IsArray()
  @Type(() => Params)
  @ValidateNested({ each: true })
  @IsOptional()
  pathParams?: Params[];

  @ApiProperty({ type: [Params] })
  @IsArray()
  @Type(() => Params)
  @ValidateNested({ each: true })
  @IsOptional()
  headers?: Params[];
}

export class CollectionRequestItem {
  @ApiProperty()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsEnum(ItemTypeEnum)
  @IsNotEmpty()
  type: ItemTypeEnum;

  @ApiProperty({ type: [CollectionRequestItem] })
  @ValidateNested({ each: true })
  @Type(() => CollectionRequestItem)
  @IsOptional()
  items?: CollectionRequestItem;

  @ApiProperty({ type: CollectionRequestMetaData })
  @IsOptional()
  @Type(() => CollectionRequestMetaData)
  request?: CollectionRequestMetaData;
}

export class CollectionRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalRequests: number;

  @ApiProperty({ type: [CollectionRequestItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollectionRequestItem)
  items: CollectionRequestItem[];

  @IsOptional()
  @IsDateString()
  createdAt?: Date;

  @IsOptional()
  @IsDateString()
  updatedAt?: Date;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  createdBy?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  updatedBy?: string;
}

export class QueryParams {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CollectionRequestDto {
  @IsString()
  @IsNotEmpty()
  collectionId: string;

  @IsString()
  @IsNotEmpty()
  workspaceId: string;

  @IsString()
  @IsOptional()
  folderId: string;

  @Type(() => CollectionRequestItem)
  @ValidateNested({ each: true })
  collectionDto?: CollectionRequestItem;
}

export class FolderPayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;
}

export class FolderDto {
  @IsString()
  @IsOptional()
  folderId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  collectionId: string;

  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}

export class DeleteFolderDto {
  @IsString()
  @IsNotEmpty()
  collectionId: string;

  @IsString()
  @IsNotEmpty()
  workspaceId: string;

  @IsString()
  @IsNotEmpty()
  folderId: string;
}
