import { BadRequestException, Injectable } from "@nestjs/common";
import { WorkspaceService } from "../services/workspace.service";
import { ServiceBusClient, ServiceBusReceiver } from "@azure/service-bus";
import { TOPIC } from "@src/modules/common/enum/topic.enum";
import { AzureServiceBusService } from "@src/modules/common/services/azureBus/azure-service-bus.service";

@Injectable()
export class WorkspaceHandler {
  private readonly sbClient: ServiceBusClient;
  private receiver: ServiceBusReceiver;
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly azureServiceBusService: AzureServiceBusService,
  ) {
    this.sbClient = new ServiceBusClient(process.env.AZURE_CONNECTION_STRING);
    this.subscribe(TOPIC.COMMON);
  }

  async workspaceMessageSuccess(data: any): Promise<void> {
    await this.workspaceService.create(data);
  }
  async workspaceMessageFailure(err: any): Promise<void> {
    throw new BadRequestException(err);
  }
  async subscribe(topicName: string) {
    await this.azureServiceBusService.receiveSubscriber(
      topicName,
      "workspacesubscription",
      this.workspaceMessageSuccess,
      this.workspaceMessageFailure,
    );
  }
}
