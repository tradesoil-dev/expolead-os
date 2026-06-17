-- Add avatar_position_y to profiles (missing from 0005)
alter table profiles add column if not exists avatar_position_y integer default 50;
