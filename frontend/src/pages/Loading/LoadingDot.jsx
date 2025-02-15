import "./LoadingDots.css";

function LoadingDot() {
  return (
    <div className="one">
      {/* Kropka 1 */}
      <div className="two dot-red"></div>
      {/* Kropka 2 */}
      <div className="two dot-yellow"></div>
      {/* Kropka 3 */}
      <div className="two dot-blue"></div>
    </div>
  );
}

export default LoadingDot;
