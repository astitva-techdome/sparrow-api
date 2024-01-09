import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateOrUpdateTeamDto } from "../payloads/team.payload";
import { TeamRepository } from "../repositories/team.repository";
import {
  DeleteResult,
  InsertOneResult,
  ObjectId,
  // ObjectId,
  UpdateResult,
  WithId,
} from "mongodb";
import { Team } from "@src/modules/common/models/team.model";
import { ProducerService } from "@src/modules/common/services/kafka/producer.service";
import { TOPIC } from "@src/modules/common/enum/topic.enum";
import { ConfigService } from "@nestjs/config";
import { UserRepository } from "../repositories/user.repository";
import { ContextService } from "@src/modules/common/services/context.service";

// import { ContextService } from "@src/modules/common/services/context.service";

/**
 * Team Service
 */
@Injectable()
export class TeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly producerService: ProducerService,
    private readonly configService: ConfigService,
    private readonly userRespository: UserRepository,
    private readonly contextService: ContextService,
  ) {}

  /**
   * Creates a new team in the database
   * @param {CreateOrUpdateTeamDto} teamData
   * @returns {Promise<InsertOneResult<Team>>} result of the insert operation
   */
  async create(
    teamData: CreateOrUpdateTeamDto,
  ): Promise<InsertOneResult<Team>> {
    const teamName = {
      name: teamData.name,
    };
    const createdTeam = await this.teamRepository.create(teamName);

    if (teamData?.firstTeam) {
      const workspaceObj = {
        name: this.configService.get("app.defaultWorkspaceName"),
        id: createdTeam.insertedId.toString(),
      };
      await this.producerService.produce(TOPIC.CREATE_USER_TOPIC, {
        value: JSON.stringify(workspaceObj),
      });
    }
    return createdTeam;
  }

  /**
   * Fetches a team from database by UUID
   * @param {string} id
   * @returns {Promise<Team>} queried team data
   */
  async get(id: string): Promise<WithId<Team>> {
    const data = await this.teamRepository.get(id);
    return data;
  }

  /**
   * Updates a team name
   * @param {string} id
   * @returns {Promise<ITeam>} mutated team data
   */
  async update(
    id: string,
    payload: CreateOrUpdateTeamDto,
  ): Promise<UpdateResult<Team>> {
    const data = await this.teamRepository.update(id, payload);
    return data;
  }

  /**
   * Delete a team from the database by UUID
   * @param {string} id
   * @returns {Promise<DeleteWriteOpResultObject>} result of the delete operation
   */
  async delete(id: string): Promise<DeleteResult> {
    const data = await this.teamRepository.delete(id);
    return data;
  }

  async getAllTeams(userId: string): Promise<Team[]> {
    const user = await this.userRespository.getUserById(userId);
    if (!user) {
      throw new BadRequestException(
        "The user with this id does not exist in the system",
      );
    }
    const teams: Team[] = [];
    for (const { id } of user.teams) {
      const teamData = await this.get(id.toString());
      teams.push(teamData);
    }
    return teams;
  }

  async isTeamOwnerOrAdmin(id: ObjectId): Promise<WithId<Team>> {
    const data = await this.teamRepository.findTeamByTeamId(id);
    const userId = this.contextService.get("user")._id;
    if (data) {
      if (data.owner.toString() === userId.toString()) {
        return data;
      } else {
        for (const item of data.admins) {
          if (item.toString() === userId.toString()) {
            return data;
          }
        }
      }
      throw new BadRequestException("You don't have access");
    }
    throw new BadRequestException("Team doesn't exist");
  }

  async isTeamMember(userId: string, userArray: Array<any>): Promise<boolean> {
    for (const item of userArray) {
      if (item.id.toString() === userId) {
        return true;
      }
    }
    throw new BadRequestException(
      "User is not part of team, first add user in Team",
    );
  }
}
