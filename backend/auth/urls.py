from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('',include('users.urls')),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
]

# Serve static files and assets
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve Vite assets directly
build_assets_path = os.path.join(settings.BASE_DIR, 'build/assets')
if os.path.exists(build_assets_path):
    urlpatterns += static('/assets/', document_root=build_assets_path)

# Catch-all route for React Router (should be last)
urlpatterns += [re_path(r'^.*', TemplateView.as_view(template_name='index.html'))]