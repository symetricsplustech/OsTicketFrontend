const invitationPath = /^\/platform\/invitations\/[a-f0-9]{24}\?token=[a-f0-9]{64}$/;

export function invitationReturnTo(value: string | null | undefined): string {
  return value && invitationPath.test(value) ? value : "";
}
