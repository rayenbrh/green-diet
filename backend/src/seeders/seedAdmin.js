import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User } from '../models/User.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/greendiet'

const email = (process.env.SEED_ADMIN_EMAIL || 'admin@greendiet.tn').toLowerCase().trim()
const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@2025!'

async function run() {
  await mongoose.connect(MONGODB_URI)

  const existing = await User.findOne({ email })
  if (existing) {
    if (existing.role !== 'admin') {
      await User.findByIdAndUpdate(existing._id, { role: 'admin' })
      console.log(`✅ Utilisateur existant « ${email} » promu admin (mot de passe inchangé).`)
    } else {
      console.log(`ℹ️ Admin déjà présent : ${email} (aucune modification du mot de passe).`)
    }
    await mongoose.disconnect()
    return
  }

  await User.create({
    firstName: 'Admin',
    lastName: 'Green Diet',
    email,
    phone: process.env.SEED_ADMIN_PHONE || '+21600000001',
    password,
    role: 'admin',
    address: { street: 'Sfax', city: 'Sfax', region: 'Sfax', country: 'Tunisie' },
  })

  console.log(`✅ Compte admin créé : ${email} / ${password}`)
  console.log('   (changez le mot de passe après la première connexion.)')
  await mongoose.disconnect()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
