import {TokenService} from '@loopback/authentication';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

interface Principal {
  [securityId]: string;
}
export interface MyUserProfile extends UserProfile {
  username?: string;
  id?: number;
  createdOn?: string;
  updatedOn?: string;
  roleId?: number;
}

export class CustomJWTService implements TokenService {
  constructor() {}

  async verifyToken(token: string): Promise<MyUserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : 'token' is null`,
      );
    }
    let userProfile: MyUserProfile;
    let secretKey: string =
      '381cca8ca044c9f1dfae06dccad603beb1645518e0a1fe8879914e0e31a2744e6ac5d27ee1ab03bae0e683770e69bd8f133112ec229b19e98aa488dbbb918465acc0a9fbe6be2e0e9c6d70308ab2cf54e9385429db564f70778e9a621975d71ff91ed1312c862b2c5b251756135ee0fb89ac1b7e64bebd538522b6e40abc567c';
    try {
      const decoded = jwt.verify(token, secretKey) as MyUserProfile;

      userProfile = {
        ...decoded,
        [securityId]: decoded.user_id?.toString(),
      };
    } catch (e) {
      throw new HttpErrors.Unauthorized(`Error verifying token : ${e.message}`);
    }

    return userProfile;
  }

  async generateToken(userProfile: MyUserProfile): Promise<string> {
    const privateKey =
      '381cca8ca044c9f1dfae06dccad603beb1645518e0a1fe8879914e0e31a2744e6ac5d27ee1ab03bae0e683770e69bd8f133112ec229b19e98aa488dbbb918465acc0a9fbe6be2e0e9c6d70308ab2cf54e9385429db564f70778e9a621975d71ff91ed1312c862b2c5b251756135ee0fb89ac1b7e64bebd538522b6e40abc567c';
    const token = jwt.sign(
      {
        [securityId]: userProfile.id?.toString(),
        user_id: userProfile.id,
        username: userProfile.username,
        createdOn: userProfile.createdOn,
        updatedOn: userProfile.updatedOn,
        role: userProfile.roleId,
      },
      privateKey,
      {
        expiresIn: '1h',
      },
    );
    return token;
  }
}
