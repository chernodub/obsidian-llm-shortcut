export type UserContentSelectionParams = {
  readonly anchorIdx: number;
  readonly headIdx: number;
};

export type UserContentParams = {
  readonly fileContent: string;
  readonly selection: UserContentSelectionParams;
};
