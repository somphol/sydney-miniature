import { createRoot } from 'react-dom/client'
import App from './App'
import './style.css'
import { t } from './i18n'

document.title = t.title
document.documentElement.lang = 'en'

createRoot(document.getElementById('root')!).render(<App />)
