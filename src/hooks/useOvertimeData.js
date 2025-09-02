import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEYS = {
  employees: 'overtime-employees',
  overtimeRecords: 'overtime-records',
  vacationRecords: 'vacation-records'
};

export const useOvertimeData = () => {
  const [employees, setEmployees] = useState([]);
  const [overtimeRecords, setOvertimeRecords] = useState([]);
  const [vacationRecords, setVacationRecords] = useState([]);

  useEffect(() => {
    const loadData = (key, defaultValue = []) => {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
      } catch (error) {
        console.error(`Failed to load ${key}:`, error);
        return defaultValue;
      }
    };

    setEmployees(loadData(STORAGE_KEYS.employees));
    setOvertimeRecords(loadData(STORAGE_KEYS.overtimeRecords));
    setVacationRecords(loadData(STORAGE_KEYS.vacationRecords));
  }, []);

  const saveToStorage = useCallback((key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  }, []);

  const addEmployee = useCallback((name) => {
    const newEmployee = {
      id: Date.now(),
      name: name.trim(),
      createdAt: new Date().toISOString()
    };
    const updated = [...employees, newEmployee];
    setEmployees(updated);
    saveToStorage(STORAGE_KEYS.employees, updated);
    return newEmployee;
  }, [employees, saveToStorage]);

  const updateEmployee = useCallback((id, name) => {
    const updated = employees.map(emp => 
      emp.id === id ? { ...emp, name: name.trim() } : emp
    );
    setEmployees(updated);
    saveToStorage(STORAGE_KEYS.employees, updated);
  }, [employees, saveToStorage]);

  const deleteEmployee = useCallback((id) => {
    const updated = employees.filter(emp => emp.id !== id);
    setEmployees(updated);
    saveToStorage(STORAGE_KEYS.employees, updated);
  }, [employees, saveToStorage]);

  // 일별 시간 업데이트
  const updateDailyTime = useCallback((type, employeeId, date, totalMinutes) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const recordData = {
      id: Date.now() + Math.random(),
      employeeId,
      employeeName: employee.name,
      date,
      totalMinutes,
      createdAt: new Date().toISOString()
    };
    
    if (type === 'overtime') {
      setOvertimeRecords(prevRecords => {
        const updated = [...prevRecords, recordData];
        saveToStorage(STORAGE_KEYS.overtimeRecords, updated);
        return updated;
      });
    } else {
      setVacationRecords(prevRecords => {
        const updated = [...prevRecords, recordData];
        saveToStorage(STORAGE_KEYS.vacationRecords, updated);
        return updated;
      });
    }
  }, [employees, saveToStorage]);

  // 일별 데이터 조회
  const getDailyData = useCallback((employeeId, date, type = 'overtime') => {
    const records = type === 'overtime' ? overtimeRecords : vacationRecords;
    const dayRecords = records
      .filter(record => record.employeeId === employeeId && record.date === date)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return dayRecords[0]?.totalMinutes || 0;
  }, [overtimeRecords, vacationRecords]);

  // 월별 통계 계산
  const getMonthlyStats = useCallback((employeeId, selectedMonth) => {
    const [year, month] = selectedMonth.split('-');
    
    const filterByMonth = (records) => records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() == year && 
             (recordDate.getMonth() + 1).toString().padStart(2, '0') == month;
    });

    const monthlyOvertime = filterByMonth(overtimeRecords);
    const monthlyVacation = filterByMonth(vacationRecords);
    
    const employeeOvertime = monthlyOvertime.filter(record => record.employeeId === employeeId);
    const employeeVacation = monthlyVacation.filter(record => record.employeeId === employeeId);

    // 최신 기록만 계산 (같은 날짜의 여러 기록 중 최신 것)
    const calculateLatestTotals = (records) => {
      const latestRecords = new Map();
      
      records.forEach(record => {
        const key = `${record.employeeId}-${record.date}`;
        const existing = latestRecords.get(key);
        
        if (!existing || new Date(record.createdAt) > new Date(existing.createdAt)) {
          latestRecords.set(key, record);
        }
      });
      
      return Array.from(latestRecords.values()).reduce((sum, record) => sum + record.totalMinutes, 0);
    };

    const totalOvertimeMinutes = calculateLatestTotals(employeeOvertime);
    const totalVacationMinutes = calculateLatestTotals(employeeVacation);
    
    return {
      totalOvertime: totalOvertimeMinutes,
      totalVacation: totalVacationMinutes,
      remaining: totalOvertimeMinutes - totalVacationMinutes
    };
  }, [overtimeRecords, vacationRecords]);

  return {
    employees,
    overtimeRecords,
    vacationRecords,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updateDailyTime,
    getDailyData,
    getMonthlyStats
  };
};
