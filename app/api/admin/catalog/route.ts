import { NextResponse } from "next/server"
import { ADMIN_IDS, getCatalog, query } from "@/lib/catalog"

function authorized(request: Request) {
  const key = request.headers.get("x-admin-key")?.split(":")
  if (!key || key.length < 2) return false
  return key[0] === process.env.ADMIN_PASSWORD && ADMIN_IDS.has(key[1])
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Brak dostępu" }, { status: 401 })
  return NextResponse.json(await getCatalog())
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Brak dostępu" }, { status: 401 })
  const body = await request.json()
  if (body.type === "category") {
    await query("INSERT INTO leviafan_categories (name, description, image_url, active) VALUES ($1,$2,$3,true)", [body.name, body.description || "", body.imageUrl || ""])
  } else {
    await query("INSERT INTO leviafan_products (category_id, name, description, price, stock, image_url, active) VALUES ($1,$2,$3,$4,$5,$6,$7)", [body.categoryId, body.name, body.description || "", Number(body.price), Number(body.stock), body.imageUrl || "", body.active !== false])
  }
  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Brak dostępu" }, { status: 401 })
  const body = await request.json()
  if (body.type === "category") await query("UPDATE leviafan_categories SET name=$1, description=$2, image_url=$3, updated_at=now() WHERE id=$4", [body.name, body.description || "", body.imageUrl || "", body.id])
  else await query("UPDATE leviafan_products SET name=$1, description=$2, price=$3, stock=$4, image_url=$5, active=$6, updated_at=now() WHERE id=$7", [body.name, body.description || "", Number(body.price), Number(body.stock), body.imageUrl || "", body.active !== false, body.id])
  return NextResponse.json({ ok: true })
}
