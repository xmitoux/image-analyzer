# Image Analyzer API

画像解析AIを利用した画像分類システムのバックエンドAPIです。指定された画像ファイルのパスに対してAI分析を実行し、画像が所属するクラス分類結果をデータベースに保存します。

## 📋 プロジェクト概要

このプロジェクトは、特定の画像ファイルへのPathを与えると、AIで分析し、その画像が所属するClassを返却するAPIに対してリクエストを投げ、レスポンスをDBに保存する処理を実装したものです。

### 主な機能
- 画像ファイルパスを受け取り、外部AI分析APIに送信
- AI分析結果（分類クラス、信頼度）をデータベースに保存
- 分析履歴の管理・参照
- モックAI分析APIによる開発・テスト環境の提供

### 技術スタック
- **バックエンド**: Django 5.2.3 + Django REST Framework
- **データベース**: PostgreSQL 17
- **開発環境**: Docker + Dev Container
- **外部API**: Google Cloud Functions (モックAI分析API)

## 🚀 開発環境の構築

### 前提条件
- Docker Desktop
- Visual Studio Code
- Dev Containers 拡張機能

### Dev Container の起動方法

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd image-analyzer
   ```

2. **VS Code でプロジェクトを開く**
   ```bash
   code .
   ```

3. **Dev Container で開く**
   - VS Code で `Ctrl+Shift+P` (macOS: `Cmd+Shift+P`) を押下
   - `Dev Containers: Reopen in Container` を選択
   - または、右下に表示される「Reopen in Container」をクリック

4. **コンテナの起動確認**
   - Dev Container が起動すると、PostgreSQLとDjangoアプリケーションコンテナが自動的に開始されます

## 🔧 Backend Django環境の構築

### 1. 環境変数の設定

```bash
# backend/.envファイルを作成
cp backend/.env.example backend/.env
```

### 2. データベースのマイグレーション

```bash
# backend ディレクトリに移動
cd backend

# マイグレーションの実行
python manage.py migrate
```

### 3. 開発サーバーの起動

```bash
# Djangoの開発サーバーを起動
python manage.py runserver 0.0.0.0:8000
```

### 4. スーパーユーザーの作成（任意）

```bash
# Django管理画面用のスーパーユーザーを作成
python manage.py createsuperuser
```

## 📡 APIの動作確認方法

### Django管理画面での確認

1. **管理画面へのアクセス**
   - ブラウザで `http://localhost:8000/admin/` にアクセス
   - 作成したスーパーユーザーでログイン

2. **AI Analysis Logsの確認**
   - 管理画面から「Ai analysis logs」を選択
   - 保存された分析結果を確認可能

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

#### 2. 画像分析API
```bash
curl -X POST http://localhost:8000/api/analyze/ \
  -H "Content-Type: application/json" \
  -d '{"image_path": "/path/to/your/image.jpg"}'
```

**レスポンス例（成功時）:**
```json
{
    "success": true,
    "image_path": "/path/to/your/image.jpg",
    "classification": 3,
    "confidence": 0.8745,
    "processing_time_ms": 1250,
    "saved_to_db": true,
    "log_id": 1
}
```

### Django REST Framework ブラウザブルAPI

1. **ブラウザでAPIアクセス**
   - `http://localhost:8000/api/hello/` - Hello World API
   - `http://localhost:8000/api/analyze/` - 画像分析API（POST）

2. **ブラウザブルAPIの利用**
   - Django REST Frameworkが提供するWeb UIでAPIを直接テスト可能
   - POSTリクエストもブラウザから送信可能

## 🗄️ データベース確認方法

### 1. Django管理画面での確認
前述の管理画面での確認方法を参照

### 2. PostgreSQL直接アクセス

```bash
# PostgreSQLコンテナに接続
docker exec -it <postgres_container_id> psql -U developer -d image_analyzer

# または、compose.yamlがある場所で
docker compose exec postgres psql -U developer -d image_analyzer
```

**主要なSQLクエリ:**
```sql
-- 全分析ログの確認
SELECT * FROM ai_analysis_log ORDER BY created_at DESC;

-- 成功した分析のみ
SELECT * FROM ai_analysis_log WHERE success = true;

-- 最新10件の分析結果
SELECT image_path, classification, confidence, created_at 
FROM ai_analysis_log 
ORDER BY created_at DESC 
LIMIT 10;
```

### 3. Django Shell での確認

```bash
# Djangoシェルを起動
python manage.py shell
```

```python
# Python shell内で実行
from api.models import AiAnalysisLog

# 全レコード数
AiAnalysisLog.objects.count()

# 最新の分析結果
AiAnalysisLog.objects.latest('created_at')

# 成功した分析のみ
AiAnalysisLog.objects.filter(success=True)
```

## 📁 プロジェクト構造

```
.
├── README.md
├── compose.yaml                 # Docker Compose設定
├── mock_ai_analysis_api.py      # モックAI分析API
├── .devcontainer/               # Dev Container設定
│   ├── devcontainer.json
│   └── Dockerfile
└── backend/                     # Djangoアプリケーション
    ├── manage.py
    ├── requirements.txt
    ├── .env.example
    ├── api/                     # メインAPIアプリ
    │   ├── models.py           # データモデル
    │   ├── views.py            # APIビュー
    │   ├── urls.py             # URL設定
    │   └── migrations/         # データベースマイグレーション
    └── image_analyzer/          # Django設定
        ├── settings.py
        ├── urls.py
        └── wsgi.py
```

## 🔧 開発・デバッグ情報

### 環境変数
- `DEBUG=True`: デバッグモード（開発環境）
- `DB_*`: PostgreSQL接続情報
- `MOCK_AI_ANALYSIS_API_URL`: 外部AI分析API URL（設定時のみ外部API使用）

### ログ出力
分析実行時は以下の情報がコンソールに出力されます：
```
🔍 Analyzing image: /path/to/image.jpg
🎯 Analysis completed: class=3, confidence=0.8745
📊 Result saved to database (ID: 1)
```

### トラブルシューティング

1. **データベース接続エラー**
   - PostgreSQLコンテナが起動しているか確認
   - `.env`ファイルの設定を確認

2. **マイグレーションエラー**
   ```bash
   python manage.py showmigrations  # マイグレーション状態の確認
   python manage.py migrate --fake-initial  # 初期マイグレーションのスキップ
   ```

3. **ポート競合**
   - `compose.yaml`でポート番号を変更
   - 既存のプロセスを停止

---

## 📝 ライセンス

このプロジェクトは開発・学習目的で作成されています。
