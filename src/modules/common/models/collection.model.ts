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

export enum ItemTypeEnum {
  FOLDER = "FOLDER",
  REQUEST = "REQUEST",
}
export enum BodyModeEnum {
  RAW,
  URLENCODED,
  FORMDATA,
  FILE,
}
export enum FormDataTypeEnum {
  TEXT,
  FILE,
}
export enum BodyModesEnum {
  "application/json",
  "application/xml",
  "application/x-www-form-urlencoded",
  "multipart/form-data",
}

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
export class Collection {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  totalRequests: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollectionItem)
  items: CollectionItem[];

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;

  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @IsString()
  @IsNotEmpty()
  updatedBy: string;
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

export class RequestBody {
  @IsEnum(BodyModeEnum)
  @IsNotEmpty()
  type: BodyModeEnum;

  @IsNotEmpty()
  schema?: SchemaObject;
}

export class Params {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsBoolean()
  required: boolean;

  @IsNotEmpty()
  schema: SchemaObject;
}

export class RequestMetaData {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  method: HTTPMethods;

  @IsString()
  @IsNotEmpty()
  operationId: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @Type(() => RequestBody)
  @ValidateNested({ each: true })
  @IsOptional()
  body?: RequestBody[];

  @IsArray()
  @Type(() => Params)
  @ValidateNested({ each: true })
  @IsOptional()
  queryParams?: Params[];

  @IsArray()
  @Type(() => Params)
  @ValidateNested({ each: true })
  @IsOptional()
  pathParams?: Params[];

  @IsArray()
  @Type(() => Params)
  @ValidateNested({ each: true })
  @IsOptional()
  headers?: Params[];
}

export class CollectionItem {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsEnum(ItemTypeEnum)
  @IsNotEmpty()
  type: ItemTypeEnum;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollectionItem)
  @IsOptional()
  items?: CollectionItem[];

  @IsOptional()
  @Type(() => RequestMetaData)
  request?: RequestMetaData;
}
