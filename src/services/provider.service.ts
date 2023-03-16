import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  Authorizer,
} from '@loopback/authorization/dist/types';
import {Provider} from '@loopback/core';

export class MyAuthorizationProvider implements Provider<Authorizer> {
  /**
   * @returns an authorizer function
   *
   */
  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    context: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ) {
    if (context.principals.length <= 0) {
      return AuthorizationDecision.DENY;
    }
    let idRole = context.principals[0].role;
    let clientRole =
      idRole == 1
        ? 'ADMIN'
        : idRole == 2
        ? 'Employees'
        : idRole == 3
        ? 'Customer'
        : null;
    console.log(clientRole);
    if (!clientRole) {
      return AuthorizationDecision.DENY;
    }

    console.log(metadata.allowedRoles);
    const allowedRoles = metadata.allowedRoles;
    if (!allowedRoles) {
      return AuthorizationDecision.DENY;
    }

    return allowedRoles?.includes(clientRole)
      ? AuthorizationDecision.ALLOW
      : AuthorizationDecision.DENY;
  }
}
