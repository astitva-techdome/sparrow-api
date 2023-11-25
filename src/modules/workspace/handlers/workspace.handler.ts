import { Injectable, OnModuleInit } from "@nestjs/common";
import { WorkspaceService } from "../services/workspace.service";
import { TOPIC } from "@src/modules/common/enum/topic.enum";
import { ConsumerService } from "@src/modules/common/services/kafka/consumer.service";

@Injectable()
export class WorkspaceHandler implements OnModuleInit {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly consumerService: ConsumerService,
  ) {}

  async onModuleInit() {
    await this.consumerService.consume({
      topic: { topic: TOPIC.CREATE_USER_TOPIC },
      config: { groupId: "test-consumer" },
      onMessage: async (message) => {
        await this.workspaceService.create(
          JSON.parse(message.value.toString()),
        );
      },
    });
  }
}
