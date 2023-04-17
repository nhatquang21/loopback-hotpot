import {UserService} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId} from '@loopback/security';
import bcrypt from 'bcrypt';
import {User} from '../models/user.model';
import {UserWithRelations} from './../models/user.model';
import {UserRepository} from './../repositories/user.repository';
import {MyUserProfile} from './jwt.service';

export type Credentials = {
  username: string;
  password: string;
};

export class CustomUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const invalidCredentialsError = 'Invalid username or password.';

    const foundUser = await this.userRepository.findOne({
      where: {username: credentials.username},
    });

    if (!foundUser) {
      throw new HttpErrors.Unauthorized(`User not found`);
    }

    const passwordMatched = await bcrypt.compare(
      credentials.password,
      foundUser.pwd,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(`Password doesn't match`);
    }

    return foundUser;
  }

  convertToUserProfile(user: User): MyUserProfile {
    return {
      ...user,
      [securityId]: `${user.id}`,
    };
  }

  //function to find user by id
  async findUserById(id: number): Promise<User & UserWithRelations> {
    const userNotfound = 'invalid User';
    const foundUser = await this.userRepository.findOne({
      where: {id: id},
    });

    if (!foundUser) {
      throw new HttpErrors.Unauthorized(userNotfound);
    }
    return foundUser;
  }

  async ChangePassword(
    id: number,
    password: string,
    newPassword: string,
  ): Promise<any> {
    const user = await this.findUserById(id);
    const passwordMatched = await bcrypt.compare(password, user.pwd);
    console.log(passwordMatched);
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(`Password doesn't match`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);
      console.log(hash);
      user.pwd = hash;
      console.log(user);
      await this.userRepository.updateById(id, user);
    }
  }
}
