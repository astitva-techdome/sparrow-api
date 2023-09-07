import { Injectable } from "@nestjs/common";
import { PermissionRepository } from "../permission.repository";
import { CreateOrUpdatePermissionDto } from "../payload/permission.payload";
import { ObjectId } from "mongodb";
import { RemovePermissionDto } from "../payload/removePermission.payload";
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

  async remove(permissionData: RemovePermissionDto) {
    return await this.permissionRepository.remove(permissionData);
  }

  async setAdminPermissionForOwner(_id: ObjectId) {
    return await this.permissionRepository.setAdminPermissionForOwner(_id);
  }
}
