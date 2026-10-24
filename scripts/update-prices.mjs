import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = 'https://models.dev/api.json';
const choices = {
  openai: ['gpt-6.1-sol', 'gpt-6-sol', 'gpt-6-luna', 'gpt-6-astra', 'gpt-5.6-sol', 'gpt-5.6-terra'],
  anthropic: ['claude-haiku-5-5', 'claude-sonnet-5-5', 'claude-opus-5-5', 'claude-fable-5-1'],
  google: ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.1-pro-preview', 'gemini-3.5-flash-lite'],
  deepseek: ['deepseek-flash', 'deepseek-v4-pro'],
  xai: ['grok-4.7', 'grok-4.3', 'grok-build-0.1'],
  alibaba: ['qwen3.8-max', 'qwen3.8-flash', 'qwen3.7-flash'],
  zai: ['glm-5.3', 'glm-5.3-flash', 'glm-5.3-flashx'],
  moonshotai: ['kimi-k3.1-pro', 'kimi-k3', 'kimi-k2.7-code'],
  minimax: ['MiniMax-M3.1-Flash', 'MiniMax-M3'],
  mistral: ['mistral-large-4', 'mistral-small-2603', 'mistral-medium-2604']
};

const input = process.argv[2];
const raw = input ? await readFile(input, 'utf8') : await (async () => {
  const response = await fetch(source, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`数据源返回 HTTP ${response.status}`);
  return response.text();
})();
const api = JSON.parse(raw);
const models = [];
const missing = [];
for (const [providerId, ids] of Object.entries(choices)) {
  const provider = api[providerId];
  for (const id of ids) {
    const model = provider?.models?.[id];
    if (!model || !Number.isFinite(model.cost?.input) || !Number.isFinite(model.cost?.output)) {
      missing.push(`${providerId}/${id}`);
      continue;
    }
    models.push({
      id: `${providerId}/${id}`,
      provider: provider.name || providerId,
      providerId,
      name: model.name || id,
      input: model.cost.input,
      output: model.cost.output,
      cacheRead: Number.isFinite(model.cost.cache_read) ? model.cost.cache_read : null,
      context: model.limit?.context || null,
      doc: provider.doc || provider.website || null,
      tiered: Boolean(model.cost.tiers?.length || model.cost.context_over_200k),
      releaseDate: model.release_date || null
    });
  }
}
if (missing.length) throw new Error(`数据源缺少指定模型，已停止更新：${missing.join(', ')}`);
if (models.length < 20) throw new Error('模型数量异常，已停止更新');
const output = path.join(root, 'data', 'prices.json');
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, JSON.stringify({
  source,
  sourceName: 'Models.dev',
  fetchedAt: new Date().toISOString(),
  unit: 'USD / 1M tokens',
  models
}, null, 2) + '\n');
console.log(`已更新 ${models.length} 个模型；${output}`);
