# Analytics Integration Guide - EstatePro

This guide walks you through setting up analytics tracking for your EstatePro platform. Choose either **Option 1: Google Analytics** or **Option 2: Microsoft Clarity** (or use both!).

---

## Option 1: Google Analytics (GA4)

### Step 1: Create a Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **"Start measuring"** (or sign in if you have an account)
3. Enter an **Account name** (e.g., "EstatePro")
4. Click **Next**

### Step 2: Set Up a Property

1. Enter a **Property name** (e.g., "EstatePro Website")
2. Select your **Time zone** and **Currency** (EGP for Egypt)
3. Click **Next**
4. Select your **Industry category**: "Real Estate"
5. Select your **Business size**
6. Click **Create**
7. Accept the Terms of Service

### Step 3: Set Up a Data Stream

1. Select **Web** as your platform
2. Enter your website URL:
   - **Development**: `http://localhost:5173`
   - **Production**: `https://yourdomain.com`
3. Enter a **Stream name** (e.g., "EstatePro Web")
4. Click **Create stream**

### Step 4: Get Your Measurement ID

1. After creating the stream, you'll see your **Measurement ID**
   - It looks like: `G-XXXXXXXXXX`
2. **Copy this ID** - you'll need it for the next step

### Step 5: Configure Your Environment

1. In your frontend project, create a `.env` file (if not exists):
   ```bash
   cd h:\Projects\real-estate-platform\real-estate-platform
   copy .env.example .env
   ```

2. Open `.env` and add your Measurement ID:
   ```env
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
   Replace `G-XXXXXXXXXX` with your actual ID.

3. **Restart your development server**:
   ```bash
   npm run dev
   ```

### Step 6: Verify It's Working

1. Open your website in a browser
2. **Accept cookies** when the consent banner appears
3. Go to Google Analytics → **Reports** → **Realtime**
4. You should see your visit appear within 30 seconds!

### Step 7: Set Up Conversions (Optional but Recommended)

In Google Analytics:
1. Go to **Admin** → **Events**
2. Find these events and mark as **Conversions**:
   - `generate_lead` (contact form submissions)
   - `begin_checkout` (inquiry submissions)
   - `schedule_tour` (tour requests)

---

## Option 2: Microsoft Clarity (FREE + Heatmaps!)

Microsoft Clarity is **completely free** and includes:
- Session recordings
- Heatmaps
- User behavior analytics

### Step 1: Create a Clarity Account

1. Go to [Microsoft Clarity](https://clarity.microsoft.com/)
2. Click **"Get started"** (sign in with Microsoft/Google/Facebook)
3. Click **"Add new project"**

### Step 2: Set Up Your Project

1. Enter **Project name**: "EstatePro"
2. Enter your **Website URL**: `https://yourdomain.com`
3. Select **Category**: "Real Estate"
4. Click **"Add new project"**

### Step 3: Get Your Clarity ID

1. After creating the project, go to **Setup** → **Install Clarity**
2. You'll see a code snippet like:
   ```html
   <script type="text/javascript">
       (function(c,l,a,r,i,t,y){...})(window, document, "clarity", "script", "XXXXXXXXXX");
   </script>
   ```
3. **Copy the ID** (the `XXXXXXXXXX` part)

### Step 4: Add Clarity to Your Project

I'll add Clarity support to the tracking service. First, update your `.env`:

```env
VITE_CLARITY_ID=XXXXXXXXXX
```

Then I'll update the tracking service to include Clarity.

### Step 5: Verify It's Working

1. Open your website
2. Accept cookies
3. Navigate around the site
4. Go to Clarity Dashboard → wait 2-3 minutes
5. You should see your session appear in **Recordings**!

---

## Quick Comparison

| Feature | Google Analytics | Microsoft Clarity |
|---------|-----------------|-------------------|
| **Price** | Free (with limits) | 100% Free |
| **Page Views** | ✅ | ✅ |
| **Events** | ✅ | ✅ |
| **Session Recordings** | ❌ (paid add-on) | ✅ FREE |
| **Heatmaps** | ❌ (paid add-on) | ✅ FREE |
| **User Demographics** | ✅ | Limited |
| **Conversion Tracking** | ✅ Advanced | Basic |
| **GDPR Compliance** | ✅ | ✅ |

**Recommendation**: Use **BOTH**! They complement each other:
- Google Analytics for traffic & conversion data
- Microsoft Clarity for session recordings & heatmaps

---

## Troubleshooting

### Analytics Not Working?

1. **Check Cookie Consent**: Did you accept "Analytics" cookies?
   - Open DevTools → Application → Local Storage
   - Look for `estatepro_cookie_preferences`
   - Ensure `analytics: true`

2. **Check Environment Variable**:
   ```bash
   # In browser console:
   console.log(import.meta.env.VITE_GA_MEASUREMENT_ID)
   ```
   Should show your GA ID.

3. **Check Script Loading**:
   - Open DevTools → Network tab
   - Filter by "gtag" or "clarity"
   - Should see the script loading

4. **Check Console for Errors**:
   - Look for `📊 [Analytics]` messages
   - "Skipped - User has not consented" = cookies not accepted
   - "Initialized successfully" = working!

### Events Not Showing?

1. In GA4, events can take up to 24 hours to appear in main reports
2. Use **Realtime** report for immediate verification
3. Use **DebugView** (GA4 → Admin → DebugView) for detailed debugging

---

## Next Steps After Setup

1. **Set up Goals/Conversions** in Google Analytics
2. **Create Custom Dashboards** for your real estate metrics
3. **Set up Alerts** for traffic drops or conversion changes
4. **Review Clarity Recordings** weekly to understand user behavior
5. **Analyze Heatmaps** to optimize page layouts

---

## Your Current Implementation

The tracking is already integrated! Here's what's being tracked:

| Event | Trigger | Data Sent |
|-------|---------|-----------|
| `page_view` | Every page navigation | Page path, title |
| `view_item` (project) | Project detail viewed | Project ID, name, location |
| `view_item` (unit) | Unit detail viewed | Unit ID, type, price, project |
| `ai_query` | AI chat message sent | Query type, has_results |
| `generate_lead` | Contact form opened | Form type, subject |
| `begin_checkout` | Unit inquiry submitted | Unit ID, type, price |
| `search` | Search performed | Search term, results count |
| `contact` | WhatsApp/Phone clicked | Method, source |

