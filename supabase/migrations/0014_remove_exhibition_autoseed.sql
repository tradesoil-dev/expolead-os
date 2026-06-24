-- Remove the exhibition auto-seed for good.
-- The real trigger was on_auth_user_created_seed_exhibitions on auth.users
-- (calling seed_default_exhibitions_for_new_user) — NOT the names guessed in
-- migration 0010, which is why new accounts kept getting CHINACOAT + ICIF.
-- New accounts now start empty; users build their list from the library picker.
-- NOTE: do NOT drop on_auth_user_created — that creates the profile + trial.

drop trigger if exists on_auth_user_created_seed_exhibitions on auth.users;
drop function if exists seed_default_exhibitions_for_new_user();
