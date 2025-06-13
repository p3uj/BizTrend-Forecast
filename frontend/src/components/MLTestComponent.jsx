import React, { useState } from 'react';
import simplePredictionService from '../services/simplePredictionService';

const MLTestComponent = () => {
  const [status, setStatus] = useState('');
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setStatus('Testing connection...');
    const result = await simplePredictionService.testConnection();
    
    if (result.success) {
      setStatus('✅ Connection successful! Server is running.');
      console.log('Connection test result:', result.data);
    } else {
      setStatus(`❌ Connection failed: ${result.error}`);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setStatus(selectedFile ? `File selected: ${selectedFile.name}` : '');
  };

  const uploadDataset = async () => {
    if (!file) {
      setStatus('❌ Please select a file first');
      return;
    }

    setLoading(true);
    setStatus('📤 Uploading dataset...');
    
    const result = await simplePredictionService.uploadDataset(file);
    
    if (result.success) {
      setUploadResult(result.data);
      setStatus('✅ Dataset uploaded successfully!');
      console.log('Upload result:', result.data);
    } else {
      setStatus(`❌ Upload failed: ${result.error}`);
      console.error('Upload error:', result.error);
    }
    
    setLoading(false);
  };

  const makePrediction = async () => {
    if (!uploadResult) {
      setStatus('❌ Please upload a dataset first');
      return;
    }

    setLoading(true);
    setStatus('🤖 Generating ML predictions...');
    
    const result = await simplePredictionService.makePrediction(uploadResult.dataset.id);
    
    if (result.success) {
      const transformedData = simplePredictionService.transformPredictionData(result.data.predictions);
      setPredictions({
        raw: result.data,
        transformed: transformedData
      });
      setStatus('✅ Predictions generated successfully!');
      console.log('Prediction result:', result.data);
      console.log('Transformed data:', transformedData);
    } else {
      setStatus(`❌ Prediction failed: ${result.error}`);
      console.error('Prediction error:', result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🧪 ML Integration Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Step 1: Test Connection</h3>
        <button onClick={testConnection} style={{ padding: '10px 20px', marginRight: '10px' }}>
          Test API Connection
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Step 2: Upload Dataset</h3>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange}
          style={{ marginBottom: '10px', display: 'block' }}
        />
        <button 
          onClick={uploadDataset} 
          disabled={!file || loading}
          style={{ padding: '10px 20px', marginRight: '10px' }}
        >
          {loading ? 'Uploading...' : 'Upload Dataset'}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Step 3: Generate Predictions</h3>
        <button 
          onClick={makePrediction} 
          disabled={!uploadResult || loading}
          style={{ padding: '10px 20px' }}
        >
          {loading ? 'Generating...' : 'Make Predictions'}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Status</h3>
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f5f5f5', 
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          {status || 'Ready to test...'}
        </div>
      </div>

      {uploadResult && (
        <div style={{ marginBottom: '20px' }}>
          <h3>📊 Dataset Info</h3>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#e8f5e8', 
            border: '1px solid #4caf50',
            borderRadius: '4px'
          }}>
            <p><strong>Filename:</strong> {uploadResult.dataset.filename}</p>
            <p><strong>Rows:</strong> {uploadResult.dataset.total_rows}</p>
            <p><strong>Sectors:</strong> {uploadResult.dataset.total_sectors}</p>
            <p><strong>Year Range:</strong> {uploadResult.dataset.year_min} - {uploadResult.dataset.year_max}</p>
          </div>
        </div>
      )}

      {predictions && (
        <div style={{ marginBottom: '20px' }}>
          <h3>🔮 ML Predictions</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <h4>📈 Model Performance</h4>
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#e3f2fd', 
              border: '1px solid #2196f3',
              borderRadius: '4px'
            }}>
              <p><strong>RMSE:</strong> {predictions.raw.model_performance.avg_rmse.toFixed(2)}</p>
              <p><strong>MAE:</strong> {predictions.raw.model_performance.avg_mae.toFixed(2)}</p>
              <p><strong>R²:</strong> {predictions.raw.model_performance.avg_r2.toFixed(3)}</p>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h4>🚀 Top Growth Predictions</h4>
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#fff3e0', 
              border: '1px solid #ff9800',
              borderRadius: '4px'
            }}>
              {predictions.transformed.growth.slice(0, 3).map((item, index) => (
                <p key={index}>
                  <strong>{item.rank}.</strong> {item.industrySector}: {item.predictedGrowth}% ({item.year})
                </p>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h4>💰 Top Revenue Predictions</h4>
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#f3e5f5', 
              border: '1px solid #9c27b0',
              borderRadius: '4px'
            }}>
              {predictions.transformed.revenue.slice(0, 3).map((item, index) => (
                <p key={index}>
                  <strong>{item.rank}.</strong> {item.industrySector}: ₱{item.predictedRevenue.toLocaleString()}M ({item.year})
                </p>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h4>🎯 Least Crowded Markets</h4>
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#e8f5e8', 
              border: '1px solid #4caf50',
              borderRadius: '4px'
            }}>
              {predictions.transformed.leastCrowded.slice(0, 3).map((item, index) => (
                <p key={index}>
                  <strong>{item.rank}.</strong> {item.industrySector}: {item.predictedNumBusinesses.toLocaleString()} businesses ({item.year})
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLTestComponent;
