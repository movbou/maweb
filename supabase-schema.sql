-- Supabase Database Schema for Kimono Anime App

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Anime List Table
CREATE TABLE IF NOT EXISTS user_anime_list (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id TEXT NOT NULL,
  anime_title TEXT NOT NULL,
  anime_image TEXT,
  anime_type TEXT,
  status TEXT CHECK (status IN ('watching', 'completed', 'plan_to_watch', 'dropped', 'on_hold')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  episodes_watched INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, anime_id)
);

-- User Watch History Table
CREATE TABLE IF NOT EXISTS user_watch_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_id TEXT NOT NULL,
  episode_id TEXT NOT NULL,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  progress REAL DEFAULT 0, -- Progress in seconds
  duration REAL, -- Total duration in seconds
  UNIQUE(user_id, anime_id, episode_id)
);

-- User Manga List Table
CREATE TABLE IF NOT EXISTS user_manga_list (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  manga_id TEXT NOT NULL,
  manga_title TEXT NOT NULL,
  manga_image TEXT,
  manga_type TEXT,
  status TEXT CHECK (status IN ('reading', 'completed', 'plan_to_read', 'dropped', 'on_hold')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  chapters_read INTEGER DEFAULT 0,
  volumes_read INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, manga_id)
);

-- User Manga Reading History Table
CREATE TABLE IF NOT EXISTS user_manga_reading_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  manga_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  page_number INTEGER DEFAULT 0, -- Current page
  total_pages INTEGER, -- Total pages in chapter
  UNIQUE(user_id, manga_id, chapter_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_anime_list_user_id ON user_anime_list(user_id);
CREATE INDEX IF NOT EXISTS idx_user_anime_list_status ON user_anime_list(status);
CREATE INDEX IF NOT EXISTS idx_user_watch_history_user_id ON user_watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watch_history_anime_id ON user_watch_history(anime_id);
CREATE INDEX IF NOT EXISTS idx_user_manga_list_user_id ON user_manga_list(user_id);
CREATE INDEX IF NOT EXISTS idx_user_manga_list_status ON user_manga_list(status);
CREATE INDEX IF NOT EXISTS idx_user_manga_reading_history_user_id ON user_manga_reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_manga_reading_history_manga_id ON user_manga_reading_history(manga_id);

-- Row Level Security (RLS) Policies
ALTER TABLE user_anime_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_manga_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_manga_reading_history ENABLE ROW LEVEL SECURITY;

-- Policies for user_anime_list
CREATE POLICY "Users can view their own list"
  ON user_anime_list FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own list"
  ON user_anime_list FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own list"
  ON user_anime_list FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own list"
  ON user_anime_list FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for user_watch_history
CREATE POLICY "Users can view their own history"
  ON user_watch_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own history"
  ON user_watch_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own history"
  ON user_watch_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own history"
  ON user_watch_history FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for user_manga_list
CREATE POLICY "Users can view their own manga list"
  ON user_manga_list FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own manga list"
  ON user_manga_list FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own manga list"
  ON user_manga_list FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own manga list"
  ON user_manga_list FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for user_manga_reading_history
CREATE POLICY "Users can view their own manga reading history"
  ON user_manga_reading_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own manga reading history"
  ON user_manga_reading_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own manga reading history"
  ON user_manga_reading_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own manga reading history"
  ON user_manga_reading_history FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_anime_list
CREATE TRIGGER update_user_anime_list_updated_at 
  BEFORE UPDATE ON user_anime_list 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_manga_list
CREATE TRIGGER update_user_manga_list_updated_at 
  BEFORE UPDATE ON user_manga_list 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
