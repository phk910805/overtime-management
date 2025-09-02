import React, { useState, useMemo } from 'react';
import { timeUtils } from '../utils/timeUtils';

const Dashboard = ({ employees, selectedMonth, updateDailyTime, getDailyData, getMonthlyStats }) => {
  const [showTimeInputPopup, setShowTimeInputPopup] = useState(false);
  const [currentTimeInput, setCurrentTimeInput] = useState({
    employeeId: null,
    day: null,
    value: 0,
    type: 'overtime'
  });

  const daysInMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    return new Date(year, month, 0).getDate();
  }, [selectedMonth]);

  const daysArray = useMemo(() => 
    Array.from({ length: daysInMonth }, (_, i) => i + 1), 
    [daysInMonth]
  );

  const handleTimeInputClick = (employeeId, day, currentValue, type = 'overtime') => {
    setCurrentTimeInput({ employeeId, day, value: currentValue, type });
    setShowTimeInputPopup(true);
  };

  const handleTimeInputSave = (newValue) => {
    const [year, month] = selectedMonth.split('-');
    const date = `${year}-${month}-${currentTimeInput.day.toString().padStart(2, '0')}`;
    updateDailyTime(currentTimeInput.type, currentTimeInput.employeeId, date, newValue);
    setShowTimeInputPopup(false);
  };

  const TimeDisplay = ({ value, onClick, type = "overtime" }) => {
    const colorClass = type === "overtime" ? "text-blue-600" : "text-green-600";
    const prefix = type === "overtime" ? "+" : "-";
    
    return (
      <div
        className="w-16 h-8 rounded text-xs flex items-center justify-center cursor-pointer hover:bg-gray-100"
        onClick={onClick}
      >
        <span className={value === 0 ? "text-gray-400" : colorClass}>
          {value === 0 ? "00:00" : `${prefix}${timeUtils.formatTime(value)}`}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {selectedMonth} 월별 현황
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="h-12">
                <th className="sticky left-0 z-20 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  이름
                </th>
                <th className="sticky left-[120px] z-20 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  초과시간
                </th>
                <th className="sticky left-[200px] z-20 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  사용시간
                </th>
                <th className="sticky left-[280px] z-20 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r-2 border-gray-300">
                  잔여시간
                </th>
                <th className="sticky left-[360px] z-20 bg-gray-50 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-16">
                  구분
                </th>
                {daysArray.map((day) => {
                  const date = new Date(selectedMonth.split('-')[0], selectedMonth.split('-')[1] - 1, day);
                  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
                  const textColor = date.getDay() === 0 || date.getDay() === 6 ? 'text-red-600' : 'text-gray-500';
                  
                  return (
                    <th key={day} className={`px-2 py-3 text-center text-xs font-medium ${textColor} uppercase tracking-wider w-16 bg-gray-50 border-l border-gray-200`}>
                      {day.toString().padStart(2, '0')}({dayOfWeek})
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => {
                const stats = getMonthlyStats(employee.id);
                
                return (
                  <tr key={employee.id}>
                    <td className="sticky left-0 z-10 px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200 bg-white">
                      {employee.name}
                    </td>
                    <td className="sticky left-[120px] z-10 px-4 py-4 whitespace-nowrap text-sm text-blue-600 border-r border-gray-200 bg-white">
                      +{timeUtils.formatTime(stats.totalOvertime)}
                    </td>
                    <td className="sticky left-[200px] z-10 px-4 py-4 whitespace-nowrap text-sm text-green-600 border-r border-gray-200 bg-white">
                      -{timeUtils.formatTime(stats.totalVacation)}
                    </td>
                    <td className={`sticky left-[280px] z-10 px-4 py-4 whitespace-nowrap text-sm border-r-2 border-gray-300 bg-white ${
                      stats.remaining >= 0 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {stats.remaining >= 0 ? '+' : '-'}{timeUtils.formatTime(Math.abs(stats.remaining))}
                      {stats.remaining < 0 && '(초과)'}
                    </td>
                    <td className="sticky left-[360px] z-10 px-2 py-2 text-center text-xs border-r border-gray-200 relative h-20 bg-white">
                      <div className="absolute left-0 right-0 top-1/2 border-t border-gray-300 transform -translate-y-px"></div>
                      <div className="flex flex-col h-full">
                        <div className="h-10 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">초과</span>
                        </div>
                        <div className="h-10 flex items-center justify-center">
                          <span className="text-green-600 font-medium">사용</span>
                        </div>
                      </div>
                    </td>
                    {daysArray.map((day) => {
                      const [year, month] = selectedMonth.split('-');
                      const date = `${year}-${month}-${day.toString().padStart(2, '0')}`;
                      const dailyMinutes = getDailyData(employee.id, date, 'overtime');
                      const vacationMinutes = getDailyData(employee.id, date, 'vacation');
                      
                      return (
                        <td key={day} className="px-2 py-2 text-center text-xs align-top border-l border-gray-200 relative bg-white">
                          <div className="absolute left-0 right-0 top-1/2 border-t border-gray-300 transform -translate-y-px"></div>
                          <div className="flex flex-col items-center justify-start h-full">
                            <div className="flex-1 flex items-center justify-center py-1">
                              <TimeDisplay 
                                value={dailyMinutes}
                                onClick={() => handleTimeInputClick(employee.id, day, dailyMinutes, 'overtime')}
                                type="overtime"
                              />
                            </div>
                            <div className="flex-1 flex items-center justify-center py-1">
                              <TimeDisplay 
                                value={vacationMinutes}
                                onClick={() => handleTimeInputClick(employee.id, day, vacationMinutes, 'vacation')}
                                type="vacation"
                              />
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 시간 입력 팝업 */}
      {showTimeInputPopup && (
        <TimeInputPopup
          show={showTimeInputPopup}
          value={currentTimeInput.value}
          onClose={() => setShowTimeInputPopup(false)}
          onSave={handleTimeInputSave}
          title={currentTimeInput.type === 'overtime' ? "초과근무 시간 입력" : "휴가사용 시간 입력"}
          type={currentTimeInput.type}
        />
      )}
    </div>
  );
};

// 시간 입력 팝업 컴포넌트
const TimeInputPopup = ({ show, value, onClose, onSave, title, type }) => {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');

  React.useEffect(() => {
    if (show) {
      const totalHours = Math.floor(value / 60);
      const totalMinutes = value % 60;
      
      setHours(totalHours > 0 ? totalHours.toString() : '');
      setMinutes(totalMinutes > 0 ? totalMinutes.toString() : '');
    }
  }, [show, value]);

  const handleSave = () => {
    const finalHours = parseInt(hours) || 0;
    const finalMinutes = parseInt(minutes) || 0;
    const totalMinutes = finalHours * 60 + finalMinutes;
    onSave(totalMinutes);
  };

  const handleDelete = () => {
    onSave(0);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">시간</label>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
                max="24"
              />
            </div>
            <div className="text-xl font-bold text-gray-400 mt-6">:</div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">분</label>
              <input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
                max="59"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
          >
            삭제
          </button>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
