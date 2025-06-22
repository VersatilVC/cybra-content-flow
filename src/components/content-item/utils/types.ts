
export interface ParsedSocialContent {
  linkedin?: string | SocialPostData;
  x?: string | SocialPostData;
}

export interface SocialPostData {
  text: string;
  image_url?: string;
}
