// import React, { useState } from "react";
// import { ImageIcon, Upload as UploadIcon } from "lucide-react";

// import type { AdvanceInfo } from "../form-types";
// import "../course-form.scss";
// import {
//   handleFileUpload,
//   validateImageFile,
// } from "../../../../../shared/utils/cloudinary/fileUpload";
// import { comments } from "../../../../../shared/constants/comments";
// import Loading from "../../../../../components/common/Loading/Loading";

// interface AdvanceInformationProps {
//   data: AdvanceInfo;
//   onUpdate: (data: Partial<AdvanceInfo>) => void;
//   onNext: () => void;
//   onPrevious: () => void;
//   onCancel: () => void;
//   setError: (error: string) => void;
// }

// export function AdvanceInformation({
//   data,
//   onUpdate,
//   onNext,
//   onPrevious,
//   onCancel,
//   setError,
// }: AdvanceInformationProps) {
//   const [isUploading, setIsUploading] = useState(false);

//   const handleThumbnailUpload = async (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     try {
//       setIsUploading(true);
//       const result = await handleFileUpload(file, {
//         validateFile: validateImageFile,
//         onUploadStart: () => setIsUploading(true),
//         onUploadEnd: () => setIsUploading(false),
//       });

//       if (result.success && result.url) {
//         onUpdate({
//           thumbnail: result.url,
//         });
//       } else {
//         console.log(comments.IMG_UPLOAD_FAIL, result.error);
//         setError(comments.IMG_UPLOAD_FAIL);
//       }
//     } catch (error) {
//       setError(comments.IMG_UPLOAD_FAIL);
//       setIsUploading(false);
//     }
//   };

//   const validateForm = () => {
//     if (!data.thumbnail) {
//       setError(comments.THUMBNAIL_REQ);
//       return false;
//     }
//     if (!data.description.trim()) {
//       setError(comments.DESCRIPTION_RQ);
//       return false;
//     }
//     return true;
//   };

//   const handleNext = () => {
//     if (validateForm()) {
//       onNext();
//     }
//   };

//   return (
//     <div className="form-section">
//       <h2>Advance Information</h2>

//       <div className="upload-section">
//         <div className="upload-icon">
//           <ImageIcon size={48} />
//         </div>
//         <div className="upload-text">
//           {isUploading
//             ? comments.UPLOADING
//             : data.thumbnail
//             ? comments.IMG_UPLOAD_SUCCESS
//             : comments.THUMBNAIL_DEFAULT}
//         </div>
//         <label className="upload-button">
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleThumbnailUpload}
//             style={{ display: "none" }}
//           />
//           <UploadIcon />
//           {isUploading ? <Loading /> : comments.UPLOAD}
//         </label>
//       </div>

//       <div className="input-group">
//         <label htmlFor="description">Course Description</label>
//         <textarea
//           id="description"
//           value={data.description}
//           onChange={(e) => onUpdate({ description: e.target.value })}
//           placeholder={comments.DESCRIPTION_PLACEHOLDER}
//           rows={6}
//           className="input-group"
//         />
//       </div>

//       <div className="button-group">
//         <div>
//           <button
//             onClick={onCancel}
//             className="secondary"
//             style={{ marginRight: "1rem" }}
//           >
//             Cancel
//           </button>
//           <button onClick={onPrevious} className="secondary">
//             Back
//           </button>
//         </div>
//         <button onClick={handleNext} className="primary" disabled={isUploading}>
//           Save & Next
//         </button>
//       </div>
//     </div>
//   );
// }
