import SwaggerParser from "@apidevtools/swagger-parser";
// import * as util from "util";
import {
  BodyModeEnum,
  Collection,
  CollectionItem,
  ItemTypeEnum,
  RequestBody,
  RequestMetaData,
  SourceTypeEnum,
} from "../models/collection.model";
import { OpenAPI303, ParameterObject } from "../models/openapi303.model";
import { HTTPMethods } from "fastify";
import { Injectable } from "@nestjs/common";
import { ContextService } from "./context.service";
import { v4 as uuidv4 } from "uuid";
import { CollectionService } from "@src/modules/workspace/services/collection.service";
import { WithId } from "mongodb";

@Injectable()
export class ParserService {
  constructor(
    private readonly contextService: ContextService,
    private readonly collectionService: CollectionService,
  ) {}
  async parse(file: string): Promise<Record<string, string>> {
    try {
      const openApiDocument = (await SwaggerParser.validate(
        file,
      )) as OpenAPI303;
      console.log("OPENAPIDOCUMENT", openApiDocument);
      const baseUrl = this.getBaseUrl(openApiDocument);

      const folderObjMap = new Map();
      console.log("PATHS VALID", openApiDocument.paths);
      for (const [key, value] of Object.entries(openApiDocument.paths)) {
        console.log("INSIDE LOOP");
        //key will be endpoints /put and values will its apis post ,put etc
        for (const [innerKey, innerValue] of Object.entries(value)) {
          console.log("INSIDE INNER LOOP");
          //key will be api methods and values will it's desc
          const requestObj: CollectionItem = {} as CollectionItem;
          console.log("REQUESTOBJ", requestObj);
          requestObj.name = key;
          requestObj.description = innerValue.description;
          requestObj.type = ItemTypeEnum.REQUEST;
          requestObj.source = SourceTypeEnum.SPEC;
          requestObj.id = uuidv4();
          (requestObj.isDeleted = false),
            (requestObj.request = {} as RequestMetaData);
          requestObj.request.method = innerKey.toUpperCase() as HTTPMethods;
          requestObj.request.operationId = innerValue.operationId;
          requestObj.request.url = baseUrl + key;

          if (innerValue.parameters?.length) {
            console.log("parameters check");
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
            console.log("requestBody Check");
            requestObj.request.body = [];
            const bodyTypes = innerValue.requestBody.content;
            for (const [type, schema] of Object.entries(bodyTypes)) {
              console.log("RequestBody Loop");
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
            openApiDocument?.tags?.length > 0 &&
            openApiDocument.tags.filter((tagObj) => {
              return tagObj.name === tag;
            });
          console.log("AFter Tag Check");
          let folderObj: CollectionItem = folderObjMap.get(tag);
          if (!folderObj) {
            console.log("Inside FolderObj Check");
            folderObj = {} as CollectionItem;
            folderObj.name = tag;
            folderObj.description = tagArr ? tagArr[0].description : "";
            folderObj.isDeleted = false;
            folderObj.type = ItemTypeEnum.FOLDER;
            folderObj.id = uuidv4();
            folderObj.items = [];
          }
          folderObj.items.push(requestObj);
          folderObjMap.set(folderObj.name, folderObj);
        }
      }
      console.log("FOLDER CHECK COMPLETED");
      const itemObject = Object.fromEntries(folderObjMap);
      console.log("itemObj", itemObject);
      let items: CollectionItem[] = [];
      let totalRequests = 0;
      for (const key in itemObject) {
        console.log("INSIDE ITEMOBJECT");
        if (itemObject.hasOwnProperty(key)) {
          items.push(itemObject[key]);
          delete itemObject[key];
        }
      }
      console.log("check item", items);
      items.map((itemObj) => {
        console.log("inside itemObj", itemObj);
        totalRequests = totalRequests + itemObj.items?.length;
      });
      const user = await this.contextService.get("user");

      console.log("user", user);

      let mergedFolderItems: CollectionItem[] = [];
      const existingCollection: WithId<Collection> =
        await this.collectionService.getActiveSyncedCollection(
          openApiDocument.info.title,
        );
      if (existingCollection) {
        console.log("Inside Existing COllection", existingCollection);
        //check on folder level
        mergedFolderItems = this.compareAndMerge(
          existingCollection.items,
          items,
        );
        for (let x = 0; x < existingCollection.items?.length; x++) {
          console.log("Inside Existing COllection Loop");
          const newItem: CollectionItem[] = items.filter((item) => {
            return item.name === existingCollection.items[x].name;
          });
          console.log("NEWITEM", newItem);
          //check on request level
          const mergedFolderRequests: CollectionItem[] = this.compareAndMerge(
            existingCollection.items[x].items,
            newItem[0]?.items || [],
          );
          mergedFolderItems[x].items = mergedFolderRequests;
        }
        items = mergedFolderItems;
      }
      const newItems: CollectionItem[] = [];
      for (let x = 0; x < items?.length; x++) {
        console.log("INSIDE LOOP of newItems", newItems);
        const itemsObj: CollectionItem = {
          name: items[x].name,
          description: items[x].description,
          id: items[x].id,
          type: items[x].type,
          isDeleted: items[x].isDeleted,
          source: SourceTypeEnum.SPEC,
          createdBy: user.name,
          updatedBy: user.name,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const innerArray: CollectionItem[] = [];
        for (let y = 0; y < items[x].items?.length; y++) {
          console.log("INNER ARRAY", innerArray);
          const data = this.handleCircularReference(items[x].items[y]);
          innerArray.push(JSON.parse(data));
        }
        itemsObj.items = innerArray;
        newItems.push(itemsObj);
      }

      const collection: Collection = {
        name: openApiDocument.info.title,
        totalRequests,
        items: newItems,
        uuid: openApiDocument.info.title,
        createdBy: user.name,
        updatedBy: user.name,
        activeSync: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (existingCollection) {
        console.log("EXISTING Collection", existingCollection);
        await this.collectionService.updateImportedCollection(
          existingCollection._id.toString(),
          collection,
        );
        return { id: existingCollection._id.toString(), name: collection.name };
      } else {
        const newCollection = await this.collectionService.importCollection(
          collection,
        );
        console.log("New COllection", newCollection);
        return {
          id: newCollection.insertedId.toString(),
          name: collection.name,
        };
      }
    } catch (error) {
      console.log("ERROR in PArser Service ", error);
    }
  }
  handleCircularReference(obj: CollectionItem) {
    try {
      const cache: any = [];
      return JSON.stringify(obj, function (key, value) {
        if (typeof value === "object" && value !== null) {
          if (cache.indexOf(value) !== -1) {
            // Circular reference found, replace with undefined
            return undefined;
          }
          // Store value in our collection
          cache.push(value);
        }
        return value;
      });
    } catch (error) {
      console.log("INSIDE HANDLE Circular Refrence", error);
    }
  }
  compareAndMerge(
    existingitems: CollectionItem[],
    newItems: CollectionItem[],
  ): CollectionItem[] {
    try {
      const newItemMap = newItems
        ? new Map(
            newItems.map((item) => [
              item.type === ItemTypeEnum.FOLDER
                ? item.name
                : item.name + item.request.method,
              item,
            ]),
          )
        : new Map();
      console.log("Compare and Merge NewItem", newItemMap);
      const existingItemMap = existingitems
        ? new Map(
            existingitems.map((item) => [
              item.type === ItemTypeEnum.FOLDER
                ? item.name
                : item.name + item.request.method,
              item,
            ]),
          )
        : new Map();
      console.log("Compare and Merge Existingtem", existingItemMap);

      // Merge old and new items while marking deleted
      const mergedArray: CollectionItem[] = existingitems.map(
        (existingItem) => {
          if (
            newItemMap.has(
              existingItem.type === ItemTypeEnum.FOLDER
                ? existingItem.name
                : existingItem.name + existingItem.request.method,
            )
          ) {
            return {
              ...newItemMap.get(
                existingItem.type === ItemTypeEnum.FOLDER
                  ? existingItem.name
                  : existingItem.name + existingItem.request.method,
              ),
              isDeleted: false,
            };
          } else if (existingItem.source === SourceTypeEnum.USER) {
            return { ...existingItem, isDeleted: false };
          } else {
            return { ...existingItem, isDeleted: true };
          }
        },
      );
      console.log("Compare and Merge ExistingtemMap", existingItemMap);
      // Add new items from newArray that are not already in the mergedArray
      newItems.forEach((newItem) => {
        if (
          !existingItemMap.has(
            newItem.type === ItemTypeEnum.FOLDER
              ? newItem.name
              : newItem.name + newItem.request.method,
          )
        ) {
          mergedArray.push({ ...newItem, isDeleted: false });
        }
      });

      return mergedArray;
    } catch (error) {
      console.log("Error Inside Compare and Merge", error);
    }
  }
  getBaseUrl(openApiDocument: OpenAPI303): string {
    const basePath = openApiDocument.basePath ? openApiDocument.basePath : "";
    if (openApiDocument.host) {
      return "https://" + openApiDocument.host + basePath;
    } else {
      return "http://localhost:{{PORT}}" + basePath;
    }
  }
}
