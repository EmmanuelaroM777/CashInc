import React, { useState, useContext } from 'react';
import { Download, FileText } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import apiClient from '../api/client';
import Input from '../components/UI/Input';
import DownloadButton from '../components/UI/DownloadButton';

const ReportsPage = () => {
  const { t } = useContext(LanguageContext);
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
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('reports.title')}</h2>
          <p className="text-[var(--text-secondary)]">{t('reports.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4 flex items-center">
            <FileText className="mr-2 text-[var(--accent-primary)]" size={20} />
            {t('reports.reportConfig')}
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">{t('reports.reportType')}</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${reportType === 'comparison' ? 'border-[var(--accent-primary)] bg-[rgba(59,130,246,0.1)] text-[var(--text-primary)]' : 'border-[var(--border-light)] bg-[var(--input-bg)] text-[var(--text-secondary)] hover:border-[var(--card-hover-border)]'}`}
                  onClick={() => setReportType('comparison')}
                >
                  <span className="font-medium">{t('reports.assetComparison')}</span>
                </button>
                <button
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${reportType === 'period' ? 'border-[var(--accent-primary)] bg-[rgba(59,130,246,0.1)] text-[var(--text-primary)]' : 'border-[var(--border-light)] bg-[var(--input-bg)] text-[var(--text-secondary)] hover:border-[var(--card-hover-border)]'}`}
                  onClick={() => setReportType('period')}
                >
                  <span className="font-medium">{t('reports.financialPeriod')}</span>
                </button>
              </div>
            </div>

            {reportType === 'period' && (
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <Input label={t('reports.startDate')} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <Input label={t('reports.endDate')} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-4 flex items-center">
            <Download className="mr-2 text-[var(--accent-primary)]" size={20} />
            {t('reports.export')}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            {t('reports.exportDesc')}
          </p>
          
          <div className="flex flex-col gap-5">
            <DownloadButton
              label={t('reports.exportPdf')}
              doneLabel={t('reports.downloaded')}
              color="#6366f1"
              onDownload={() => handleExport('pdf')}
            />
            <DownloadButton
              label={t('reports.exportExcel')}
              doneLabel={t('reports.downloaded')}
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
