# Varys

Varys is a full-stack application. This README provides instructions for installation and running both backend and frontend components.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Python](https://www.python.org/) (if backend is Python-based)
- [pip](https://pip.pypa.io/) (if backend is Python-based)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Varys.git
cd Varys
```

### 2. Install Backend Dependencies

```bash
# For Python backend
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies

```bash
cd ../varys-frontend
npm install
```

## Running the Application

### 1. Start the Backend

```bash
# For Python backend
uvicorn api.app:app --reload
```

### 2. Start the Frontend

Open a new terminal window:

```bash
cd varys-frontend
npm run dev
```

The frontend will typically be available at `http://localhost:8000` and the backend at `http://localhost:5173` (or as configured).

## Deployment
The project is deployed at:
- Frontend - https://varysnp.netlify.app/
- Backend - https://varysbackend.onrender.com
- Database - https://supabase.com/dashboard/project/dtuhawvwbcfkyukqfrqw/editor/17269?schema=public
- PPT - https://docs.google.com/presentation/d/1u7upiGu_yqQ1V5U9jWyByqcvnISt-fMa1XaDN9a8KFs/edit?slide=id.p1#slide=id.p1 


## License

MIT
