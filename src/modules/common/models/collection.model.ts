import { Type } from "class-transformer";
import {
  IsArray,
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

class FormData {
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

class RequestBody {
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

class QueryParams {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

class RequestMetaData {
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
  @Type(() => QueryParams)
  @ValidateNested({ each: true })
  @IsOptional()
  queryParams?: QueryParams[];
}

class CollectionItem {
  @IsString()
  @IsNotEmpty()
  name: string;

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
