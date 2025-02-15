import styled from 'styled-components';

const Button = ({onClick}) => {
  return (
    <StyledWrapper>
      <button className="button"
      onClick={onClick}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
        </svg>
        <div className="text">
          START
        </div>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .button {
  font-weight: bold;
    background-color: #ffffff00;
    color: #fff;
    width: 8.5em;
    height: 2.9em;
    border: #4bf2af 0.2em solid;
    border-radius: 11px;
    text-align: right;
    transition: all 0.3s ease;
  }

  .button:hover {
    background-color: #93f5ba;
    color: black;
    cursor: pointer;
  }

  .button svg {
    width: 1.6em;
    margin: -0.2em 0.8em 1em;
    position: absolute;
    display: flex;
    transition: all 0.3s ease;
  }

  .button:hover svg {
    transform: translateX(5px);
  }

  .text {
    margin: 0 1.5em
  }`;

export default Button;
