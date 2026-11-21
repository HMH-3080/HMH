# .env in Production — Are We Handling Secrets Correctly?

![.env in Production — Are you really securing your secrets?](articles/env-secrets-in-production.png)

استخدام ملفات `.env` في التطوير شائع ومناسب جداً لكن نفس أسلوب إدارة الإعدادات والأسرار في بيئة الإنتاج محتاج حسابات تانية

المشكلة مش في ملف `.env` نفسه لكن في الافتراض إن وجوده داخل السيرفر مع شوية صلاحيات و `.gitignore` كافي لتأمين الداتا الحساسة

في بيئة الإنتاج عندنا مجموعة من البيانات اللي لازم نتعامل معاها باعتبارها Secrets زي Database Credentials و API Keys و JWT Signing Keys و Private Tokens

وتخزين البيانات دي في ملف نصي معناه إن أمانها مرتبط بشكل مباشر بصلاحيات الوصول للملف وبأمان النظام اللي بيستضيفه

فيه كذا نقطة محتاجة اهتمام أثناء تجهيز بيئة الإنتاج

**File Permissions**

مين عنده صلاحية قراءة الملف؟

تشغيل التطبيق بمستخدم مخصص وتقييد صلاحيات الملف بحيث يكون متاح للمستخدم ده فقط خطوة أساسية لتقليل احتمالية الوصول غير المصرح به

مثلاً على Linux ممكن نستخدم:

```bash
sudo chown myapp:myapp /etc/myapp/production.env
sudo chmod 600 /etc/myapp/production.env
```

كده مالك الملف فقط هو اللي عنده صلاحية القراءة والكتابة

وممكن كمان نتأكد إن المجلد نفسه مش متاح لمستخدمين تانيين

```bash
sudo chmod 700 /etc/myapp
```

**File Location**

وجود ملف `.env` داخل مجلد التطبيق مش أفضل اختيار خصوصاً لو المجلد موجود داخل Web Root أو بيتعامل معاه أكتر من Service

الأفضل فصل ملفات الإعدادات والأسرار عن ملفات التطبيق ووضعها في مسار مخصص بصلاحيات محددة

مثلاً بدل:

```text
/var/www/myapp/.env
```

نستخدم:

```text
/etc/myapp/production.env
```

وممكن نربطه بالتطبيق عن طريق Systemd:

```ini
[Service]
User=myapp
Group=myapp
EnvironmentFile=/etc/myapp/production.env
ExecStart=/opt/myapp/bin/server
```

وبكده بنفصل ملفات التطبيق عن إعدادات التشغيل

**Docker Images**

من المشاكل الكبيرة تمرير الأسرار عند عملية بناء Docker Image باستخدام `ARG` أو `ENV` أو نسخ ملف `.env` داخل الصورة

لأن البيانات دي ممكن تفضل موجودة داخل Image Layers حتى بعد حذف الملف من الصورة النهائية

الأفضل استخدام Docker BuildKit Secrets عند مرحلة البناء عند الحاجة واستخدام آليات حقن الأسرار وقت التشغيل

مثال لاستخدام BuildKit أثناء البناء:

```dockerfile
# syntax=docker/dockerfile:1

RUN --mount=type=secret,id=npm_token \
    TOKEN=$(cat /run/secrets/npm_token) && \
    npm install
```

وعند البناء:

```bash
docker build \
  --secret id=npm_token,src=./npm_token \
  -t myapp .
```

المهم هنا إن BuildKit Secrets مخصصة لمرحلة البناء ومش بديل عن إدارة أسرار التطبيق وقت التشغيل

**Docker Runtime Secrets**

لو بتستخدم Docker Compose ممكن تمرر الأسرار للتطبيق كملفات بدل تخزينها داخل Image

```yaml
services:
  app:
    image: myapp:latest
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

والتطبيق يقرأ السر من:

```text
/run/secrets/db_password
```

مع ملاحظة إن Docker Compose العادي بيستخدم ملفات على الجهاز المضيف كمصدر للأسرار وبالتالي لازم تأمين الملفات الأصلية وصلاحيات الوصول ليها

**Environment Variables**

الانتقال من `.env` إلى Environment Variables مش حل أمني كامل

لأن متغيرات البيئة ممكن تكون متاحة لعمليات تانية حسب صلاحيات النظام وطريقة تشغيل التطبيق وممكن تظهر في Diagnostic Dumps أو Logs

مثلاً على Linux ممكن الوصول لمتغيرات البيئة الخاصة بعملية من خلال:

```bash
cat /proc/<PID>/environ
```

طبعاً الوصول للملف ده بيخضع لصلاحيات النظام وإعدادات الحماية

بالتالي تغيير طريقة التخزين لوحده مش كافي من غير التحكم في Access و Process Isolation

**Secrets Management**

في المشاريع اللي فيها أكتر من Service أو بيئة تشغيل مختلفة بيكون استخدام Secret Manager حل أفضل من إدارة ملفات يدوياً

أدوات زي HashiCorp Vault و AWS Secrets Manager بتوفر إمكانيات لإدارة الأسرار والتحكم في الوصول ليها وتغييرها ومتابعة استخدامها

مثلاً بدل ما التطبيق يحتفظ بقاعدة بيانات Credentials ثابتة ممكن يحصل عليها وقت التشغيل من Secret Manager باستخدام هوية وصلاحيات مخصصة للخدمة

وبكده مش محتاجين نحط بيانات الدخول الخاصة بالـ Secret Manager نفسها داخل المشروع

**Secret Rotation**

تغيير الـ Credentials بشكل دوري أو عند الاشتباه في تسريبها جزء مهم من إدارة الأسرار

مثلاً لو Database Password اتسرب لازم نقدر نغيره ونلغي القديم من غير ما نحتاج نعيد بناء التطبيق بالكامل

وده ممكن يتنفذ من خلال دعم التطبيق لتحديث بيانات الاتصال وإعادة إنشاء Connection Pool عند الحاجة

**Least Privilege**

كل Service المفروض يكون عندها صلاحية الوصول للأسرار اللي محتاجاها فقط

مش منطقي إن خدمة مسؤولة عن إرسال Emails يكون عندها صلاحية الوصول لبيانات قاعدة البيانات أو مفاتيح خدمات تانية من غير احتياج فعلي

مثلاً ممكن نخصص API Key لخدمة إرسال الإيميلات بصلاحيات الإرسال فقط بدل استخدام مفتاح عام عنده صلاحيات إدارة الحساب بالكامل

في النهاية لازم نفرق بين Configuration Management و Secrets Management

ملف `.env` مناسب جداً لإدارة إعدادات التطوير وممكن استخدامه في مشاريع إنتاجية بسيطة بشرط عزله وتأمينه بشكل صحيح

لكن مع زيادة تعقيد البنية التحتية وتعدد الخدمات والبيئات بيكون من الأفضل الانتقال لحل مخصص لإدارة الأسرار

الأمان مش مرتبط بمكان تخزين الـ Secret فقط لكنه مرتبط بدورة حياته بالكامل من الإنشاء والتخزين وتحديد صلاحيات الوصول لحد التدوير والإلغاء

**How do you manage application secrets in production?**
