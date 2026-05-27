# Asyah & Sukiflee · Wedding Invitation

การ์ดเชิญงานแต่งงานแบบ static site (React + Babel-in-browser)
วันที่ 26 กรกฎาคม 2026 · Baroh, Yaha, Yala

## โครงสร้างไฟล์

```
weding/
├── index.html                       # redirect → Wedding Card.html
├── Wedding Card.html                # การ์ดเชิญ (โหลด site.jsx)
├── site.jsx                         # React app
├── tweaks-panel.jsx                 # shared UI controls
│
├── netlify.toml                     # Netlify config
├── _headers                         # Netlify / Cloudflare Pages headers
├── .htaccess                        # Apache / cPanel hosting config
├── robots.txt                       # block search engine indexing
└── README.md
```

## ทดสอบบนเครื่องก่อน deploy

วิธีง่ายที่สุด — double-click `index.html` เปิดในเบราว์เซอร์ (Babel จะ transpile JSX ให้อัตโนมัติ)

ถ้าอยากรัน local server (แนะนำ เพื่อให้ใกล้เคียง production):

```powershell
# Python
python -m http.server 8080

# หรือ Node
npx serve .
```

แล้วเปิด http://localhost:8080

## Deploy บน Static Host

### ✅ Netlify (แนะนำ — drag & drop ง่ายที่สุด)
1. ไปที่ https://app.netlify.com/drop
2. ลาก folder `weding/` ทั้งหมดเข้าไป
3. เสร็จ — ได้ URL อัตโนมัติ
4. config ใน `netlify.toml` และ `_headers` จะถูกใช้อัตโนมัติ

### ✅ Cloudflare Pages
1. https://pages.cloudflare.com → Create project → Direct upload
2. อัพ folder ทั้งหมด (build command/output ว่างไว้)
3. `_headers` ทำงานเหมือน Netlify

### ✅ Vercel
1. https://vercel.com → Add New Project
2. Import folder (no build settings needed)

### ✅ GitHub Pages
1. push folder ขึ้น repo
2. Settings → Pages → Branch: main, Folder: / (root)

### ✅ Apache / cPanel (shared hosting ไทย)
1. ZIP folder ทั้งหมด upload ผ่าน File Manager
2. แตก zip ไปที่ `public_html/`
3. `.htaccess` จะตั้ง MIME type ของ `.jsx` ให้อัตโนมัติ

### ✅ Nginx
เพิ่มใน server block:
```nginx
location ~ \.jsx$ {
    default_type application/javascript;
    add_header Cache-Control "public, max-age=3600";
}
```

## ปรับแต่งข้อมูล

ค่า default อยู่ใน block `EDITMODE-BEGIN ... EDITMODE-END`:
- ชื่อเจ้าบ่าว/เจ้าสาว
- วันที่ / เวลา
- สถานที่ / map query
- palette / petal density

แก้ใน [site.jsx](site.jsx)

## หมายเหตุ

- `robots.txt` ตั้งให้ block search engine ทุกตัว เพราะเป็นการ์ดเชิญส่วนตัว — ถ้าอยากให้ค้นเจอใน Google ลบไฟล์นี้
- ถ้า production จริงๆ อยากให้โหลดเร็วกว่านี้ ควร build เป็น JS bundle ด้วย Vite/esbuild — ตอนนี้ใช้ Babel ใน browser ซึ่งโหลดช้ากว่า ~1-2 วินาที (แต่ใช้ได้)
- ภาษา: รองรับทั้งไทย/อังกฤษ/อาหรับ (Bismillah)
