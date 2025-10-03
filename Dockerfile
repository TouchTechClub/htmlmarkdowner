# Build stage
FROM oven/bun:1 AS builder

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json bun.lock* ./

# Install all dependencies (including devDependencies for build)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build standalone executable
RUN bun run build

# Production stage - use minimal base image
FROM debian:bookworm-slim

# Install required runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy the compiled executable from builder
COPY --from=builder /app/htmlmarkdowner /app/htmlmarkdowner

# Expose the port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Run the compiled executable
CMD ["./htmlmarkdowner"]

