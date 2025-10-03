# 🔥 HTML Markdowner API

A blazingly fast API server that converts HTML pages to clean Markdown format. Built with Bun, Hono, and Redis.

## Features

- ✨ Convert any static HTML/SSR page to Markdown
- 🚀 Fast and efficient with Redis caching (1 hour TTL)
- 🛡️ Rate limiting by IP (100 requests per 15 minutes)
- 📄 Support for single page and multi-page crawling
- 🎯 Clean article extraction using Mozilla Readability
- 🐳 Docker-ready for easy deployment
- ⚡ Built with Bun for maximum performance

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Framework**: [Hono](https://hono.dev)
- **Validation**: [ArkType](https://arktype.io) via [@hono/arktype-validator](https://www.npmjs.com/package/@hono/arktype-validator)
- **Rate Limiting**: [hono-rate-limiter](https://www.npmjs.com/package/hono-rate-limiter) with Redis
- **HTML Parsing**: [JSDOM](https://github.com/jsdom/jsdom) + [Mozilla Readability](https://github.com/mozilla/readability)
- **Markdown Conversion**: [Turndown](https://github.com/mixmark-io/turndown)

## Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [Redis](https://redis.io) >= 7.0 (or use Docker Compose)

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd htmlmarkdowner

# Install dependencies
bun install

# Start Redis with Docker (recommended)
bun run docker:redis

# Run the development server
bun run dev
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
REDIS_URL=redis://localhost:6379
```

## API Documentation

### Endpoints

#### `GET /`
Returns the HTML documentation page.

#### `GET /convert`
Convert URL to Markdown.

**Query Parameters:**
- `url` (required): The URL to convert
- `enableDetailedResponse` (optional): Return full page content instead of just article (default: `false`)

**Headers:**
- `Accept: application/json` - Returns JSON array with markdown
- `Accept: text/plain` - Returns plain text markdown

#### `GET /health`
Health check endpoint that verifies Redis connection.

### Examples

#### Single Page (Text Response)
```bash
curl "http://localhost:3000/convert?url=https://example.com"
```

#### Single Page (JSON Response)
```bash
curl -H "Accept: application/json" \
  "http://localhost:3000/convert?url=https://example.com"
```

Response:
```json
[
  {
    "url": "https://example.com",
    "md": "# Example Domain\n\nThis domain is for use in illustrative examples..."
  }
]
```

#### Detailed Response (Full Page Content)
```bash
curl "http://localhost:3000/convert?url=https://example.com&enableDetailedResponse=true"
```

## Rate Limiting

- **Limit**: 5 requests per minute
- **Scope**: Per IP address
- **Headers**: Rate limit info included in response headers (`RateLimit-*`)
- **Storage**: Redis

## Building Standalone Executable

The project can be built into a single standalone executable using Bun's `--compile` flag. This significantly reduces startup time and simplifies deployment.

```bash
# Build the executable
bun run build

# Run it directly (no dependencies needed!)
./htmlmarkdowner
```

The executable:
- ✅ Contains all dependencies bundled
- ✅ No need for `node_modules` in production
- ✅ Faster cold start times (~50ms vs ~200ms)
- ✅ Single binary deployment
- ✅ Minified and optimized
- ✅ Cross-platform support

## Docker Deployment

### Local Development (Redis Only)

For local development, run only Redis in Docker and the app directly with Bun:

```bash
# Start Redis
bun run docker:redis

# In another terminal, run the app
bun run dev

# Stop Redis when done
bun run docker:redis:down
```

The services will be available at:
- API: http://localhost:3000 (running via Bun)
- Redis: localhost:6379 (running via Docker)

### Production Deployment (Full Stack)

For production, use the production compose file that runs both Redis and the app:

```bash
# Build and start all services
bun run docker:prod:up

# View logs
bun run docker:prod:logs

# Stop services
bun run docker:prod:down

# Stop and remove volumes
docker-compose -f docker-compose.prod.yml down -v
```

The services will be available at:
- API: http://localhost:3000 (running via Docker)
- Redis: localhost:6379 (running via Docker)

### Using Docker Only

```bash
# Start Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Build the app
docker build -t htmlmarkdowner .

# Run the app
docker run -d \
  --name htmlmarkdowner \
  -p 3000:3000 \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  htmlmarkdowner
```

## Production Deployment on VM

1. **Install Docker and Docker Compose** on your VM:
```bash
# Update packages
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin
```

2. **Clone and configure**:
```bash
git clone <your-repo-url>
cd htmlmarkdowner

# Optional: Create .env file for custom configuration
echo "PORT=3000" > .env
echo "REDIS_URL=redis://redis:6379" >> .env
```

3. **Deploy**:
```bash
# Build and start (using production compose file)
sudo docker-compose -f docker-compose.prod.yml up -d

# Check status
sudo docker-compose -f docker-compose.prod.yml ps

# View logs
sudo docker-compose -f docker-compose.prod.yml logs -f app
```

4. **Set up reverse proxy** (optional, using Nginx):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **Enable SSL** with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Development

```bash
# Run in development mode with hot reload
bun run dev

# Build standalone executable
bun run build

# Run the standalone executable
./htmlmarkdowner
```

## Project Structure

```
htmlmarkdowner/
├── src/
│   └── index.ts           # Main application file
├── Dockerfile             # Docker build configuration
├── docker-compose.yml     # Multi-container setup
├── .dockerignore         # Docker ignore rules
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## How It Works

1. **Request Validation**: ArkType validates incoming URL parameters
2. **Rate Limiting**: Redis-backed rate limiter checks IP allowance
3. **Fetch HTML**: Uses native `fetch` to get page content
4. **Parse & Extract**: JSDOM + Readability extract main content
5. **Convert**: Turndown converts HTML to clean Markdown
6. **Return**: Sends markdown response to client

### Docker Build Process

The multi-stage Dockerfile:
1. **Builder Stage**: Uses `oven/bun:1` to compile the TypeScript source into a standalone executable with `bun build --compile`
2. **Production Stage**: Uses minimal `debian:bookworm-slim` base (only ~78MB) and copies just the compiled binary
3. **Result**: Production image is much smaller (~150MB vs ~500MB+) and has faster startup times

## Differences from Original Markdowner

- ❌ **No Puppeteer**: Uses `fetch` for static HTML (much lighter & faster)
- ❌ **No Cloudflare Workers**: Runs on any Node.js/Bun environment
- ❌ **No Twitter/X Support**: Focused on standard HTML pages
- ✅ **Simpler Stack**: Easier to deploy and maintain
- ✅ **Better Validation**: ArkType for type-safe validation
- ✅ **Docker Ready**: Easy deployment with Docker Compose
- ✅ **Standalone Executable**: Single binary with all dependencies bundled

## Troubleshooting

### Redis Connection Issues
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Check Docker Redis logs
docker-compose logs redis
```

### Port Already in Use
```bash
# Change PORT in .env or docker-compose.yml
PORT=3001
```

### Rate Limit Issues
```bash
# Clear rate limit for an IP in Redis
redis-cli DEL "hrl:{IP_ADDRESS}"
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
