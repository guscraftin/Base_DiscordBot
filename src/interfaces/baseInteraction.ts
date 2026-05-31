import { InteractionDeferReplyOptions } from "discord.js";

export default interface CustomBaseInteraction {
  botPermissions?: bigint[];
  cooldown?: number;
  deferOptions?: InteractionDeferReplyOptions & { withResponse: true };
}
