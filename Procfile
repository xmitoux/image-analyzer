web: cd backend && python manage.py migrate && gunicorn --bind 0.0.0.0:$PORT image_analyzer.wsgi:application
