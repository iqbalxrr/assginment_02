export interface UserPayload {
  id: number;
  name: string;
  email: string;
  role: 'contributor' | 'maintainer';
  created_at: Date;
  updated_at: Date;
}

export interface SignupInput {
  name: string;
  email: string;
  password?: string;
  role?: 'contributor' | 'maintainer';
}

export interface LoginInput {
  email: string;
  password?: string;
}

export interface LoginResult {
  token: string;
  user: UserPayload;
}
