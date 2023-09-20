import { Injectable } from "@nestjs/common";
import {
  ProcessErrorArgs,
  ServiceBusClient,
  ServiceBusReceivedMessage,
  ServiceBusReceiver,
  ServiceBusSender,
} from "@azure/service-bus";

@Injectable()
export class AzureBusService {
  private readonly sbClient: ServiceBusClient;
  private sender: ServiceBusSender;
  private receiver: ServiceBusReceiver;
  private readonly connectionString: string;
  constructor() {
    this.connectionString = process.env.AZURE_CONNECTION_STRING;
    this.sbClient = new ServiceBusClient(this.connectionString);
  }

  async createSender(topicName: string) {
    this.sender = this.sbClient.createSender(topicName);
    return;
  }

  async sendMessage(topicName: string, message: any): Promise<void> {
    this.createSender(topicName);
    const messageBody = {
      contentType: "application/json",
      body: message,
    };
    await this.sender.sendMessages(messageBody);
    await this.sender.close();
    return;
  }

  async receiveSubscriber(
    topicName: string,
    subscription: string,
    processMessage: (arg0: ServiceBusReceivedMessage) => void,
    processError: (arg0: ProcessErrorArgs) => void,
  ) {
    this.receiver = this.sbClient.createReceiver(topicName, subscription);
    this.receiver.subscribe({
      processMessage: async (data) => await processMessage(data.body),
      processError: async (err) => await processError(err),
    });
  }
}
