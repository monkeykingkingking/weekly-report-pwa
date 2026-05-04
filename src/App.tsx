import { WeekView } from './components/WeekView'
import { InputPanel } from './components/InputPanel'
import { ExportButton } from './components/ExportButton'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ExportButton />
      <div className="pt-12">
        <WeekView />
      </div>
      <InputPanel />
    </div>
  )
}

export default App
