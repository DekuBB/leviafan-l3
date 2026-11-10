import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const ADMIN_IDS = new Set(["6506504589", "5756373450", "6590919667"])

export async function query<T extends Record<string, unknown>>(text: string, values: unknown[] = []) {
  const result = await pool.query<T>(text, values)
  return result.rows
}

export async function getCatalog() {
  const categories = await query("SELECT id, name, description, image_url, active FROM leviafan_categories WHERE active = true ORDER BY created_at DESC")
  const products = await query("SELECT id, category_id, name, description, price, stock, image_url, active FROM leviafan_products WHERE active = true ORDER BY created_at DESC")
  return { categories, products }
}
