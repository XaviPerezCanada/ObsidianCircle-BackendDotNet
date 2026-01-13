import { useEffect, useState } from 'react';
import { getWeather, type WeatherForecast } from './services/weatherService';
import './App.css';

function App() {
  
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);

  useEffect(() => {
    getWeather()
      .then(data => {
          // Si aquí intentas hacer data.push("texto"), TS te marcará ERROR.
          setForecast(data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="App">
      <h1>Clima (con TypeScript)</h1>
      <ul>
        {forecast.map((item, index) => (
          // ¡Aquí tienes autocompletado! Si escribes "item.", te saldrán las propiedades.
          <li key={index}>
            {item.date} - {item.temperatureC}°C ({item.summary})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;