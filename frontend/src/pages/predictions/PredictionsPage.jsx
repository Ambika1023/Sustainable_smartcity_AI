import { useState, useEffect } from 'react'
import {
  TrendingUp, Cpu, Play, CheckCircle2, AlertCircle, Info,
  Calendar, Layers, Activity, HelpCircle
} from 'lucide-react'
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import DashboardLayout from '../../layouts/DashboardLayout'
import { predictionService } from '../../services/predictionService'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import LoadingSkeleton from '../../components/ui/LoadingSkeleton'

const PREDICTION_TABS = [
  { id: 'water_demand', label: 'Water Demand', unit: 'Liters' },
  { id: 'electricity_consumption', label: 'Electricity Consumption', unit: 'kWh' },
  { id: 'waste_generation', label: 'Waste Generation', unit: 'kg' },
  { id: 'complaint_volume', label: 'Complaint Volume', unit: 'Complaints' },
  { id: 'sustainability_performance', label: 'Sustainability Performance', unit: 'Index' },
]

export default function PredictionsPage() {
  const { user, hasAnyRole } = useAuth()
  const [activeTab, setActiveTab] = useState('water_demand')
  const [daysAhead, setDaysAhead] = useState(30)
  const [predictionData, setPredictionData] = useState(null)
  const [modelStatuses, setModelStatuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [training, setTraining] = useState(false)
  const [trainMessage, setTrainMessage] = useState('')

  const canTrain = hasAnyRole(['SUPER_ADMIN', 'DATA_ANALYST'])

  const loadData = async () => {
    setLoading(true)
    try {
      const [predRes, statusesRes] = await Promise.all([
        predictionService.getPredictions(activeTab, { days_ahead: daysAhead }),
        predictionService.getAllModelStatuses().catch(() => []),
      ])
      setPredictionData(predRes)
      setModelStatuses(statusesRes || [])
    } catch (err) {
      console.error('Failed to load predictions', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [activeTab, daysAhead])

  const handleTrainModel = async () => {
    setTraining(true)
    setTrainMessage('')
    try {
      const res = await predictionService.trainModel(activeTab)
      if (res.status === 'TRAINED') {
        setTrainMessage(`Model successfully trained on ${res.samples_used} samples. MAE: ${res.metrics?.mae?.toFixed(2)}, R²: ${res.metrics?.r2?.toFixed(3)}`)
      } else {
        setTrainMessage(res.message || 'Model training completed.')
      }
      loadData()
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to train machine learning model')
    } finally {
      setTraining(false)
    }
  }

  const currentStatus = modelStatuses.find(m => m.prediction_type === activeTab) || {}
  const isTrained = currentStatus.is_trained || predictionData?.status === 'OK'

  // Combine historical and predicted for chart
  const chartData = []
  if (predictionData) {
    if (predictionData.historical) {
      predictionData.historical.forEach((h) => {
        chartData.push({
          date: h.date,
          actual: h.value,
        })
      })
    }
    if (predictionData.predictions) {
      predictionData.predictions.forEach((p) => {
        chartData.push({
          date: p.date,
          predicted: p.predicted_value,
        })
      })
    }
  }

  const currentTabObj = PREDICTION_TABS.find(t => t.id === activeTab)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">City Performance Predictions</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Machine learning forecasting using Scikit-learn Random Forest Regressors trained on municipal telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canTrain && (
              <Button
                variant="primary"
                icon={Play}
                loading={training}
                onClick={handleTrainModel}
              >
                Train Model ({currentTabObj?.label})
              </Button>
            )}
          </div>
        </div>

        {/* Prediction Category Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-gray-200 pb-2">
          {PREDICTION_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setTrainMessage(''); }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <TrendingUp size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Train Notification Message */}
        {trainMessage && (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <span>{trainMessage}</span>
          </div>
        )}

        {/* Model State Banner */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${isTrained ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                <Cpu size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-sm">
                    {currentTabObj?.label} Forecasting Engine
                  </h3>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    isTrained ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isTrained ? 'Model Trained & Active' : 'Model Not Trained'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Algorithm: Scikit-learn RandomForestRegressor (n_estimators=100, features=[day_of_week, month, day_of_month, week_of_year])
                </p>
              </div>
            </div>

            {/* Forecast horizon selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium">Forecast Horizon:</span>
              <select
                value={daysAhead}
                onChange={(e) => setDaysAhead(Number(e.target.value))}
                className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy-500 font-medium"
              >
                <option value={7}>7 Days Ahead</option>
                <option value={14}>14 Days Ahead</option>
                <option value={30}>30 Days Ahead</option>
                <option value={60}>60 Days Ahead</option>
                <option value={90}>90 Days Ahead</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Forecasting Section */}
        {loading ? (
          <LoadingSkeleton variant="card" />
        ) : !isTrained ? (
          <div className="bg-white rounded-xl border border-amber-200 p-8 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Model Not Trained</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              No trained weights file exists for <strong>{currentTabObj?.label}</strong>. To generate accurate predictions based on your city's actual environmental records, click the train button below.
            </p>
            {canTrain ? (
              <Button
                variant="primary"
                icon={Play}
                loading={training}
                onClick={handleTrainModel}
              >
                Train {currentTabObj?.label} Model
              </Button>
            ) : (
              <p className="text-xs text-gray-400">Only Super Admins and Data Analysts can trigger model training.</p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Historical Records vs. Predicted Trajectory
                </h3>
                <p className="text-xs text-gray-500">
                  Solid blue curve indicates observed telemetry. Dashed amber line represents ML forecasting for next {daysAhead} days.
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v, name) => [Number(v).toLocaleString() + ' ' + (currentTabObj?.unit || ''), name === 'actual' ? 'Observed Telemetry' : 'Predicted Value']} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Historical Actual"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="ML Predicted"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#f59e0b' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

