const { PDFDocument } = PDFLib

const fileInput = document.getElementById('file-input')
const fileList = document.getElementById('file-list')
const mergeBtn = document.getElementById('merge-btn')
const status = document.getElementById('status')
const dropZone = document.getElementById('drop-zone')
const clearBtn = document.getElementById('clear-btn')
const listHeader = document.getElementById('list-header')
const fileBadge = document.getElementById('file-badge')
const outputName = document.getElementById('output-name')
const bottomSection = document.getElementById('bottom-section')
const divider = document.getElementById('divider')

const MAX_SIZE = 50 * 1024 * 1024
let files = []
let dragSrcIndex = null

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function parsePagesString(pages) {
  const isRange = s => s.includes('-') || s.toLowerCase().includes('to')
  const parseRange = s => {
    const [start, end] = s.split(/-|to/i).map(x => parseInt(x.trim()))
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }
  pages = pages.trim()
  if (!pages || pages === 'all') return null
  if (pages.match(/^\d+$/)) return [parseInt(pages)]
  if (pages.includes(',')) return pages.split(',').flatMap(s => isRange(s) ? parseRange(s) : [parseInt(s.trim())])
  if (isRange(pages)) return parseRange(pages)
  return null
}

function renderFiles() {
  fileList.innerHTML = ''
  files.forEach(({ file, pages }, i) => {
    const oversized = file.size > MAX_SIZE
    const li = document.createElement('li')
    li.draggable = true
    li.dataset.index = i
    li.innerHTML = `
      <div class="file-row">
        <div class="file-num">${i + 1}</div>
        <span class="drag-handle">⠿</span>
        <div class="file-icon">📄</div>
        <div class="file-details">
          <div class="file-name">${file.name}</div>
          <div class="${oversized ? 'file-warning' : 'file-meta'}">
            ${oversized ? '⚠️ Exceeds 50MB limit' : formatSize(file.size)}
          </div>
        </div>
        <button class="btn-remove" onclick="removeFile(${i})">✕</button>
      </div>
      <div class="page-range">
        <label>Pages:</label>
        <input type="text" placeholder="all pages  ·  or e.g. 1,3  /  1-5  /  2 to 4" value="${pages}" data-index="${i}" />
      </div>
    `

    li.addEventListener('dragstart', () => { dragSrcIndex = i; li.classList.add('dragging') })
    li.addEventListener('dragend', () => li.classList.remove('dragging'))
    li.addEventListener('dragover', e => { e.preventDefault(); li.classList.add('drag-over') })
    li.addEventListener('dragleave', () => li.classList.remove('drag-over'))
    li.addEventListener('drop', e => {
      e.preventDefault()
      li.classList.remove('drag-over')
      if (dragSrcIndex !== null && dragSrcIndex !== i) {
        const moved = files.splice(dragSrcIndex, 1)[0]
        files.splice(i, 0, moved)
        renderFiles()
      }
    })

    li.querySelector('input[data-index]').addEventListener('input', e => {
      files[i].pages = e.target.value.trim()
    })

    fileList.appendChild(li)
  })

  const hasOversized = files.some(f => f.file.size > MAX_SIZE)
  const show = files.length > 0
  listHeader.className = show ? 'list-header visible' : 'list-header'
  divider.classList.toggle('hidden', !show)
  bottomSection.classList.toggle('hidden', !show)
  mergeBtn.disabled = files.length < 2 || hasOversized
  fileBadge.textContent = files.length
}

function removeFile(index) {
  files.splice(index, 1)
  renderFiles()
}

clearBtn.addEventListener('click', () => {
  files = []
  status.className = ''
  status.textContent = ''
  renderFiles()
})

fileInput.addEventListener('change', () => {
  files = [...files, ...Array.from(fileInput.files).map(f => ({ file: f, pages: '' }))]
  fileInput.value = ''
  renderFiles()
})

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover') })
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'))
dropZone.addEventListener('drop', e => {
  e.preventDefault()
  dropZone.classList.remove('dragover')
  const dropped = Array.from(e.dataTransfer.files)
    .filter(f => f.type === 'application/pdf')
    .map(f => ({ file: f, pages: '' }))
  files = [...files, ...dropped]
  renderFiles()
})

mergeBtn.addEventListener('click', async () => {
  if (files.length < 2) return

  status.className = ''
  status.innerHTML = '<div class="loader"></div> Merging your files...'
  mergeBtn.disabled = true

  try {
    const mergedDoc = await PDFDocument.create()

    for (const { file, pages } of files) {
      const arrayBuffer = await file.arrayBuffer()
      const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
      const pageNums = parsePagesString(pages)
      const indices = pageNums ? pageNums.map(p => p - 1) : srcDoc.getPageIndices()
      const copied = await mergedDoc.copyPages(srcDoc, indices)
      copied.forEach(p => mergedDoc.addPage(p))
    }

    const pdfBytes = await mergedDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = (outputName.value.trim() || 'merged') + '.pdf'
    a.click()
    URL.revokeObjectURL(url)

    status.className = 'success'
    status.innerHTML = '✦ Merged successfully! Your download has started.'
  } catch (err) {
    status.className = 'error'
    status.innerHTML = '✕ ' + err.message
  } finally {
    mergeBtn.disabled = files.length < 2
  }
})
