import { BadRequestException, Injectable } from "@nestjs/common";
import { ServiceBusClient } from "@azure/service-bus";
import { TOPIC } from "@src/modules/common/enum/topic.enum";
import { AzureBusService } from "@src/modules/common/services/azureBus/azure-bus.service";
import { SUBSCRIPTION } from "@src/modules/common/enum/subscription.enum";
import { ConfigService } from "@nestjs/config";
import { PermissionService } from "../services/permission.service";

@Injectable()
export class PermissionHandler {
  private readonly sbClient: ServiceBusClient;
  constructor(
    private readonly permissionService: PermissionService,
    private readonly azureBusService: AzureBusService,
    private readonly configService: ConfigService,
  ) {
    this.sbClient = new ServiceBusClient(
      this.configService.get("azure.connectionString"),
    );
    this.subscribe(TOPIC.USER_ADDED_TO_TEAM_TOPIC);
  }
  permissionMessageSuccess = async (data: any) => {
    const permissionArray = data.teamWorkspaces;
    const userId = data.userId;
    await this.permissionService.addPermissionInWorkspace(
      permissionArray,
      userId,
    );
  };
  permissionMessageFailure = async (err: any) => {
    throw new BadRequestException(err);
  };
  async subscribe(topicName: string) {
    await this.azureBusService.receiveSubscriber(
      topicName,
      SUBSCRIPTION.USER_ADDED_TO_TEAM_SUBSCRIPTION,
      this.permissionMessageSuccess,
      this.permissionMessageFailure,
    );
  }
}
