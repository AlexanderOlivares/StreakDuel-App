declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      // Custom prop to prompt user to change display name
      mustUpdateUsername?: boolean;
    };
    expires: ISODateString;
  }
}
export { Session };
