# SlideUnlocker - Remove PowerPoint Write Protection

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

<p align="center">
  <strong>🔓 Instantly remove write-protection from PowerPoint (.pptx) files - 100% free, 100% private, runs entirely in your browser.</strong>
</p>

---

## ✨ Features

- **Zero-Upload Guarantee** - Your files never leave your device. All processing happens locally in your browser.
- **Instant Processing** - Removes protection in less than 1 second on average.
- **No Sign-Up Required** - Use it immediately without creating an account.
- **Free Forever** - No hidden fees, no premium tiers.
- **Modern Dark Theme** - Beautiful, responsive dark UI with jewel-tone accents.
- **Privacy First** - Client-side processing means your documents stay on your machine.

---

## 📖 How It Works (A to Z)

### Step 1: Upload Your File
Drag and drop your protected `.pptx` file onto the upload area, or click to browse and select the file from your device.

### Step 2: Automatic Detection
The tool automatically validates your file:
- Confirms it's a valid `.pptx` (PowerPoint 2007+) file
- Checks for write-protection ("Password to Modify")

### Step 3: Remove Protection
Click the **"Unlock Presentation"** button. The tool:
1. Reads the PowerPoint file using JavaScript
2. Locates the `presentation.xml` file inside the archive
3. Removes the `<p:modifyVerifier>` tag that enforces write-protection
4. Repackages the modified file as a new `.pptx`

### Step 4: Download
Save the unlocked file directly to your device. The original file remains untouched.

---

## ⚠️ Limitations

- **Only removes "Password to Modify" restrictions** - Files protected with an actual Open Password (encryption) cannot be unlocked this way.
- **Only supports .pptx format** - Older `.ppt` files are not supported. Please re-save as `.pptx` in PowerPoint first.
- **Does not recover forgotten passwords** - This tool only removes protection that you already know the password for.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/slideunlocker.git
   cd slideunlocker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The production build will be created in the `build` folder, ready for deployment to any static hosting service.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Tailwind CSS | Styling |
| JSZip | PPTX file handling |
| FileSaver.js | File downloads |
| Lucide React | Icons |

---

## 📁 Project Structure

```
slideunlocker/
├── public/
│   ├── index.html        # Main HTML template
│   ├── favicon.ico       # Website icon
│   └── logo*.png         # React app logos
├── src/
│   ├── App.js            # Main application component
│   ├── index.js          # React entry point
│   └── index.css         # Global styles & Tailwind
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
├── package.json          # Dependencies & scripts
└── README.md            # This file
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [JSZip](https://stuk.github.io/jszip/) - For making client-side PPTX manipulation possible
- [Lucide](https://lucide.dev/) - For beautiful open-source icons
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework

---

## 🔗 Live Demo

> **⚠️ Update this URL after hosting:**
> Live website: `[YOUR_DOMAIN_HERE]`

---

<p align="center">
  Made with ❤️ for a more open web
</p>
