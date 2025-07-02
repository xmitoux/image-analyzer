# Image Analyzer API

画像解析AIを利用した画像解析アプリのバックエンドAPIです。  
指定された画像に対してAI解析を実行し、画像が所属するクラス分類結果をデータベースに保存します。

## 📝 概要

このプロジェクトは、技術課題「AI画像分析API連携とDB保存処理の実装」に対する成果物です。

### 📋 課題の要件
- 特定の画像ファイルのパスを受け取り、AIで分析してClassを返却するAPIへのリクエスト送信
- レスポンスのデータベース保存
- 成功・失敗に関わらず全ての結果をログとして保存
- リクエスト送信時刻と受信時刻の記録

### 🖥️ 使用技術スタック
- **バックエンド**: Django 5.2.3 + Django REST Framework
- **データベース**: PostgreSQL 17
- **フロントエンド**: Next.js 15 + TypeScript + Tailwind CSS
- **クラウド**: Google Cloud Storage + Vision API + Vercel + Railway
- **開発環境**: Docker + Dev Container

### ✅ 成果物
#### 画像解析モックAPI
-  `call_mock_ai_analysis_api_local()` : [`backend/api/views.py#L263`](https://github.com/xmitoux/image-analyzer/blob/ee43e1806af82497940dba1ec20cf3544586f469/backend/api/views.py#L263)
- 画像解析APIの振る舞いを模したモック
- 実行ごとにランダムなレスポンスを返す
- 実装コード

   <details>

   <summary>折りたたみ</summary>

   ```py
   def call_mock_ai_analysis_api_local(image_content):
      """
      ローカル開発用のモック処理
      """
      processing_time = random.uniform(0.3, 1.2)
      time.sleep(processing_time)

      # 90%の確率で成功、10%で失敗
      if random.random() > 0.1:
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

   ```

   </details>

#### 画像解析 + 結果保存API

- `analyze_image_mock()` : [`backend/api/views.py#L126`](https://github.com/xmitoux/image-analyzer/blob/ee43e1806af82497940dba1ec20cf3544586f469/backend/api/views.py#L126)
- 画像解析モックAPIを実行
- レスポンスをDBに保存
- 実装コード

   <details>

   <summary>折りたたみ</summary>

   ```py
   @api_view(['POST'])
   @parser_classes([JSONParser])
   def analyze_image_mock(request):
      """
      ローカル開発用: image_pathでモック解析
      """
      request_timestamp = timezone.now()

      image_path = request.data.get('image_path')

      if not image_path:
         return Response({
               'success': False,
               'message': 'image_path is required'
         }, status=status.HTTP_400_BAD_REQUEST)

      try:
         # ローカルモック解析のみ
         print(" Using local mock")
         analysis_result = call_mock_ai_analysis_api_local(image_path)

         response_timestamp = timezone.now()

         print(f"✅ Analysis result: {analysis_result}")

         # DB保存処理
         analysis_log = AiAnalysisLog.objects.create(
               image_path=image_path or 'base64_data',
               success=analysis_result['success'],
               message=analysis_result['message'],
               classification=analysis_result['estimated_data'].get(
                  'class') if analysis_result['success'] else None,
               confidence=analysis_result['estimated_data'].get(
                  'confidence') if analysis_result['success'] else None,
               request_timestamp=request_timestamp,
               response_timestamp=response_timestamp
         )

         print(f"💾 Saved to DB with ID: {analysis_log.id}")

         if analysis_result['success']:
               return Response({
                  'id': analysis_log.id,
                  'success': True,
                  'message': 'success',
                  'estimated_data': {
                     'class': analysis_result['estimated_data']['class'],
                     'confidence': analysis_result['estimated_data']['confidence']
                  }
               })
         else:
               return Response({
                  'id': analysis_log.id,
                  'success': False,
                  'message': analysis_result['message'],
                  'estimated_data': {}
               })

      except Exception as e:
         print(f"💥 Analysis Error: {str(e)}")
         return Response({
               'success': False,
               'message': f'Analysis failed: {str(e)}'
         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


   ```

   </details>


### ✨️ 課題を超えた実装

課題内容からAI画像解析に興味を持ち、Google Cloud Vision APIを用いて実際に画像解析の実行と結果の保存を行うWebアプリを作成しました。  
本番環境にデプロイ済みですがURLは非公開です。

#### 画像解析 + 結果保存API (Vision API連携板)
- `analyze_image()`: [`backend/api/views.py#L42`](https://github.com/xmitoux/image-analyzer/blob/ee43e1806af82497940dba1ec20cf3544586f469/backend/api/views.py#L42)
- 画像ファイルをGoogle Cloud Storageへアップロード
- アップロードした画像をVision APIで解析
- 解析結果をDBに保存

#### 画像解析アプリ
- 動作確認用の簡易なフロントエンドアプリ
- 画像解析画面
   - 画像をAPIへPOST
   - 解析結果の表示
- 画像解析ログ一覧画面
   - 保存された解析結果の一覧表示
   - 分類結果でのフィルタ表示

## 🚀 開発環境の構築

### 前提条件
- Docker Desktop
- Visual Studio Code
- Dev Containers 拡張機能

### Dev Container の起動方法

1. **リポジトリのクローン**

2. **VS Code でワークスペースを開く**
    - `image-analyzer.code-workspace`

3. **Dev Container で開く**
   - VS Code で `Ctrl+Shift+P` (macOS: `Cmd+Shift+P`) を押下
   - `Dev Containers: Reopen in Container` を選択
   - または、右下に表示される「Reopen in Container」をクリック

4. **コンテナの起動確認**
   - Dev Container が起動すると、PostgreSQLとDjango + Next.jsアプリケーションコンテナが自動的に開始されます。

## 🔧 バックエンド(Django)環境の構築

### 1. 環境変数の設定

```bash
cd backend
cp .env.example .env
```

### 2. データベースのマイグレーション

```bash
python manage.py migrate
```

### 3. 開発サーバーの起動

```bash
python manage.py runserver 0.0.0.0:8000
```

### 4. Django管理画面用のスーパーユーザーの作成

```bash
python manage.py createsuperuser
```

## 📡 APIの動作確認方法

### API エンドポイントの動作確認

#### 1. Hello World API（動作確認用）
```bash
curl -X GET http://localhost:8000/api/hello/
```

**レスポンス例:**
```json
{
    "message": "Hello World from Django API! 🎉",
    "status": "success",
    "data": {
        "version": "1.0.0",
        "project": "Image Analyzer"
    }
}
```

#### 2. 課題解答API（Mock AI分析）
```bash
curl -X POST http://localhost:8000/api/analyze-mock/ \
  -H "Content-Type: application/json" \
  -d '{"image_path": "/image/d03f1d36ca69348c51aa/c413eac329e1c0d03/test.jpg"}'
```

**レスポンス例（成功時）:**
```json
{
    "id": 1,
    "success": true,
    "message": "success",
    "estimated_data": {
        "class": 3,
        "confidence": 0.8745
    }
}
```

**レスポンス例（失敗時）:**
```json
{
    "id": 2,
    "success": false,
    "message": "Error:E50012",
    "estimated_data": {}
}
```

## 🗄️ データベース確認方法

### Django管理画面での確認

1. **管理画面へのアクセス**
   - ブラウザで [http://localhost:8000/admin/](http://localhost:8000/admin/) にアクセス
   - 作成したスーパーユーザーでログイン

2. **AI Analysis Logsの確認**
   - 管理画面から「Ai analysis logs」を選択
   - 保存された分析結果を確認可能


## 📱 フロントエンド(Next.js)環境の構築・動作確認方法

### 1. 開発サーバの起動

```bash
cd frontend
npm run dev
```

### 2. アプリを開く
[http://localhost:3000](http://localhost:3000)

### 3. 画像解析画面で解析を実行する
課題の「画像解析 + 結果保存API」が実行され、結果が表示されます。

### 4. 画像解析ログ一覧で結果を確認する
解析結果のログが一覧表示されます。


> [!NOTE]
> ローカル環境ではVision APIを使った解析、および画像の保存機能は動作しません。  
