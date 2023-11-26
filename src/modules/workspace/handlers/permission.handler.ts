import { Injectable, OnModuleInit } from "@nestjs/common";
import { TOPIC } from "@src/modules/common/enum/topic.enum";
import { SUBSCRIPTION } from "@src/modules/common/enum/subscription.enum";
import { PermissionService } from "../services/permission.service";
import { ConsumerService } from "@src/modules/common/services/kafka/consumer.service";

@Injectable()
export class PermissionHandler implements OnModuleInit {
  constructor(
    private readonly permissionService: PermissionService,
    private readonly consumerService: ConsumerService,
  ) {}

  async onModuleInit() {
    await this.consumerService.consume({
      topic: { topic: TOPIC.USER_ADDED_TO_TEAM_TOPIC },
      config: { groupId: SUBSCRIPTION.USER_ADDED_TO_TEAM_SUBSCRIPTION },
      onMessage: async (message) => {
        const data = JSON.parse(message.value.toString());
        const permissionArray = data.teamWorkspaces;
        const userId = data.userId;
        await this.permissionService.addPermissionInWorkspace(
          permissionArray,
          userId,
        );
      },
    });
  }
}
