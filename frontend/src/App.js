
// App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FormPage from './components/FormPage';
import Portfolio from './components/PortfolioPage';
import NotFound from './components/NotFound';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FormPage />} />
        <Route path="/portfolio/:id" element={<Portfolio />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
