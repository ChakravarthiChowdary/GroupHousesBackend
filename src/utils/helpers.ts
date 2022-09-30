export const checkPassword = (
  password: string,
  confirmPassword: string
): string => {
  if (password !== confirmPassword) {
    return "Passwords should match to register.";
  }

  if (password.length < 8) {
    return "Password should have minimum of 8 characters.";
  }

  if (!password.match(/[A-Z]/)) {
    return "Password should have atleast one capital letter.";
  }

  if (!password.match(/[0-9]/)) {
    return "Password should have atleast one number.";
  }

  if (!password.match(/[$&+,:;=?@#|'<>.^*()%!-]/)) {
    return "Password should have atleast on special character.";
  }

  return "";
};

const _MS_PER_DAY = 1000 * 60 * 60 * 24;

export const dateDiffInDays = (a: Date, b: Date): Number => {
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};
