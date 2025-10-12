const fs = require('fs')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()

const DB_FILE = path.resolve(process.cwd(), 'data.sqlite')
const MIGRATIONS_DIR = path.resolve(process.cwd(), 'migrations')

function runSql(db, sql) {
  return new Promise((res, rej) => {
    db.exec(sql, (err) => {
      if (err) rej(err)
      else res()
    })
  })
}

async function main() {
  try {
    if (fs.existsSync(DB_FILE)) fs.unlinkSync(DB_FILE)

    const db = new sqlite3.Database(DB_FILE)

    // run migrations
    const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort()
    for (const file of files) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
      await runSql(db, sql)
    }

    // create collection
    const now = Date.now()
    const collectionId = require('crypto').randomUUID()
    await new Promise((res, rej) => db.run('INSERT INTO Collection (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)', collectionId, 'pw-e2e', now, now, function(err) { if (err) rej(err); else res(); }))

    // create card
    const cardId = require('crypto').randomUUID()
    await new Promise((res, rej) => db.run('INSERT INTO Card (id, collection_id, question, answer, format, compartment, next_review_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', cardId, collectionId, 'Q', 'A', 'text', 1, now, now, now, function(err) { if (err) rej(err); else res(); }))

    // close and reopen to simulate reload
    await new Promise((res) => db.close(res))

    const db2 = new sqlite3.Database(DB_FILE)
    const cardsCount = await new Promise((res, rej) => db2.all('SELECT * FROM Card WHERE collection_id = ? AND deleted_at IS NULL', [collectionId], (err, rows) => { if (err) rej(err); else res(rows.length) }))

    // soft delete collection
    await new Promise((res, rej) => db2.run('UPDATE Collection SET deleted_at = ? WHERE id = ?', Date.now(), collectionId, function(err) { if (err) rej(err); else res(); }))
    await new Promise((res, rej) => db2.run('UPDATE Card SET deleted_at = ? WHERE collection_id = ?', Date.now(), collectionId, function(err) { if (err) rej(err); else res(); }))

    const cardsAfterDelete = await new Promise((res, rej) => db2.all('SELECT * FROM Card WHERE collection_id = ? AND deleted_at IS NULL', [collectionId], (err, rows) => { if (err) rej(err); else res(rows.length) }))

    await new Promise((res) => db2.close(res))

    const out = { cardsCount, cardsAfterDelete }
    console.log(JSON.stringify(out))
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(2)
  }
}

main()
