import {AuthenticationComponent} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {AuthorizationComponent} from '@loopback/authorization/dist/authorization-component';
import {AuthorizationTags} from '@loopback/authorization/dist/keys';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import dotenv from 'dotenv';
import path from 'path';
import {DbDataSource} from './datasources/db.datasource';
import {UserRepository} from './repositories/user.repository';
import {MySequence} from './sequence';
import {CustomJWTService} from './services/jwt.service';
import {MyAuthorizationProvider} from './services/provider.service';
import {CustomUserService} from './services/user.service';

dotenv.config();
export {ApplicationConfig};

export class HotpotManagementApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.component(AuthenticationComponent);
    // Mount jwt component
    this.component(JWTAuthenticationComponent);
    // Bind datasource
    this.dataSource(DbDataSource, UserServiceBindings.DATASOURCE_NAME);
    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    //Handle custom binding

    this.component(AuthorizationComponent);
    this.bind('authorizationProviders.my-authorizer-provider')
      .toProvider(MyAuthorizationProvider)
      .tag(AuthorizationTags.AUTHORIZER);

    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(
      CustomJWTService as any,
    );
    this.bind(UserServiceBindings.USER_SERVICE).toClass(
      CustomUserService as any,
    );
    this.bind(UserServiceBindings.USER_REPOSITORY).toClass(UserRepository);
    this.bind('datasources.db').toClass(DbDataSource);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
