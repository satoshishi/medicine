# 服薬管理カレンダー

朝・夜の服薬状況と血圧を管理するWebアプリです。

## 機能

- **カレンダー画面**: 月カレンダーに服薬状況をドット表示、通院日をスタンプ表示
- **日付詳細**: タップして服薬トグル・血圧入力・通院記録を入力
- **グラフ画面**: 月ごとの血圧グラフと服薬ヒートマップ
- **設定画面**: 薬の名前カスタマイズ、データのバックアップ・復元

データはブラウザのlocalStorageに保存されます（サーバー不要・無料）。

## ローカルで起動する

```bash
cd /path/to/medicine
python3 -m http.server 8080
```

ブラウザで `http://localhost:8080` を開く。

> **注意**: ES Moduleを使用しているため、`index.html`をダブルクリックで開いても動作しません。必ずHTTPサーバー経由でアクセスしてください。

## GitHub Pages にデプロイする（自宅外からアクセスするために）

### 1. GitHubにリポジトリを作成

[GitHub](https://github.com) でリポジトリを新規作成（例: `medicine`）。

### 2. pushする

```bash
cd /path/to/medicine
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/<あなたのユーザー名>/medicine.git
git push -u origin main
```

### 3. GitHub Pages を有効化

1. リポジトリページ → **Settings** → **Pages**
2. **Source** を `Deploy from a branch` に設定
3. **Branch** を `main` / `/ (root)` に設定して **Save**

数分後に `https://<あなたのユーザー名>.github.io/medicine/` でアクセスできます。

## ファイル構成

```
medicine/
├── index.html          # エントリーポイント
├── manifest.json       # PWAマニフェスト
├── sw.js               # Service Worker
├── css/                # スタイルシート
├── js/
│   ├── app.js          # アプリルート
│   ├── store.js        # localStorageアクセス
│   ├── utils.js        # 日付ヘルパー
│   └── components/     # Vueコンポーネント
└── assets/
    └── icon-192.png    # PWAアイコン
```

## スマートフォンにインストール（PWA）

GitHub Pages でホスト後、スマートフォンのブラウザでアクセスし「ホーム画面に追加」することでアプリのようにインストールできます。
