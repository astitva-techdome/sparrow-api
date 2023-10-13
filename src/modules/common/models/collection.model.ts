import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { HTTPMethods } from "fastify";
import { ObjectId } from "mongodb";
import { SchemaObject } from "./openapi303.model";
import { ApiProperty } from "@nestjs/swagger";
export enum ItemTypeEnum {
  FOLDER = "FOLDER",
  REQUEST = "REQUEST",
}
export enum BodyModeEnum {
  "application/json",
  "application/xml",
  "application/x-www-form-urlencoded",
  "multipart/form-data",
}
export enum FormDataTypeEnum {
  TEXT,
  FILE,
}
// export enum BodyModesEnum {
//   "application/json",
//   "application/xml",
//   "application/x-www-form-urlencoded",
//   "multipart/form-data",
// }

export enum SourceTypeEnum {
  "SPEC",
  "USER",
}
export class QueryParams {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars

export class RequestBody {
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

export class RequestMetaData {
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

  @ApiProperty({ type: [RequestBody] })
  @Type(() => RequestBody)
  @ValidateNested({ each: true })
  @IsOptional()
  body?: RequestBody[];

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

export class CollectionItem {
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

  @ApiProperty({ type: [CollectionItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollectionItem)
  @IsOptional()
  items?: CollectionItem[];

  @ApiProperty({ type: RequestMetaData })
  @IsOptional()
  @Type(() => RequestMetaData)
  request?: RequestMetaData;
}

export class Collection {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalRequests: number;

  @ApiProperty({ type: [CollectionItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollectionItem)
  items: CollectionItem[];

  @IsOptional()
  @IsDateString()
  createdAt?: Date;

  @IsOptional()
  @IsDateString()
  updatedAt?: Date;

  @IsString()
  @IsOptional()
  createdBy?: string;

  @IsString()
  @IsOptional()
  updatedBy?: string;
}

export class CollectionDto {
  @IsMongoId()
  @IsNotEmpty()
  id: ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class FormData {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsEnum(FormDataTypeEnum)
  @IsNotEmpty()
  type: FormDataTypeEnum;
}
