import React from 'react';
import styled from 'styled-components';

const GlowSearch = ({ value, onChange, onKeyDown, placeholder = "Buscar..." }) => {
  return (
    <StyledWrapper>
      <div>
        <div id="poda">
          <div className="glow" />
          <div className="darkBorderBg" />
          <div className="darkBorderBg" />
          <div className="darkBorderBg" />
          <div className="white" />
          <div className="border" />
          <div id="main">
            <input 
              placeholder={placeholder} 
              type="text" 
              name="text" 
              className="input" 
              value={value}
              onChange={onChange}
              onKeyDown={onKeyDown}
            />
            <div id="input-mask" />
            <div id="pink-mask" />
            <div id="search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width={18} viewBox="0 0 24 24" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" height={18} fill="none">
                <circle stroke="url(#search)" r={8} cy={11} cx={11} />
                <line stroke="url(#searchl)" y2="16.65" y1={22} x2="16.65" x1={22} />
                <defs>
                  <linearGradient gradientTransform="rotate(50)" id="search">
                    <stop stopColor="#a78bfa" offset="0%" />
                    <stop stopColor="#6366f1" offset="50%" />
                  </linearGradient>
                  <linearGradient id="searchl">
                    <stop stopColor="#6366f1" offset="0%" />
                    <stop stopColor="#3b82f6" offset="50%" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .white,
  .border,
  .darkBorderBg,
  .glow {
    max-height: 52px;
    max-width: 254px;
    height: 100%;
    width: 100%;
    position: absolute;
    overflow: hidden;
    z-index: -1;
    border-radius: 999px;
    filter: blur(3px);
  }
  .input {
    background-color: #0a0e1a;
    border: none;
    width: 220px;
    height: 38px;
    border-radius: 999px;
    color: white;
    padding-left: 38px;
    padding-right: 16px;
    font-size: 13px;
  }
  #poda {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .input::placeholder {
    color: #6b7280;
  }
  .input:focus {
    outline: none;
  }
  #main:focus-within > #input-mask {
    display: none;
  }
  #input-mask {
    pointer-events: none;
    width: 60px;
    height: 16px;
    position: absolute;
    background: linear-gradient(90deg, transparent, #0a0e1a);
    top: 11px;
    left: 50px;
  }
  #pink-mask {
    pointer-events: none;
    width: 24px;
    height: 16px;
    position: absolute;
    background: #8b5cf6;
    top: 6px;
    left: 5px;
    filter: blur(16px);
    opacity: 0.8;
    transition: all 2s;
  }
  #main:hover > #pink-mask {
    opacity: 0;
  }
  .white {
    max-height: 45px;
    max-width: 227px;
    border-radius: 999px;
    filter: blur(2px);
  }
  .white::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(83deg);
    position: absolute;
    width: 600px;
    height: 600px;
    background-repeat: no-repeat;
    background-position: 0 0;
    filter: brightness(1.4);
    background-image: conic-gradient(
      rgba(0, 0, 0, 0) 0%,
      #6366f1,
      rgba(0, 0, 0, 0) 8%,
      rgba(0, 0, 0, 0) 50%,
      #8b5cf6,
      rgba(0, 0, 0, 0) 58%
    );
    transition: all 2s;
  }
  .border {
    max-height: 41px;
    max-width: 223px;
    border-radius: 999px;
    filter: blur(0.5px);
  }
  .border::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(70deg);
    position: absolute;
    width: 600px;
    height: 600px;
    filter: brightness(1.3);
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: conic-gradient(
      #0a0e1a,
      #3b82f6 5%,
      #0a0e1a 14%,
      #0a0e1a 50%,
      #8b5cf6 60%,
      #0a0e1a 64%
    );
    transition: all 2s;
  }
  .darkBorderBg {
    max-height: 47px;
    max-width: 232px;
  }
  .darkBorderBg::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(82deg);
    position: absolute;
    width: 600px;
    height: 600px;
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: conic-gradient(
      rgba(0, 0, 0, 0),
      #1e3a8a,
      rgba(0, 0, 0, 0) 10%,
      rgba(0, 0, 0, 0) 50%,
      #6d28d9,
      rgba(0, 0, 0, 0) 60%
    );
    transition: all 2s;
  }
  #poda:hover > .darkBorderBg::before {
    transform: translate(-50%, -50%) rotate(-98deg);
  }
  #poda:hover > .glow::before {
    transform: translate(-50%, -50%) rotate(-120deg);
  }
  #poda:hover > .white::before {
    transform: translate(-50%, -50%) rotate(-97deg);
  }
  #poda:hover > .border::before {
    transform: translate(-50%, -50%) rotate(-110deg);
  }
  #poda:focus-within > .darkBorderBg::before {
    transform: translate(-50%, -50%) rotate(442deg);
    transition: all 4s;
  }
  #poda:focus-within > .glow::before {
    transform: translate(-50%, -50%) rotate(420deg);
    transition: all 4s;
  }
  #poda:focus-within > .white::before {
    transform: translate(-50%, -50%) rotate(443deg);
    transition: all 4s;
  }
  #poda:focus-within > .border::before {
    transform: translate(-50%, -50%) rotate(430deg);
    transition: all 4s;
  }
  .glow {
    overflow: hidden;
    filter: blur(30px);
    opacity: 0.4;
    max-height: 110px;
    max-width: 340px;
  }
  .glow:before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(60deg);
    position: absolute;
    width: 999px;
    height: 999px;
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: conic-gradient(
      #000,
      #3b82f6 5%,
      #000 38%,
      #000 50%,
      #8b5cf6 60%,
      #000 87%
    );
    transition: all 2s;
  }
  @keyframes rotate {
    100% {
      transform: translate(-50%, -50%) rotate(450deg);
    }
  }
  #main {
    position: relative;
  }
  #search-icon {
    position: absolute;
    left: 12px;
    top: 10px;
  }
`;

export default GlowSearch;
