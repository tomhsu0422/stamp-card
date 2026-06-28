# 可愛集點卡同步版

這是 Netlify 專案，請用 GitHub 匯入 Netlify 部署，不要用 Netlify Drop 拖曳上傳。

## 上傳 GitHub

1. 到 GitHub 建立新 Repository，例如 `stamp-card`。
2. 把這個資料夾內所有檔案上傳到 Repository 根目錄。
3. 確認 GitHub 裡看得到：
   - index.html
   - style.css
   - app.js
   - package.json
   - netlify.toml
   - netlify/functions/stamps.js

## Netlify 部署

1. Netlify → Add new site → Import an existing project
2. 選 GitHub
3. 選剛剛的 Repository
4. Build command 可留空，或填：`npm run build`
5. Publish directory 填：`.`
6. 按 Deploy

## 測試同步後端

部署完成後，打開：

`https://你的網址/.netlify/functions/stamps`

如果看到類似：

```json
{"people":{"huiping":{"name":"蕙萍","total":0},"yujie":{"name":"宇杰","total":0}},"history":[],"updatedAt":null,"version":1}
```

就代表 Function 成功。

## 注意

如果你是用拖曳 ZIP 到 Netlify Drop，通常 Function 不會正常啟用，所以會顯示同步失敗。
