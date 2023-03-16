import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
} from '@loopback/authorization/dist/types';

export async function basicAuthorization(
  context: AuthorizationContext,
  metadata: AuthorizationMetadata,
) {
  const idFromRequest = await context.invocationContext.args[0];

  let currentUserId: number;
  if (context.principals.length <= 0) {
    return AuthorizationDecision.DENY;
  }
  currentUserId = context.principals[0].user_id;
  if (context.principals[0].role == 1) {
    return AuthorizationDecision.ABSTAIN;
  }
  if (currentUserId == idFromRequest) {
    return AuthorizationDecision.ABSTAIN;
  } else {
    return AuthorizationDecision.DENY;
  }
}
