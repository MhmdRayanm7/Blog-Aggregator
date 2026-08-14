# Gator — RSS Feed Aggregator CLI

[![CI](https://github.com/MhmdRayanm7/Blog-Aggregator/actions/workflows/ci.yml/badge.svg)](https://github.com/MhmdRayanm7/Blog-Aggregator/actions/workflows/ci.yml)

Gator is a command-line RSS feed aggregator built with **TypeScript, PostgreSQL, and Drizzle ORM**.

It allows multiple local users to add RSS feeds, follow feeds created by other users, continuously collect posts in the background, and browse the latest articles directly from the terminal.

The project was originally built as part of the Boot.dev Gator guided project and was later refactored into a cleaner layered architecture.

---

## Features

* Register local users
* Switch between existing users
* Add RSS feeds
* List feeds and their creators
* Follow and unfollow feeds
* Support many-to-many relationships between users and feeds
* Continuously fetch RSS feeds
* Fetch the least-recently-updated feed first
* Parse RSS XML
* Store posts in PostgreSQL
* Prevent duplicate posts using unique URLs
* Browse posts from feeds followed by the current user
* Configurable browse limits
* Configurable aggregation intervals
* Logged-in command middleware
* PostgreSQL migrations with Drizzle Kit
* Type-safe database access with Drizzle ORM

---

## Tech Stack

* TypeScript
* Node.js
* PostgreSQL
* Drizzle ORM
* Drizzle Kit
* postgres.js
* fast-xml-parser
* tsx
* NVM

---

## Architecture

Gator separates CLI logic, commands, database access, RSS parsing, and aggregation.

```text
CLI
 |
 v
Command Registry
 |
 +------ Logged-In Middleware
 |
 v
Command Handlers
 |
 +------------+
 |            |
 v            v
Database     RSS Service
Queries         |
 |              v
 v          Remote RSS Feeds
PostgreSQL
```

The aggregator runs as a long-lived process.

```text
Get next feed
      |
      v
Fetch RSS
      |
      v
Parse posts
      |
      v
Store new posts
      |
      v
Update last_fetched_at
      |
      v
Wait and repeat
```

---

## Requirements

Before running Gator, install:

* Git
* NVM
* Node.js
* npm
* PostgreSQL

The repository contains an `.nvmrc`, so NVM can automatically use the correct Node.js version.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/MhmdRayanm7/Blog-Aggregator.git
cd Blog-Aggregator
```

### 2. Install and activate the required Node.js version

```bash
nvm install
nvm use
```

### 3. Install dependencies

```bash
npm install
```

### 4. Verify TypeScript

```bash
npm run typecheck
```

---

## PostgreSQL Setup

Create a PostgreSQL database called:

```text
gator
```

On Linux or WSL:

```bash
sudo -u postgres psql
```

Then:

```sql
CREATE DATABASE gator;
```

Exit PostgreSQL:

```text
\q
```

You can test the connection with:

```bash
psql "postgres://postgres:YOUR_PASSWORD@localhost:5432/gator"
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

Your PostgreSQL username, password, port, or database name may be different depending on your local setup.

---

## Configuration

Gator stores its local configuration in:

```text
~/.gatorconfig.json
```

Create the file:

```bash
touch ~/.gatorconfig.json
```

Add your PostgreSQL connection string:

```json
{
  "db_url": "postgres://postgres:YOUR_PASSWORD@localhost:5432/gator?sslmode=disable"
}
```

Do **not** add `current_user_name` manually.

Gator automatically manages it when you register or log in.

An example config after using the application may look like:

```json
{
  "db_url": "postgres://postgres:YOUR_PASSWORD@localhost:5432/gator?sslmode=disable",
  "current_user_name": "lane"
}
```

> Never commit database credentials to the repository. The Gator config belongs in your home directory, outside the project.

---

## Database Migrations

Apply the existing migrations:

```bash
npm run migrate
```

When changing the database schema during development:

```bash
npm run generate
npm run migrate
```

---

## Running Gator

The general command format is:

```bash
npm run start <command> [...arguments]
```

For example:

```bash
npm run start register lane
```

---

## Commands

### Register

Creates a new user and makes that user current.

```bash
npm run start register lane
```

---

### Login

Switches to an existing user.

```bash
npm run start login lane
```

---

### Users

Lists all users and marks the current one.

```bash
npm run start users
```

Example:

```text
* lane
* allan (current)
* hunter
```

---

### Add Feed

Adds a new RSS feed.

The user who adds the feed automatically follows it.

```bash
npm run start addfeed "Hacker News" "https://news.ycombinator.com/rss"
```

---

### Feeds

Lists every feed, its URL, and the user who created it.

```bash
npm run start feeds
```

---

### Follow

Follows an existing feed.

```bash
npm run start follow "https://news.ycombinator.com/rss"
```

---

### Unfollow

Stops following a feed.

```bash
npm run start unfollow "https://news.ycombinator.com/rss"
```

---

### Following

Lists feeds followed by the current user.

```bash
npm run start following
```

---

### Aggregate

Starts the long-running RSS aggregator.

```bash
npm run start agg 1m
```

The duration supports:

```text
ms  milliseconds
s   seconds
m   minutes
h   hours
```

Examples:

```bash
npm run start agg 500ms
npm run start agg 30s
npm run start agg 1m
npm run start agg 1h
```

Gator immediately fetches one feed and then continues using the configured interval.

Stop it safely with:

```text
Ctrl+C
```

You should normally leave the aggregator running in one terminal while using Gator from another terminal.

---

### Browse

Displays recent posts from feeds followed by the current user.

```bash
npm run start browse
```

The default limit is:

```text
2
```

Provide a custom limit:

```bash
npm run start browse 10
```

---

### Reset

Deletes the local users and related application data.

```bash
npm run start reset
```

This command is mainly useful during development and testing.

---

## Example Workflow

Create a clean local environment:

```bash
npm run start reset
```

Register a user:

```bash
npm run start register lane
```

Add Hacker News:

```bash
npm run start addfeed "Hacker News" "https://news.ycombinator.com/rss"
```

Check followed feeds:

```bash
npm run start following
```

Start collecting posts:

```bash
npm run start agg 1m
```

Leave that terminal running.

Open another terminal and browse collected posts:

```bash
npm run start browse 5
```

Register another user:

```bash
npm run start register allan
```

Follow the existing Hacker News feed:

```bash
npm run start follow "https://news.ycombinator.com/rss"
```

Now both users can consume posts from the same feed without creating duplicate feed records.

---

## Database Model

Gator uses four main tables.

### users

Stores Gator users.

Each username is unique.

```text
users
├── id
├── created_at
├── updated_at
└── name
```

### feeds

Stores RSS feeds.

Each feed has one creator and a unique URL.

```text
feeds
├── id
├── created_at
├── updated_at
├── name
├── url
├── user_id
└── last_fetched_at
```

`last_fetched_at` is used by the aggregator to decide which feed should be fetched next.

### feed_follows

Implements the many-to-many relationship between users and feeds.

```text
feed_follows
├── id
├── created_at
├── updated_at
├── user_id
└── feed_id
```

A user can follow many feeds.

A feed can be followed by many users.

The same user/feed pair cannot be inserted twice.

### posts

Stores articles collected from RSS feeds.

```text
posts
├── id
├── created_at
├── updated_at
├── title
├── url
├── description
├── published_at
└── feed_id
```

Post URLs are unique.

This means repeatedly fetching the same RSS feed does not create duplicate posts.

---

## Relationships

```text
users
  |
  | creates
  v
feeds
  |
  | has
  v
posts


users
  |
  | follows
  v
feed_follows
  |
  v
feeds
```

Or more formally:

```text
users 1 ----< feeds

users >----< feeds
       through
     feed_follows

feeds 1 ----< posts
```

---

## Project Structure

```text
.
├── .nvmrc
├── drizzle.config.ts
├── package.json
├── tsconfig.json
│
└── src
    ├── index.ts
    ├── config.ts
    ├── rss.ts
    ├── aggregator.ts
    │
    ├── cli
    │   ├── middleware.ts
    │   ├── registry.ts
    │   └── types.ts
    │
    ├── commands
    │   ├── aggregate.ts
    │   ├── auth.ts
    │   ├── feeds.ts
    │   ├── follows.ts
    │   └── posts.ts
    │
    └── db
        ├── index.ts
        ├── schema.ts
        │
        ├── migrations
        │
        └── queries
            ├── users.ts
            ├── feeds.ts
            ├── feedFollows.ts
            └── posts.ts
```

### `src/index.ts`

Application entry point.

It registers the available commands and dispatches CLI arguments to the correct handler.

### `src/cli`

Contains the custom CLI infrastructure.

The project intentionally does not depend on a command framework such as Commander.

### `src/commands`

Contains command handlers grouped by feature.

```text
auth.ts       authentication and users
feeds.ts      feed management
follows.ts    following relationships
posts.ts      post browsing
aggregate.ts  long-running aggregation
```

### `src/db`

Contains the PostgreSQL connection, Drizzle schema, migrations, and queries.

Database logic is kept out of command handlers whenever possible.

### `src/rss.ts`

Fetches and parses external RSS documents.

### `src/aggregator.ts`

Coordinates feed scheduling, RSS fetching, and post persistence.

---

## npm Scripts

Run the CLI:

```bash
npm run start <command>
```

Type-check the project:

```bash
npm run typecheck
```

Generate a new Drizzle migration:

```bash
npm run generate
```

Apply migrations:

```bash
npm run migrate
```

---

## Design Decisions

### Hand-Rolled CLI

Gator uses its own command registry instead of a CLI framework.

This keeps command dispatch explicit and demonstrates how CLI applications work internally.

### Logged-In Middleware

Commands such as:

```text
addfeed
follow
unfollow
following
browse
```

require an active user.

Instead of repeating user lookup logic inside every handler, Gator wraps these commands with logged-in middleware.

### Query Layer

Database queries live separately from CLI command handlers.

This keeps the command layer focused on:

```text
input
validation
orchestration
output
```

while the database layer handles persistence.

### Feed Scheduling

The aggregator selects feeds by `last_fetched_at`.

Feeds that have never been fetched are prioritized, followed by the least recently fetched feed.

This allows one long-running worker to rotate continuously through all feeds.

### Duplicate Protection

Feed URLs and post URLs are unique.

Posts are inserted using conflict-safe behavior, preventing repeated RSS downloads from creating duplicate articles.

---

## Development

After changing TypeScript code:

```bash
npm run typecheck
```

After changing `src/db/schema.ts`:

```bash
npm run generate
npm run migrate
```

For manual database inspection:

```bash
psql "postgres://postgres:YOUR_PASSWORD@localhost:5432/gator"
```

Useful PostgreSQL commands:

```sql
\dt
```

```sql
SELECT * FROM users;
SELECT * FROM feeds;
SELECT * FROM feed_follows;
SELECT * FROM posts;
```

---

## RSS Feeds to Try

Hacker News:

```text
https://news.ycombinator.com/rss
```

TechCrunch:

```text
https://techcrunch.com/feed/
```

Boot.dev:

```text
https://www.boot.dev/blog
```

Not every website exposes RSS in exactly the same structure, so some feeds may require additional parser support.

---

## Troubleshooting

### `Unknown command`

Make sure the command exists and is registered in the CLI registry.

Example:

```bash
npm run start users
```

### Database connection fails

Verify PostgreSQL is running and confirm your connection string:

```bash
psql "postgres://postgres:YOUR_PASSWORD@localhost:5432/gator"
```

### Tables do not exist

Apply migrations:

```bash
npm run migrate
```

### `browse` returns no posts

Make sure:

1. A user is logged in.
2. The user follows at least one feed.
3. The aggregator has collected posts.

Run:

```bash
npm run start following
```

Then start:

```bash
npm run start agg 10s
```

After some feeds have been fetched:

```bash
npm run start browse 5
```


