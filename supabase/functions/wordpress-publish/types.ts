export interface WordPressUser {
  id: number;
  username: string;
  email: string;
  name: string;
}

export interface WordPressPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  status: string;
  link: string;
  featured_media: number;
}

export interface WordPressMedia {
  id: number;
  source_url: string;
  link: string;
}

export interface ContentDerivative {
  id: string;
  derivative_type: string;
  content_type: string;
  content?: string;
  file_url?: string;
  word_count?: number;
  title: string;
}

export interface ContentItem {
  id: string;
  title: string;
  content?: string;
  user_id: string;
  tags?: string[];
}