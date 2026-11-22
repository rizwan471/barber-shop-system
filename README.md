# ✂️ Elite Barber Lounge - Barber Shop Management System

ایک جدید، تیز رفتار اور خوبصورت **Barber Shop Management System** جو مکمل طور پر HTML5، CSS3، جدید JavaScript اور **Supabase (Free Tier Database)** پر تیار کیا گیا ہے۔

اس پروجیکٹ کو خصوصی طور پر اس طرح ڈیزائن کیا گیا ہے کہ آپ اسے بغیر کسی خرچ کے **GitHub** اور **Netlify Free Tier** پر آسانی سے لائیو چلا سکتے ہیں۔

---

## 🌟 نمایاں خصوصیات (Key Features)

1. **Dashboard (ڈیش بورڈ):**
   - روزانہ کی اپائنٹمنٹس، کل کمائی، ایکٹو کسٹمرز اور مکمل سروسز کے لائیو KPI کارڈز۔
   - پچھلے 7 دنوں کی آمدنی کا انٹرایکٹو بار چارٹ (Interactive Revenue Trend Chart)۔
   - آج کے شیڈول کی تفصیلی فہرست بمع فوری ایکشنز (Done, Pay, Receipt)۔

2. **Customers Management (کسٹمرز):**
   - نیا گاہک شامل کریں (Add Customer Modal)۔
   - گاہک کے کوائف تبدیل کریں (Edit Customer) یا ڈیلیٹ کریں۔
   - کسٹمر ہسٹری ونڈو: پچھلے تمام وزٹس، پسندیدہ اسٹائل اور خرچ کردہ کل رقم کی تفصیل۔
   - فوری تلاش (Instant Real-time Search by Name, Phone or Email)۔

3. **Services & Pricing (سروسز مینو):**
   - کٹیگری فلٹرز: Haircuts, Beard & Shave, Combos, Facial & Spa, Hair Color۔
   - سروس کا دورانیہ (Minutes) اور قیمت (Rs. / $) کا حساب۔
   - نئی سروس شامل کریں، ریٹ تبدیل کریں یا آن/آف (Active/Inactive) کریں۔

4. **Appointments Booking (اپائنٹمنٹس):**
   - نیا وقت بک کریں (کسٹمر، سروس، اسٹائلسٹ، تاریخ، وقت اور قیمت منتخب کریں)۔
   - شیڈول اسٹیٹس مینیجمنٹ: Pending, Confirmed, Completed, Cancelled۔
   - تاریخ کے لحاظ سے فلٹر (Today, Tomorrow, All Dates) اور اسٹیٹس فلٹر۔
   - اپائنٹمنٹ مکمل ہوتے ہی فوری بل بنانے اور رسید پرنٹ کرنے کی سہولت۔

5. **Payments & Billing (ادائیگیاں اور رسید):**
   - کیش، کارڈ، EasyPaisa، JazzCash اور آن لائن بینک ٹرانسفر کی سپورٹ۔
   - خودکار یونیک انوائس نمبر جنریشن (مثلاً `INV-2026-0001`)۔
   - خوبصورت، تھرمل پرنٹر اور A4 دونوں کے لیے تیار شدہ **پرنٹ ایبل رسید (Printable Receipt)**۔

6. **Reports & Analytics (رپورٹس اور برآمد):**
   - وقت کا انتخاب: Today, Last 7 Days, This Month, All Time یا کسٹم تاریخیں۔
   - سروسز کی آمدنی کا تقابل اور ادائیگی کے طریقوں کا فیصد شیئر۔
   - ایک کلک میں تمام اپائنٹمنٹس، ادائیگیوں اور کسٹمرز کی لسٹ **Excel / CSV** میں ڈاؤن لوڈ کریں۔

7. **Dual Mode Architecture (Supabase Live + Demo Mode):**
   - جیسے ہی آپ Supabase کی کیز داخل کریں گے، سسٹم فوری طور پر لائیو PostgreSQL سے جڑ جائے گا۔
   - اگر آپ نے ابھی ڈیٹا بیس نہیں بنایا تو بھی تمام فیچرز (Add, Edit, Delete, Search, Billing) مقامی طور پر ڈیمو موڈ میں 100 فیصد فعال رہیں گے۔
   - سسٹم کی سیٹنگز میں "Seed / Upload Demo Data to Supabase" کا بٹن موجود ہے جو ایک کلک میں ڈیٹا بیس کو آباد کر دیتا ہے۔

---

## 📁 پروجیکٹ کا ڈھانچہ (Project Structure)

```text
Barber Shop Management System/
│
├── index.html              # مرکزی ایپلیکیشن پیج (SPA)
├── netlify.toml            # نیٹلی فائی ڈپلائمنٹ کنفیگریشن اور ری ڈائریکٹس
├── supabase_setup.sql      # سپابیس کے لیے مکمل PostgreSQL اسکرپٹ بمع ٹیبلز و RLS
├── .gitignore              # گٹ اگنور فائل
├── README.md               # مکمل رہنما دستاویز (اردو + English)
│
├── css/
│   ├── style.css           # جدید لکژری باربر شاپ ڈارک/سلیک تھیم اور امبر گولڈ کلرز
│   ├── responsive.css      # موبائل، ٹیبلٹ اور ونڈوز ڈیسک ٹاپ کے لیے ریسپانسو ڈیزائن
│   └── print.css           # رسید اور رپورٹس کی صاف ستھری پرنٹنگ کے لیے خصوصی سی ایس ایس
│
└── js/
    ├── config.js           # شاپ کا نام، کرنسی اور سپابیس کی ابتدائی سیٹنگز
    ├── supabase-client.js  # سپابیس کلائنٹ اور کنکشن اسٹیٹس ہینڈلر
    ├── db.js               # لائیو سپابیس اور لوکل اسٹوریج کا یونیفائیڈ ڈیٹا لیئر
    ├── ui.js               # ٹوسٹ الرٹس، پاپ اپ موڈلز اور فارمیٹرز
    ├── dashboard.js        # ڈیش بورڈ، لائیو گراف اور شیڈول کنٹرولر
    ├── customers.js        # کسٹمرز CRUD اور وزٹ ہسٹری ماڈیول
    ├── services.js         # سروسز مینو اور پرائسنگ ماڈیول
    ├── appointments.js     # اپائنٹمنٹس بکنگ اور شیڈولنگ ماڈیول
    ├── payments.js         # بلنگ، ادائیگیاں اور تھرمل رسید ماڈیول
    ├── reports.js          # فنانشل رپورٹس، اینالیٹکس اور CSV ایکسپورٹ
    └── app.js              # نیویگیشن راؤٹر اور گلوبل کنفیگریشن
```

---

## 🚀 مرحلہ وار رہنما: Supabase، GitHub اور Netlify پر چلانے کا طریقہ

### مرحلہ 1: Supabase پر مفت ڈیٹا بیس بنانا (5 منٹ)

1. **[supabase.com](https://supabase.com)** پر جائیں اور **Start your project** پر کلک کر کے اپنے مفت اکاؤنٹ میں لاگ ان کریں۔
2. **New Project** بٹن دبائیں:
   - **Name:** `barber-shop-db`
   - **Database Password:** کوئی بھی مضبوط پاس ورڈ لکھ کر یاد رکھیں۔
   - **Region:** اپنے قریب ترین خطہ (مثلاً Singapore یا Frankfurt) منتخب کریں۔
   - **Plan:** Free Plan منتخب کریں اور **Create new project** پر کلک کریں۔
3. جب پروجیکٹ بن جائے تو بائیں جانب مینو میں **SQL Editor** پر جائیں۔
4. **New query** پر کلک کریں۔
5. اس پروجیکٹ میں موجود **`supabase_setup.sql`** فائل کا تمام کوڈ کاپی کریں اور Supabase کے SQL Editor میں پیسٹ کر کے نیچے دائیں کونے میں **Run** بٹن دبا دیں۔
   - اس سے `customers`, `services`, `barbers`, `appointments`, اور `payments` کے ٹیبلز، پرفارمنس انڈیکسز، مفت پبلک رسائی پالیسیاں اور بنیادی ڈیمو ڈیٹا خود بخود بن جائیں گے!
6. بائیں مینو میں سب سے نیچے **Project Settings** (گیئر آئیکون) پر جائیں اور **API** منتخب کریں:
   - **Project URL** کاپی کریں۔
   - **Project API keys** کے تحت **anon / public** کلید کاپی کریں۔

---

### مرحلہ 2: ویب سائٹ کو Supabase سے کنیکٹ کرنا

آپ کے پاس کنیکٹ کرنے کے دو آسان طریقے ہیں:

* **طریقہ نمبر 1 (ایپ کے اندر سے - سب سے آسان):**
  - ایپ کھولیں اور اوپر دائیں کونے میں **⚙️ (Settings)** آئیکون پر کلک کریں۔
  - اپنے کاپی کیے گئے **Project URL** اور **Anon Key** پیسٹ کریں۔
  - **⚡ Test Connection** پر کلک کریں۔ سبز رنگ کا میسج آئے گا کہ کنکشن کامیاب رہا!
  - **Save Settings** دبائیں۔ اب آپ کا ڈیٹا براہ راست سپابیس کلاؤڈ میں محفوظ ہوگا!

* **طریقہ نمبر 2 (کوڈ فائل کے ذریعے):**
  - `js/config.js` فائل کھولیں اور اپنے کریڈنشلز لکھیں:
    ```javascript
    window.APP_CONFIG = {
        supabaseUrl: 'https://xyzcompany.supabase.co',
        supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        shopName: 'Elite Barber Lounge',
        currencySymbol: 'Rs. '
    };
    ```

---

### مرحلہ 3: GitHub پر اپلوڈ کرنا

1. **[github.com](https://github.com)** پر جائیں اور لاگ ان کریں۔
2. نیا ریپوزیٹری بنائیں (**New Repository**)، مثلاً نام رکھیں: `barber-shop-management-system`۔
3. اسے **Public** رکھیں اور Create دبائیں۔
4. اپنے کمپیوٹر پر پروجیکٹ فولڈر میں ٹرمینل کھول کر یہ کمانڈز چلائیں:
   ```bash
   git init
   git add .
   git commit -m "Initial Barber Shop Management System"
   git branch -M main
   git remote add origin https://github.com/آپکا_یوزرنیم/barber-shop-management-system.git
   git push -u origin main
   ```

---

### مرحلہ 4: Netlify پر مفت لائیو آن لائن چلانا (Deployment)

1. **[netlify.com](https://netlify.com)** پر جائیں اور مفت لاگ ان کریں۔
2. ڈیش بورڈ پر **Add new site** پر کلک کریں اور **Import an existing project** منتخب کریں۔
3. **GitHub** منتخب کریں اور اپنی ریپوزیٹری `barber-shop-management-system` کو منتخب کریں۔
4. سیٹنگز میں کچھ تبدیل کرنے کی ضرورت نہیں (Build command خالی رہے گا اور Publish directory `.` ہوگی)۔
5. **Deploy site** کا بٹن دبا دیں۔
6. 10 سے 20 سیکنڈ میں آپ کی ویب سائٹ پوری دنیا کے لیے لائیو ہو جائے گی (مثلاً `https://elite-barber-app.netlify.app`)!
7. آپ Netlify کی سیٹنگز میں جا کر **Change site name** سے اپنی مرضی کا لنک بھی رکھ سکتے ہیں۔

---

### مرحلہ 5: Live Testing (لائیو ٹیسٹنگ چیک لسٹ)

اپنی لائیو ویب سائٹ پر جا کر درج ذیل چیزیں چیک کریں:
1. **کسٹمر شامل کرنا:** Customers میں جا کر "+ Add Customer" دبائیں اور نیا نام درج کریں۔ لسٹ میں نام شامل ہونا چاہیے۔
2. **سروس شامل کرنا:** Services میں جا کر نئی سروس اور ریٹ شامل کریں۔
3. **اپائنٹمنٹ بکنگ:** Appointments میں جا کر گاہک اور سروس چن کر بکنگ کریں۔
4. **اسٹیٹس اپ ڈیٹ اور بلنگ:** اپائنٹمنٹ پر **Done** دبائیں اور پھر **Pay** دبا کر کیش یا کارڈ کی رسید حاصل کریں۔ رسید پرنٹ کر کے ٹیسٹ کریں۔
5. **رپورٹس اور CSV:** Reports سیکشن میں جا کر دیکھیں کہ آمدنی کا چارٹ خود بخود اپ ڈیٹ ہو گیا ہے، اور "Export Appointments (.CSV)" دبا کر ایکسل فائل ڈاؤن لوڈ کریں۔

مبارک ہو! آپ کا مکمل باربر شاپ مینجمنٹ سسٹم تیار، محفوظ اور آن لائن لائیو ہے۔
