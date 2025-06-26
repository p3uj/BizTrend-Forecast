# Use Python 3.11 image with pre-installed build tools
FROM python:3.11

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Set work directory
WORKDIR /app

# Install only essential system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies with optimizations
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --timeout=1000 --prefer-binary -r requirements.txt

# Copy project files
COPY . .

# Create necessary directories
RUN mkdir -p media/datasets media/profile_pictures

# Collect static files
RUN python manage.py collectstatic --noinput

# Create startup script to handle Railway's PORT environment variable
RUN echo '#!/bin/bash' > /start.sh && \
    echo 'PORT=${PORT:-8000}' >> /start.sh && \
    echo 'python manage.py migrate --noinput' >> /start.sh && \
    echo 'exec daphne -b 0.0.0.0 -p $PORT auth.asgi:application' >> /start.sh && \
    chmod +x /start.sh

# Expose port (Railway will override this)
EXPOSE 8000

# Start the application
CMD ["/start.sh"]
