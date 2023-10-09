import SwaggerParser from "@apidevtools/swagger-parser";
// import * as util from "util";
import {
  BodyModeEnum,
  CollectionItem,
  ItemTypeEnum,
  RequestBody,
  RequestMetaData,
} from "../models/collection.model";
import { OpenAPI303, ParameterObject } from "./openapi303";
import { HTTPMethods } from "fastify";
// import { paths, components } from "./example";
export class ParserService {
  constructor() {}
  async parse() {
    // const openApiDocument = (await SwaggerParser.validate(
    //   __dirname + "/example.yaml",
    // )) as OpenAPI303;

    const openApiDocument = (await SwaggerParser.validate(
      __dirname + "/test.json",
    )) as OpenAPI303;

    // const collObj: Collection = {
    //   name: "test",
    //   totalRequests: 1,
    //   items: [],
    // };

    const folderObjMap = new Map();

    for (const [key, value] of Object.entries(openApiDocument.paths)) {
      for (const [innerKey, innerValue] of Object.entries(value)) {
        const requestObj: CollectionItem = {} as CollectionItem;
        requestObj.name = key;
        requestObj.description = innerValue.description;
        requestObj.type = ItemTypeEnum.REQUEST;
        requestObj.request = {} as RequestMetaData;
        requestObj.request.name = key;
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
            body.schema = schema;
            requestObj.request.body.push(body);
          }
        }

        //Add to a folder
        const tag = innerValue.tags ? innerValue.tags[0] : "default";
        let folderObj: CollectionItem = folderObjMap.get(tag);
        if (!folderObj) {
          folderObj = {} as CollectionItem;
          folderObj.name = tag;
          folderObj.description = "";
          folderObj.type = ItemTypeEnum.FOLDER;
          folderObj.items = [];
        }
        folderObj.items.push(requestObj);
        folderObjMap.set(folderObj.name, folderObj);
      }
    }

    console.log(folderObjMap);
    return;
  }
}
