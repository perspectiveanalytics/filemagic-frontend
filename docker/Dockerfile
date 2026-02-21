# Simple nginx-based frontend container
FROM nginx:mainline-alpine

# Copy pre-built assets from GitLab CI artifacts
COPY dist /usr/share/nginx/html

# Copy custom nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy IP allowlist (provided by CI, falls back to empty file for local builds)
RUN touch /etc/nginx/allowed_ips.conf
COPY docker/allowed_ips.con[f] /etc/nginx/allowed_ips.conf

# Expose port 8080 (non-privileged port)
EXPOSE 8080

# Health check (use 127.0.0.1 instead of localhost to force IPv4)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
