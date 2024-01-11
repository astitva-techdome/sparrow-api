import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateOrUpdateTeamDto, TeamResponse } from "../payloads/team.payload";
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
import { MemoryStorageFile } from "@blazity/nest-file-fastify";
import { TeamRole } from "@src/modules/common/enum/roles.enum";

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
    image?: MemoryStorageFile,
  ): Promise<InsertOneResult<Team>> {
    let team;
    if (image) {
      const dataBuffer = image.buffer;
      const dataString = dataBuffer.toString("base64");
      const logo = {
        bufferString: dataString,
        encoding: image.encoding,
        mimetype: image.mimetype,
        size: image.size,
      };
      team = {
        name: teamData.name,
        description: teamData.description ?? "",
        logo: logo,
      };
    } else {
      team = {
        name: teamData.name,
        description: teamData.description ?? "",
      };
    }
    const createdTeam = await this.teamRepository.create(team);
    const user = await this.contextService.get("user");
    const userData = await this.userRespository.findUserByUserId(
      new ObjectId(user._id),
    );
    const updatedUserTeams = [...userData.teams];
    updatedUserTeams.push({
      id: createdTeam.insertedId,
      name: teamData.name,
      role: TeamRole.OWNER,
    });
    const updatedUserParams = {
      teams: updatedUserTeams,
    };
    await this.userRespository.updateUserById(
      new ObjectId(userData._id),
      updatedUserParams,
    );
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
  async get(id: string): Promise<WithId<TeamResponse> | WithId<Team>> {
    const data = await this.teamRepository.get(id);
    let updatedData: TeamResponse;
    if (data.logo) {
      updatedData = {
        _id: data._id,
        name: data.name,
        description: data.description,
        logo: {
          buffer: Buffer.from(data?.logo?.bufferString, "base64"),
          encoding: data?.logo?.encoding,
          mimetype: data?.logo?.mimetype,
          size: data?.logo?.size,
        },
        workspaces: data.workspaces,
        users: data.users,
        owner: data.owner,
        admins: data?.admins,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        createdBy: data.createdBy,
        updatedBy: data.updatedBy,
      };
    }
    return data.logo ? updatedData : data;
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

  async getAllTeams(userId: string): Promise<WithId<TeamResponse>[]> {
    const user = await this.userRespository.getUserById(userId);
    if (!user) {
      throw new BadRequestException(
        "The user with this id does not exist in the system",
      );
    }
    const teams: WithId<TeamResponse>[] = [];
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
