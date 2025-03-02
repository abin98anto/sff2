import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SearchIcon, FilterIcon } from "lucide-react";

import "./CourseListPage.scss";
import ICourse from "../../../entities/ICourse";
import axiosInstance from "../../../shared/config/axiosConfig";
import API from "../../../shared/constants/API";
import comments from "../../../shared/constants/comments";
import ICategory from "../../../entities/misc/ICategory";
import Loading from "../../../components/common/Loading/Loading";
import Pagination from "../../../components/common/Pagination/Pagination";
import CustomSnackbar from "../../../components/common/CustomSnackbar";
import useSnackbar from "../../../hooks/useSnackbar";

const CourseListPage = () => {
  const [allCourses, setAllCourses] = useState<ICourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<ICourse[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const coursesPerPage = 8;

  // Fetch categories anad courses.
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const categoriesResponse = await axiosInstance.get(API.CATEGORY_GET);
        const fetchedCategories = categoriesResponse.data.data;

        const validCategories = Array.isArray(fetchedCategories)
          ? fetchedCategories
          : [];
        setCategories([{ _id: "All", name: "All" }, ...validCategories]);

        const coursesResponse = await axiosInstance.get(API.COURSE_GET);
        const activeCourses = coursesResponse.data.data.data.filter(
          (course: ICourse) => course.isActive
        );
        setAllCourses(activeCourses);
        setFilteredCourses(activeCourses);
        setLoading(false);
      } catch (err) {
        showSnackbar(comments.COURSE_FETCH_FAIL, "error");
        setLoading(false);
        console.error(comments.COURSE_FETCH_FAIL, err);
      }
    };

    fetchData();
  }, []);

  // Handle both string IDs and populated category objects
  const getCategoryName = (category: ICategory | string): string => {
    if (!category) return "Uncategorized";
    return typeof category === "object" ? category.name : "unknown";
  };

  // Filter courses.
  useEffect(() => {
    const filtered = allCourses.filter((course) => {
      const titleMatch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      let categoryMatch = false;
      if (selectedCategory === "All") {
        categoryMatch = true;
      } else {
        if (typeof course.category === "object" && course.category._id) {
          categoryMatch =
            course.category._id === selectedCategory ||
            course.category.name === selectedCategory;
        } else {
          categoryMatch = course.category === selectedCategory;
        }
      }

      return titleMatch && categoryMatch;
    });

    setFilteredCourses(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, allCourses]);

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  );

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="courses-page">
      <div className="container">
        <h1>Explore Courses</h1>

        <div className="controls">
          <div className="search">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon />
          </div>

          <div className="filter">
            <FilterIcon />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="course-grid">
          {currentCourses.length > 0 ? (
            currentCourses.map((course) => (
              <div key={course._id} className="course-card">
                <img
                  src={
                    course.thumbnail || "/placeholder.svg?height=200&width=300"
                  }
                  alt={course.title}
                />

                <div className="course-info">
                  <Link
                    to={`/course/${course._id}`}
                    key={course._id}
                    className="course-card-link"
                  >
                    <h2>{course.title}</h2>
                    <p>Language : {course.language}</p>
                    <p className="subtitle">{course.subtitle}</p>
                    <p className="category">
                      Category :{" "}
                      {getCategoryName(course.category as string | ICategory)}
                    </p>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-courses">
              <p>No courses found matching your criteria.</p>
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </div>
  );
};

export default CourseListPage;
