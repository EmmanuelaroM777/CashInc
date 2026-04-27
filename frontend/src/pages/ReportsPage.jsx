import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import apiClient from '../api/client';
import Input from '../components/UI/Input';
import DownloadButton from '../components/UI/DownloadButton';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('comparison');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format) => {
    if (reportType === 'period' && (!startDate || !endDate)) {
      throw new Error('dates');
    }

    let url = `/reports/export/${format}?report_type=${reportType}`;
    if (reportType === 'period') {
      url += `&start_date=${new Date(startDate).toISOString()}&end_date=${new Date(endDate).toISOString()}`;
    }

    const response = await apiClient.get(url, { responseType: 'blob' });

    const blob = new Blob([response.data], { 
      type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';
    link.setAttribute('download', `infracontrol_reporte_${reportType}_${new Date().toISOString().split('T')[0]}.${extension}`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Reportes</h2>
          <p className="text-[var(--text-secondary)]">Genere y exporte reportes financieros</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <FileText className="mr-2 text-[var(--accent-primary)]" size={20} />
            Configuración del Reporte
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Tipo de Reporte</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${reportType === 'comparison' ? 'border-[var(--accent-primary)] bg-[rgba(59,130,246,0.1)] text-white' : 'border-[var(--border-light)] bg-[rgba(0,0,0,0.2)] text-[var(--text-secondary)] hover:border-[rgba(255,255,255,0.2)]'}`}
                  onClick={() => setReportType('comparison')}
                >
                  <span className="font-medium">Comparativa de Activos</span>
                </button>
                <button
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${reportType === 'period' ? 'border-[var(--accent-primary)] bg-[rgba(59,130,246,0.1)] text-white' : 'border-[var(--border-light)] bg-[rgba(0,0,0,0.2)] text-[var(--text-secondary)] hover:border-[rgba(255,255,255,0.2)]'}`}
                  onClick={() => setReportType('period')}
                >
                  <span className="font-medium">Financiero por Período</span>
                </button>
              </div>
            </div>

            {reportType === 'period' && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <Input label="Fecha Inicio" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <Input label="Fecha Fin" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <Download className="mr-2 text-[var(--accent-primary)]" size={20} />
            Exportar
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Descargue el reporte configurado en el formato de su preferencia.
          </p>
          
          <div className="flex flex-col gap-5">
            <DownloadButton
              label="Exportar como PDF"
              doneLabel="Descargado"
              color="#6366f1"
              onDownload={() => handleExport('pdf')}
            />
            <DownloadButton
              label="Exportar como Excel"
              doneLabel="Descargado"
              color="#10b981"
              onDownload={() => handleExport('excel')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
