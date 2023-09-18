import { Injectable } from "@nestjs/common";
import {
  ServiceBusClient,
  ServiceBusReceiver,
  ServiceBusSender,
} from "@azure/service-bus";
import { QUEUE } from "../../enum/queue.enum";
import { WorkspaceHandler } from "./workspace.handler";

@Injectable()
export class AzureServiceBusService {
  private readonly sbClient: ServiceBusClient;
  private sender: ServiceBusSender;
  private receiver: ServiceBusReceiver;
  private readonly workspaceHandler: WorkspaceHandler;
  // private readonly
  private readonly connectionString: string;

  constructor() {
    this.connectionString =
      "Endpoint=sb://sparrow-dev.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=PIfthMfnQm1E1A+MpjlZh4EnRhcOUSDad+ASbAikdhs=";
    this.sbClient = new ServiceBusClient(this.connectionString);
  }

  async createSenderAndReceiver(queueName: string) {
    this.sender = this.sbClient.createSender(queueName);
    this.receiver = this.sbClient.createReceiver(queueName, {
      receiveMode: "receiveAndDelete",
    });
    this.subscribe(queueName);
  }

  async subscribe(queue: string) {
    switch (queue) {
      case QUEUE.EVENT:
        this.receiver.subscribe({
          processMessage: (data) =>
            this.workspaceHandler.workspaceMessageSuccess(data),
          processError: (err) =>
            this.workspaceHandler.workspaceMessageFailure(err),
        });
        break;
      default:
        break;
    }
  }

  async sendMessage(queueName: string, message: any): Promise<void> {
    this.createSenderAndReceiver(queueName);
    const messageBody = {
      contentType: "application/json",
      body: message,
    };
    await this.sender.sendMessages(messageBody);
    await this.sender.close();
  }

  // async receiveMessage(): Promise<string | null> {
  //   const messages = await this.receiver.receiveMessages(1);
  //   await this.receiver.close();
  //   return messages.length > 0 ? messages[0].body : null;
  // }
}
