# The Syllabus v4.5  
A modern, AI‑powered daily reading generator built with Remix, TypeScript, and Google AI Studio.

Live Site: https://thesyllabusv4-5.vercel.app  
Repository: https://github.com/slimsheazy/thesyllabusv4.5

---

## 🏷️ Badges

![Vercel Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)
![Remix](https://img.shields.io/badge/Framework-Remix-blue?logo=remix)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)
![Google Gemini](https://img.shields.io/badge/AI-Gemini-4285F4?logo=google)

---

## 📌 Overview

**The Syllabus v4.5** is a lightweight, fast, and aesthetically clean web app that generates daily readings using the Gemini API.  
It blends minimal UI with dynamic Lenormand card imagery and smooth interactions.

This version focuses on:

- Cleaner structure  
- Faster load times  
- More reliable API calls  
- Better asset organization  
- Easier deployment to Vercel  

---

## 🚀 Features

- 🔮 **AI‑generated readings** powered by Google Gemini  
- 🃏 **Lenormand card visuals** (self‑hosted for reliability)  
- ⚡ **Vite + TypeScript** for fast local development  
- 🎨 **Custom styling** with lightweight CSS  
- 🌐 **Instant Vercel deployments**  
- 🔐 **Environment‑based API key handling**  

---

## 🛠️ Tech Stack

- **Remix (AI Studio template)**  
- **TypeScript**  
- **Vite**  
- **Node.js**  
- **Vercel**  
- **Google Gemini API**  

---

## 📂 Project Structure

thesyllabusv4.5/
├── public/
│   ├── images/
│   │   └── lenormand/      # Card images
│   └── screenshots/        # Optional demo images
├── src/
│   ├── routes/
│   ├── components/
│   └── styles/
├── .env.local
├── package.json
├── vite.config.ts
└── server.ts


---

## 🔮 How It Works

1. User loads the app  
2. A Lenormand card spread is selected  
3. The app sends a structured prompt to the **Gemini API**  
4. Gemini returns a reading based on the selected cards  
5. The UI displays the reading with card imagery and animations  

The reading logic is intentionally lightweight and fast, keeping the experience smooth.

---

## 🧪 Running Locally

### **Prerequisites**
- Node.js (LTS recommended)  
- A Google Gemini API key  

### **Setup**

```bash
npm install
