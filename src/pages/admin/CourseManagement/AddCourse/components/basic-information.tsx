import { useEffect, useState } from "react";
import type { BasicInfo } from "../form-types";
import {
  FormSection,
  InputGroup,
  CharCount,
  ButtonGroup,
  Button,
} from "../StyledComponents";
import { ICategory } from "../../../../../entities/categories/ICategories";
import axiosInstance from "../../../../../utils/axiosConfig";
import { API_ENDPOINTS, someMessages } from "../../../../../utils/constants";

interface ICategoryResponse {
  data: ICategory[];
}

interface BasicInformationProps {
  data: BasicInfo;
  onUpdate: (data: Partial<BasicInfo>) => void;
  onNext: () => void;
  onCancel: () => void;
  setError: (error: string) => void;
}

export function BasicInformation({
  data,
  onUpdate,
  onNext,
  onCancel,
  setError,
}: BasicInformationProps) {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cateError, setcateError] = useState<string>("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get<ICategoryResponse>(
        API_ENDPOINTS.GET_CATS
      );
      if (response.data && response.data.data) {
        setCategories(response.data.data);
      } else {
        setcateError(someMessages.NO_CAT_RECIVIED);
      }
    } catch (err) {
      console.error(someMessages.FETCH_CAT_FAIL, err);
      setcateError(someMessages.FETCH_CAT_FAIL);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof BasicInfo, value: string) => {
    onUpdate({ [field]: value });
  };

  const validateForm = () => {
    if (!data.title.trim()) {
      setError(someMessages.TITLE_REQ);
      return false;
    }
    if (!data.subtitle.trim()) {
      setError(someMessages.SUBTITLE_REQ);
      return false;
    }
    if (!data.category) {
      setError(someMessages.CAT_REQ);
      return false;
    }
    if (!data.topic.trim()) {
      setError(someMessages.TOPIC_REQ);
      return false;
    }
    if (!data.language) {
      setError(someMessages.LANG_REQ);
      return false;
    }
    if (!data.duration.trim()) {
      setError(someMessages.DURA_REQ);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <FormSection>
      <h2>Basic Information</h2>

      <InputGroup>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={data.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Your course title"
          maxLength={80}
        />
        <CharCount>{data.title.length}/80</CharCount>
      </InputGroup>

      <InputGroup>
        <label htmlFor="subtitle">Subtitle</label>
        <input
          id="subtitle"
          type="text"
          value={data.subtitle}
          onChange={(e) => handleChange("subtitle", e.target.value)}
          placeholder="Your course subtitle"
          maxLength={120}
        />
        <CharCount>{data.subtitle.length}/120</CharCount>
      </InputGroup>

      <InputGroup>
        <label htmlFor="category">Course Category</label>
        <select
          id="category"
          value={data.category}
          onChange={(e) => handleChange("category", e.target.value)}
          disabled={isLoading}
        >
          <option value="">Select...</option>
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))
          ) : (
            <option value="" disabled>
              {isLoading ? someMessages.LOADING : someMessages.NO_CAT_RECIVIED}
            </option>
          )}
        </select>
        {cateError && <span className="error-message">{cateError}</span>}
      </InputGroup>

      <InputGroup>
        <label htmlFor="topic">Course Topic</label>
        <input
          id="topic"
          type="text"
          value={data.topic}
          onChange={(e) => handleChange("topic", e.target.value)}
          placeholder={someMessages.TOPIC_PLACEHOLDER}
        />
      </InputGroup>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        <InputGroup>
          <label htmlFor="language">Course Language</label>
          <select
            id="language"
            value={data.language}
            onChange={(e) => handleChange("language", e.target.value)}
          >
            <option value="">Select...</option>
            <option value="english">English</option>
            <option value="malayalam">Malayalam</option>
            <option value="hindi">Hindi</option>
          </select>
        </InputGroup>

        <InputGroup>
          <label htmlFor="duration">Duration</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              id="duration"
              type="number"
              value={data.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
              placeholder={someMessages.DURA_PLACEHOLDER}
              min="1"
            />
            <select>
              <option>Day</option>
              <option>Hours</option>
              <option>Minutes</option>
            </select>
          </div>
        </InputGroup>
      </div>

      <ButtonGroup>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleNext}>Save & Next</Button>
      </ButtonGroup>
    </FormSection>
  );
}
