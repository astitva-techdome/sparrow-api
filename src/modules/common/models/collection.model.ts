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
import { SchemaObject } from "../services/openapi303";

export enum ItemTypeEnum {
  FOLDER,
  REQUEST,
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
export enum SourceTypeEnum {
  SPEC,
  USER,
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
  mode: BodyModeEnum;

  @IsOptional()
  @IsString()
  raw?: string;

  @IsArray()
  @Type(() => FormData)
  @ValidateNested({ each: true })
  @IsOptional()
  formData?: FormData[];
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
  url: string;

  @Type(() => RequestBody)
  @IsOptional()
  body?: RequestBody;

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
