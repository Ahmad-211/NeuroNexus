export const uploadImageToCloudinary = async (file) => {
  if (!file) {
    throw new Error("No file provided");
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Automatically determine the resource type based on the file type
  // PDFs are often blocked for delivery as "image" by default Cloudinary security settings,
  // so treating them as "auto" ensures they are uploaded without format matching errors.
  const resourceType = file.type === "application/pdf" ? "raw" : "auto";
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cloudinary error details:", data);
      throw new Error(data.error?.message || "Failed to upload image to Cloudinary");
    }

    return data.secure_url; // This is the image link you will save to Firebase
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};
