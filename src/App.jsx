import React, { useState } from 'react';
import { Clock, Calendar, Users, BarChart3, Settings } from 'lucide-react';
import EmployeeManagement from './components/EmployeeManagement';
import Dashboard from './components/Dashboard';
import { useOvertimeData } from './hooks/useOvertimeData';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  const { 
    employees, 
    overtimeRecords, 
    vacationRecords,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updateDailyTime,
    getDailyData,
    getMonthlyStats
  } = useOvertimeData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">초과 근무시간 관리</h1>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: '대시보드', icon: BarChart3 },
              { id: 'records', label: '히스토리', icon: Calendar },
              { id: 'employees', label: '직원 관리', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 inline-block mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            employees={employees}
            selectedMonth={selectedMonth}
            updateDailyTime={updateDailyTime}
            getDailyData={getDailyData}
            getMonthlyStats={(employeeId) => getMonthlyStats(employeeId, selectedMonth)}
          />
        )}

        {activeTab === 'records' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">기록 히스토리</h2>
            <div className="mt-8">
              <p className="text-sm text-gray-500">
                히스토리 기능이 곧 추가됩니다.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <EmployeeManagement
            employees={employees}
            addEmployee={addEmployee}
            updateEmployee={updateEmployee}
            deleteEmployee={deleteEmployee}
          />
        )}
      </main>
    </div>
  );
}

export default App;
