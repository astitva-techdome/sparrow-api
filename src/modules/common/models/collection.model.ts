import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { HTTPMethods } from "fastify";

enum ItemTypeEnum {
  FOLDER,
  REQUEST,
}

enum BodyModeEnum {
  RAW,
  URLENCODED,
  FORMDATA,
  FILE,
}

enum FormDataTypeEnum {
  TEXT,
  FILE,
}

export class CollectionDTO {
  @IsString()
  @IsNotEmpty()
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Collection {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  totalRequests: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollectionItem)
  items: Array<CollectionItem>;

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
  items?: Array<CollectionItem>;

  @IsOptional()
  @Type(() => RequestMetaData)
  request?: RequestMetaData;

  @IsArray()
  @Type(() => CollectionDTO)
  @ValidateNested({ each: true })
  collection: CollectionDTO;
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
  queryParams?: Array<QueryParams>;
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
  formData?: Array<FormData>;
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

class QueryParams {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}
