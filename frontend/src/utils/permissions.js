export const canCreateCrime = (role) =>
  role === "ADMIN" || role === "OFFICER";

export const canUploadEvidence = (role) =>
  role === "ADMIN" || role === "OFFICER";

export const canManageUsers = (role) =>
  role === "ADMIN";

export const canUpdateCase = (role) =>
  role === "ADMIN" || role === "OFFICER" || role === "INVESTIGATOR";
