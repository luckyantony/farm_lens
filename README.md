# 🌿 FarmLens: AI-Powered Crop Health Advisor

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Gemini 3 Pro](https://img.shields.io/badge/AI-Gemini%203%20Pro-4285F4)
![Status](https://img.shields.io/badge/Status-Prototype-success)

> **Featured in Google DeepMind's Vibe Code Hackathon (Dec 2025) — Top-50 Contender!**

**FarmLens** is a sustainable plant health diagnostic app built with Google's **Gemini 3 Pro**. Snap a photo of your crop, add voice notes, and get instant, eco-friendly insights on diseases, remedies, prevention, and yield forecasts—all powered by native multimodal AI. No external APIs, just pure Gemini magic for privacy-safe analysis.

From Kenyan maize fields to global gardens, FarmLens tackles **$220–300B in annual crop losses** (FAO 2025), empowering 579 million smallholder farmers (85% under 2 ha) with SDG 2-aligned tools.

---

## 🚀 Demo

**[Try the Live Prototype on Google AI Studio](https://aistudiocdn.com/...)**  
*(Public, interactive — upload a leaf pic now!)*

---

## 📸 Screenshots

| Landing Page | Diagnosis (Whitefly) | Swahili Support |
|:---:|:---:|:---:|
| <img src="docs/landing.png" width="240" alt="Landing Page" /> | <img src="docs/whitefly_result.png" width="240" alt="Whitefly Diagnosis" /> | <img src="docs/swahili_rust.png" width="240" alt="Swahili Interface" /> |

---

## 🌍 Why FarmLens?

*   **Global Impact**: Addresses yield gaps up to 70% in sub-Saharan Africa (33M smallholders produce 80% of food) and beyond. In Kenya, it aids in combating fall armyworm's 58% maize devastation.
*   **African Roots**: Built by a Kenyan developer with **Swahili support** for local shambas, scaling to worldwide resilience.
*   **Gemini-Powered**: Leverages vision analysis, audio fusion, and long-context reasoning for accurate, offline-feel diagnostics.
*   **Eco-First**: Prioritizes organic remedies (e.g., neem spray over chemicals) to promote sustainable agriculture.
*   **Privacy-Safe**: Stateless processing via Gemini API ensures user data isn't stored unnecessarily.

> **Disclaimer**: AI-generated insights are for informational purposes only. Not a substitute for professional agricultural advice. Consult local experts for field use.

---

## 🛠️ Features

### 1. Multimodal Input
*   **📸 Vision**: Upload photos via camera or file picker (JPG/PNG, <5MB).
*   **🎤 Voice**: Record up to 30s of context (symptoms, weather conditions) which Gemini fuses with visual data for better diagnosis.

### 2. Smart Analysis
*   **Disease Detection**: Identifies issues like Brown Rust, Whiteflies, Nutrient Deficiencies.
*   **Healthy Plant Logic**: If no disease is found, provides maintenance and care tips.
*   **Edge Case Handling**: Detects blurry images or non-plant objects and prompts the user to retry.

### 3. Actionable Insights
*   **Remedies**: 3-step eco-friendly solutions.
*   **Prevention**: Crop rotation, spacing, and soil health tips.
*   **Forecast**: Yield recovery predictions (e.g., "20% boost in 4 weeks").

### 4. Accessibility
*   **🗣️ Audio Narration**: Text-to-Speech button for low-literacy accessibility.
*   **🌐 Language Toggle**: Instant switching between **English** and **Swahili**.
*   **📄 Export**: Download reports as text files for offline reference.

---

## 📋 Tech Stack

*   **Core AI**: Google Gemini 3 Pro (Vision, Reasoning) & Gemini 2.5 Flash (TTS).
*   **Frontend**: React 19, TypeScript, Tailwind CSS.
*   **Integration**: Google GenAI SDK for JavaScript.
*   **Build Tool**: Vite.

---

## 🏗️ Installation & Setup

This is a client-side application. You can run it locally with Node.js.

### 1. Clone the Repo
```bash
git clone https://github.com/luckyantony/farm_lens.git
cd farm_lens
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your Google Gemini API key:
```env
API_KEY=your_actual_api_key_here
```

### 4. Run Locally
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📖 Usage Example

1.  **Upload**: Tap the **Camera** or **Upload** icon to select a plant photo.
2.  **Add Context**: (Optional) Tap the **Mic** icon to say *"Dry soil, yellow spots appearing on lower leaves."*
3.  **Analyze**: Click "Analyze Plant Health". Gemini fuses the image and your notes.
4.  **View Results**:
    *   **Issue**: Brown Rust (Leaf Rust)
    *   **Remedies**: Neem oil spray, remove infected leaves.
    *   **Impact**: "Potential 20-40% yield recovery."

---

## 🔧 Development & Contributing

*   **Prompts**: See `services/gemini.ts` for the system instructions and JSON schema used for analysis.
*   **Localization**: Languages are managed in `components/ResultsDisplay.tsx` and `types.ts`.
*   **Roadmap**: Mobile PWA support, Weather API integration, Community Forum.

**Contribute**: Fork → PR. We welcome contributions for more regional languages!

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

*   **Google DeepMind & Kaggle** for the Vibe Code Hackathon.
*   **FAO** for 2025 State of Food and Agriculture (SOFA) data.
*   Built with ❤️ from **Nairobi, Kenya**.

---

<div align="center">
  <p>🌱 <strong>Star this repo if it helps your farm!</strong> 🌱</p>
  <p>Questions? <a href="https://github.com/luckyantony/farm_lens/issues">Open an issue</a>.</p>
</div>