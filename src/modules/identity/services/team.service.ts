import { Injectable } from "@nestjs/common";
// import { CreateOrUpdateTeamDto } from "../payload/team.payload";
import { CreateOrUpdateTeamDto } from "../payloads/team.payload";
// import { TeamRepository } from "../team.repository";
import { TeamRepository } from "../repositories/team.repository";

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
    return await this.teamRepository.create(teamData);
  }

  /**
   * Fetches a team from database by UUID
   * @param {string} id
   * @returns {Promise<Team>} queried team data
   */
  async get(id: string) {
    return await this.teamRepository.get(id);
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
    return await this.teamRepository.delete(id);
  }
}
