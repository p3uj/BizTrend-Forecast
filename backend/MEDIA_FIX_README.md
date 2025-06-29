# Media Files Fix for Production Deployment

## Problem
Media files (profile pictures, uploaded datasets) are not displaying in your Railway deployment because:
1. Django's development server doesn't serve media files in production
2. Railway uses ephemeral filesystem - files get lost on restarts
3. No cloud storage configured for persistent file storage

## Immediate Solutions

### Option 1: Quick Fix (Temporary)
The changes I made to your code will help serve media files in production:

1. **Updated `settings.py`**: Added production media handling
2. **Updated `urls.py`**: Improved media file serving
3. **Added custom media view**: More reliable file serving in production

### Option 2: Cloud Storage (Recommended)
For a permanent solution, configure cloud storage:

#### AWS S3 Setup:
1. Create an AWS S3 bucket
2. Get your AWS credentials
3. Add these environment variables to Railway:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_STORAGE_BUCKET_NAME=your_bucket_name
   AWS_S3_REGION_NAME=us-east-1
   ```
4. Uncomment the AWS S3 configuration in `settings.py`

#### Alternative: Railway Volumes
Railway offers persistent volumes for file storage:
1. Go to your Railway project
2. Add a new service → Volume
3. Mount it to your backend service
4. Update `MEDIA_ROOT` to point to the volume path

## Testing the Fix

1. **Deploy the updated code to Railway**
2. **Test media file access**:
   - Try accessing: `https://your-railway-domain.railway.app/media/profile_pictures/filename.jpg`
   - Check if profile pictures load in your frontend

## Migration Commands

If you set up cloud storage, run:
```bash
python manage.py migrate_media
```

## Troubleshooting

### Check if files exist:
```bash
# SSH into your Railway deployment
railway shell

# Check media directory
ls -la media/
ls -la media/profile_pictures/
```

### Check logs:
```bash
railway logs
```

### Test media serving:
```bash
curl -I https://your-domain.railway.app/media/profile_pictures/test.jpg
```

## Next Steps

1. **Deploy the updated code**
2. **Test media file access**
3. **Consider setting up cloud storage for production**
4. **Monitor file uploads and serving**

## Environment Variables to Add

Add these to your Railway environment variables:
```
ENVIRONMENT=production
```

For AWS S3 (optional):
```
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_STORAGE_BUCKET_NAME=your_bucket
AWS_S3_REGION_NAME=us-east-1
``` 