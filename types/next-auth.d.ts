import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { Role, Status } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: Role;
      status?: Status;
      memberId?: string | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: Role;
    status?: Status;
    memberId?: string | null;
  }
}
