
import { useParams } from "react-router";

const visualizerId = () => {
  const { id } = useParams();
  const image = id ? sessionStorage.getItem(id) : null;

  return (
    <div className="visualizer">
      <h1>Visualizer</h1>
      {image && (
        <div className="image-container">
          <img src={image} alt="Floor plan" />
        </div>
      )}
    </div>
  );
};

export default visualizerId;