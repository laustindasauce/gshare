export const emailIsValid = (email: string): boolean =>
  /(.+)@(.+){2,}\.(.+){2,}/.test(email);
