import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [formData, setFormData] = useState({
    pregnancies: 0, glucose: 120, bloodPressure: 70, skinThickness: 20,
    insulin: 80, bmi: 25, dpf: 0.5, age: 30
  });
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post('http://localhost:8000/predict', formData);
    setResult(response.data);
  };

  return (
    <div className="App">
      <h1>Diabetes Risk Checker</h1>
      <form onSubmit={handleSubmit}>
        {/* Map through inputs here */}
        <button type="submit">Analyze Risk</button>
      </form>

      {result && (
        <div className="report">
          <h2>Result: {result.prediction}</h2>
          <p>Risk Probability: {result.probability}</p>
          <p>{result.analysis}</p>
          <h3>Precautions:</h3>
          <ul>{result.precautions.map(p => <li key={p}>{p}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
export default App;
