export type OperationalRecord = {
  _id: string;
  name: string;
  organizationUnit?: { _id: string; name: string; type: string } | null;
};
