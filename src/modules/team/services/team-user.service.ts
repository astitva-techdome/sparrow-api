import { Injectable } from "@nestjs/common";
import { TeamRepository } from "../team.repository";
import { CreateOrUpdateTeamUserDto } from "../payload/user.payload";

/**
 * Team User Service
 */
@Injectable()
export class TeamUserService {
  constructor(private readonly teamRepository: TeamRepository) {}

  /**
   * Creates a new team in the database
   * @param {CreateOrUpdateTeamDto} teamData
   * @returns {Promise<InsertOneWriteOpResult<Team>>} result of the insert operation
   */
  async addUser(teamData: CreateOrUpdateTeamUserDto) {
    return await this.teamRepository.addUser(teamData);
  }
}
