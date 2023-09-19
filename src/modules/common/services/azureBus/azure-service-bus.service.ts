import { Injectable } from "@nestjs/common";
import {
  ServiceBusClient,
  ServiceBusReceiver,
  ServiceBusSender,
} from "@azure/service-bus";
import { QUEUE } from "../../enum/queue.enum";
import { WorkspaceHandler } from "./handlers/workspace.handler";

@Injectable()
export class AzureServiceBusService {
  private readonly sbClient: ServiceBusClient;
  private sender: ServiceBusSender;
  private receiver: ServiceBusReceiver;

  // private readonly
  private readonly connectionString: string;

  constructor(private readonly workspaceHandler: WorkspaceHandler) {
    this.connectionString =
      "Endpoint=sb://sparrow-dev.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=PIfthMfnQm1E1A+MpjlZh4EnRhcOUSDad+ASbAikdhs=";
    this.sbClient = new ServiceBusClient(this.connectionString);
    this.subscribe(QUEUE.EVENT);
  }

  async createSender(queueName: string) {
    this.sender = this.sbClient.createSender(queueName);
    return;
  }

  async subscribe(queueName: string) {
    this.receiver = this.sbClient.createReceiver(queueName, {
      receiveMode: "receiveAndDelete",
    });
    this.receiver.subscribe({
      processMessage: async (data) =>
        await this.workspaceHandler.workspaceMessageSuccess(data.body),
      processError: async (err) =>
        await this.workspaceHandler.workspaceMessageFailure(err),
    });
  }

  async sendMessage(queueName: string, message: any): Promise<void> {
    this.createSender(queueName);
    const messageBody = {
      contentType: "application/json",
      body: message,
    };
    await this.sender.sendMessages(messageBody);
    return;
  }
  //   await delay(20000);
  //   await this.receiver.close();
  //   await this.sender.close();
  //   await this.sbClient.close();
}
