import SwaggerParser from "@apidevtools/swagger-parser";
// import * as util from "util";
import {
  BodyModeEnum,
  Collection,
  CollectionItem,
  ItemTypeEnum,
  RequestBody,
  RequestMetaData,
} from "../models/collection.model";
import { OpenAPI303, ParameterObject } from "../models/openapi303.model";
import { HTTPMethods } from "fastify";
import { Injectable } from "@nestjs/common";
import { ContextService } from "./context.service";

@Injectable()
export class ParserService {
  constructor(private readonly contextService: ContextService) {}
  async parse(file: string): Promise<Collection> {
    const openApiDocument = (await SwaggerParser.validate(file)) as OpenAPI303;

    const folderObjMap = new Map();

    for (const [key, value] of Object.entries(openApiDocument.paths)) {
      //key will be endpoints /put and values will its apis post ,put etc
      for (const [innerKey, innerValue] of Object.entries(value)) {
        //key will be api methods and values will it's desc
        const requestObj: CollectionItem = {} as CollectionItem;
        requestObj.name = key;
        requestObj.description = innerValue.description;
        requestObj.type = ItemTypeEnum.REQUEST;
        requestObj.request = {} as RequestMetaData;
        requestObj.request.method = innerKey as HTTPMethods;
        requestObj.request.operationId = innerValue.operationId;
        requestObj.request.url = key;

        if (innerValue.parameters?.length) {
          requestObj.request.queryParams = innerValue.parameters.filter(
            (param: ParameterObject) => param.in === "query",
          );
          requestObj.request.pathParams = innerValue.parameters.filter(
            (param: ParameterObject) => param.in === "path",
          );
          requestObj.request.headers = innerValue.parameters.filter(
            (param: ParameterObject) => param.in === "header",
          );
        }
        if (innerValue.requestBody) {
          requestObj.request.body = [];
          const bodyTypes = innerValue.requestBody.content;
          for (const [type, schema] of Object.entries(bodyTypes)) {
            const body: RequestBody = {} as RequestBody;
            body.type = Object.values(BodyModeEnum).find(
              (enumMember) => enumMember === type,
            ) as BodyModeEnum;
            body.schema = (schema as any).schema;
            requestObj.request.body.push(body);
          }
        }
        //Add to a folder
        const tag = innerValue.tags ? innerValue.tags[0] : "default";
        const tagArr =
          openApiDocument?.tags.length > 0 &&
          openApiDocument.tags.filter((tagObj) => {
            return tagObj.name === tag;
          });

        let folderObj: CollectionItem = folderObjMap.get(tag);
        if (!folderObj) {
          folderObj = {} as CollectionItem;
          folderObj.name = tag;
          folderObj.description = tagArr ? tagArr[0].description : "";
          folderObj.type = ItemTypeEnum.FOLDER;
          folderObj.items = [];
        }
        folderObj.items.push(requestObj);
        folderObjMap.set(folderObj.name, folderObj);
      }
    }
    const itemObject = Object.fromEntries(folderObjMap);
    const items: CollectionItem[] = [];
    let totalRequests = 0;
    for (const key in itemObject) {
      if (itemObject.hasOwnProperty(key)) {
        items.push(itemObject[key]);
        delete itemObject[key];
      }
    }
    items.map((itemObj) => {
      totalRequests = totalRequests + itemObj.items.length;
    });
    const user = await this.contextService.get("user");
    const collection: Collection = {
      name: openApiDocument.info.title,
      totalRequests,
      items: items,
      createdBy: user.name,
      updatedBy: user.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return collection;
  }
}
