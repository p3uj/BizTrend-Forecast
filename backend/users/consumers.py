import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Dataset, PredictionResult, Trend

User = get_user_model()


class PredictionConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time prediction updates.
    Handles connections and broadcasts prediction results to connected clients.
    """
    
    async def connect(self):
        """Accept WebSocket connection and add to prediction group"""
        self.group_name = 'predictions'
        
        # Join prediction group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to real-time prediction updates'
        }))

    async def disconnect(self, close_code):
        """Leave prediction group when disconnecting"""
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """Handle messages from WebSocket"""
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            if message_type == 'ping':
                # Respond to ping with pong
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'message': 'Connection alive'
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))

    # Handler for dataset upload updates
    async def dataset_uploaded(self, event):
        """Send dataset upload notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'dataset_uploaded',
            'message': event['message'],
            'dataset_id': event['dataset_id'],
            'timestamp': event['timestamp']
        }))

    # Handler for prediction generation updates
    async def prediction_started(self, event):
        """Send prediction started notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'prediction_started',
            'message': event['message'],
            'dataset_id': event['dataset_id'],
            'timestamp': event['timestamp']
        }))

    # Handler for prediction completion updates
    async def prediction_completed(self, event):
        """Send prediction completion notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'prediction_completed',
            'message': event['message'],
            'dataset_id': event['dataset_id'],
            'predictions_count': event['predictions_count'],
            'timestamp': event['timestamp']
        }))

    # Handler for prediction data updates
    async def prediction_data_updated(self, event):
        """Send updated prediction data to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'prediction_data_updated',
            'message': event['message'],
            'data': event['data'],
            'timestamp': event['timestamp']
        }))

    # Handler for error notifications
    async def prediction_error(self, event):
        """Send prediction error notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'prediction_error',
            'message': event['message'],
            'error': event['error'],
            'timestamp': event['timestamp']
        }))

    # Handler for user account updates
    async def user_updated(self, event):
        """Send user account update notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'user_updated',
            'message': event['message'],
            'user_id': event['user_id'],
            'user_data': event.get('user_data', {}),
            'timestamp': event['timestamp']
        }))

    # Handler for user creation
    async def user_created(self, event):
        """Send user creation notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'user_created',
            'message': event['message'],
            'user_id': event['user_id'],
            'user_data': event.get('user_data', {}),
            'timestamp': event['timestamp']
        }))

    # Handler for user status changes
    async def user_status_changed(self, event):
        """Send user status change notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'user_status_changed',
            'message': event['message'],
            'user_id': event['user_id'],
            'status': event['status'],
            'timestamp': event['timestamp']
        }))

    # Handler for user deletion
    async def user_deleted(self, event):
        """Send user deletion notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'user_deleted',
            'message': event['message'],
            'user_id': event['user_id'],
            'timestamp': event['timestamp']
        }))

    # Handler for profile updates
    async def profile_updated(self, event):
        """Send profile update notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'profile_updated',
            'message': event['message'],
            'user_id': event['user_id'],
            'updated_fields': event.get('updated_fields', []),
            'timestamp': event['timestamp']
        }))

    @database_sync_to_async
    def get_latest_trends(self):
        """Get latest trends data from database"""
        try:
            # Get latest trends (similar to the existing API logic)
            latest_trends = Trend.objects.filter(is_latest=True).order_by('rank')
            
            growth_rate_data = []
            revenue_data = []
            least_crowded_data = []
            years = set()
            
            for trend in latest_trends:
                years.add(trend.prediction_result.year)
                
                trend_data = {
                    'type': trend.type,
                    'rank': trend.rank,
                    'prediction_result': {
                        'year': trend.prediction_result.year,
                        'industry_sector': trend.prediction_result.industry_sector,
                        'predicted_revenue': float(trend.prediction_result.predicted_revenue),
                        'predicted_growth_rate': float(trend.prediction_result.predicted_growth_rate),
                        'predicted_least_crowded': trend.prediction_result.predicted_least_crowded
                    }
                }
                
                if trend.category == 'growth_rate':
                    growth_rate_data.append(trend_data)
                elif trend.category == 'revenue':
                    revenue_data.append(trend_data)
                elif trend.category == 'least_crowded':
                    least_crowded_data.append(trend_data)
            
            return [growth_rate_data, revenue_data, least_crowded_data, sorted(list(years))]
            
        except Exception as e:
            return [[], [], [], []]
