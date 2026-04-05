export class AuthError extends Error {
  constructor(message = "ログインが必要です。") {
    super(message);
    this.name = "AuthError";
  }
}

export class PermissionError extends Error {
  constructor(message = "権限がありません。") {
    super(message);
    this.name = "PermissionError";
  }
}