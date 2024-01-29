export interface AuthDTO {
  email: string;
  password: string;
}

export interface SendOtpDTO {
  email: string;
}

export interface VerifyOtpDTO {
  email: string;
  code: string;
}

export interface ChangePasswordDTO {
  email: string;
  password: string;
  resetToken: string;
}
