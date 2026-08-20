import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import react from '@vitejs/plugin-react'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

test('calculator inputs have accessible labels and cent-precision sliders', async () => {
  const vite = await createServer({
    appType: 'custom',
    cacheDir: join(tmpdir(), 'espp-calculator-vite-cache'),
    configFile: false,
    plugins: [react()],
    server: { hmr: false, middlewareMode: true },
  })

  try {
    const { default: App } = await vite.ssrLoadModule('/src/App.jsx')
    const markup = renderToStaticMarkup(createElement(App))

    for (const id of [
      'salary',
      'paychecks',
      'ordTaxRate',
      'cgTaxRate',
      'startPrice',
      'purchasePrice',
      'salePrice',
    ]) {
      assert.match(markup, new RegExp(`<label for="${id}"`))
      assert.match(markup, new RegExp(`<input[^>]*id="${id}"`))
    }

    assert.match(markup, /id="purchasePrice"[^>]*step="0\.01"/)
    assert.match(markup, /id="salePrice"[^>]*step="0\.01"/)
  } finally {
    await vite.close()
  }
})

test('page metadata describes the calculator', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')

  assert.match(html, /<title>ESPP Calculator<\/title>/)
  assert.match(html, /<meta name="description"/)
})
