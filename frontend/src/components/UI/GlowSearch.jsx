import React from 'react';
import styled from 'styled-components';
import { Search } from 'lucide-react';

const GlowSearch = ({ value, onChange, onKeyDown, placeholder = "Buscar..." }) => {
  return (
    <StyledWrapper>
      <div className="search-container">
        <Search className="search-icon" size={16} />
        <input 
          placeholder={placeholder} 
          type="text" 
          className="input" 
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .search-container {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .input {
    background-color: var(--input-bg);
    border: 1px solid var(--border-light);
    width: 240px;
    height: 38px;
    border-radius: 999px;
    color: var(--text-primary);
    padding-left: 38px;
    padding-right: 16px;
    font-size: 13px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .input::placeholder {
    color: var(--text-muted);
  }

  .input:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.25);
    width: 270px;
  }

  .search-icon {
    position: absolute;
    left: 14px;
    color: var(--text-muted);
    pointer-events: none;
    transition: color 0.3s ease;
  }

  .input:focus ~ .search-icon,
  .search-container:focus-within .search-icon {
    color: var(--accent-primary);
  }
`;

export default GlowSearch;
