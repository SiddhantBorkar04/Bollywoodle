-- First, let's make sure we're starting fresh (optional)
-- TRUNCATE TABLE songs;

-- Insert the songs
INSERT INTO songs (title, artist, soundcloud_id, embed_url, is_daily_song)
VALUES 
  ('Tum Hi Ho', 'Arijit Singh', '760293922', 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/760293922&auto_play=false', false),
  ('Chaiyya Chaiyya', 'A.R. Rahman', '760293922', 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/760293922&auto_play=false', false),
  ('Jai Ho', 'A.R. Rahman', '760293922', 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/760293922&auto_play=false', false);

-- Set one song as the daily song (optional)
UPDATE songs 
SET is_daily_song = true 
WHERE title = 'Tum Hi Ho' 
LIMIT 1; 