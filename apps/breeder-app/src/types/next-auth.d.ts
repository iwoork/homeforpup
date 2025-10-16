import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      userType?: string
      isVerified?: boolean
      phone?: string | null
      location?: string | null
      bio?: string | null
      firstName?: string | null
      lastName?: string | null
    }
    accessToken?: string
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    userType?: string
    isVerified?: boolean
    phone?: string | null
    location?: string | null
    bio?: string | null
    firstName?: string | null
    lastName?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    userType?: string
    isVerified?: boolean
    phone?: string
    location?: string
    bio?: string
    firstName?: string
    lastName?: string
  }
}
