# Deployment Guide

This guide provides comprehensive instructions for deploying the Next.js daily task planner application to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Build Process](#build-process)
4. [Deployment Options](#deployment-options)
5. [Database Configuration](#database-configuration)
6. [Security Considerations](#security-considerations)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Scaling and Performance](#scaling-and-performance)
9. [Backup and Recovery](#backup-and-recovery)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

#### Minimum Requirements

- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 10GB available space
- **OS**: Linux (Ubuntu 20.04+ recommended), macOS, or Windows Server

#### Recommended Requirements

- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **Network**: Stable internet connection

### Software Requirements

#### Runtime Environment

- **Node.js**: Version 18.0 or higher
- **Bun**: Version 1.0 or higher (optional, can use npm/yarn)
- **SQLite**: Version 3 or higher

#### Development Tools (for custom builds)

- **Git**: Version 2.0 or higher
- **Build tools**: Make, GCC (for native modules)

### Third-party Services

#### Optional Services

- **CDN**: For static asset delivery (Cloudflare, AWS CloudFront)
- **Monitoring**: Application monitoring (Datadog, New Relic)
- **Logging**: Centralized logging (ELK Stack, LogRocket)
- **Backup**: Cloud storage (AWS S3, Google Cloud Storage)

## Environment Configuration

### Environment Variables

Create a `.env.production` file with the following variables:

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_NAME="Daily Task Planner"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_API_URL="https://your-domain.com/api"

# Database
DATABASE_URL="file:./prod.sqlite.db"

# Security
JWT_SECRET="your-super-secret-jwt-key-change-this"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=application/pdf,image/*,text/*
UPLOAD_PATH="./uploads"

# Search
SEARCH_DEBOUNCE_MS=300
ELASTICSEARCH_URL=""  # Optional, for advanced search

# Monitoring
ENABLE_METRICS=true
METRICS_ENDPOINT="/api/metrics"
SENTRY_DSN=""  # Optional, for error tracking

# Performance
ENABLE_COMPRESSION=true
ENABLE_CACHING=true
CACHE_TTL=3600  # 1 hour in seconds
```

### Configuration Files

#### Next.js Configuration (`next.config.production.js`)

```javascript
const nextConfig = {
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

#### PM2 Configuration (`ecosystem.config.js`)

```javascript
module.exports = {
  apps: [
    {
      name: "task-planner",
      script: "./dist/server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      max_memory_restart: "1G",
      node_args: "--max-old-space-size=4096",
    },
  ],
};
```

## Build Process

### Local Build

1. **Install Dependencies**

   ```bash
   bun install
   # or
   npm install
   # or
   yarn install
   ```

2. **Run Tests**

   ```bash
   bun test
   # or
   npm test
   # or
   yarn test
   ```

3. **Build Application**

   ```bash
   bun run build
   # or
   npm run build
   # or
   yarn build
   ```

4. **Verify Build**
   ```bash
   bun start
   # or
   npm start
   # or
   yarn start
   ```

### Docker Build

#### Multi-stage Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Create necessary directories
RUN mkdir -p /app/uploads /app/data /app/logs
RUN chown -R nextjs:nodejs /app/uploads /app/data /app/logs

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["bun", "start"]
```

#### Docker Build Commands

```bash
# Build the image
docker build -t task-planner:latest .

# Tag the image
docker tag task-planner:latest your-registry/task-planner:v1.0.0

# Push to registry
docker push your-registry/task-planner:v1.0.0
```

### CI/CD Pipeline

#### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "bun"

      - name: Setup Bun
        run: |
          curl -fsSLo- https://bun.sh/install | bash
          echo "$HOME/.bun/bin" >> $GITHUB_PATH

      - name: Install dependencies
        run: bun install

      - name: Run tests
        run: bun test

      - name: Build application
        run: bun run build
        env:
          NODE_ENV: production

      - name: Build Docker image
        run: |
          docker build -t task-planner:${{ github.sha }} .
          docker tag task-planner:${{ github.sha }} task-planner:latest

      - name: Deploy to staging
        if: github.ref == 'refs/heads/main'
        run: |
          # Deploy to staging environment
          # Add your deployment script here

      - name: Deploy to production
        if: github.event_name == 'release'
        run: |
          # Deploy to production environment
          # Add your deployment script here
```

## Deployment Options

### 1. Vercel Deployment

#### Automatic Deployment

1. **Connect to GitHub**

   - Go to [Vercel Dashboard](https://vercel.com)
   - Import your GitHub repository
   - Configure project settings

2. **Environment Variables**

   - Add all required environment variables
   - Set `NODE_ENV` to `production`

3. **Build Settings**

   ```json
   {
     "buildCommand": "bun run build",
     "outputDirectory": "dist",
     "devCommand": "bun dev"
   }
   ```

4. **Deploy**
   - Vercel will automatically deploy on git push
   - Monitor deployment in the dashboard

#### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
# ... add other variables
```

### 2. AWS Deployment

#### Using AWS Elastic Beanstalk

1. **Prepare Application**

   ```bash
   # Create application package
   zip -r task-planner.zip . -x "*.git*" "node_modules/*" ".env*"
   ```

2. **Create Elastic Beanstalk Application**

   ```bash
   # Install AWS CLI
   pip install awscli

   # Configure AWS credentials
   aws configure

   # Create application
   aws elasticbeanstalk create-application --application-name task-planner

   # Create application version
   aws elasticbeanstalk create-application-version \
     --application-name task-planner \
     --version-label v1.0.0 \
     --source-bundle S3Bucket="your-bucket" S3Key="task-planner.zip"
   ```

3. **Create Environment**
   ```bash
   aws elasticbeanstalk create-environment \
     --application-name task-planner \
     --environment-name task-planner-prod \
     --solution-stack-name "64bit Amazon Linux 2 v5.8.4 running Node.js 18.x" \
     --version-label v1.0.0 \
     --option-settings \
       Namespace=aws:autoscaling:launchconfiguration,OptionName=InstanceType,Value=t3.medium \
       Namespace=aws:autoscaling:asg,OptionName=MinSize,Value=2 \
       Namespace=aws:autoscaling:asg,OptionName=MaxSize,Value=6
   ```

#### Using AWS ECS/Fargate

1. **Create ECS Cluster**

   ```bash
   aws ecs create-cluster --cluster-name task-planner-cluster
   ```

2. **Create Task Definition**

   ```json
   {
     "family": "task-planner-task",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "task-planner",
         "image": "your-registry/task-planner:latest",
         "portMappings": [
           {
             "containerPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/task-planner",
             "awslogs-region": "us-east-1",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

3. **Create Service**
   ```bash
   aws ecs create-service \
     --cluster task-planner-cluster \
     --service-name task-planner-service \
     --task-definition task-planner-task \
     --desired-count 2 \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
   ```

### 3. Google Cloud Platform Deployment

#### Using Google Cloud Run

1. **Build and Push Container**

   ```bash
   # Build container
   gcloud builds submit --tag gcr.io/your-project/task-planner

   # Deploy to Cloud Run
   gcloud run deploy task-planner \
     --image gcr.io/your-project/task-planner \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

2. **Set Environment Variables**
   ```bash
   gcloud run services update task-planner \
     --set-env-vars NODE_ENV=production \
     --set-env-vars DATABASE_URL="your-database-url"
   ```

### 4. DigitalOcean Deployment

#### Using App Platform

1. **Connect GitHub Repository**

   - Go to DigitalOcean App Platform
   - Connect your GitHub repository
   - Configure build settings

2. **Environment Variables**

   - Add environment variables in the dashboard
   - Set resource limits

3. **Deploy**
   - App Platform will automatically deploy
   - Monitor deployment progress

#### Using Droplets

1. **Create Droplet**

   ```bash
   # Create droplet with doctl
   doctl compute droplet create task-planner-prod \
     --image ubuntu-22-04-x64 \
     --size s-2vcpu-4gb \
     --region nyc1
   ```

2. **Setup Environment**

   ```bash
   # SSH to droplet
   ssh root@your-droplet-ip

   # Install dependencies
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt-get install -y nodejs
   npm install -g pm2

   # Clone and setup application
   git clone your-repo.git
   cd task-planner
   npm install
   npm run build
   ```

3. **Configure Reverse Proxy**

   ```nginx
   # Nginx configuration
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
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Start Application**

   ```bash
   # Start with PM2
   pm2 start npm --name "task-planner" -- start

   # Setup startup script
   pm2 startup
   pm2 save
   ```

### 5. Kubernetes Deployment

#### Basic Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: task-planner
  labels:
    app: task-planner
spec:
  replicas: 3
  selector:
    matchLabels:
      app: task-planner
  template:
    metadata:
      labels:
        app: task-planner
    spec:
      containers:
        - name: task-planner
          image: your-registry/task-planner:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: database-url
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: task-planner-service
spec:
  selector:
    app: task-planner
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: task-planner-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - your-domain.com
      secretName: task-planner-tls
  rules:
    - host: your-domain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: task-planner-service
                port:
                  number: 80
```

#### Apply Configuration

```bash
# Apply manifests
kubectl apply -f deployment.yaml

# Check deployment status
kubectl get pods
kubectl get services
kubectl get ingress
```

## Database Configuration

### SQLite Configuration

#### Production SQLite Setup

1. **Database File Location**

   ```bash
   # Create data directory
   mkdir -p /app/data
   chown -R nextjs:nodejs /app/data

   # Set database URL
   DATABASE_URL="file:/app/data/prod.sqlite.db"
   ```

2. **Database Optimization**

   ```sql
   -- Enable WAL mode for better concurrency
   PRAGMA journal_mode=WAL;

   -- Optimize for performance
   PRAGMA synchronous=NORMAL;
   PRAGMA cache_size=10000;
   PRAGMA temp_store=memory;
   PRAGMA mmap_size=268435456; -- 256MB
   ```

3. **Backup Strategy**

   ```bash
   # Create backup script
   #!/bin/bash
   sqlite3 /app/data/prod.sqlite.db ".backup /backup/prod_$(date +%Y%m%d_%H%M%S).sqlite.db"

   # Schedule with cron
   0 2 * * * /path/to/backup-script.sh
   ```

### PostgreSQL Configuration (Alternative)

#### Setup PostgreSQL

1. **Environment Variables**

   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```

2. **Connection Pooling**

   ```javascript
   // lib/db.js
   import { Pool } from "pg";

   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl:
       process.env.NODE_ENV === "production"
         ? { rejectUnauthorized: false }
         : false,
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });

   export default pool;
   ```

3. **Migration Script**
   ```bash
   # Run migrations
   npx drizzle-kit push
   ```

### Database Migration

#### Migration Script

```javascript
// scripts/migrate.js
import { migrate } from "drizzle-orm/node-sqlite3/migrator";
import { db } from "../src/lib/db";

async function runMigration() {
  try {
    await migrate(db, { migrationsFolder: "./src/lib/migrations" });
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
```

#### Run Migration

```bash
# Run migration
node scripts/migrate.js

# Or with Docker
docker exec -it container-name node scripts/migrate.js
```

## Security Considerations

### Application Security

#### HTTPS Configuration

1. **SSL Certificate**

   ```bash
   # Using Let's Encrypt
   sudo apt-get install certbot
   sudo certbot certonly --standalone -d your-domain.com

   # Nginx configuration
   server {
       listen 443 ssl http2;
       server_name your-domain.com;

       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

       # SSL Configuration
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
       ssl_prefer_server_ciphers off;
       ssl_session_cache shared:SSL:10m;
       ssl_session_timeout 10m;
   }
   ```

2. **Security Headers**
   ```javascript
   // next.config.js
   async headers() {
     return [
       {
         source: '/(.*)',
         headers: [
           { key: 'X-Content-Type-Options', value: 'nosniff' },
           { key: 'X-Frame-Options', value: 'DENY' },
           { key: 'X-XSS-Protection', value: '1; mode=block' },
           { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
           { key: 'Content-Security-Policy', value: "default-src 'self'" },
           { key: 'Referrer-Policy', value: 'origin-when-cross-origin' }
         ]
       }
     ];
   }
   ```

#### Authentication and Authorization

1. **JWT Security**

   ```javascript
   // Use strong secrets
   const jwtSecret = process.env.JWT_SECRET;
   if (!jwtSecret || jwtSecret.length < 32) {
     throw new Error("JWT secret must be at least 32 characters long");
   }

   // Token expiration
   const token = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });
   ```

2. **Input Validation**

   ```javascript
   // API route validation
   import { z } from "zod";

   const taskSchema = z.object({
     title: z.string().min(1).max(200),
     priority: z.enum(["low", "medium", "high", "urgent"]),
   });

   export async function POST(request) {
     const body = await request.json();
     const validated = taskSchema.parse(body);
     // Process validated data
   }
   ```

#### File Upload Security

1. **File Type Validation**

   ```javascript
   const allowedTypes = [
     "image/jpeg",
     "image/png",
     "image/gif",
     "application/pdf",
     "text/plain",
   ];

   if (!allowedTypes.includes(file.mimetype)) {
     throw new Error("File type not allowed");
   }
   ```

2. **File Size Limits**

   ```javascript
   const maxSize = 5 * 1024 * 1024; // 5MB
   if (file.size > maxSize) {
     throw new Error("File too large");
   }
   ```

3. **Secure File Storage**

   ```javascript
   import { randomBytes } from "crypto";

   const fileName = `${randomBytes(16).toString("hex")}_${originalName}`;
   const filePath = path.join(uploadDir, fileName);

   // Store only relative path in database
   await db.insert(attachments).values({
     filename: fileName,
     path: `/uploads/${fileName}`,
   });
   ```

### Infrastructure Security

#### Firewall Configuration

```bash
# UFW (Ubuntu)
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw deny 3000/tcp   # Block direct app access
ufw enable

# Check status
ufw status
```

#### Container Security

1. **Non-root User**

   ```dockerfile
   # Dockerfile
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   USER nextjs
   ```

2. **Security Scanning**

   ```bash
   # Scan for vulnerabilities
   docker scan your-image:tag

   # Use distroless images
   FROM gcr.io/distroless/nodejs18
   ```

#### Secrets Management

1. **Environment Variables**

   ```bash
   # Use Docker secrets or Kubernetes secrets
   kubectl create secret generic app-secrets \
     --from-literal=jwt-secret='your-secret' \
     --from-literal=database-url='your-url'
   ```

2. **Secrets Rotation**

   ```javascript
   // Implement key rotation
   const keys = {
     current: process.env.JWT_SECRET_CURRENT,
     previous: process.env.JWT_SECRET_PREVIOUS,
   };

   // Validate with both keys during rotation
   function verifyToken(token) {
     try {
       return jwt.verify(token, keys.current);
     } catch (error) {
       return jwt.verify(token, keys.previous);
     }
   }
   ```

## Monitoring and Logging

### Application Monitoring

#### Health Checks

```javascript
// /api/health
export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {
      database: await checkDatabase(),
      cache: await checkCache(),
    },
  };

  const isHealthy = Object.values(health.checks).every(
    (check) => check.status === "healthy"
  );

  return new Response(JSON.stringify(health), {
    status: isHealthy ? 200 : 503,
    headers: { "Content-Type": "application/json" },
  });
}

async function checkDatabase() {
  try {
    await db.execute(sql`SELECT 1`);
    return { status: "healthy" };
  } catch (error) {
    return { status: "unhealthy", error: error.message };
  }
}
```

#### Metrics Collection

```javascript
// metrics.js
class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      memoryUsage: [],
    };
  }

  recordRequest(duration) {
    this.metrics.requests++;
    this.metrics.responseTime.push(duration);
  }

  recordError() {
    this.metrics.errors++;
  }

  getAverageResponseTime() {
    if (this.metrics.responseTime.length === 0) return 0;
    const sum = this.metrics.responseTime.reduce((a, b) => a + b, 0);
    return sum / this.metrics.responseTime.length;
  }

  getMemoryUsage() {
    return process.memoryUsage();
  }
}

export const metrics = new MetricsCollector();
```

#### APM Integration

```javascript
// With New Relic
import newrelic from "newrelic";

// Middleware for request tracking
export function withMetrics(handler) {
  return async (req, res) => {
    const start = Date.now();
    try {
      const result = await handler(req, res);
      const duration = Date.now() - start;
      newrelic.recordMetric("Custom/Request/Duration", duration);
      return result;
    } catch (error) {
      newrelic.noticeError(error);
      throw error;
    }
  };
}
```

### Logging Strategy

#### Structured Logging

```javascript
// logger.js
import fs from "fs";
import path from "path";

class Logger {
  constructor() {
    this.logDir = process.env.LOG_DIR || "./logs";
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(level, message, meta = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
      pid: process.pid,
      hostname: require("os").hostname(),
    };

    const logFile = path.join(
      this.logDir,
      `${new Date().toISOString().split("T")[0]}.log`
    );
    fs.appendFileSync(logFile, JSON.stringify(entry) + "\n");

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(JSON.stringify(entry));
    }
  }

  info(message, meta) {
    this.log("info", message, meta);
  }
  warn(message, meta) {
    this.log("warn", message, meta);
  }
  error(message, meta) {
    this.log("error", message, meta);
  }
  debug(message, meta) {
    this.log("debug", message, meta);
  }
}

export const logger = new Logger();
```

#### Error Tracking

```javascript
// With Sentry
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Error handling middleware
export function withErrorHandling(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      Sentry.captureException(error);
      logger.error("Unhandled error", {
        error: error.message,
        stack: error.stack,
      });
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
```

### Log Aggregation

#### ELK Stack Integration

```javascript
// Logstash configuration
// logstash.conf
input {
  file {
    path => "/app/logs/*.log"
    start_position => "beginning"
    codec => "json"
  }
}

filter {
  if [level] == "error" {
    mutate {
      add_tag => ["error"]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "task-planner-logs-%{+YYYY.MM.dd}"
  }
}
```

#### Cloud Logging

```javascript
// Google Cloud Logging
import { Logging } from "@google-cloud/logging";

const logging = new Logging();
const log = logging.log("task-planner");

function writeLog(severity, message, meta) {
  const entry = log.entry(
    {
      resource: { type: "global" },
      severity,
      timestamp: new Date().toISOString(),
    },
    {
      message,
      meta,
    }
  );

  log.write(entry);
}
```

## Scaling and Performance

### Horizontal Scaling

#### Load Balancer Configuration

```nginx
# Nginx load balancer
upstream app_servers {
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://app_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Session Management

```javascript
// Redis session store
import session from "express-session";
import connectRedis from "connect-redis";

const RedisStore = connectRedis(session);

const sessionConfig = {
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};
```

### Vertical Scaling

#### Performance Monitoring

```javascript
// Performance metrics
function collectPerformanceMetrics() {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  return {
    memory: {
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external,
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system,
    },
    uptime: process.uptime(),
  };
}

// Monitor and alert
setInterval(() => {
  const metrics = collectPerformanceMetrics();

  if (metrics.memory.heapUsed > 500 * 1024 * 1024) {
    // 500MB
    logger.warn("High memory usage detected", metrics.memory);
  }
}, 60000); // Check every minute
```

#### Database Scaling

1. **Read Replicas**

   ```javascript
   // Database configuration with read replicas
   const dbConfig = {
     master: process.env.DATABASE_URL,
     replicas: [process.env.DATABASE_REPLICA_1, process.env.DATABASE_REPLICA_2],
   };

   function getReadConnection() {
     const replica =
       dbConfig.replicas[Math.floor(Math.random() * dbConfig.replicas.length)];
     return createConnection(replica);
   }
   ```

2. **Caching Strategy**

   ```javascript
   // Redis caching
   import Redis from "ioredis";

   const redis = new Redis(process.env.REDIS_URL);

   async function getCachedData(key, fetcher, ttl = 3600) {
     let data = await redis.get(key);
     if (data) {
       return JSON.parse(data);
     }

     data = await fetcher();
     await redis.setex(key, ttl, JSON.stringify(data));
     return data;
   }
   ```

### CDN Configuration

#### Static Asset Optimization

```javascript
// next.config.js
const nextConfig = {
  images: {
    domains: ["your-cdn.com"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
};
```

#### Cloudflare Configuration

```javascript
// Cloudflare integration
export async function GET(request) {
  const url = new URL(request.url);
  const cache = caches.default;

  let response = await cache.match(request);
  if (!response) {
    response = await fetch(request);
    response = new Response(response.body, response);
    response.headers.set("Cache-Control", "s-maxage=3600");
    await cache.put(request, response.clone());
  }

  return response;
}
```

## Backup and Recovery

### Database Backup

#### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="/app/data/prod.sqlite.db"
BACKUP_FILE="$BACKUP_DIR/sqlite_backup_$DATE.db"

# Create backup
sqlite3 $DB_FILE ".backup $BACKUP_FILE"

# Compress backup
gzip $BACKUP_FILE

# Keep only last 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_FILE.gz s3://your-bucket/backups/
```

#### Schedule Backup

```bash
# Add to crontab
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh

# Weekly full backup on Sundays
0 3 * * 0 /path/to/full-backup.sh
```

### Application Backup

#### Code and Configuration Backup

```bash
#!/bin/bash
# app-backup.sh

BACKUP_DIR="/backup/app"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/app"

# Create archive
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" \
  -C $APP_DIR \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=logs \
  .

# Upload to cloud storage
# aws s3 cp "$BACKUP_DIR/app_$DATE.tar.gz" s3://your-bucket/app-backups/
```

### Disaster Recovery

#### Recovery Plan

1. **Database Recovery**

   ```bash
   # Restore from backup
   gunzip < backup_file.gz | sqlite3 new_database.db

   # Verify integrity
   sqlite3 new_database.db "PRAGMA integrity_check;"
   ```

2. **Application Recovery**

   ```bash
   # Restore application
   tar -xzf app_backup.tar.gz -C /app

   # Install dependencies
   npm install

   # Run migrations
   npm run migrate

   # Start application
   npm start
   ```

3. **Full System Recovery**
   ```bash
   # Restore from Docker image
   docker pull your-registry/task-planner:latest
   docker run -d \
     --name task-planner \
     -p 3000:3000 \
     -v /backup/data:/app/data \
     your-registry/task-planner:latest
   ```

## Troubleshooting

### Common Issues

#### Application Won't Start

**Symptoms:**

- Application crashes on startup
- Port already in use
- Missing dependencies

**Solutions:**

```bash
# Check logs
pm2 logs task-planner
# or
docker logs container-name

# Check port usage
lsof -i :3000
# or
netstat -tuln | grep 3000

# Reinstall dependencies
rm -rf node_modules
npm install
# or
bun install
```

#### Database Connection Issues

**Symptoms:**

- Cannot connect to database
- Database locked errors
- Migration failures

**Solutions:**

```bash
# Check database file permissions
ls -la /app/data/

# Check if database is locked
lsof /app/data/prod.sqlite.db

# Reset database (development only)
rm /app/data/prod.sqlite.db
npm run migrate
```

#### Performance Issues

**Symptoms:**

- Slow response times
- High memory usage
- Application timeouts

**Solutions:**

```bash
# Monitor resources
top
# or
htop

# Check Node.js memory usage
node --max-old-space-size=4096 app.js

# Enable compression
# In next.config.js
compress: true
```

#### Deployment Failures

**Symptoms:**

- Build failures
- Container crashes
- Health check failures

**Solutions:**

```bash
# Check build logs
npm run build 2>&1 | tee build.log

# Check container logs
docker logs container-name

# Test health endpoint
curl http://localhost:3000/api/health
```

### Debugging Tools

#### Application Debugging

```javascript
// Enable debug mode
process.env.DEBUG = "task-planner:*";

// Debug logging
import debug from "debug";
const log = debug("task-planner:api");

export async function GET(request) {
  log("Processing request:", request.url);
  // ... rest of handler
}
```

#### Performance Profiling

```bash
# CPU profiling
node --prof app.js
node --prof-process isolate-*.log > profile.txt

# Memory profiling
node --inspect app.js
# Open chrome://inspect in Chrome browser
```

#### Network Debugging

```bash
# Check network connectivity
curl -v http://localhost:3000/api/health

# Check DNS resolution
nslookup your-domain.com

# Check SSL certificate
openssl s_client -connect your-domain.com:443
```

### Support Resources

#### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

#### Community Support

- GitHub Issues
- Stack Overflow
- Discord communities
- Reddit forums

#### Professional Support

- Vercel Support (for Vercel deployments)
- AWS Support (for AWS deployments)
- Google Cloud Support (for GCP deployments)

---

This deployment guide provides comprehensive instructions for deploying the Next.js daily task planner application to production. Always test your deployment process in a staging environment before deploying to production, and ensure you have proper monitoring and backup procedures in place.
