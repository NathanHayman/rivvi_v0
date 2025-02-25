-- Create the enum type first if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'user', 'superadmin');
    END IF;
END $$;

-- Alter the users table, explicitly casting the role column
ALTER TABLE "users" ALTER COLUMN "role" TYPE user_role USING 
  CASE 
    WHEN "role" = 'admin' THEN 'admin'::user_role
    WHEN "role" = 'user' THEN 'user'::user_role
    WHEN "role" = 'superadmin' THEN 'superadmin'::user_role
    ELSE 'user'::user_role  -- Default fallback if the value is unexpected
  END;

-- Set the default for future rows
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'::user_role; 