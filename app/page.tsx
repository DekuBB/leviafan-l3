'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, BadgeCheck, Bot, Boxes, ChevronRight, CircleHelp, Gift, Heart, Home, MessageCircle, Package, ShieldCheck, ShoppingBag, Star, UserRound, Wallet, X } from 'lucide-react'

type Product = { name: string; description: string; price: number; tag: string; tone: string }

const products: Product[] = [
  { name: 'Komplet Aurora', description: 'Minimalistyczny zestaw dodatków do codziennego stylu.', price: 89, tag: 'Bestseller', tone: 'lavender' },
  { name: 'Karta podarunkowa', description: 'Cyfrowa karta Leviafan — idealna na prezent.', price: 120, tag: 'Cyfrowe', tone: 'mint' },
  { name: 'Box Weekend', description: 'Starannie wybrane akcesoria lifestyle w eleganckim pudełku.', price: 149, tag: 'Nowość', tone: 'peach' },
]

const menu = [
  { label: 'Konto osobiste', icon: UserRound },
  { label: 'Doładuj saldo', icon: Wallet },
  { label: 'Kup produkt', icon: ShoppingBag },
  { label: 'Opinie', icon: Star },
  { label: 'Zasady sklepu', icon: ShieldCheck },
  { label: 'Pomoc i kontakt', icon: CircleHelp },
]

export default function Page() {
  const [section, setSection] = useState('Kup produkt')
  const [city, setCity] = useState('Warszawa')
  const [selected, setSelected] = useState<Product | null>(null)
  const [toast, setToast] = useState('')

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  return (
    <main className="shell">
      <section className="phone" aria-label="Panel sklepu Leviafan">
        <header className="topbar">
          <div className="brand"><div className="brand-mark">L</div><div><strong>Leviafan</strong><span>legalny sklep lifestyle</span></div></div>
          <button className="icon-button" aria-label="Zamknij podgląd"><X size={18} /></button>
        </header>

        <div className="welcome-card">
          <div><p className="eyebrow">Witaj ponownie</p><h1>Twój spokojny<br /><em>zakup online.</em></h1><p className="welcome-copy">Odkrywaj starannie wybrane produkty, korzystaj z bezpiecznych płatności i szybkiej dostawy.</p></div>
          <div className="welcome-orb"><Bot size={28} strokeWidth={1.5} /><span>24/7</span></div>
        </div>

        <div className="content-grid">
          <aside className="sidebar" aria-label="Nawigacja sklepu">
            <p className="section-label">Menu główne</p>
            <nav>{menu.map(({ label, icon: Icon }) => <button key={label} className={section === label ? 'nav-item active' : 'nav-item'} onClick={() => setSection(label)}><Icon size={17} /><span>{label}</span>{section === label && <ChevronRight size={15} className="nav-arrow" />}</button>)}</nav>
            <div className="safe-note"><BadgeCheck size={18} /><div><strong>Bezpieczny wybór</strong><span>Legalne produkty<br />i transparentne zasady</span></div></div>
          </aside>

          <div className="catalog">
            <div className="catalog-heading"><div><p className="eyebrow">{section === 'Kup produkt' ? 'Katalog produktów' : 'Leviafan'}</p><h2>{section === 'Kup produkt' ? 'Wybierz coś dla siebie' : section}</h2></div><button className="cart-button" onClick={() => notify('Koszyk jest pusty')}><ShoppingBag size={17} /><span>0</span></button></div>
            {section === 'Kup produkt' ? <>
              <div className="city-row"><span>Dostawa do</span>{['Warszawa', 'Wrocław', 'Katowice'].map(item => <button key={item} className={city === item ? 'city active' : 'city'} onClick={() => setCity(item)}>{item}</button>)}</div>
              <div className="product-list">{products.map(product => <article className="product-card" key={product.name}><div className={`product-art ${product.tone}`}><div className="product-shape"><Package size={30} strokeWidth={1.3} /></div><span>{product.tag}</span></div><div className="product-info"><div><h3>{product.name}</h3><p>{product.description}</p></div><strong className="price">{product.price} <small>PLN</small></strong></div><button className="add-button" onClick={() => { setSelected(product); notify(`${product.name} dodano do koszyka`) }}>Dodaj do koszyka <ArrowRight size={15} /></button></article>)}</div>
            </> : <div className="empty-section"><div className="empty-icon"><Gift size={27} /></div><h3>{section}</h3><p>Ta sekcja jest gotowa do połączenia z Twoim botem Telegram. Tutaj pokażemy aktualne dane i akcje konta.</p><button className="primary-button" onClick={() => setSection('Kup produkt')}>Wróć do katalogu</button></div>}
          </div>
        </div>

        <footer className="bottom-nav"><button onClick={() => setSection('Kup produkt')} className={section === 'Kup produkt' ? 'bottom-active' : ''}><Home size={18} /><span>Sklep</span></button><button onClick={() => setSection('Opinie')}><Heart size={18} /><span>Opinie</span></button><button onClick={() => setSection('Pomoc i kontakt')}><MessageCircle size={18} /><span>Kontakt</span></button><button onClick={() => setSection('Konto osobiste')}><UserRound size={18} /><span>Konto</span></button></footer>
        {toast && <div className="toast"><BadgeCheck size={17} />{toast}</div>}
      </section>
      {selected && <div className="selection-pill" role="status"><span>{selected.name}</span><button onClick={() => setSelected(null)} aria-label="Usuń wybór">×</button></div>}
    </main>
  )
}
