import React from 'react';
import styled from 'styled-components';

const PaymentModal = ({ isOpen, onClose, planName, planPrice }) => {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <StyledWrapper onClick={(e) => e.stopPropagation()}>
        <div className="modal">
          <button className="close-btn" onClick={onClose}>✕</button>
          <div className="plan-header">
            <h2>Suscripción {planName}</h2>
            <p className="price">${planPrice}<span>/mes</span></p>
          </div>
          <form className="form" onSubmit={(e) => { e.preventDefault(); alert('¡Pago procesado!'); onClose(); }}>
            <div className="payment--options">
              <button name="paypal" type="button">
                <svg viewBox="0 0 124 33" height="33px" width="124px" xmlns="http://www.w3.org/2000/svg">
                  <path d="M46.211,6.749h-6.839c-0.468,0-0.866,0.34-0.939,0.802l-2.766,17.537c-0.055,0.346,0.213,0.658,0.564,0.658h3.265c0.468,0,0.866-0.34,0.939-0.803l0.746-4.73c0.072-0.463,0.471-0.803,0.938-0.803h2.165c4.505,0,7.105-2.18,7.784-6.5c0.306-1.89,0.013-3.375-0.872-4.415C50.224,7.353,48.5,6.749,46.211,6.749z M47,13.154c-0.374,2.454-2.249,2.454-4.062,2.454h-1.032l0.724-4.583c0.043-0.277,0.283-0.481,0.563-0.481h0.473c1.235,0,2.4,0,3.002,0.704C47.027,11.668,47.137,12.292,47,13.154z" fill="#a78bfa"/>
                  <path d="M66.654,13.075h-3.275c-0.279,0-0.52,0.204-0.563,0.481l-0.145,0.916l-0.229-0.332c-0.709-1.029-2.29-1.373-3.868-1.373c-3.619,0-6.71,2.741-7.312,6.586c-0.313,1.918,0.132,3.752,1.22,5.031c0.998,1.176,2.426,1.666,4.125,1.666c2.916,0,4.533-1.875,4.533-1.875l-0.146,0.91c-0.055,0.348,0.213,0.66,0.562,0.66h2.95c0.469,0,0.865-0.34,0.939-0.803l1.77-11.209C67.271,13.388,67.004,13.075,66.654,13.075z M62.089,19.449c-0.316,1.871-1.801,3.127-3.695,3.127c-0.951,0-1.711-0.305-2.199-0.883c-0.484-0.574-0.668-1.391-0.514-2.301c0.295-1.855,1.805-3.152,3.67-3.152c0.93,0,1.686,0.309,2.184,0.892C62.034,17.721,62.232,18.543,62.089,19.449z" fill="#a78bfa"/>
                  <path d="M84.096,13.075h-3.291c-0.314,0-0.609,0.156-0.787,0.417l-4.539,6.686l-1.924-6.425c-0.121-0.402-0.492-0.678-0.912-0.678h-3.234c-0.393,0-0.666,0.384-0.541,0.754l3.625,10.638l-3.408,4.811c-0.268,0.379,0.002,0.9,0.465,0.9h3.287c0.312,0,0.604-0.152,0.781-0.408L84.564,13.97C84.826,13.592,84.557,13.075,84.096,13.075z" fill="#a78bfa"/>
                  <path d="M94.992,6.749h-6.84c-0.467,0-0.865,0.34-0.938,0.802l-2.766,17.537c-0.055,0.346,0.213,0.658,0.562,0.658h3.51c0.326,0,0.605-0.238,0.656-0.562l0.785-4.971c0.072-0.463,0.471-0.803,0.938-0.803h2.164c4.506,0,7.105-2.18,7.785-6.5c0.307-1.89,0.012-3.375-0.873-4.415C99.004,7.353,97.281,6.749,94.992,6.749z M95.781,13.154c-0.373,2.454-2.248,2.454-4.062,2.454h-1.031l0.725-4.583c0.043-0.277,0.281-0.481,0.562-0.481h0.473c1.234,0,2.4,0,3.002,0.704C95.809,11.668,95.918,12.292,95.781,13.154z" fill="#6366f1"/>
                  <path d="M115.434,13.075h-3.273c-0.281,0-0.52,0.204-0.562,0.481l-0.145,0.916l-0.23-0.332c-0.709-1.029-2.289-1.373-3.867-1.373c-3.619,0-6.709,2.741-7.311,6.586c-0.312,1.918,0.131,3.752,1.219,5.031c1,1.176,2.426,1.666,4.125,1.666c2.916,0,4.533-1.875,4.533-1.875l-0.146,0.91c-0.055,0.348,0.213,0.66,0.564,0.66h2.949c0.467,0,0.865-0.34,0.938-0.803l1.771-11.209C116.053,13.388,115.785,13.075,115.434,13.075z M110.869,19.449c-0.314,1.871-1.801,3.127-3.695,3.127c-0.949,0-1.711-0.305-2.199-0.883c-0.484-0.574-0.666-1.391-0.514-2.301c0.297-1.855,1.805-3.152,3.67-3.152c0.93,0,1.686,0.309,2.184,0.892C110.816,17.721,111.014,18.543,110.869,19.449z" fill="#6366f1"/>
                  <path d="M119.295,7.23l-2.807,17.858c-0.055,0.346,0.213,0.658,0.562,0.658h2.822c0.469,0,0.867-0.34,0.939-0.803l2.768-17.536c0.055-0.346-0.213-0.659-0.562-0.659h-3.16C119.578,6.749,119.338,6.953,119.295,7.23z" fill="#6366f1"/>
                </svg>
              </button>
              <button name="apple-pay" type="button">
                <svg viewBox="0 0 512 210.2" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M93.6,27.1C87.6,34.2,78,39.8,68.4,39c-1.2-9.6,3.5-19.8,9-26.1c6-7.3,16.5-12.5,25-12.9C103.4,10,99.5,19.8,93.6,27.1 M102.3,40.9c-13.9-0.8-25.8,7.9-32.4,7.9c-6.7,0-16.8-7.5-27.8-7.3c-14.3,0.2-27.6,8.3-34.9,21.2c-15,25.8-3.9,64,10.6,85c7.1,10.4,15.6,21.8,26.8,21.4c10.6-0.4,14.8-6.9,27.6-6.9c12.9,0,16.6,6.9,27.8,6.7c11.6-0.2,18.9-10.4,26-20.8c8.1-11.8,11.4-23.3,11.6-23.9c-0.2-0.2-22.4-8.7-22.6-34.3c-0.2-21.4,17.5-31.6,18.3-32.2C123.3,42.9,107.7,41.3,102.3,40.9 M182.6,11.9v155.9h24.2v-53.3h33.5c30.6,0,52.1-21,52.1-51.4c0-30.4-21.1-51.2-51.3-51.2H182.6z M206.8,32.3h27.9c21,0,33,11.2,33,30.9c0,19.7-12,31-33.1,31h-27.8V32.3z M336.6,169c15.2,0,29.3-7.7,35.7-19.9h0.5v18.7h22.4V90.2c0-22.5-18-37-45.7-37c-25.7,0-44.7,14.7-45.4,34.9h21.8c1.8-9.6,10.7-15.9,22.9-15.9c14.8,0,23.1,6.9,23.1,19.6v8.6l-30.2,1.8c-28.1,1.7-43.3,13.2-43.3,33.2C298.4,155.6,314.1,169,336.6,169z M343.1,150.5c-12.9,0-21.1-6.2-21.1-15.7c0-9.8,7.9-15.5,23-16.4l26.9-1.7v8.8C371.9,140.1,359.5,150.5,343.1,150.5z M425.1,210.2c23.6,0,34.7-9,44.4-36.3L512,54.7h-24.6l-28.5,92.1h-0.5l-28.5-92.1h-25.3l41,113.5l-2.2,6.9c-3.7,11.7-9.7,16.2-20.4,16.2c-1.9,0-5.6-0.2-7.1-0.4v18.7C417.3,210,423.3,210.2,425.1,210.2z" fill="#a78bfa"/>
                </svg>
              </button>
              <button name="google-pay" type="button">
                <svg fill="none" viewBox="0 0 80 39" height={39} width={80} xmlns="http://www.w3.org/2000/svg">
                  <path fill="#8b8ba3" d="M37.8 19.7V29H34.8V6H42.6C44.5 6 46.3 6.7 47.7 8C49.1 9.2 49.8 11 49.8 12.9C49.8 14.8 49.1 16.5 47.7 17.8C46.3 19.1 44.6 19.8 42.6 19.8L37.8 19.7ZM37.8 8.8V16.8H42.8C43.9 16.8 45 16.4 45.7 15.6C47.3 14.1 47.3 11.6 45.8 10.1L45.7 10C44.9 9.2 43.9 8.7 42.8 8.8H37.8Z"/>
                  <path fill="#8b8ba3" d="M56.7 12.8C58.9 12.8 60.6 13.4 61.9 14.6C63.2 15.8 63.8 17.4 63.8 19.4V29H61V26.8H60.9C59.7 28.6 58 29.5 56 29.5C54.3 29.5 52.8 29 51.6 28C50.5 27 49.8 25.6 49.8 24.1C49.8 22.5 50.4 21.2 51.6 20.2C52.8 19.2 54.5 18.8 56.5 18.8C58.3 18.8 59.7 19.1 60.8 19.8V19.1C60.8 18.1 60.4 17.1 59.6 16.5C58.8 15.8 57.8 15.4 56.7 15.4C55 15.4 53.7 16.1 52.8 17.5L50.2 15.9C51.8 13.8 53.9 12.8 56.7 12.8ZM52.9 24.2C52.9 25 53.3 25.7 53.9 26.1C54.6 26.6 55.4 26.9 56.2 26.9C57.4 26.9 58.6 26.4 59.5 25.5C60.5 24.6 61 23.5 61 22.3C60.1 21.6 58.8 21.2 57.1 21.2C55.9 21.2 54.9 21.5 54.1 22.1C53.3 22.6 52.9 23.3 52.9 24.2Z"/>
                  <path fill="#8b8ba3" d="M80 13.3L70.1 36H67.1L70.8 28.1L64.3 13.4H67.5L72.2 24.7H72.3L76.9 13.4H80V13.3Z"/>
                  <path fill="#6366f1" d="M25.9 17.7C25.9 16.8 25.8 15.9 25.7 15H13.2V20.1H20.3C20 21.7 19.1 23.2 17.7 24.1V27.4H22C24.5 25.1 25.9 21.7 25.9 17.7Z"/>
                  <path fill="#8b5cf6" d="M13.2 30.6C16.8 30.6 19.8 29.4 22 27.4L17.7 24.1C16.5 24.9 15 25.4 13.2 25.4C9.8 25.4 6.8 23.1 5.8 19.9H1.4V23.3C3.7 27.8 8.2 30.6 13.2 30.6Z"/>
                  <path fill="#a78bfa" d="M5.8 19.9C5.2 18.3 5.2 16.5 5.8 14.8V11.4H1.4C-0.5 15.1-0.5 19.5 1.4 23.3L5.8 19.9Z"/>
                  <path fill="#6366f1" d="M13.2 9.4C15.1 9.4 16.9 10.1 18.3 11.4L22.1 7.6C19.7 5.4 16.5 4.1 13.3 4.2C8.3 4.2 3.7 7 1.5 11.5L5.9 14.9C6.8 11.7 9.8 9.4 13.2 9.4Z"/>
                </svg>
              </button>
            </div>
            <div className="separator">
              <hr className="line" />
              <p>o paga con tarjeta</p>
              <hr className="line" />
            </div>
            <div className="credit-card-info--form">
              <div className="input_container">
                <label className="input_label">Nombre del titular</label>
                <input className="input_field" type="text" placeholder="Nombre completo" required />
              </div>
              <div className="input_container">
                <label className="input_label">Número de tarjeta</label>
                <input className="input_field" type="text" placeholder="0000 0000 0000 0000" maxLength={19} required />
              </div>
              <div className="input_container">
                <label className="input_label">Fecha de expiración / CVV</label>
                <div className="split">
                  <input className="input_field" type="text" placeholder="MM/AA" maxLength={5} required />
                  <input className="input_field" type="text" placeholder="CVV" maxLength={4} required />
                </div>
              </div>
            </div>
            <button className="purchase--btn" type="submit">Pagar ${planPrice}/mes</button>
          </form>
        </div>
      </StyledWrapper>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(12px);
  animation: fadeIn 0.3s ease;

  &::before {
    content: "";
    position: absolute;
    top: 30%;
    left: 25%;
    width: 400px;
    height: 400px;
    background: #8b5cf6;
    border-radius: 50%;
    filter: blur(180px);
    opacity: 0.25;
    pointer-events: none;
  }
  &::after {
    content: "";
    position: absolute;
    bottom: 20%;
    right: 25%;
    width: 350px;
    height: 350px;
    background: #3b82f6;
    border-radius: 50%;
    filter: blur(180px);
    opacity: 0.2;
    pointer-events: none;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const StyledWrapper = styled.div`
  position: relative;
  z-index: 10;
  animation: slideUp 0.4s cubic-bezier(0.32,0.72,0,1);

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .modal {
    position: relative;
    width: fit-content;
    background: rgba(15,17,26,0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 25px 80px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.1);
    border-radius: 24px;
    max-width: 420px;
  }

  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: #8b8ba3;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    &:hover { background: rgba(255,255,255,0.1); color: white; }
  }

  .plan-header {
    text-align: center;
    padding: 24px 20px 0;
    h2 { color: white; font-size: 18px; font-weight: 700; margin: 0 0 4px; }
    .price {
      font-size: 32px; font-weight: 800;
      background: linear-gradient(135deg, #a78bfa, #6366f1, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      span { font-size: 14px; font-weight: 400; }
    }
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 20px;
  }

  .payment--options {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
  }

  .payment--options button {
    height: 50px;
    background: rgba(255,255,255,0.03);
    border-radius: 12px;
    padding: 0;
    border: 1px solid rgba(255,255,255,0.08);
    outline: none;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      background: rgba(255,255,255,0.08);
      border-color: rgba(139,92,246,0.3);
      box-shadow: 0 0 15px rgba(139,92,246,0.15);
    }
  }

  .payment--options button svg { height: 18px; }
  .payment--options button:last-child svg { height: 22px; }

  .separator {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    gap: 10px;
    color: #6b7280;
    p {
      word-break: keep-all;
      text-align: center;
      font-weight: 600;
      font-size: 11px;
      margin: auto;
      white-space: nowrap;
    }
    .line {
      width: 100%;
      height: 1px;
      border: 0;
      background: rgba(255,255,255,0.08);
      margin: auto;
    }
  }

  .credit-card-info--form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .input_container {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .split {
    display: grid;
    grid-template-columns: 4fr 2fr;
    gap: 12px;
  }

  .input_label {
    font-size: 11px;
    color: #8b8ba3;
    font-weight: 600;
  }

  .input_field {
    width: 100%;
    height: 42px;
    padding: 0 16px;
    border-radius: 10px;
    outline: none;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: white;
    font-size: 14px;
    transition: all 0.3s cubic-bezier(0.15,0.83,0.66,1);
    box-sizing: border-box;
    &::placeholder { color: #4b5563; }
    &:focus {
      border-color: rgba(139,92,246,0.5);
      box-shadow: 0 0 0 2px rgba(139,92,246,0.2), 0 0 20px rgba(139,92,246,0.1);
      background: rgba(255,255,255,0.02);
    }
  }

  .purchase--btn {
    height: 50px;
    border-radius: 12px;
    border: 0;
    outline: none;
    color: white;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    background: linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6);
    box-shadow: 0 4px 20px rgba(139,92,246,0.3);
    transition: all 0.3s;
    &:hover {
      box-shadow: 0 4px 30px rgba(139,92,246,0.5);
      transform: translateY(-1px);
    }
  }

  .input_field::-webkit-outer-spin-button,
  .input_field::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .input_field[type=number] { -moz-appearance: textfield; }
`;

export default PaymentModal;
