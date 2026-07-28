import { SetMetadata } from '@nestjs/common';
import { JwtPayload } from '../strategies/jwt.strategy';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Array<JwtPayload['role']>) =>
  SetMetadata(ROLES_KEY, roles);
