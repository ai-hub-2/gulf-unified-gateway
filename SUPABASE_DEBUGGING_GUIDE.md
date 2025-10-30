# دليل تشخيص مشاكل Supabase

## التاريخ
2025-10-30

## المشكلة
رسالة "Not Found" تظهر عند محاولة فتح روابط الدفع، حتى بعد إضافة متغيرات البيئة.

## خطوات التشخيص

### 1. افتح صفحة الاختبار

**الرابط:** https://elegant-dolphin-df88ef.netlify.app/supabase-test

هذه الصفحة ستفحص:
- ✓ هل متغيرات البيئة موجودة؟
- ✓ هل يمكن الاتصال بـ Supabase؟
- ✓ هل الجداول موجودة في قاعدة البيانات؟
- ✓ هل الأذونات (RLS Policies) مُفعّلة؟
- ✓ هل يمكن للمستخدمين المجهولين القراءة والكتابة؟

### 2. تحليل النتائج

#### الحالة 1: متغيرات البيئة مفقودة
```json
{
  "url": "undefined",
  "key": "missing"
}
```

**الحل:**
1. تم إضافة المتغيرات إلى Netlify بالفعل
2. لكن يجب إعادة البناء مع المتغيرات الجديدة
3. المتغيرات يتم تضمينها في وقت البناء، ليس في وقت التشغيل

#### الحالة 2: الجداول غير موجودة
```json
{
  "links": {
    "exists": false,
    "error": "relation \"public.links\" does not exist"
  }
}
```

**الحل:**
يجب تطبيق Migration على Supabase:

```bash
# الطريقة 1: استخدام Supabase Dashboard
1. افتح: https://supabase.com/dashboard/project/ktgieynieeqnjdhmpjht
2. اذهب إلى SQL Editor
3. انسخ محتويات: /workspace/supabase/migrations/20251007135959_c0115ec8-a671-486d-aa0a-f319977ce715.sql
4. الصقها واضغط Run

# الطريقة 2: استخدام Supabase CLI (إذا كان مُثبّت)
supabase db push
```

#### الحالة 3: الأذونات محظورة
```json
{
  "canSelect": false,
  "selectError": "permission denied",
  "canInsert": false,
  "insertError": "new row violates row-level security policy"
}
```

**الحل:**
يجب تطبيق RLS Policies على Supabase:

```bash
# افتح Supabase Dashboard -> SQL Editor
# نفذ محتويات: /workspace/fix-supabase-policies.sql
```

أو يدوياً:
```sql
-- Enable RLS on tables
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Anyone can view links" ON public.links FOR SELECT USING (true);
CREATE POLICY "Anyone can create links" ON public.links FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Anyone can create payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update payments" ON public.payments FOR UPDATE USING (true);
```

### 3. بعد تطبيق الإصلاحات

1. **أعد تحميل صفحة الاختبار:**
   ```
   https://elegant-dolphin-df88ef.netlify.app/supabase-test
   ```

2. **تحقق من النتائج:**
   - ✓ الاتصال: "connected"
   - ✓ جميع الجداول: موجودة
   - ✓ القراءة (SELECT): مسموح
   - ✓ الإضافة (INSERT): مسموح

3. **جرّب إنشاء رابط جديد:**
   ```
   https://elegant-dolphin-df88ef.netlify.app/create/SA/shipping
   ```

4. **افتح الرابط المُنشأ:**
   - يجب أن يعمل بدون رسالة "Not Found" ✓

## الملفات المُساعدة

1. **`/workspace/supabase/migrations/20251007135959_c0115ec8-a671-486d-aa0a-f319977ce715.sql`**
   - Migration كامل لإنشاء الجداول والأذونات
   - يحتوي على بيانات أولية (seed data)

2. **`/workspace/fix-supabase-policies.sql`**
   - ملف SQL لإصلاح الأذونات فقط
   - يمكن تطبيقه بشكل منفصل

3. **`/workspace/src/pages/SupabaseTest.tsx`**
   - صفحة اختبار شاملة
   - تعرض جميع المعلومات التشخيصية

## نقاط مهمة

### متغيرات البيئة في Vite

⚠️ **تحذير:** متغيرات البيئة في Vite يتم تضمينها في وقت البناء:

```typescript
// في الكود المصدري:
const url = import.meta.env.VITE_SUPABASE_URL;

// بعد البناء (build):
const url = "https://ktgieynieeqnjdhmpjht.supabase.co";
```

**لذلك:**
- إضافة متغيرات البيئة على Netlify لا يكفي
- يجب إعادة البناء بعد إضافة المتغيرات
- أو استخدام `netlify deploy --build` للبناء على Netlify

### Row Level Security (RLS)

Supabase يحمي البيانات افتراضياً عبر RLS. لجعل الجداول عامة:

```sql
-- تفعيل RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بالقراءة
CREATE POLICY "public_read" ON table_name 
  FOR SELECT 
  USING (true);

-- السماح للجميع بالإضافة
CREATE POLICY "public_insert" ON table_name 
  FOR INSERT 
  WITH CHECK (true);
```

## الخطوات التالية

بعد إصلاح Supabase:

1. ✅ جميع الروابط الجديدة ستُحفظ في قاعدة البيانات
2. ✅ يمكن مشاركتها وفتحها من أي جهاز
3. ✅ البيانات محفوظة بشكل آمن
4. ✅ جميع الميزات تعمل بشكل كامل

⚠️ **ملاحظة:** الروابط القديمة التي تم إنشاؤها قبل إصلاح Supabase لن تعمل لأنها لم تُحفظ في قاعدة البيانات أبداً.

## الدعم

إذا استمرت المشكلة بعد تطبيق جميع الخطوات:

1. افتح صفحة الاختبار وأرسل لقطة شاشة من النتائج
2. افتح Console في المتصفح (F12) وابحث عن أخطاء
3. تحقق من Supabase Dashboard -> Settings -> API
