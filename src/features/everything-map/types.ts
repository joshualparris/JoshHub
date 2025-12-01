export type TocItem = {
  id: string;
  title: string;
  page?: number | null;
};

export type TocNode = TocItem & {
  children: TocNode[];
};
