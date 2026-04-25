import React from 'react';

const Loader = ({ fullScreen = false }) => {
  const loaderContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div style={{
        borderTopColor: 'var(--accent-primary)',
        borderRightColor: 'var(--accent-secondary)',
        borderBottomColor: 'var(--accent-tertiary)',
        borderLeftColor: 'transparent',
      }} className="w-12 h-12 border-4 rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-[var(--text-secondary)]">Cargando...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)] bg-opacity-90 backdrop-blur-sm">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      {loaderContent}
    </div>
  );
};

export default Loader;
