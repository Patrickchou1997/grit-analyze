export interface GRIT {
  grit_all: number;
  passion: number;
  perseverance: number;
  message: string;
}
export interface GritResponse {
  student_ID: number;
  Grit: number;
  GritPassion: number;
  GritPerseverance: number;
  message: string;
  feature: {
    [key: string]: number;
  };
}