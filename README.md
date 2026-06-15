# 📄 PDF Merger

A clean, modern web app to merge multiple PDF files into one — right in your browser. No sign-up, no file storage, 100% private.

![PDF Merger](https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-8b5cf6?style=flat-square)
![Made with](https://img.shields.io/badge/Made%20with-pdf--lib-ec4899?style=flat-square)

---

## ✨ Features

- 📂 **Drag & drop** or click to upload PDF files
- 🔢 **Reorder files** by dragging them up and down
- 📑 **Select specific pages** per file (e.g. `1,3` or `1-5` or `2 to 4`)
- 🏷️ **Custom output filename** — name your merged PDF anything
- 📏 **File size display** — see KB/MB for each file
- ⚠️ **50MB limit validation** — warns you before merging
- 🗑️ **Clear all** — reset everything in one click
- ⚡ **Fast** — merges instantly on the server and auto-downloads
- 🔒 **Private** — no files are stored on the server

---

## 🚀 Live Demo

> 🔗 [Click here to try it live](#) ← *(add your Render link here)*

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | HTML, CSS, Vanilla JS |
| Backend | Node.js, Express |
| PDF Engine | [pdf-lib](https://pdf-lib.js.org/) |
| File Uploads | Multer |

---

## 📦 Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/Chitranii/PDF-Merger.git
cd PDF-Merger

# 2. Install dependencies
npm install

# 3. Start the server
npm start

# 4. Open in browser
http://localhost:3000
```

---

## 📁 Project Structure

```
PDF-Merger/
├── public/
│   └── index.html        # Frontend UI
├── index.js              # Node.js PDF merger class
├── PDFMergerBase.js      # Base merger logic (pdf-lib)
├── parsePagesString.js   # Page range parser
├── server.js             # Express server
└── package.json
```

---

## 🎯 How to Use

1. **Upload** — drag & drop or click to select 2+ PDF files
2. **Arrange** — drag files to set the merge order
3. **Pages** *(optional)* — enter page ranges like `1-3` or `1,5,7`
4. **Name** *(optional)* — set a custom output filename
5. **Merge** — click the button and your file downloads instantly

---

## 📄 License

MIT © [Chitranii](https://github.com/Chitranii)
