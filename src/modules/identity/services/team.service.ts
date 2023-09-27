import { Injectable } from "@nestjs/common";
import { CreateOrUpdateTeamDto } from "../payloads/team.payload";
import { TeamRepository } from "../repositories/team.repository";
import { ApiResponseService } from "@src/modules/common/services/api-response.service";
import { HttpStatusCode } from "@src/modules/common/enum/httpStatusCode.enum";

/**
 * Team Service
 */
@Injectable()
export class TeamService {
  constructor(private readonly teamRepository: TeamRepository) {}

  /**
   * Creates a new team in the database
   * @param {CreateOrUpdateTeamDto} teamData
   * @returns {Promise<InsertOneWriteOpResult<Team>>} result of the insert operation
   */
  async create(teamData: CreateOrUpdateTeamDto) {
    const data = await this.teamRepository.create(teamData);
    return new ApiResponseService("Team Created", HttpStatusCode.CREATED, data);
  }

  /**
   * Fetches a team from database by UUID
   * @param {string} id
   * @returns {Promise<Team>} queried team data
   */
  async get(id: string) {
    const data = await this.teamRepository.get(id);
    return new ApiResponseService("Sucess", HttpStatusCode.OK, data);
  }

  /**
   * Updates a team name
   * @param {string} id
   * @returns {Promise<ITeam>} mutated team data
   */
  async update(id: string, payload: CreateOrUpdateTeamDto) {
    return await this.teamRepository.update(id, payload);
  }

  /**
   * Delete a team from the database by UUID
   * @param {string} id
   * @returns {Promise<DeleteWriteOpResultObject>} result of the delete operation
   */
  async delete(id: string) {
    const data = await this.teamRepository.delete(id);
    return new ApiResponseService("Team Deleted", HttpStatusCode.OK, data);
  }
}
