import { Injectable } from "@nestjs/common";
import { PermissionRepository } from "../permission.repository";
import { CreateOrUpdatePermissionDto } from "../payload/permission.payload";
import { ObjectId } from "mongodb";
/**
 * Permission Service
 */
@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  /**
   * Add a new permission in user in the database
   * @param {CreateOrUpdatePermissionDto} permissionData
   * @returns {Promise<InsertOneWriteOpResult<Permission>>} result of the insert operation
   */
  async create(permissionData: CreateOrUpdatePermissionDto) {
    return await this.permissionRepository.create(permissionData);
  }

  async setAdminPermissionForOwner(_id: ObjectId) {
    return await this.permissionRepository.setAdminPermissionForOwner(_id);
  }
}
