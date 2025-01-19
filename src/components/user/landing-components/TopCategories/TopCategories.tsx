import "./TopCategories.scss";
import { images } from "../../../../shared/constants/images";

const TopCategories = () => {
  return (
    <div className="top-categories-container">
      <div className="left-section">
        <img
          src={images.STUDENTS_LIBARARY}
          alt="Library Illustration"
          className="illustration"
        />
      </div>

      <div className="right-section">
        <h2>Top Categories</h2>
        <div className="categories-grid">
          <div className="category-item">
            <span className="category-name">Art & Design</span>
            <span className="category-count">5 Courses</span>
          </div>
          <div className="category-item">
            <span className="category-name">Art & Design</span>
            <span className="category-count">5 Courses</span>
          </div>
          <div className="category-item">
            <span className="category-name">Coding</span>
            <span className="category-count">10 Courses</span>
          </div>
          <div className="category-item">
            <span className="category-name">Art & Design</span>
            <span className="category-count">3 Courses</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopCategories;
