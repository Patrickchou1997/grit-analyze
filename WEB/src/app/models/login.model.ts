export interface LoginResponse {
  message: string;
  result: UserDetail;
  token: string;
}
export interface UserDetail {
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  user_ID: string;
  user_name: string;
  user_role: string;
}
