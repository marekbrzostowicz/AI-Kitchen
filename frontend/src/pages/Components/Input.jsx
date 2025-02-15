import { forwardRef } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const Input = forwardRef(
  ({ placeholder, value, onChange, onKeyDown, gradientVariant }, ref) => {
    return (
      <StyledWrapper gradientVariant={gradientVariant}>
        <div className="form__group field">
          <input
            className="form__field"
            type="text"
            ref={ref}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
          />
        </div>
      </StyledWrapper>
    );
  }
);

// Add displayName for better debugging
Input.displayName = "Input";

Input.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func,
  gradientVariant: PropTypes.oneOf(["green", "orange"]),
};

Input.defaultProps = {
  gradientVariant: "green", // default to green
};

export default Input;

const StyledWrapper = styled.div`
  .form__group {
    position: relative;
    padding: 20px 0 0;
    width: 100%;
    max-width: 180px;
  }
  .form__field {
    font-family: inherit;
    width: 100%;
    border: none;
    border-bottom: 2px solid #9b9b9b;
    outline: 0;
    font-size: 17px;
    color: #fff;
    padding: 7px 0;
    background: transparent;
    transition: border-color 0.2s;
  }
  .form__field::placeholder {
    color: transparent;
  }
  .form__field:placeholder-shown ~ .form__label {
    font-size: 17px;
    cursor: text;
    top: 20px;
  }
  .form__field:focus {
    padding-bottom: 6px;
    font-weight: 700;
    border-width: 3px;
    border-image: ${(props) =>
      props.gradientVariant === "green"
        ? "linear-gradient(to right, #87fa70, #26bd80)"
        : "linear-gradient(to right, #d7f01d, #fc8a26)"};
    border-image-slice: 1;
  }
  .form__field:focus ~ .form__label {
    position: absolute;
    top: 0;
    display: block;
    transition: 0.2s;
    font-size: 17px;
    color: #38caef;
    font-weight: 700;
  }
  .form__field:required,
  .form__field:invalid {
    box-shadow: none;
  }
`;
