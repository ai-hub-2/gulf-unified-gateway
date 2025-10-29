# 🚀 تعليمات النشر على Netlify

## معرف الموقع
```
nfp_ccsFPmt165aa1zwVVSM8JgENK5EdnPA312ff
```

## ✅ الملفات جاهزة
- ✅ تم بناء المشروع في مجلد `dist`
- ✅ تم تحديث `netlify.toml` بإعدادات صحيحة
- ✅ تم إصلاح مشاكل التوجيه (routing)
- ✅ جميع الملفات جاهزة للنشر

## الطريقة 1: النشر باستخدام Netlify CLI (مستحسن)

### 1. تثبيت Netlify CLI
```bash
npm install -g netlify-cli
```

### 2. تسجيل الدخول
```bash
netlify login
```

### 3. النشر
```bash
netlify deploy --prod --dir=dist --site=nfp_ccsFPmt165aa1zwVVSM8JgENK5EdnPA312ff
```

أو استخدام السكريبت الجاهز:
```bash
chmod +x deploy-netlify.sh
./deploy-netlify.sh
```

## الطريقة 2: النشر اليدوي (الأسهل)

### الخطوات:
1. اذهب إلى [Netlify Dashboard](https://app.netlify.com)
2. اضغط على "Add new site"
3. اختر "Deploy manually"
4. اسحب مجلد `dist` إلى منطقة الرفع
5. انتظر حتى يكتمل النشر

### أو رفع ملف ZIP:
- تم إنشاء `netlify-deploy.zip` - يمكنك رفعه مباشرة

## الطريقة 3: ربط مع Git (للمستقبل)

1. ارفع الكود إلى GitHub
2. في Netlify:
   - Add new site → Import an existing project
   - اختر المستودع
   - إعدادات:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
     - **Site ID**: `nfp_ccsFPmt165aa1zwVVSM8JgENK5EdnPA312ff`

## ✅ الإصلاحات المطبقة

1. ✅ **إصلاح التوجيه**: تم إزالة التوجيهات الخاطئة التي كانت تمنع عمل الروابط
2. ✅ **إضافة أزرار النسخ والمعاينة**: تمت إضافتها لروابط الشحن والشاليهات
3. ✅ **تحديث معرف الموقع**: تم إضافته في `netlify.toml`

## 🔍 التحقق بعد النشر

بعد النشر، تأكد من:
- ✅ الموقع يعمل بشكل صحيح
- ✅ روابط `/r/*` تعمل
- ✅ روابط `/pay/*` تعمل
- ✅ أزرار النسخ والمعاينة تعمل
- ✅ الروابط تعمل عند المشاركة

## 📝 ملاحظات

- جميع الملفات المطلوبة موجودة في مجلد `dist`
- ملف `netlify.toml` يحتوي على الإعدادات الصحيحة
- ملف `_redirects` في المجلد `public` موجود ويحتوي على التوجيهات الصحيحة

---

**🎉 المشروع جاهز للنشر!**
