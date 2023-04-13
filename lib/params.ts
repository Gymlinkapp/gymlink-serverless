import type { NextApiRequest, NextApiResponse } from 'next';

export type Params<T> = {
  req: NextApiRequest;
  res: NextApiResponse<T>;
};
