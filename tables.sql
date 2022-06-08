CREATE table users (
   id serial NOT NULL PRIMARY KEY, 
   "createdAt" date NOT NULL DEFAULT NOW(),
   name text NOT NULL,
   email text UNIQUE NOT NULL,
   password text NOT NULL
);

CREATE table links (
   id serial NOT NULL PRIMARY KEY,
   "createdAt" date NOT NULL DEFAULT NOW(), 
   "shortUrl" text UNIQUE NOT NULL,
   url text UNIQUE NOT NULL,
   "visitCount" integer NOT NULL,
   "userId" integer NOT NULL REFERENCES users(id)
);

CREATE table sessions (
   id serial NOT NULL PRIMARY KEY,
   "createdAt" date NOT NULL DEFAULT NOW(), 
   token text UNIQUE NOT NULL,
   "startSession" TIMESTAMP NOT NULL DEFAULT NOW(),
   "endSession" TIMESTAMP,
   "userId" integer NOT NULL REFERENCES users(id)
);