import React, { useState } from 'react';

export default function PreviewPage() {
  const [isDark, setIsDark] = useState(false);
  const [isPersonal, setIsPersonal] = useState(false);

  const buildUrl = (role) => {
    let url = `/?role=${role}&debugTitle=${role}`;
    if (isDark) url += '&dark=1';
    if (isPersonal) url += '&personal=1';
    return url;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Xem nhanh giao diện chức danh (Launcher)</h1>

        <div className="bg-white p-6 rounded-xl border border-slate-200 mb-8 flex gap-8 justify-center shadow-sm">
          <label className="flex items-center gap-2 font-medium cursor-pointer">
            <input 
              type="checkbox" 
              className="w-5 h-5 cursor-pointer accent-teal-600"
              checked={isDark}
              onChange={e => setIsDark(e.target.checked)}
            />
            Bật Dark Mode
          </label>
          <label className="flex items-center gap-2 font-medium cursor-pointer">
            <input 
              type="checkbox" 
              className="w-5 h-5 cursor-pointer accent-teal-600"
              checked={isPersonal}
              onChange={e => setIsPersonal(e.target.checked)}
            />
            Mở sẵn "Có doanh số cá nhân" (SL/SM)
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Nhóm FC */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="text-lg font-semibold mb-4 pb-2 border-b-2 border-teal-600 text-teal-700">
              Nhóm Tư Vấn Viên (FC)
            </div>
            <div className="flex flex-col gap-2">
              <a href={buildUrl('FC')} className="block py-3 px-4 rounded-lg font-medium text-white bg-teal-600 hover:bg-teal-700 hover:opacity-90 transition-all text-center">FC (Financial Consultant)</a>
              <a href={buildUrl('StarFC')} className="block py-3 px-4 rounded-lg font-medium text-white bg-teal-600 hover:bg-teal-700 hover:opacity-90 transition-all text-center">Star FC</a>
            </div>
          </div>

          {/* Nhóm SL */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="text-lg font-semibold mb-4 pb-2 border-b-2 border-blue-700 text-blue-800">
              Quản Lý Cấp Trung (SL)
            </div>
            <div className="flex flex-col gap-2">
              <a href={buildUrl('GSL')} className="block py-3 px-4 rounded-lg font-medium text-white bg-blue-700 hover:bg-blue-800 hover:opacity-90 transition-all text-center">GSL (Group Sales Leader)</a>
              <a href={buildUrl('SSL')} className="block py-3 px-4 rounded-lg font-medium text-white bg-blue-700 hover:bg-blue-800 hover:opacity-90 transition-all text-center">SSL (Senior Sales Leader)</a>
              <a href={buildUrl('ESL')} className="block py-3 px-4 rounded-lg font-medium text-white bg-blue-700 hover:bg-blue-800 hover:opacity-90 transition-all text-center">ESL (Executive Sales Leader)</a>
            </div>
          </div>

          {/* Nhóm SM */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="text-lg font-semibold mb-4 pb-2 border-b-2 border-amber-700 text-amber-800">
              Quản Lý Cấp Cao (SM+)
            </div>
            <div className="flex flex-col gap-2">
              <a href={buildUrl('SM')} className="block py-3 px-4 rounded-lg font-medium text-white bg-amber-700 hover:bg-amber-800 hover:opacity-90 transition-all text-center">SM (Sales Manager)</a>
              <a href={buildUrl('EM')} className="block py-3 px-4 rounded-lg font-medium text-white bg-amber-700 hover:bg-amber-800 hover:opacity-90 transition-all text-center">EM (Executive Manager)</a>
              <a href={buildUrl('ERM')} className="block py-3 px-4 rounded-lg font-medium text-white bg-amber-700 hover:bg-amber-800 hover:opacity-90 transition-all text-center">ERM (Executive Regional Manager)</a>
              <a href={buildUrl('IRM')} className="block py-3 px-4 rounded-lg font-medium text-white bg-amber-700 hover:bg-amber-800 hover:opacity-90 transition-all text-center">IRM (Institutional Regional Manager)</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
