import { useLocation } from "react-router";

const VisualizerId = () => {
    const location = useLocation();
    const { initialImage, name } = location.state || {};

    return (
        <section className="visualizer">
            <h1>{name || "Untitled Project"}</h1>

            <div className="visualizer-content">
                {initialImage ? (
                    <div className="image-container">
                        <h2>Source Image</h2>
                        <img src={initialImage} alt="source" />
                    </div>
                ) : (
                    <p>No image available</p>
                )}
            </div>
        </section>
    );
};

export default VisualizerId;