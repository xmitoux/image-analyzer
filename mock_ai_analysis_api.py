import random

import functions_framework


@functions_framework.http
def mock_ai_analysis_api(request):
    """
    画像解析AIの外部モックAPI(GCPにデプロイ)
    """
    if request.method != 'POST':
        return {"error": "Only POST method allowed!"}
    try:
        # 80%の確率で成功、20%で失敗
        if random.random() > 0.2:
            return {
                'success': True,
                'message': 'success',
                'estimated_data': {
                    'class': random.randint(1, 5),
                    'confidence': round(random.uniform(0.7, 0.95), 4)
                }
            }
        else:
            return {
                'success': False,
                'message': 'Error:E50012',
                'estimated_data': {}
            }

    except Exception as e:
        return {
            "success": False,
            "message": "Error:E99999",
            "estimated_data": {}
        }
