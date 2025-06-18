"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import api from "../../../config/auth/api";
import { Loader2 } from "lucide-react";

// Custom input component with emerald gradient
const StyledInput = ({
  type = "text",
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  min,
  className = "",
  disabled = false,
}) => (
  <input
    type={type}
    id={id}
    name={name}
    value={value}
    onChange={onChange}
    className={`w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
      disabled ? "bg-gray-100" : "bg-white"
    } ${className}`}
    placeholder={placeholder}
    required={required}
    min={min}
    disabled={disabled}
  />
);

// Custom select component with emerald gradient
const StyledSelect = ({
  id,
  name,
  value,
  onChange,
  children,
  required = false,
  disabled = false,
  className = "",
}) => (
  <div className="relative">
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full appearance-none px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 pr-10 ${
        disabled ? "bg-gray-100" : "bg-white"
      } ${className}`}
      required={required}
      disabled={disabled}
    >
      {children}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
      <svg
        className="fill-current h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
      >
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
      </svg>
    </div>
  </div>
);

// Custom textarea component with emerald gradient
const StyledTextarea = ({
  id,
  name,
  value,
  onChange,
  rows = 4,
  placeholder,
  required = false,
  className = "",
}) => (
  <textarea
    id={id}
    name={name}
    value={value}
    onChange={onChange}
    rows={rows}
    className={`w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${className}`}
    placeholder={placeholder}
    required={required}
  />
);

// Custom checkbox component with emerald gradient
const StyledCheckbox = ({ id, name, checked, onChange, label }) => (
  <div className="flex items-center">
    <div className="relative flex items-center">
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        className="opacity-0 absolute h-5 w-5 cursor-pointer"
      />
      <div
        className={`border border-gray-300 rounded-md w-5 h-5 flex flex-shrink-0 justify-center items-center mr-2 ${
          checked
            ? "bg-gradient-to-r from-emerald-600 to-emerald-700 border-transparent"
            : "bg-white"
        }`}
      >
        <svg
          className={`fill-current w-3 h-3 text-white pointer-events-none ${
            checked ? "block" : "hidden"
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
        </svg>
      </div>
    </div>
    <label
      htmlFor={id}
      className="select-none cursor-pointer text-sm text-gray-700"
    >
      {label}
    </label>
  </div>
);

// Loading spinner component
const LoadingSpinner = ({ size = "small" }) => (
  <div className="flex items-center justify-center">
    <Loader2
      className={`animate-spin ${
        size === "small" ? "h-4 w-4" : "h-6 w-6"
      } text-emerald-600`}
    />
  </div>
);

const AddItemContainer = () => {
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    categoryId: "",
    location: "",
    properties: [],
    paymentType: "Pullik",
    currencyType: "UZS",
    negotiable: false,
    regionId: "",
    districtId: "",
    imageIndex: 0, // Index of the main image
  });

  // Store actual file objects with their order
  const [imageFiles, setImageFiles] = useState([]);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [uploadingImages, setUploadingImages] = useState([]);

  // Data states
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategoryId, setSelectedCategoryId] = useState(0);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [categoryProperties, setCategoryProperties] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    fetchRegions();
  }, []);

  // Fetch categories
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await api.get("/category?parentId=null");
      if (response?.data?.success) {
        setCategories(response.data.content);
        console.log(response.data.content);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Kategoriyalarni yuklashda xatolik yuz berdi");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  console.log(selectedSubcategoryId);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.categoryId) {
      fetchSubcategories(formData.categoryId);
      fetchCategoryProperties(formData.categoryId);
    }
  }, [formData.categoryId]);

  // Fetch subcategories
  const fetchSubcategories = async (categoryId) => {
    setIsLoadingSubcategories(true);
    try {
      const response = await api.get(`/category/${categoryId}/children`);
      if (response.data.success) {
        setSubcategories(response.data.content);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      toast.error("Subkategoriyalarni yuklashda xatolik yuz berdi");
    } finally {
      setIsLoadingSubcategories(false);
    }
  };

  // Fetch category properties
  const fetchCategoryProperties = async (categoryId) => {
    setIsLoadingProperties(true);
    try {
      const response = await api.get(`/category/${categoryId}`);
      if (response.data.success) {
        setCategoryProperties(response.data.content.properties || []);
        console.log(response.data);

        // Initialize properties array with empty values
        const initialProperties = (response.data.content.properties || []).map(
          (prop) => ({
            propertyId: prop.id,
            type: prop.type,
            value: {
              key: prop.name,
              value: "",
            },
          })
        );

        setFormData((prev) => ({
          ...prev,
          properties: initialProperties,
        }));
      }
    } catch (error) {
      console.error("Error fetching category properties:", error);
      toast.error("Kategoriya xususiyatlarini yuklashda xatolik yuz berdi");
    } finally {
      setIsLoadingProperties(false);
    }
  };

  // Fetch regions
  const fetchRegions = async () => {
    setIsLoadingRegions(true);
    try {
      const response = await api.get("/location/regions");
      if (response.data.success) {
        setRegions(response.data.content);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast.error("Viloyatlarni yuklashda xatolik yuz berdi");
    } finally {
      setIsLoadingRegions(false);
    }
  };

  // Fetch districts when region changes
  useEffect(() => {
    if (formData.regionId) {
      fetchDistricts(formData.regionId);
    } else {
      setDistricts([]);
      setFormData((prev) => ({ ...prev, districtId: "" }));
    }
  }, [formData.regionId]);

  // Fetch districts
  const fetchDistricts = async (regionId) => {
    setIsLoadingDistricts(true);
    try {
      const response = await api.get(`/location/districts/${regionId}`);
      if (response.data.success) {
        setDistricts(response.data.content);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast.error("Tumanlarni yuklashda xatolik yuz berdi");
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle property value changes
  const handlePropertyChange = (propertyId, value) => {
    setFormData((prev) => ({
      ...prev,
      properties: prev.properties.map((prop) =>
        prop.propertyId === propertyId
          ? { ...prop, value: { ...prop.value, value } }
          : prop
      ),
    }));
  };

  // Handle image drop (unified for all images)
  const onImageDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      // Process each file sequentially
      for (const file of acceptedFiles) {
        // Add to uploading state
        const uploadId =
          Date.now().toString() + Math.random().toString(36).substring(2, 9);
        setUploadingImages((prev) => [
          ...prev,
          { id: uploadId, name: file.name, progress: 0 },
        ]);

        try {
          // Create a preview URL for the image
          const previewUrl = URL.createObjectURL(file);

          // Add the file to our files array
          setImageFiles((prev) => [
            ...prev,
            { file, previewUrl, id: uploadId },
          ]);

          // If this is the first image, set it as main (imageIndex = 0)
          if (imageFiles.length === 0) {
            setFormData((prev) => ({
              ...prev,
              imageIndex: 0,
            }));
          }

          // Update progress
          setUploadingImages((prev) =>
            prev.map((img) =>
              img.id === uploadId ? { ...img, progress: 100 } : img
            )
          );

          // Remove from uploading state after a delay
          setTimeout(() => {
            setUploadingImages((prev) =>
              prev.filter((img) => img.id !== uploadId)
            );
          }, 1000);
        } catch (error) {
          console.error("Error processing image:", error);
          // Update uploading state to show error
          setUploadingImages((prev) =>
            prev.map((img) =>
              img.id === uploadId ? { ...img, error: true } : img
            )
          );

          // Remove from uploading state after a delay
          setTimeout(() => {
            setUploadingImages((prev) =>
              prev.filter((img) => img.id !== uploadId)
            );
          }, 3000);
        }

        // Add a small delay between uploads
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    },
    [imageFiles.length]
  );

  // Remove an image
  const removeImage = (index) => {
    // Remove from imageFiles
    setImageFiles((prev) => prev.filter((_, i) => i !== index));

    // Adjust imageIndex if necessary
    setFormData((prev) => ({
      ...prev,
      imageIndex:
        prev.imageIndex >= index && prev.imageIndex > 0
          ? prev.imageIndex - 1
          : prev.imageIndex >= imageFiles.length - 1
          ? Math.max(0, imageFiles.length - 2)
          : prev.imageIndex,
    }));
  };

  // Set an image as main by updating imageIndex
  const setAsMainImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageIndex: index,
    }));
  };

  // Dropzone hook
  const imageDropzone = useDropzone({
    onDrop: onImageDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 10,
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Sarlavha kiritilishi shart");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Tavsif kiritilishi shart");
      return;
    }

    if (!formData.price || Number.parseFloat(formData.price) <= 0) {
      toast.error("To'g'ri narx kiritilishi shart");
      return;
    }

    if (!formData.categoryId) {
      toast.error("Kategoriya tanlanishi shart");
      return;
    }

    if (!formData.regionId) {
      toast.error("Viloyat tanlanishi shart");
      return;
    }

    if (!formData.districtId) {
      toast.error("Tuman tanlanishi shart");
      return;
    }

    if (imageFiles.length === 0) {
      toast.error("Kamida bitta rasm yuklash shart");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();

      // 1. Text fields
      submitFormData.append("title", formData.title);
      submitFormData.append("description", formData.description);
      submitFormData.append("price", formData.price);
      submitFormData.append("categoryId", formData.categoryId);
      submitFormData.append("paymentType", formData.paymentType);
      submitFormData.append("currencyType", formData.currencyType);
      submitFormData.append("negotiable", formData.negotiable);
      submitFormData.append("regionId", formData.regionId);
      submitFormData.append("districtId", formData.districtId);

      // 2. Image index (which image should be main)
      submitFormData.append("imageIndex", formData.imageIndex.toString());

      // 3. Properties (if any)
      if (formData.properties && formData.properties.length > 0) {
        submitFormData.append(
          "properties",
          JSON.stringify(formData.properties)
        );
      }

      // 4. Add image files to FormData in the correct order
      imageFiles.forEach((imgFile) => {
        submitFormData.append("files", imgFile.file);
      });

      console.log("Files being sent:", imageFiles);
      console.log("Main image index:", formData.imageIndex);

      const response = await api.post("/products", submitFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("E'lon muvaffaqiyatli qo'shildi");

        // Reset form
        setFormData({
          title: "",
          description: "",
          price: "",
          categoryId: "",
          location: "",
          properties: [],
          paymentType: "Pullik",
          currencyType: "UZS",
          negotiable: false,
          regionId: "",
          districtId: "",
          imageIndex: 0,
        });
        setImageFiles([]);
        setSubcategories([]);
        setCategoryProperties([]);
        setDistricts([]);
      } else {
        toast.error(
          response.data?.message || "E'lonni qo'shishda xatolik yuz berdi"
        );
      }
    } catch (error) {
      console.error("E'lonni qo'shishda xatolik:", error);
      toast.error(
        error.response?.data?.message || "E'lonni qo'shishda xatolik yuz berdi"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-full mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Yangi e'lon qo'shish
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Asosiy ma'lumotlar</h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sarlavha <span className="text-red-500">*</span>
                  </label>
                  <StyledInput
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Mahsulot nomini kiriting"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tavsif <span className="text-red-500">*</span>
                  </label>
                  <StyledTextarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mahsulot haqida batafsil ma'lumot"
                    required
                  />
                </div>

                {/* Price */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Narx <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <StyledInput
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="rounded-r-none"
                        placeholder="0"
                        min="0"
                        required
                      />
                      <select
                        name="currencyType"
                        value={formData.currencyType}
                        onChange={handleChange}
                        className="px-3 py-2 border border-l-0 border-gray-200 rounded-r-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="UZS">UZS</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="paymentType"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      To'lov turi
                    </label>
                    <StyledSelect
                      id="paymentType"
                      name="paymentType"
                      value={formData.paymentType}
                      onChange={handleChange}
                    >
                      <option value="Pullik">Pullik</option>
                      <option value="Bepul">Bepul</option>
                    </StyledSelect>
                  </div>
                </div>

                {/* Negotiable */}
                <div className="flex items-center">
                  <StyledCheckbox
                    id="negotiable"
                    name="negotiable"
                    checked={formData.negotiable}
                    onChange={handleChange}
                    label="Narx kelishiladi"
                  />
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Kategoriya</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Main Category */}
                  <div>
                    <label
                      htmlFor="categoryId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Asosiy kategoriya <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <StyledSelect
                        id="categoryId"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                        disabled={isLoadingCategories}
                      >
                        <option value="">Kategoriyani tanlang</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </StyledSelect>
                      {isLoadingCategories && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                          <LoadingSpinner />
                        </div>
                      )}
                    </div>
                  </div>

                  {subcategories.length > 0 && (
                    <div>
                      <label
                        htmlFor="subcategoryId"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Subkategoriya
                      </label>
                      <div className="relative">
                        <StyledSelect
                          id="subcategoryId"
                          name="categoryId"
                          value={selectedSubcategoryId || ""}
                          onChange={(e) => {
                            setSelectedCategoryId(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              categoryId: e.target.value,
                            }));
                          }}
                          disabled={isLoadingSubcategories}
                        >
                          <option value="">Subkategoriyani tanlang</option>
                          {subcategories.map((subcategory) => (
                            <option key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </option>
                          ))}
                        </StyledSelect>
                        {isLoadingSubcategories && (
                          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                            <LoadingSpinner />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Properties - Show only if properties exist */}
            {categoryProperties.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Xususiyatlar</h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categoryProperties.map((property) => (
                      <div key={property.id}>
                        <label
                          htmlFor={`property-${property.id}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {property.name}
                        </label>

                        {property.type === "STRING" && !property.options && (
                          <StyledInput
                            id={`property-${property.id}`}
                            value={
                              formData.properties.find(
                                (p) => p.propertyId === property.id
                              )?.value.value || ""
                            }
                            onChange={(e) =>
                              handlePropertyChange(property.id, e.target.value)
                            }
                            placeholder={`${property.name} kiriting`}
                          />
                        )}

                        {(property.type === "SELECT" ||
                          (property.type === "STRING" && property.options)) && (
                          <StyledSelect
                            id={`property-${property.id}`}
                            value={
                              formData.properties.find(
                                (p) => p.propertyId === property.id
                              )?.value?.value || ""
                            }
                            onChange={(e) =>
                              handlePropertyChange(property.id, e.target.value)
                            }
                          >
                            <option value="">Tanlang</option>
                            {property.options?.map((option, index) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                          </StyledSelect>
                        )}

                        {property.type === "DATE" && (
                          <StyledInput
                            type="date"
                            id={`property-${property.id}`}
                            value={
                              formData.properties.find(
                                (p) => p.propertyId === property.id
                              )?.value.value || ""
                            }
                            onChange={(e) =>
                              handlePropertyChange(property.id, e.target.value)
                            }
                          />
                        )}

                        {property.type === "BOOLEAN" && (
                          <StyledCheckbox
                            id={`property-${property.id}`}
                            checked={
                              formData.properties.find(
                                (p) => p.propertyId === property.id
                              )?.value.value === "true"
                            }
                            onChange={(e) =>
                              handlePropertyChange(
                                property.id,
                                e.target.checked ? "true" : "false"
                              )
                            }
                            label={property.name}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Joylashuv</h2>

              <div className="space-y-4">
                {/* Region and District */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="regionId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Viloyat <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <StyledSelect
                        id="regionId"
                        name="regionId"
                        value={formData.regionId}
                        onChange={handleChange}
                        required
                        disabled={isLoadingRegions}
                      >
                        <option value="">Viloyatni tanlang</option>
                        {regions.map((region) => (
                          <option key={region.id} value={region.id}>
                            {region.name}
                          </option>
                        ))}
                      </StyledSelect>
                      {isLoadingRegions && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                          <LoadingSpinner />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="districtId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tuman <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <StyledSelect
                        id="districtId"
                        name="districtId"
                        value={formData.districtId}
                        onChange={handleChange}
                        required
                        disabled={
                          !formData.regionId ||
                          districts.length === 0 ||
                          isLoadingDistricts
                        }
                      >
                        <option value="">Tumanni tanlang</option>
                        {districts.map((district) => (
                          <option key={district.id} value={district.id}>
                            {district.name}
                          </option>
                        ))}
                      </StyledSelect>
                      {isLoadingDistricts && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                          <LoadingSpinner />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detailed Location */}
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Manzil
                  </label>
                  <StyledInput
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Batafsil manzil"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Rasmlar</h2>

              <div className="space-y-6">
                {/* Image Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rasmlar <span className="text-red-500">*</span>
                  </label>

                  <div
                    {...imageDropzone.getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      imageDropzone.isDragActive
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-gray-300 hover:border-emerald-400 hover:bg-gray-50"
                    }`}
                  >
                    <input {...imageDropzone.getInputProps()} />

                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mx-auto h-12 w-12 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        Rasmlarni yuklash uchun bosing yoki shu yerga tashlang
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG, WEBP (max: 5MB har biri)
                      </p>
                    </div>
                  </div>

                  {/* Display all images */}
                  {imageFiles.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {imageFiles.map((image, index) => (
                        <div key={image.id} className="relative group">
                          <div
                            className={`relative border rounded-md overflow-hidden ${
                              formData.imageIndex === index
                                ? "ring-2 ring-emerald-500"
                                : ""
                            }`}
                          >
                            <img
                              src={image.previewUrl || "/placeholder.svg"}
                              alt={`Product ${index + 1}`}
                              className="h-24 w-full object-cover"
                            />
                            {formData.imageIndex === index && (
                              <div className="absolute top-1 left-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs px-2 py-1 rounded-md">
                                Asosiy
                              </div>
                            )}
                          </div>

                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {formData.imageIndex !== index && (
                              <button
                                type="button"
                                onClick={() => setAsMainImage(index)}
                                className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full p-1 mx-1 shadow-md hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200"
                                title="Asosiy rasm sifatida belgilash"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="bg-red-500 text-white rounded-full p-1 mx-1 shadow-md hover:bg-red-600 transition-all duration-200"
                              title="O'chirish"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Current main image indicator */}
                  {imageFiles.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      Asosiy rasm: {formData.imageIndex + 1}-rasm (
                      {imageFiles.length} ta rasmdan)
                    </div>
                  )}
                </div>

                {/* Uploading Progress */}
                {uploadingImages.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadingImages.map((img) => (
                      <div key={img.id} className="bg-gray-50 rounded-md p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium truncate">
                            {img.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {img.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              img.error
                                ? "bg-red-500"
                                : "bg-gradient-to-r from-emerald-600 to-emerald-700"
                            }`}
                            style={{ width: `${img.progress}%` }}
                          ></div>
                        </div>
                        {img.error && (
                          <p className="text-xs text-red-500 mt-1">
                            Yuklashda xatolik yuz berdi
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-md shadow-sm hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <LoadingSpinner />
                    <span className="ml-2">Yuklanmoqda...</span>
                  </div>
                ) : (
                  "E'lonni qo'shish"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemContainer;
