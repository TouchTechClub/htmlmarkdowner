# 🔥 HTML Markdowner API

A blazingly fast API server that converts HTML pages to clean Markdown format. Built with Bun, Hono, and Redis.

## Features

- ✨ Convert any static HTML/SSR page to Markdown
- 🚀 Fast and efficient with Redis caching
- 🛡️ Rate limiting by IP (5 requests per minute)
- 🎯 Clean article extraction using Mozilla Readability
- 📚 Interactive API documentation with Scalar
- 🐳 Docker-ready for easy deployment
- ⚡ Built with Bun for maximum performance
- 🔧 Type-safe validation with Zod
- 📋 OpenAPI 3.1 specification

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) (v1.0+)
- **Framework**: [Hono](https://hono.dev) with [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
- **API Documentation**: [@scalar/hono-api-reference](https://github.com/scalar/scalar/tree/main/packages/hono-api-reference)
- **Validation**: [Zod](https://zod.dev) with [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
- **Rate Limiting**: [hono-rate-limiter](https://github.com/rhinobase/hono-rate-limiter) with [rate-limit-redis](https://github.com/wyattjoh/rate-limit-redis)
- **Caching**: [Redis](https://redis.io) (v7.0+)
- **HTML Parsing**: [JSDOM](https://github.com/jsdom/jsdom) + [Mozilla Readability](https://github.com/mozilla/readability)
- **Markdown Conversion**: [Turndown](https://github.com/mixmark-io/turndown)
- **Linting/Formatting**: [Biome](https://biomejs.dev)

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

### Interactive Documentation

Visit `http://localhost:3000` to access the interactive API documentation powered by [Scalar](https://scalar.com). The documentation is auto-generated from OpenAPI 3.1 specifications.

### Endpoints

#### `GET /`
Returns the interactive API documentation page using Scalar.

#### `GET /convert`
Convert URL to Markdown.

**Query Parameters:**
- `url` (required): The URL to convert to Markdown (must be a valid HTTP/HTTPS URL)
- `enableDetailedResponse` (optional): Return full page content instead of just article content (default: `false`)

**Headers:**
- `Accept: application/json` - Returns JSON array with markdown content
- `Accept: text/plain` - Returns plain text markdown (default)

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

- **Limit**: 5 requests per minute per IP address
- **Scope**: Per IP address (supports proxy headers: `CF-Connecting-IP`, `X-Forwarded-For`, `X-Real-IP`)
- **Headers**: Rate limit info included in response headers (`RateLimit-*`)
- **Storage**: Redis with `rate-limit-redis`
- **Standard**: [IETF Draft 7](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/) compliant

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

### Available Scripts

```bash
# Development
bun run dev              # Run in development mode with hot reload
bun run start            # Run production server (src/index.ts)

# Building
bun run build            # Build standalone executable with minification

# Code Quality
bun run format           # Format code with Biome
bun run format:check     # Check code formatting
bun run lint             # Lint and fix code with Biome
bun run lint:check       # Check linting without fixing
bun run check            # Run both formatting and linting
bun run check:ci         # CI-friendly check (no fixes)

# Docker
bun run docker:redis     # Start Redis container for development
bun run docker:redis:down # Stop Redis container
bun run docker:prod:build # Build production Docker image
bun run docker:prod:up   # Start production stack
bun run docker:prod:down # Stop production stack
bun run docker:prod:logs # View production logs
```

### Development Setup

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Start Redis** (choose one):
   ```bash
   # Option 1: Docker (recommended)
   bun run docker:redis

   # Option 2: Local Redis installation
   redis-server
   ```

3. **Run development server**:
   ```bash
   bun run dev
   ```

4. **Access the application**:
   - API: http://localhost:3000
   - Documentation: http://localhost:3000
   - Health Check: http://localhost:3000/health

### Code Quality

The project uses [Biome](https://biomejs.dev) for fast linting and formatting:

- **Formatting**: Tab indentation, double quotes
- **Linting**: Recommended rules enabled
- **Import Organization**: Automatic import sorting

## Project Structure

```
htmlmarkdowner/
├── src/
│   ├── config/
│   │   └── redis.ts           # Redis client configuration
│   ├── lib/
│   │   ├── markdown.ts        # HTML to Markdown conversion logic
│   │   └── validation.ts      # Zod schemas and validation helpers
│   ├── middleware/
│   │   └── rate-limiter.ts    # Rate limiting middleware
│   ├── routes/
│   │   ├── convert.ts         # URL conversion endpoint
│   │   ├── health.ts          # Health check endpoint
│   │   └── index.ts           # Route mounting and OpenAPI setup
│   └── index.ts               # Main application entry point
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Development Redis setup
├── docker-compose.prod.yml    # Production deployment
├── biome.json                 # Linting and formatting configuration
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## How It Works

1. **Request Validation**: Zod schemas validate and transform incoming URL parameters
2. **Rate Limiting**: Redis-backed rate limiter checks IP-based request limits
3. **Fetch HTML**: Uses native `fetch` with browser User-Agent to get page content
4. **Parse & Extract**: JSDOM creates DOM, Readability extracts article content (or full body if detailed response requested)
5. **Clean HTML**: Removes unwanted elements (scripts, styles, iframes, etc.)
6. **Convert**: Turndown converts cleaned HTML to clean Markdown with ATX headings and fenced code blocks
7. **Return**: Sends markdown response in requested format (JSON or plain text)

### Docker Build Process

The multi-stage Dockerfile optimizes for both build speed and runtime efficiency:

1. **Builder Stage** (`oven/bun:1`):
   - Installs all dependencies (including dev dependencies)
   - Copies source code
   - Builds standalone executable with `bun build --compile --minify --sourcemap --target bun`

2. **Production Stage** (`debian:bookworm-slim`):
   - Minimal base image (~78MB) with only essential runtime dependencies
   - Installs `ca-certificates` for HTTPS requests
   - Copies only the compiled binary (no source code or dependencies)
   - Exposes port 3000 and sets production environment

3. **Result**: Production image (~150MB) with fast startup times and no unnecessary dependencies

## Differences from Original Markdowner

- ❌ **No Puppeteer**: Uses `fetch` for static HTML (much lighter & faster)
- ❌ **No Cloudflare Workers**: Runs on any Node.js/Bun environment
- ❌ **No Twitter/X Support**: Focused on standard HTML pages
- ✅ **Simpler Stack**: Easier to deploy and maintain
- ✅ **Better Validation**: Zod for type-safe validation
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

## Credits

This project is an alternative implementation of [markdowner](https://github.com/supermemoryai/markdowner) by [supermemoryai](https://supermemory.ai). While the original markdowner uses Puppeteer for dynamic content rendering, htmlmarkdowner focuses on static/SSR pages with a simpler stack.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
