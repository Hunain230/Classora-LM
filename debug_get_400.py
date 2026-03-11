import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'classora.settings')
django.setup()

import json
from rest_framework.test import APIClient
from accounts.models import CustomUser

ali = CustomUser.objects.filter(email='ali@gmail.com').first()
if ali:
    client = APIClient()
    client.force_authenticate(user=ali)
    
    response = client.get('/api/lms/courses/')
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response Data: {json.dumps(response.data, indent=2)}")
    except:
        print(f"Response Content: {response.content}")
else:
    print("User 'ali@gmail.com' not found.")
