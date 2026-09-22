# Gator

Gator is a command-line RSS feed aggregator built with TypeScript and PostgreSQL.

It allows multiple users to add and follow RSS feeds, continuously collect posts from those feeds, and browse posts from the feeds they follow.

## Requirements

To run Gator, you'll need:

- Node.js
- npm
- PostgreSQL

## Installation

Clone the repository and install the dependencies:

```bash
git clone <your-repository-url>
cd gator-blog-aggregator
npm install
```

Create a PostgreSQL database for Gator.

Then run the database migrations:

```bash
npm run migrate
```

To make the `gator` command available globally on your machine:

```bash
npm link
```

You can then run Gator from the command line:

```bash
gator <command> [arguments]
```

## Configuration

Gator reads its configuration from:

```text
~/.gatorconfig.json
```

Create the file with the following structure:

```json
{
  "db_url": "postgres://postgres:postgres@localhost:5432/gator?sslmode=disable"
}
```

Replace the connection string with the credentials and database name for your PostgreSQL installation.

The `current_user_name` field is managed by Gator when you register or log in as a user. For example, after selecting a user the configuration may look like:

```json
{
  "db_url": "postgres://postgres:postgres@localhost:5432/gator?sslmode=disable",
  "current_user_name": "khaled"
}
```

## Usage

### Register a user

```bash
gator register khaled
```

Registering a user also makes that user the current user.

### Login

Switch to an existing user:

```bash
gator login khaled
```

### List users

```bash
gator users
```

### Add an RSS feed

```bash
gator addfeed "Lane's Blog" https://www.wagslane.dev/index.xml
```

The user who adds a feed automatically follows it.

### List feeds

```bash
gator feeds
```

### Follow a feed

```bash
gator follow https://www.wagslane.dev/index.xml
```

### List followed feeds

```bash
gator following
```

### Unfollow a feed

```bash
gator unfollow https://www.wagslane.dev/index.xml
```

### Aggregate posts

Start continuously fetching RSS feeds:

```bash
gator agg 1m
```

The duration controls how often Gator fetches the next feed. Supported units include milliseconds, seconds, minutes, and hours.

For example:

```bash
gator agg 30s
```

Stop the aggregator with `Ctrl+C`.

### Browse posts

Browse the latest posts from feeds followed by the current user:

```bash
gator browse
```

By default, Gator displays 2 posts.

You can specify a different limit:

```bash
gator browse 10
```

### Reset the database data

```bash
gator reset
```

This removes the application's users and their related data.

## Example Workflow

```bash
gator register khaled

gator addfeed "Lane's Blog" https://www.wagslane.dev/index.xml

gator agg 1m
```

After allowing the aggregator to collect posts, stop it with `Ctrl+C` and browse the results:

```bash
gator browse 5
```

## Tech Stack

- TypeScript
- Node.js
- PostgreSQL
- Drizzle ORM
- `postgres`
- `fast-xml-parser`