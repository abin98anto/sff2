import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SearchIcon, FilterIcon, CalendarIcon } from "lucide-react";

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
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [_, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const coursesPerPage = 5;
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await axiosInstance.get(API.CATEGORY_GET);
        const fetchedCategories = categoriesResponse.data.data.data.data;

        const validCategories = Array.isArray(fetchedCategories)
          ? fetchedCategories
          : [];

        setCategories([{ _id: "All", name: "All" }, ...validCategories]);
      } catch (err) {
        showSnackbar(comments.CAT_FETCH_FAIL, "error");
        console.error(comments.CAT_FETCH_FAIL, err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("page", currentPage.toString());
        params.append("limit", coursesPerPage.toString());

        if (appliedSearchTerm) {
          params.append("search", appliedSearchTerm);
        }

        if (selectedCategory !== "All") {
          params.append("category", selectedCategory);
        }

        if (dateFilter !== "all") {
          params.append("sort", dateFilter);
        }

        const response = await axiosInstance.get(
          `${API.COURSE_GET}?${params.toString()}`
        );
        const { data, totalPages: pages, total } = response.data.data;

        setCourses(data);
        setTotalPages(pages);
        setTotalCourses(total);
        setLoading(false);
      } catch (err) {
        showSnackbar(comments.COURSE_FETCH_FAIL, "error");
        setLoading(false);
        console.error(comments.COURSE_FETCH_FAIL, err);
      }
    };

    fetchCourses();
  }, [currentPage, appliedSearchTerm, selectedCategory, dateFilter]);

  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateFilter(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setDateFilter("all");
    setSearchTerm("");
    setAppliedSearchTerm("");
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getCategoryName = (category: ICategory | string): string => {
    if (!category) return "Uncategorized";
    return typeof category === "object" ? category.name : "unknown";
  };

  const hasActiveFilters = () => {
    return (
      selectedCategory !== "All" || dateFilter !== "all" || searchTerm !== ""
    );
  };

  if (loading && currentPage === 1) {
    return <Loading />;
  }

  return (
    <div className="courses-page">
      <div className="container">
        <h1>Explore Courses</h1>

        <div className="controls">
          <div className="search-container">
            <div className="search">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchIcon />
            </div>
            <div className="search-button">
              <button onClick={handleSearch}>Search</button>
            </div>
          </div>

          <div className="filters-section">
            <div className="filter">
              <label>
                <FilterIcon size={16} />
                Category
              </label>
              <select value={selectedCategory} onChange={handleCategoryChange}>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter">
              <label>
                <CalendarIcon size={16} />
                Date
              </label>
              <select value={dateFilter} onChange={handleDateChange}>
                <option value="all">All Time</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {hasActiveFilters() && (
              <button className="reset-button" onClick={resetFilters}>
                Reset All
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="loading-overlay">
            <Loading />
          </div>
        )}

        <div className="course-grid">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course._id} className="course-card">
                <Link
                  to={`/course/${course._id}`}
                  key={course._id}
                  className="course-card-link"
                >
                  <img src={course.thumbnail} alt={course.title} />

                  <div className="course-info">
                    <h2>{course.title}</h2>
                    <p>Language: {course.language}</p>
                    <p className="subtitle">{course.subtitle}</p>
                    <p className="category">
                      Category:{" "}
                      {getCategoryName(course.category as string | ICategory)}
                    </p>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="no-courses">
              <p>No courses found matching your criteria.</p>
              <button onClick={resetFilters}>Reset Filters</button>
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
