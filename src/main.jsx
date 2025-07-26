import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

import "./app.css"
import { SearchContextProvider } from './context/SearchContext.jsx'




ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   <SearchContextProvider><App /></SearchContextProvider>
  </React.StrictMode>
)

document.body.style.fontFamily = "'Inter', sans-serif"