import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import apiClient from '../../api/client';

const TransactionModal = ({ isOpen, onClose, onSuccess }) => {
  const [assets, setAssets] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    asset_id: '',
    type: 'operativo',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: ''
  });

  useEffect(() => {
    if (isOpen) {
      const fetchAssets = async () => {
        try {
          const res = await apiClient.get('/assets');
          setAssets(res.data.assets);
          if (res.data.assets.length > 0) {
            setFormData(prev => ({ ...prev, asset_id: res.data.assets[0].id }));
          }
        } catch (error) {
          console.error("Error fetching assets for modal", error);
        }
      };
      fetchAssets();
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.asset_id) {
      alert("Debe seleccionar un activo");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      };
      
      await apiClient.post('/finances/transactions', payload);
      
      setFormData(prev => ({
        ...prev,
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      }));
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Error creating transaction", error);
      alert("Error al registrar transacción");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => !isSubmitting && onClose()}
      title="Registrar Gasto / Transacción"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5 w-full">
          <label className="text-sm font-medium text-[var(--text-secondary)]">Activo Relacionado</label>
          <select 
            name="asset_id" 
            value={formData.asset_id} 
            onChange={handleInputChange} 
            required 
            className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all"
          >
            {assets.map(a => (
              <option key={a.id} value={a.id} className="bg-[var(--bg-secondary)]">{a.name}</option>
            ))}
            {assets.length === 0 && (
              <option value="" disabled className="bg-[var(--bg-secondary)]">No hay activos registrados</option>
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 w-full">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Tipo</label>
            <select 
              name="type" 
              value={formData.type} 
              onChange={handleInputChange} 
              required 
              className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--border-light)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent-primary)] transition-all"
            >
              <option value="operativo" className="bg-[var(--bg-secondary)]">Gasto Operativo</option>
              <option value="mantenimiento" className="bg-[var(--bg-secondary)]">Gasto Mantenimiento</option>
              <option value="mejora" className="bg-[var(--bg-secondary)]">Mejora/Inversión</option>
              <option value="ingreso" className="bg-[var(--bg-secondary)]">Ingreso (+)</option>
            </select>
          </div>
          <Input 
            label="Monto ($)" 
            name="amount" 
            type="number" 
            step="0.01" 
            min="0.01" 
            value={formData.amount} 
            onChange={handleInputChange} 
            required 
          />
        </div>

        <Input 
          label="Fecha" 
          name="date" 
          type="date" 
          value={formData.date} 
          onChange={handleInputChange} 
          required 
        />
        <Input 
          label="Categoría (Opcional)" 
          name="category" 
          value={formData.category} 
          onChange={handleInputChange} 
          placeholder="Ej. Electricidad, Pintura..." 
        />
        <Input 
          label="Descripción (Opcional)" 
          name="description" 
          value={formData.description} 
          onChange={handleInputChange} 
        />

        <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-[var(--border-light)]">
          <Button type="button" variant="ghost" onClick={() => onClose()}>Cancelar</Button>
          <Button type="submit" isLoading={isSubmitting}>Registrar</Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionModal;
