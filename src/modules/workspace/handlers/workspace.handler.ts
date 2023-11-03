import { BadRequestException, Injectable } from "@nestjs/common";
import { WorkspaceService } from "../services/workspace.service";
import { ServiceBusClient } from "@azure/service-bus";
import { TOPIC } from "@src/modules/common/enum/topic.enum";
import { AzureBusService } from "@src/modules/common/services/azureBus/azure-bus.service";
import { SUBSCRIPTION } from "@src/modules/common/enum/subscription.enum";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class WorkspaceHandler {
  private readonly sbClient: ServiceBusClient;
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly azureBusService: AzureBusService,
    private readonly configService: ConfigService,
  ) {
    this.sbClient = new ServiceBusClient(
      this.configService.get("azure.connectionString"),
    );
    this.subscribe(TOPIC.CREATE_USER_TOPIC);
  }
  workspaceMessageSuccess = async (data: any) => {
    await this.workspaceService.create(data);
  };
  workspaceMessageFailure = async (err: any) => {
    throw new BadRequestException(err);
  };
  async subscribe(topicName: string) {
    await this.azureBusService.receiveSubscriber(
      topicName,
      SUBSCRIPTION.CREATE_USER_SUBSCRIPTION,
      this.workspaceMessageSuccess,
      this.workspaceMessageFailure,
    );
  }
}
