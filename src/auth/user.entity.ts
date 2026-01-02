export interface User {
  resetOtp: any;
  id: string;
  email: string;
  password: string;
  token?: string;
  role: string;
  permissions: string[];
  resetToken: string;
  resetExpires: number;
  fcmToken: string;
  // các field khác nếu cần
}
