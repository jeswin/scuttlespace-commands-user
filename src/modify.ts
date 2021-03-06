import { ApolloClient } from "apollo-client";
import gql from "graphql-tag";
import { IConfig, IMessage, Response } from "scuttlespace-commands-common";
import { parseServiceResult } from "scuttlespace-service-common";
import { ICallContext } from "standard-api";
import * as expr from "switch-expr";
import { invokeEnableUser } from "./schemaTypes";

export default async function modify(
  args: any,
  msg: IMessage<{ text: string }>,
  pub: string,
  config: IConfig,
  context: ICallContext,
  apolloClient: ApolloClient<any>
) {
  return new Response(`TODO.`, msg.key);
  const externalId = msg.author;
  const messageId = msg.key;
  const accountCreationExpressions = async () =>
    await expr.firstAsync([
      [
        () => typeof args.enable !== "undefined",
        async () => {
          const { username } = await invokeEnableUser(
            { args: { externalId } },
            apolloClient
          );
          return new Response(
            `The user ${username} has been enabled.`,
            messageId
          );
        }
      ],
      [
        () => typeof args.disable !== "undefined",
        async () => {
          const { username } = await parseServiceResult(
            authService.disableAccount(externalId, context)
          );
          return new Response(
            `The user ${username} has been disabled.`,
            messageId
          );
        }
      ],
      [
        () => typeof args.destroy !== "undefined",
        async () => {
          try {
            const { username } = await parseServiceResult(
              authService.destroyAccount(externalId, context)
            );
            return new Response(
              `The user ${username} has been deleted.`,
              messageId
            );
          } catch (ex) {
            return new Response(
              ex.code === "CANNOT_DELETE_ACTIVE_ACCOUNT"
                ? `As a safety measure, the user needs to be disabled before deleting it. Say 'user disable'.`
                : `Unable to delete the user.`,
              messageId
            );
          }
        }
      ]
    ]);
  const accountModExpressions = async () => {
    const results = await expr.collectAsync([
      [
        () => typeof args.about !== "undefined",
        async () => {
          const { username } = await parseServiceResult(
            authService.editAccountAbout(args.about, externalId, context)
          );
          return "about text";
        }
      ],
      [
        () => typeof args.domain !== "undefined",
        async () => {
          const { username } = await parseServiceResult(
            authService.editAccountDomain(args.domain, externalId, context)
          );
          return "domain";
        }
      ]
    ]);
    return results.length
      ? new Response(`Updated ${results.join(", ")}.`, messageId)
      : undefined;
  };
  return (
    (await accountCreationExpressions()) ||
    (await accountModExpressions()) ||
    new Response(`Sorry, did not follow that instruction.`, messageId)
  );
}
