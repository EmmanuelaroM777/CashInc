import React, { useState } from 'react';
import styled from 'styled-components';

const DownloadButton = ({ label, doneLabel = "Listo", color = "#6366f1", onDownload }) => {
  const [checked, setChecked] = useState(false);

  const handleClick = async () => {
    if (checked) return;
    try {
      await onDownload();
      setChecked(true);
      setTimeout(() => setChecked(false), 4500);
    } catch (e) {
      // If error (e.g. missing dates), don't animate
    }
  };

  return (
    <StyledWrapper $color={color}>
      <div className="container">
        <label className="label" onClick={handleClick}>
          <input
            type="checkbox"
            className="input"
            checked={checked}
            readOnly
          />
          <span className="circle">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 19V5m0 14-4-4m4 4 4-4" />
            </svg>
            <div className="square" />
          </span>
          <p className="title">{label}</p>
          <p className="title">{doneLabel}</p>
        </label>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .label {
    background-color: transparent;
    border: 2px solid ${p => p.$color};
    display: flex;
    align-items: center;
    border-radius: 50px;
    width: 100%;
    cursor: pointer;
    transition: all 0.4s ease;
    padding: 5px;
    position: relative;
    height: 54px;
    box-sizing: border-box;
  }

  .label::before {
    content: "";
    position: absolute;
    top: 0; bottom: 0; left: 0; right: 0;
    background-color: #fff;
    width: 8px; height: 8px;
    transition: all 0.4s ease;
    border-radius: 100%;
    margin: auto;
    opacity: 0;
    visibility: hidden;
  }

  .label .input { display: none; }

  .label .title {
    font-size: 14px;
    color: #fff;
    transition: all 0.4s ease;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 16px;
    text-align: center;
    white-space: nowrap;
  }

  .label .title:last-child {
    opacity: 0;
    visibility: hidden;
  }

  .label .circle {
    height: 42px;
    width: 42px;
    min-width: 42px;
    border-radius: 50%;
    background-color: ${p => p.$color};
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.4s ease;
    position: relative;
    box-shadow: 0 0 0 0 rgba(255,255,255,0);
    overflow: hidden;
  }

  .label .circle .icon {
    color: #fff;
    width: 26px;
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.4s ease;
  }

  .label .circle .square {
    aspect-ratio: 1;
    width: 14px;
    border-radius: 2px;
    background-color: #fff;
    opacity: 0; visibility: hidden;
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.4s ease;
  }

  .label .circle::before {
    content: "";
    position: absolute;
    left: 0; top: 0;
    background-color: rgba(0,0,0,0.3);
    width: 100%;
    height: 0;
    transition: all 0.4s ease;
  }

  /* CHECKED: shrink to circle */
  .label:has(.input:checked) {
    width: 54px;
    animation: expandBack 0.4s ease 3.5s forwards;
  }

  .label:has(.input:checked)::before {
    animation: rotate 3s ease-in-out 0.4s forwards;
  }

  .label .input:checked + .circle {
    animation: pulse 1s forwards, circleDelete 0.2s ease 3.5s forwards;
    rotate: 180deg;
  }

  .label .input:checked + .circle::before {
    animation: installing 3s ease-in-out forwards;
  }

  .label .input:checked + .circle .icon {
    opacity: 0; visibility: hidden;
  }

  .label .input:checked ~ .circle .square {
    opacity: 1; visibility: visible;
  }

  .label .input:checked ~ .title {
    opacity: 0; visibility: hidden;
  }

  .label .input:checked ~ .title:last-child {
    animation: showDoneMessage 0.4s ease 3.5s forwards;
  }

  @keyframes pulse {
    0% { scale: 0.95; box-shadow: 0 0 0 0 rgba(255,255,255,0.7); }
    70% { scale: 1; box-shadow: 0 0 0 16px rgba(255,255,255,0); }
    100% { scale: 0.95; box-shadow: 0 0 0 0 rgba(255,255,255,0); }
  }

  @keyframes installing {
    from { height: 0; }
    to { height: 100%; }
  }

  @keyframes rotate {
    0% { transform: rotate(-90deg) translate(25px) rotate(0); opacity: 1; visibility: visible; }
    99% { transform: rotate(270deg) translate(25px) rotate(270deg); opacity: 1; visibility: visible; }
    100% { opacity: 0; visibility: hidden; }
  }

  @keyframes expandBack {
    100% { width: 100%; border-color: rgb(16,185,129); }
  }

  @keyframes circleDelete {
    100% { opacity: 0; visibility: hidden; }
  }

  @keyframes showDoneMessage {
    100% { opacity: 1; visibility: visible; }
  }
`;

export default DownloadButton;
