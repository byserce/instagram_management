export type BotStatus =
  | 'IDLE'
  | 'STARTING'
  | 'RUNNING'
  | 'WAITING_TREND_APPROVAL'
  | 'APPROVING_TREND'
  | 'GENERATING_POST'
  | 'WAITING_POST_APPROVAL'
  | 'APPROVING_POST'
  | 'REJECTING_POST'
  | 'ERROR'
  | 'UNKNOWN';

export type Post = {
  text: string;
  imageUrl: string;
};
