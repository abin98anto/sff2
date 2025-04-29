/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SearchIcon, FilterIcon, CalendarIcon, StarIcon } from "lucide-react";

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

interface IReview {
  _id?: string;
  ratings: number;
  comments: string;
  userId: string;
  courseId: string;
}

interface ICourseWithReview extends ICourse {
  averageRating?: number;
}

interface ReviewResult {
  courseId: string;
  avgRating: number;
}

const CourseListPage = () => {
  const [courses, setCourses] = useState<ICourseWithReview[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("none");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [_, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);
  const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
  const coursesPerPage = 8;
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [courseReviews, setCourseReviews] = useState<{ [key: string]: number }>(
    {}
  );

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

  const fetchCourseReviews = async (courseId: string): Promise<number> => {
    try {
      const response = await axiosInstance.get(`/review/${courseId}`);
      const reviewsData = response.data;

      if (reviewsData && Array.isArray(reviewsData.data)) {
        const reviews: IReview[] = reviewsData.data;
        const ratings = reviews.map((review) => review.ratings);

        const average =
          ratings.length > 0
            ? ratings.reduce((a: number, b: number) => a + b, 0) /
              ratings.length
            : 0;

        return average;
      }
      return 0;
    } catch (error) {
      console.error(`Error fetching reviews for course ${courseId}:`, error);
      return 0;
    }
  };

  const fetchAllCourseReviews = async (coursesData: ICourse[]) => {
    const reviewsObj: { [key: string]: number } = {};

    try {
      const reviewPromises = coursesData.map(async (course) => {
        if (course._id) {
          const avgRating = await fetchCourseReviews(course._id);
          return { courseId: course._id, avgRating } as ReviewResult;
        }
        return { courseId: "", avgRating: 0 } as ReviewResult;
      });

      const reviewResults = await Promise.all(reviewPromises);

      reviewResults.forEach((result) => {
        if (result.courseId) {
          reviewsObj[result.courseId] = result.avgRating;
        }
      });

      setCourseReviews(reviewsObj);
      console.log("simpley log in fetxh all xourse reviwe", courseReviews);
      const coursesWithReviews = coursesData.map((course) => {
        const courseId = course._id || "";
        const averageRating = courseId ? reviewsObj[courseId] || 0 : 0;

        return {
          ...course,
          averageRating,
        };
      });

      const sortedCourses = [...coursesWithReviews];

      if (reviewFilter === "highest") {
        sortedCourses.sort(
          (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
        );
      } else if (reviewFilter === "lowest") {
        sortedCourses.sort(
          (a, b) => (a.averageRating || 0) - (b.averageRating || 0)
        );
      }

      setCourses(sortedCourses);
    } catch (error) {
      showSnackbar("Failed to fetch course reviews", "error");
      console.error("Error fetching course reviews:", error);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("page", currentPage.toString());
        params.append("limit", coursesPerPage.toString());
        params.append("isActive", "true");

        if (appliedSearchTerm) {
          params.append("search", appliedSearchTerm);
        }

        if (selectedCategory !== "All") {
          params.append("category", selectedCategory);
        }

        if (dateFilter !== "all" && reviewFilter === "none") {
          params.append("sort", dateFilter);
        }

        const response = await axiosInstance.get(
          `${API.COURSE_GET}?${params.toString()}`
        );
        const { data, totalPages: pages, total } = response.data.data;

        if (reviewFilter !== "none") {
          await fetchAllCourseReviews(data);
        } else {
          setCourses(data);
        }

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
  }, [
    currentPage,
    appliedSearchTerm,
    selectedCategory,
    dateFilter,
    reviewFilter,
  ]);

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
    if (e.target.value !== "all") {
      setReviewFilter("none");
    }
    setCurrentPage(1);
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReviewFilter(e.target.value);
    if (e.target.value !== "none") {
      setDateFilter("all");
    }
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setDateFilter("all");
    setReviewFilter("none");
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
      selectedCategory !== "All" ||
      dateFilter !== "all" ||
      reviewFilter !== "none" ||
      searchTerm !== ""
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
              <select
                value={dateFilter}
                onChange={handleDateChange}
                disabled={reviewFilter !== "none"}
              >
                <option value="all">All Time</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <div className="filter">
              <label>
                <StarIcon size={16} />
                Rating
              </label>
              <select
                value={reviewFilter}
                onChange={handleReviewChange}
                disabled={dateFilter !== "all"}
              >
                <option value="none">No Rating Filter</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
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
                    {course.averageRating !== undefined && (
                      <p className="rating">
                        Rating: {course.averageRating.toFixed(1)}
                        <StarIcon size={16} className="star-icon" />
                      </p>
                    )}
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
