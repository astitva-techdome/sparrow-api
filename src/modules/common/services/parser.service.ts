import SwaggerParser from "@apidevtools/swagger-parser";
// import * as util from "util";
import * as fs from "fs";
import {
  CollectionItem,
  ItemTypeEnum,
  RequestMetaData,
} from "../models/collection.model";
import { OpenAPI303, ParameterObject } from "./openapi303";
import { HTTPMethods } from "fastify";
// import { paths, components } from "./example";
export class ParserService {
  constructor() {}
  async parse() {
    const openApiDocument = (await SwaggerParser.validate(
      __dirname + "/example.yaml",
    )) as OpenAPI303;

    fs.writeFile("json.txt", JSON.stringify(openApiDocument), (err) => {
      if (err) console.log(err);
      else {
        console.log("File written successfully\n");
      }
    });

    // const collObj: Collection = {
    //   name: "test",
    //   totalRequests: 1,
    //   items: [],
    // };

    const folderObjMap = new Map();

    for (const tag of openApiDocument.tags) {
      const folderObj: CollectionItem = {} as CollectionItem;
      folderObj.name = tag.name;
      folderObj.description = tag.description;
      folderObj.type = ItemTypeEnum.FOLDER;
      folderObj.items = [];
      folderObjMap.set(folderObj.name, folderObj);
    }

    for (const [key, value] of Object.entries(openApiDocument.paths)) {
      for (const [innerKey, innerValue] of Object.entries(value)) {
        const requestObj: CollectionItem = {} as CollectionItem;
        // const folderObj = folderObjMap.get(innerValue.tags[0]);
        requestObj.name = key;
        requestObj.description = innerValue.description;
        requestObj.type = ItemTypeEnum.REQUEST;
        requestObj.request = {} as RequestMetaData;
        requestObj.request.name = key;
        requestObj.request.method = innerKey as HTTPMethods;
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
        }
      }
    }

    return;
  }
  async parse2() {
    // Schema Obj
    // type MyType = components["schemas"]["MyType"];
    // // Path params
    // type EndpointParams = paths["/my/endpoint"]["parameters"];
    // // Response obj
    // type SuccessResponse =
    //   paths["/my/endpoint"]["get"]["responses"][200]["content"]["application/json"]["schema"];
    // type ErrorResponse =
    //   paths["/my/endpoint"]["get"]["responses"][500]["content"]["application/json"]["schema"];
    // // Example input
    // const inputObject = {
    //   put: {
    //     tags: ["pet"],
    //     summary: "Update an existing pet",
    //     description: "Update an existing pet by Id",
    //     operationId: "updatePet",
    //     requestBody: {
    //       description: "Update an existent pet in the store",
    //       content: {
    //         "application/json": {
    //           schema: {
    //             required: ["name", "photoUrls"],
    //             type: "object",
    //             properties: {
    //               id: {
    //                 type: "integer",
    //                 format: "int64",
    //                 example: 10,
    //               },
    //               name: {
    //                 type: "string",
    //                 example: "doggie",
    //               },
    //               category: {
    //                 type: "object",
    //                 properties: {
    //                   id: {
    //                     type: "integer",
    //                     format: "int64",
    //                     example: 1,
    //                   },
    //                   name: {
    //                     type: "string",
    //                     example: "Dogs",
    //                   },
    //                 },
    //                 xml: {
    //                   name: "category",
    //                 },
    //               },
    //               photoUrls: {
    //                 type: "array",
    //                 xml: {
    //                   wrapped: true,
    //                 },
    //                 items: {
    //                   type: "string",
    //                   xml: {
    //                     name: "photoUrl",
    //                   },
    //                 },
    //               },
    //               tags: {
    //                 type: "array",
    //                 xml: {
    //                   wrapped: true,
    //                 },
    //                 items: {
    //                   type: "object",
    //                   properties: {
    //                     id: {
    //                       type: "integer",
    //                       format: "int64",
    //                     },
    //                     name: {
    //                       type: "string",
    //                     },
    //                   },
    //                   xml: {
    //                     name: "tag",
    //                   },
    //                 },
    //               },
    //               status: {
    //                 type: "string",
    //                 description: "pet status in the store",
    //                 enum: ["available", "pending", "sold"],
    //               },
    //             },
    //             xml: {
    //               name: "pet",
    //             },
    //           },
    //         },
    //         "application/xml": {
    //           schema: {
    //             required: ["name", "photoUrls"],
    //             type: "object",
    //             properties: {
    //               id: {
    //                 type: "integer",
    //                 format: "int64",
    //                 example: 10,
    //               },
    //               name: {
    //                 type: "string",
    //                 example: "doggie",
    //               },
    //               category: {
    //                 type: "object",
    //                 properties: {
    //                   id: {
    //                     type: "integer",
    //                     format: "int64",
    //                     example: 1,
    //                   },
    //                   name: {
    //                     type: "string",
    //                     example: "Dogs",
    //                   },
    //                 },
    //                 xml: {
    //                   name: "category",
    //                 },
    //               },
    //               photoUrls: {
    //                 type: "array",
    //                 xml: {
    //                   wrapped: true,
    //                 },
    //                 items: {
    //                   type: "string",
    //                   xml: {
    //                     name: "photoUrl",
    //                   },
    //                 },
    //               },
    //               tags: {
    //                 type: "array",
    //                 xml: {
    //                   wrapped: true,
    //                 },
    //                 items: {
    //                   type: "object",
    //                   properties: {
    //                     id: {
    //                       type: "integer",
    //                       format: "int64",
    //                     },
    //                     name: {
    //                       type: "string",
    //                     },
    //                   },
    //                   xml: {
    //                     name: "tag",
    //                   },
    //                 },
    //               },
    //               status: {
    //                 type: "string",
    //                 description: "pet status in the store",
    //                 enum: ["available", "pending", "sold"],
    //               },
    //             },
    //             xml: {
    //               name: "pet",
    //             },
    //           },
    //         },
    //         "application/x-www-form-urlencoded": {
    //           schema: {
    //             required: ["name", "photoUrls"],
    //             type: "object",
    //             properties: {
    //               id: {
    //                 type: "integer",
    //                 format: "int64",
    //                 example: 10,
    //               },
    //               name: {
    //                 type: "string",
    //                 example: "doggie",
    //               },
    //               category: {
    //                 type: "object",
    //                 properties: {
    //                   id: {
    //                     type: "integer",
    //                     format: "int64",
    //                     example: 1,
    //                   },
    //                   name: {
    //                     type: "string",
    //                     example: "Dogs",
    //                   },
    //                 },
    //                 xml: {
    //                   name: "category",
    //                 },
    //               },
    //               photoUrls: {
    //                 type: "array",
    //                 xml: {
    //                   wrapped: true,
    //                 },
    //                 items: {
    //                   type: "string",
    //                   xml: {
    //                     name: "photoUrl",
    //                   },
    //                 },
    //               },
    //               tags: {
    //                 type: "array",
    //                 xml: {
    //                   wrapped: true,
    //                 },
    //                 items: {
    //                   type: "object",
    //                   properties: {
    //                     id: {
    //                       type: "integer",
    //                       format: "int64",
    //                     },
    //                     name: {
    //                       type: "string",
    //                     },
    //                   },
    //                   xml: {
    //                     name: "tag",
    //                   },
    //                 },
    //               },
    //               status: {
    //                 type: "string",
    //                 description: "pet status in the store",
    //                 enum: ["available", "pending", "sold"],
    //               },
    //             },
    //             xml: {
    //               name: "pet",
    //             },
    //           },
    //         },
    //       },
    //       required: true,
    //     },
    //     responses: {
    //       "200": {
    //         description: "Successful operation",
    //         content: {
    //           "application/json": {
    //             schema: {
    //               required: ["name", "photoUrls"],
    //               type: "object",
    //               properties: {
    //                 id: {
    //                   type: "integer",
    //                   format: "int64",
    //                   example: 10,
    //                 },
    //                 name: {
    //                   type: "string",
    //                   example: "doggie",
    //                 },
    //                 category: {
    //                   type: "object",
    //                   properties: {
    //                     id: {
    //                       type: "integer",
    //                       format: "int64",
    //                       example: 1,
    //                     },
    //                     name: {
    //                       type: "string",
    //                       example: "Dogs",
    //                     },
    //                   },
    //                   xml: {
    //                     name: "category",
    //                   },
    //                 },
    //                 photoUrls: {
    //                   type: "array",
    //                   xml: {
    //                     wrapped: true,
    //                   },
    //                   items: {
    //                     type: "string",
    //                     xml: {
    //                       name: "photoUrl",
    //                     },
    //                   },
    //                 },
    //                 tags: {
    //                   type: "array",
    //                   xml: {
    //                     wrapped: true,
    //                   },
    //                   items: {
    //                     type: "object",
    //                     properties: {
    //                       id: {
    //                         type: "integer",
    //                         format: "int64",
    //                       },
    //                       name: {
    //                         type: "string",
    //                       },
    //                     },
    //                     xml: {
    //                       name: "tag",
    //                     },
    //                   },
    //                 },
    //                 status: {
    //                   type: "string",
    //                   description: "pet status in the store",
    //                   enum: ["available", "pending", "sold"],
    //                 },
    //               },
    //               xml: {
    //                 name: "pet",
    //               },
    //             },
    //           },
    //           "application/xml": {
    //             schema: {
    //               required: ["name", "photoUrls"],
    //               type: "object",
    //               properties: {
    //                 id: {
    //                   type: "integer",
    //                   format: "int64",
    //                   example: 10,
    //                 },
    //                 name: {
    //                   type: "string",
    //                   example: "doggie",
    //                 },
    //                 category: {
    //                   type: "object",
    //                   properties: {
    //                     id: {
    //                       type: "integer",
    //                       format: "int64",
    //                       example: 1,
    //                     },
    //                     name: {
    //                       type: "string",
    //                       example: "Dogs",
    //                     },
    //                   },
    //                   xml: {
    //                     name: "category",
    //                   },
    //                 },
    //                 photoUrls: {
    //                   type: "array",
    //                   xml: {
    //                     wrapped: true,
    //                   },
    //                   items: {
    //                     type: "string",
    //                     xml: {
    //                       name: "photoUrl",
    //                     },
    //                   },
    //                 },
    //                 tags: {
    //                   type: "array",
    //                   xml: {
    //                     wrapped: true,
    //                   },
    //                   items: {
    //                     type: "object",
    //                     properties: {
    //                       id: {
    //                         type: "integer",
    //                         format: "int64",
    //                       },
    //                       name: {
    //                         type: "string",
    //                       },
    //                     },
    //                     xml: {
    //                       name: "tag",
    //                     },
    //                   },
    //                 },
    //                 status: {
    //                   type: "string",
    //                   description: "pet status in the store",
    //                   enum: ["available", "pending", "sold"],
    //                 },
    //               },
    //               xml: {
    //                 name: "pet",
    //               },
    //             },
    //           },
    //         },
    //       },
    //       "400": {
    //         description: "Invalid ID supplied",
    //       },
    //       "404": {
    //         description: "Pet not found",
    //       },
    //       "405": {
    //         description: "Validation exception",
    //       },
    //     },
    //     security: [
    //       {
    //         petstore_auth: ["write:pets", "read:pets"],
    //       },
    //     ],
    //   },
    // };
    // const openApiDocument = await SwaggerParser.validate(
    //   __dirname + "/example.yaml",
    // );
    // //Example collection object to insert
    // // const collObj: Collection = {
    // //   name: "test",
    // //   totalRequests: 1,
    // //   items: [],
    // // };
    // //Example Folder item obj
    // const itemObjMap = new Map();
    // const folderArray = []; // to keep track of what all folders do we have
    // //Take out list of folders, create folder object items
    // for (const tag of openApiDocument.tags) {
    //   const itemObj: CollectionItem = {} as CollectionItem;
    //   folderArray.push(tag.name);
    //   itemObj.name = tag.name;
    //   itemObj.description = tag.description;
    //   itemObj.type = ItemTypeEnum.FOLDER;
    //   itemObj.items = [];
    //   itemObjMap.set(itemObj.name, itemObj);
    // }
    // for (const [key, value] of Object.entries(openApiDocument.paths)) {
    //   for (const [innerKey, innerValue] of Object.entries(value)) {
    //     console.log(innerKey, innerValue);
    //     // const requestObj: CollectionItem = {} as CollectionItem;
    //     const itemObj = itemObjMap.get((innerValue as any).tags[0]);
    //     // requestObj.name = key;
    //     // requestObj.description = tag.description;
    //     // requestObj.type = ItemTypeEnum.FOLDER;
    //   }
    // }
    // Call the function to flatten the object
    // const flatJson = this.flattenObject(inputObject.put);
    // Print the flattened JSON
    // console.log(flatJson);
  }

  // flattenObject(obj: Record<string, any>, parentKey = ""): Record<string, any> {
  //   return Object.keys(obj).reduce((acc: Record<string, any>, key: string) => {
  //     const currentKey = parentKey ? `${parentKey}.${key}` : key;

  //     if (typeof obj[key] === "object" && obj[key] !== null) {
  //       const nestedObj = this.flattenObject(obj[key], currentKey);
  //       Object.assign(acc, nestedObj);
  //     } else {
  //       acc[currentKey] = obj[key];
  //     }

  //     return acc;
  //   }, {});
  // }
}
