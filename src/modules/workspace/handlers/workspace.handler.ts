import { BadRequestException, Injectable } from "@nestjs/common";
import { WorkspaceService } from "../services/workspace.service";
import { ServiceBusClient } from "@azure/service-bus";
import { TOPIC } from "@src/modules/common/enum/topic.enum";
import { AzureServiceBusService } from "@src/modules/common/services/azureBus/azure-service-bus.service";
import { SUBSCRIPTION } from "@src/modules/common/enum/subscription.enum";

@Injectable()
export class WorkspaceHandler {
  private readonly sbClient: ServiceBusClient;
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly azureServiceBusService: AzureServiceBusService,
  ) {
    this.sbClient = new ServiceBusClient(process.env.AZURE_CONNECTION_STRING);
    this.subscribe(TOPIC.COMMON);
  }
  workspaceMessageSuccess = async (data: any) => {
    await this.workspaceService.create(data);
  };
  workspaceMessageFailure = async (err: any) => {
    throw new BadRequestException(err);
  };
  async subscribe(topicName: string) {
    await this.azureServiceBusService.receiveSubscriber(
      topicName,
      SUBSCRIPTION.WORKSPACE,
      this.workspaceMessageSuccess,
      this.workspaceMessageFailure,
    );
  }
}
