# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works fine)

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish provisioning (takes ~2 minutes)
3. Go to **Project Settings** > **API**
4. Copy your **Project URL** and **anon/public key**

### 3. Configure Environment Variables

1. Copy the example env file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up the Database

1. In your Supabase dashboard, go to the **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `schema.sql` from this project
4. Paste it into the SQL Editor
5. Click **Run** to execute

This creates all tables, policies, triggers, and default data.

### 5. Set Up Storage for Product Images

1. In Supabase dashboard, go to **Storage**
2. Click **Create a new bucket**
3. Name it `products`
4. Set it to **Public**
5. Create the bucket
6. Click on the `products` bucket
7. Go to **Policies** tab
8. Add a new policy:
   - Policy name: "Public Access"
   - Target roles: `public`
   - Policy type: `SELECT`
   - Policy definition: `true`
9. Click **Review** then **Save policy**

### 6. Configure Authentication (Optional but Recommended for Development)

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Under **Email**, disable "Confirm email" for easier testing
3. This allows immediate login after registration (re-enable in production!)

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 8. Create Your Admin Account

1. Go to `/auth/register`
2. Fill in:
   - Full Name: Your Name
   - Email: your@email.com
   - Password: (at least 6 characters)
3. Click **Create Account**
4. You'll be redirected to login
5. Sign in with your credentials

### 9. Configure Your Store

1. After logging in, go to **Settings** in the sidebar
2. Update:
   - Store Name
   - Store Description
   - Currency
   - Upload a logo
   - Configure payment provider (optional)
   - Set shipping rates
3. Click **Save Settings**

## You're Done! 🎉

Your dashboard is now ready. You can:
- Add categories under **Categories**
- Create products under **Products**
- View orders under **Orders**
- Check customers under **Customers**
- Monitor analytics on the **Dashboard**

## Troubleshooting

### Can't login after registration?
- Check that your Supabase project is active
- Verify environment variables are correct
- Check browser console for errors

### Images not uploading?
- Ensure `products` bucket exists in Supabase Storage
- Check the bucket is set to **Public**
- Verify the policy allows public SELECT

### Database errors?
- Make sure you ran the entire `schema.sql` file
- Check the SQL Editor for any error messages
- Verify RLS policies are enabled

### Build errors?
```bash
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

## Next Steps

- Add your first product with images
- Create some categories to organize products
- Explore the settings page to customize your store
- Test the order management workflow

## Production Deployment

When ready to deploy:
1. Push code to GitHub
2. Deploy on Vercel (recommended) or your preferred platform
3. Add environment variables in deployment settings
4. Re-enable email confirmation in Supabase Auth
5. Set up proper CORS in Supabase
6. Configure custom domain
7. Store sensitive payment keys in Supabase Vault

---

Need help? Check the main README.md for detailed documentation.
