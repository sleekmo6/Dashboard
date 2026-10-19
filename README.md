# E-Commerce Admin Dashboard

A complete single-store e-commerce admin dashboard built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Live demo

**URL:** https://dashboard-orcin-nine-94.vercel.app

**Demo login**
- Email: `demo@skeeks.app`
- Password: `DemoStore`

This account is for portfolio viewing only. Data may be reset periodically.
Do not use real personal or payment information.

## Features

- **Authentication**: Email/password login and registration using Supabase Auth
- **Product Management**:
  - Create, edit, delete products
  - Multiple product images with Supabase Storage
  - Product variants (size, color, etc.) with individual prices and stock
  - Categories
  - Inventory tracking
- **Order Management**:
  - List all orders with status filtering
  - View order details (customer info, items, totals)
  - Update order status (Pending, Processing, Shipped, Delivered, Cancelled)
- **Customer Management**: View customer list with order history and spending
- **Dashboard Analytics**:
  - Total revenue
  - Number of orders
  - Average order value
  - Top selling products
  - Recent orders
  - Sales charts
- **Store Settings**:
  - Store name, logo, description
  - Currency selection
  - Payment provider integration (Stripe/Paystack)
  - Shipping options and rates
  - Store status (open/closed)
- **Dark Mode Support**
- **Fully Responsive Design**

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Notifications**: Sonner

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd Dashboard
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set Up the Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `schema.sql` and run it in the SQL Editor

This will create:
- All necessary tables (profiles, products, orders, customers, etc.)
- Row Level Security (RLS) policies
- Triggers for automated updates
- Default store settings

### 4. Set Up Storage

1. In your Supabase dashboard, go to Storage
2. Create a new bucket called `products`
3. Set the bucket to **public**
4. Add the following policy for public access:
   - Policy name: "Public Access"
   - Allowed operations: SELECT
   - Policy definition: `true`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your First Admin Account

1. Navigate to `/auth/register`
2. Sign up with your email and password
3. You'll be automatically logged in and redirected to the dashboard

## Project Structure

```
├── app/
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   │   ├── categories/    # Category management
│   │   ├── customers/     # Customer list
│   │   ├── orders/        # Order management
│   │   ├── products/      # Product management
│   │   └── settings/      # Store settings
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects to login)
├── components/
│   ├── categories/        # Category components
│   ├── customers/         # Customer components
│   ├── dashboard/         # Dashboard components
│   ├── orders/            # Order components
│   ├── products/          # Product components
│   ├── settings/          # Settings components
│   ├── ui/                # Reusable UI components
│   └── theme-provider.tsx # Theme provider
├── lib/
│   ├── supabase/          # Supabase client utilities
│   └── utils.ts           # Utility functions
├── middleware.ts          # Auth middleware
├── schema.sql             # Database schema
└── tailwind.config.ts     # Tailwind configuration
```

## Database Schema

The application uses the following main tables:

- `profiles` - User profiles
- `store_settings` - Store configuration
- `categories` - Product categories
- `products` - Product information
- `product_variants` - Product variants
- `product_images` - Product images
- `orders` - Customer orders
- `order_items` - Order line items
- `customers` - Customer information

## Key Features Explained

### Authentication & Authorization

- Uses Supabase Auth for secure authentication
- Middleware protects dashboard routes
- Row Level Security (RLS) ensures data access control

### Product Management

- Support for multiple images per product
- Image upload to Supabase Storage
- Product variants with individual pricing and inventory
- Category organization
- Draft, published, and archived status

### Order Management

- Comprehensive order tracking
- Status updates (Pending → Processing → Shipped → Delivered)
- Customer information and shipping details
- Order item breakdown with pricing

### Analytics Dashboard

- Real-time metrics
- Sales charts using Recharts
- Top selling products
- Recent orders overview

### Store Settings

- Configurable store information
- Logo upload
- Multiple currency support
- Payment provider integration (Stripe/Paystack)
- Flexible shipping rates

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Add environment variables in project settings
4. Deploy

### Other Platforms

The app can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted

## Important Notes

- This is a **single-tenant** application - each deployment is for one store only
- For multiple stores, deploy separate instances with different Supabase projects
- Remember to set up proper RLS policies in production
- Store payment provider keys securely (consider using Supabase Vault for production)
- Configure CORS and allowed domains in Supabase for production

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Security Considerations

1. **Row Level Security**: All tables have RLS enabled with appropriate policies
2. **Environment Variables**: Never commit `.env.local` to version control
3. **Payment Keys**: Store sensitive keys securely (use Supabase Vault in production)
4. **Image Upload**: Validate file types and sizes on the client and server
5. **Authentication**: Middleware protects all dashboard routes

## Customization

### Branding

- Update store settings in the dashboard
- Modify color scheme in `tailwind.config.ts`
- Change logo and favicon in the `public` folder

### Adding Features

The modular structure makes it easy to extend:
- Add new pages in `app/dashboard/`
- Create new components in `components/`
- Extend database schema in Supabase
- Add new API routes in `app/api/`

## Troubleshooting

### Images Not Uploading

- Ensure the `products` bucket exists in Supabase Storage
- Check bucket is set to public
- Verify RLS policies on the storage bucket

### Authentication Issues

- Verify environment variables are set correctly
- Check Supabase project URL and anon key
- Ensure email confirmations are disabled in Supabase Auth settings (for development)

### Database Errors

- Ensure `schema.sql` was run completely
- Check RLS policies are enabled
- Verify user has proper permissions

## Support

For issues and questions:
- Check the Supabase documentation
- Review Next.js documentation
- Check shadcn/ui component documentation

## License

MIT

---

Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and Supabase
