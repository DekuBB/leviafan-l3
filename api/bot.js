const express = require('express')
const { Telegraf, Markup, session } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN || '')
const app = express()
app.use(express.json({ limit: '1mb' }))

const LOGO_URL = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_20261110_055032_723-Iv2XXfXhKFcLEiMy3pNLzUKw6xdPcL.jpg'
const RULES_URL = 'https://telegra.ph/Leviafan---zasady-sklepu-11-10'
const products = [
  { id: 'aurora', name: 'Komplet Aurora', description: 'Minimalistyczny zestaw dodatków lifestyle.', price: 89 },
  { id: 'gift', name: 'Karta podarunkowa', description: 'Cyfrowa karta Leviafan na wybrany prezent.', price: 120 },
  { id: 'weekend', name: 'Box Weekend', description: 'Starannie wybrane akcesoria w eleganckim pudełku.', price: 149 },
]

const ADMIN_IDS = new Set(['6506504589', '5756373450', '6590919667'])
const ADMIN_DASHBOARD_URL = 'https://v0-leviafan.vercel.app/'

const keyboard = Markup.keyboard([
  ['Konto osobiste', 'Doładuj swoje saldo'],
  ['Kup produkt', 'Opinia'],
  ['Zasady', 'Pomoc i kontakt'],
]).resize()

function mainKeyboard(ctx) {
  if (!ADMIN_IDS.has(String(ctx.from?.id))) return keyboard
  return Markup.keyboard([
    ['Konto osobiste', 'Doładuj swoje saldo'],
    ['Kup produkt', 'Opinia'],
    ['Zasady', 'Pomoc i kontakt'],
    ['🔐 Panel administratora'],
  ]).resize()
}

function isAdmin(ctx) {
  return ADMIN_IDS.has(String(ctx.from?.id))
}

const backHome = Markup.inlineKeyboard([
  [Markup.button.callback('↩️ Wstecz', 'account'), Markup.button.callback('🏠 Dom', 'home')],
])

function safeName(ctx) {
  return [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(' ') || 'Klient'
}
function money(value) { return `${value.toFixed(2).replace('.', ',')} PLN` }
function orderId() { return `LEV-${Date.now().toString(36).toUpperCase()}` }
function productKeyboard() {
  return Markup.inlineKeyboard(products.map((p) => [Markup.button.callback(`${p.name} — ${money(p.price)}`, `product:${p.id}`)]).concat([[Markup.button.callback('🏠 Dom', 'home')]]))
}
function homeText(name = 'Kliencie') {
  return `Witaj, ${name}.

Leviafan to legalny sklep lifestyle z wyselekcjonowanymi produktami i przejrzystą obsługą zamówień.

Wybierz opcję z menu poniżej, aby rozpocząć.`
}
function accountText(ctx) {
  const id = ctx.from.id
  return `👤 Konto osobiste

Nazwa: ${safeName(ctx)}
ID Telegram: ${id}
Saldo: 0,00 PLN
Status: Nowicjusz
Zniżka: 0%
Punkty: 0
Zakupy: 0

Link referencyjny:
t.me/leviafan5zzz_bot?start=ref_${id}`
}

bot.use(session())
bot.start(async (ctx) => ctx.reply(homeText(safeName(ctx)), mainKeyboard(ctx)))
bot.command('menu', async (ctx) => ctx.reply(homeText(safeName(ctx)), mainKeyboard(ctx)))
bot.hears('🔐 Panel administratora', async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('Brak uprawnień.', keyboard)
  ctx.session.awaitingAdminPassword = true
  return ctx.reply('Panel administratora jest chroniony. Wpisz hasło dostępu:')
})
bot.hears('Konto osobiste', async (ctx) => ctx.reply(accountText(ctx), Markup.inlineKeyboard([
  [Markup.button.callback('Moje referały', 'referrals'), Markup.button.callback('Zakupy', 'orders')],
  [Markup.button.callback('Doładuj saldo', 'topup'), Markup.button.callback('Wymień punkty', 'points')],
  [Markup.button.callback('Aktywuj kupon', 'coupon'), Markup.button.callback('Moje rezerwacje', 'reservations')],
  [Markup.button.callback('🏠 Dom', 'home')],
])))
bot.hears('Kup produkt', async (ctx) => ctx.reply('Wybierz produkt z legalnej oferty Leviafan:', productKeyboard()))
bot.hears('Doładuj swoje saldo', async (ctx) => ctx.reply('Doładowania są obsługiwane przez operatora po potwierdzeniu zamówienia. Napisz do nas, a otrzymasz instrukcję bezpiecznej płatności.', backHome))
bot.hears('Opinia', async (ctx) => ctx.reply('Twoja opinia pomaga nam rozwijać sklep. Napisz wiadomość zaczynającą się od „Opinia:”, a przekażemy ją zespołowi.', backHome))
bot.hears('Zasady', async (ctx) => ctx.reply('Zapoznaj się z regulaminem sklepu i zasadami zwrotów:', Markup.inlineKeyboard([[Markup.button.url('Otwórz regulamin', RULES_URL)], [Markup.button.callback('🏠 Dom', 'home')]])))
bot.hears('Pomoc i kontakt', async (ctx) => ctx.reply('Potrzebujesz pomocy? Napisz do operatora: @leviafan5zzz_bot\n\nObsługa odpowiada w dni robocze 9:00–18:00.', backHome))

bot.action('home', async (ctx) => { await ctx.answerCbQuery(); return ctx.editMessageText(homeText(safeName(ctx)), keyboard) })
bot.action('account', async (ctx) => { await ctx.answerCbQuery(); return ctx.editMessageText(accountText(ctx), Markup.inlineKeyboard([[Markup.button.callback('Moje referały', 'referrals'), Markup.button.callback('Zakupy', 'orders')], [Markup.button.callback('Doładuj saldo', 'topup'), Markup.button.callback('Wymień punkty', 'points')], [Markup.button.callback('Aktywuj kupon', 'coupon'), Markup.button.callback('Moje rezerwacje', 'reservations')], [Markup.button.callback('🏠 Dom', 'home')]])) })
bot.action(/^product:(.+)$/, async (ctx) => { await ctx.answerCbQuery(); const p = products.find((item) => item.id === ctx.match[1]); if (!p) return; ctx.session.selectedProduct = p.id; return ctx.editMessageText(`${p.name}\n\n${p.description}\nCena: ${money(p.price)}\n\nWybierz sposób płatności:`, Markup.inlineKeyboard([[Markup.button.callback('BLIK', 'pay:blik'), Markup.button.callback('Karta', 'pay:card')], [Markup.button.callback('↩️ Produkty', 'products'), Markup.button.callback('🏠 Dom', 'home')]])) })
bot.action('products', async (ctx) => { await ctx.answerCbQuery(); return ctx.editMessageText('Wybierz produkt z legalnej oferty Leviafan:', productKeyboard()) })
bot.action(/^pay:(.+)$/, async (ctx) => { await ctx.answerCbQuery(); const p = products.find((item) => item.id === ctx.session.selectedProduct); if (!p) return ctx.editMessageText('Sesja wygasła. Wybierz produkt ponownie.', productKeyboard()); const id = orderId(); ctx.session.orderId = id; return ctx.editMessageText(`Zamówienie ${id}\n\nProdukt: ${p.name}\nKwota: ${money(p.price)}\nMetoda: ${ctx.match[1].toUpperCase()}\n\nPo potwierdzeniu płatności operator przekaże dalsze informacje. Nie wysyłaj danych wrażliwych na czacie.`, Markup.inlineKeyboard([[Markup.button.callback('Potwierdź zamówienie', 'confirm'), Markup.button.callback('Anuluj', 'home')]])) })
bot.action('confirm', async (ctx) => { await ctx.answerCbQuery('Zamówienie przyjęte'); return ctx.editMessageText(`Dziękujemy. Zamówienie ${ctx.session.orderId || orderId()} zostało przyjęte do weryfikacji. Operator skontaktuje się z Tobą w tej rozmowie.`, Markup.inlineKeyboard([[Markup.button.callback('🏠 Dom', 'home')]])) })
for (const action of ['referrals', 'orders', 'points', 'coupon', 'reservations']) bot.action(action, async (ctx) => { await ctx.answerCbQuery(); return ctx.editMessageText('Ta funkcja będzie dostępna po aktywacji konta. Skontaktuj się z operatorem, aby uzyskać pomoc.', backHome) })
bot.on('text', async (ctx) => {
  if (ctx.session.awaitingAdminPassword) {
    ctx.session.awaitingAdminPassword = false
    if (!isAdmin(ctx) || ctx.message.text !== process.env.ADMIN_PASSWORD) return ctx.reply('Nieprawidłowe hasło lub brak uprawnień.', mainKeyboard(ctx))
    return ctx.reply('Dostęp przyznany. Otwórz panel administratora:', Markup.inlineKeyboard([
      [Markup.button.url('Otwórz dashboard', ADMIN_DASHBOARD_URL)],
      [Markup.button.callback('🏠 Dom', 'home')],
    ]))
  }
  if (ctx.message.text.startsWith('Opinia:')) return ctx.reply('Dziękujemy za opinię. Została przekazana zespołowi.', mainKeyboard(ctx))
  return ctx.reply('Nie rozpoznaję tej opcji. Wybierz przycisk z menu.', mainKeyboard(ctx))
})

app.get('/api/bot', (_req, res) => res.status(200).json({ ok: true, service: 'leviafan-telegram-bot' }))
app.post('/api/bot', async (req, res) => {
  if (process.env.TELEGRAM_WEBHOOK_SECRET && req.headers['x-telegram-bot-api-secret-token'] !== process.env.TELEGRAM_WEBHOOK_SECRET) return res.status(401).json({ ok: false })
  try { await bot.handleUpdate(req.body); return res.status(200).json({ ok: true }) } catch (error) { console.error('[leviafan-bot]', error); return res.status(200).json({ ok: false }) }
})

module.exports = async (req, res) => {
  if (!process.env.BOT_TOKEN) return res.status(500).json({ ok: false, error: 'BOT_TOKEN is not configured' })
  return app(req, res)
}
