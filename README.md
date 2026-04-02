# 💊 MediSync

**MediSync** is a modern, fully responsive React application designed to manage, track, and monitor personal medication inventory. Built with care to ensure critical medicines never run out, it features smart stock alerts, automated order calculations, and an intuitive dashboard interface.

---

## ✨ Key Features

* 📦 **Comprehensive Inventory Dashboard:** View all medications at a glance, including dosages, consumption rates, and real-time stock levels.
* ⚠️ **Smart Stock Alerts:** Automatically flags medicines that are running low and highlights estimated depletion dates.
* 🧠 **Order Suggestions:** Automatically calculates exactly how many strips/packs need to be ordered to cover the remaining days of the current month.
* 🛒 **Restock Hub:** A dedicated interface to log new purchases. Simply input the number of strips bought, and MediSync automatically calculates the units and updates the main inventory.
* 📱 **Hybrid Mobile Responsiveness:** Uses optimized Data Tables for desktop users and transforms into a sleek, easy-to-read Card layout for mobile screens. Modern off-canvas sliding drawer for navigation.
* 🔍 **Search & Filter:** Instantly find specific medications by name or toggle the "Low Stock Only" filter for quick triage.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React.js
* **State Management:** Redux Toolkit (`react-redux`, `@reduxjs/toolkit`)
* **Routing:** React Router v6 (`react-router-dom`)
* **Styling:** Tailwind CSS (Modern utility-first CSS)
* **Icons:** Lucide React (`lucide-react`)
* **Date Manipulation:** date-fns (`date-fns`)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and npm (or yarn) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/medisync.git](https://github.com/your-username/medisync.git)
   cd medisync