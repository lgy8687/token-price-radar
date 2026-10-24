# Token 价格雷达

一个面向中文读者的模型 API 价格比较页：[在线查看](https://lgy8687.github.io/token-price-radar/)。

## 数据口径

- 上游：[Models.dev](https://models.dev/) 的公开模型数据库。
- 单位：美元 / 百万 Token，展示输入、输出、缓存读取基础价。
- 选取 10 家厂商的 33 个模型；名单在 [`scripts/update-prices.mjs`](scripts/update-prices.mjs)。
- [`data/prices.json`](data/prices.json) 是站点使用的价格快照，`fetchedAt` 记录抓取时间。
- 页面可点“核对最新价”，直接从 Models.dev 拉取最新公开数据；失败时继续显示仓库中的快照。
- 仓库快照可通过下方命令手动更新。自动定时更新尚未启用。

价格可能受地区、上下文长度、批处理、模态、合同、税费等影响。上游是社区整理，实际账单请以对应厂商文档为准。此站不推断没有历史快照支持的“涨价/降价”。

## 本地更新

需要 Node.js 22 及以上：

```sh
node scripts/update-prices.mjs
```

本地直接打开 HTML 文件时，浏览器可能不允许读取旁边的 JSON。可以用任何静态文件服务器预览，例如：

```sh
python3 -m http.server 8000
```

然后访问 `http://localhost:8000`。
