import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import PDFMerger from './index.js'

const app = express()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB per file
})
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(express.static(path.join(__dirname, 'public')))

app.post('/merge', upload.array('pdfs'), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'Please upload at least 2 PDF files.' })
    }

    const pagesPerFile = req.body.pages
      ? (Array.isArray(req.body.pages) ? req.body.pages : [req.body.pages])
      : req.files.map(() => 'all')

    const merger = new PDFMerger()

    for (let i = 0; i < req.files.length; i++) {
      const pages = pagesPerFile[i]
      const pageArg = (!pages || pages === 'all') ? null : pages
      await merger.add(req.files[i].buffer, pageArg)
    }

    await merger.setMetadata({ producer: 'pdf-merger-js', title: 'Merged PDF' })

    const mergedBuffer = await merger.saveAsBuffer()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf')
    res.send(mergedBuffer)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Failed to merge PDFs.' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
})
