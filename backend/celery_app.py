try:
    from celery import Celery
    app = Celery('smart_civic_ai')
    app.config_from_object({
        'broker_url': 'redis://redis:6379/0',
        'result_backend': 'redis://redis:6379/1',
        'task_serializer': 'json',
        'result_serializer': 'json',
        'accept_content': ['json'],
        'timezone': 'Asia/Kolkata',
        'task_routes': {
            'app.workers.intake_worker.*': {'queue': 'intake'},
            'app.workers.priority_worker.*': {'queue': 'priority'},
            'app.workers.depth_worker.*': {'queue': 'depth'},
            'app.workers.verification_worker.*': {'queue': 'verification'},
            'app.workers.dedup_worker.*': {'queue': 'dedup'},
        },
        'task_default_queue': 'default',
        'worker_prefetch_multiplier': 1,
        'task_acks_late': True,
        'task_reject_on_worker_lost': True,
    })
    app.autodiscover_tasks(['app.workers'])
except ImportError:
    # Graceful shim for local lightweight testing when Celery is not in host Python PATH
    class MockCelery:
        def task(self, *args, **kwargs):
            def decorator(func):
                func.delay = lambda *a, **k: func(None, *a, **k)
                func.send_task = lambda *a, **k: None
                return func
            return decorator
        
        def send_task(self, name, args=None, kwargs=None, queue=None):
            return None
        
        def autodiscover_tasks(self, *args, **kwargs):
            pass

    app = MockCelery()
