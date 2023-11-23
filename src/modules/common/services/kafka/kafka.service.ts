import {
  Kafka,
  Producer,
  //   KafkaMessage,
  Consumer,
  EachMessagePayload,
} from "kafkajs";
import { Injectable } from "@nestjs/common";

@Injectable()
export class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private consumerone: Consumer;

  constructor() {
    this.kafka = new Kafka({
      clientId: "kafkajs",
      brokers: ["127.0.0.1:9092", "localhost:9101"], // Replace with your Kafka broker(s)
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: "my-group" }); // Replace 'my-group' with your consumer group
    this.consumerone = this.kafka.consumer({ groupId: "my-group" }); // Replace 'my-group' with your consumer group

    this.initConsumer();
  }

  async connect() {
    await this.producer.connect();
  }

  async send(topic: string, message: string): Promise<void> {
    await this.connect();
    try {
      await this.producer.send({
        topic,
        messages: [{ value: message }],
      });
      await this.disconnect();
    } catch (error) {
      // Handle error
      console.error("Error sending message:", error);
    }
  }

  async disconnect() {
    await this.producer.disconnect();
  }
  private async initConsumer() {
    console.log("in consumer");
    await this.consumer.connect();
    await this.consumerone.connect();

    await this.consumer.subscribe({ topic: "my-topic" }); // Replace 'my-topic' with your topic name
    await this.consumerone.subscribe({ topic: "my-topic" }); // Replace 'my-topic' with your topic name

    await this.consumer.run({
      eachMessage: async ({
        // topic,
        // partition,
        message,
      }: EachMessagePayload) => {
        console.log(`Received message: ${message.value.toString()}`);
        // Handle the incoming message here
        // You can process the message or trigger functions based on the received data
      },
    });
    await this.consumerone.run({
      eachMessage: async ({
        // topic,
        // partition,
        message,
      }: EachMessagePayload) => {
        console.log(
          `By consumerone Received message: ${message.value.toString()}`,
        );
        // Handle the incoming message here
        // You can process the message or trigger functions based on the received data
      },
    });
  }
}
