-- Unique mobile and employee number on user profiles (NULLs allowed).
-- Run against AdminUsers database.

ALTER TABLE user_profiles
  ADD UNIQUE INDEX uq_user_profiles_mobile (mobile),
  ADD UNIQUE INDEX uq_user_profiles_emp_no (empNo);
