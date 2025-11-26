"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import api from "../../../config/auth/api";
import { Loader2, ChevronLeft, ChevronRight, Check, X, Image as ImageIcon } from "lucide-react";

// Custom input component with modern design
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
    className={`w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 ${
      disabled ? "bg-gray-50 text-gray-500" : "bg-white"
    } ${className}`}
    placeholder={placeholder}
    required={required}
    min={min}
    disabled={disabled}
  />
);

// Custom select component
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
      className={`w-full appearance-none px-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 pr-10 ${
        disabled ? "bg-gray-50 text-gray-500" : "bg-white"
      } ${className}`}
      required={required}
      disabled={disabled}
    >
      {children}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
      <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
      </svg>
    </div>
  </div>
);

// Custom textarea component
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
    className={`w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 resize-none ${className}`}
    placeholder={placeholder}
    required={required}
  />
);

// Custom checkbox component
const StyledCheckbox = ({ id, name, checked, onChange, label }) => (
  <label htmlFor={id} className="flex items-center cursor-pointer group">
    <div className="relative">
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div
        className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${
          checked
            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-500"
            : "bg-white border-gray-300 group-hover:border-emerald-400"
        }`}
      >
        {checked && (
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        )}
      </div>
    </div>
    <span className="ml-3 text-gray-700 select-none">{label}</span>
  </label>
);

// Loading spinner component
const LoadingSpinner = ({ size = "small" }) => (
  <Loader2
    className={`animate-spin ${
      size === "small" ? "h-5 w-5" : "h-8 w-8"
    } text-emerald-600`}
  />
);

const AddItemContainer = () => {
  // Current step (0-4)
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

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
    imageIndex: 0,
  });

  const [mainCategoryId, setMainCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
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
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [categoryProperties, setCategoryProperties] = useState([]);

  const steps = [
    { title: "Asosiy ma'lumot", icon: "📝" },
    { title: "Kategoriya", icon: "📂" },
    { title: "Xususiyatlar", icon: "⚙️" },
    { title: "Joylashuv", icon: "📍" },
    { title: "Rasmlar", icon: "📷" },
  ];

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    fetchRegions();
  }, []);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await api.get("/category?parentId=null");
      if (response?.data?.success) {
        setCategories(response.data.content);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Kategoriyalarni yuklashda xatolik yuz berdi");
    } finally {
      setIsLoadingCategories(false);
    }
  };

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

  useEffect(() => {
    if (formData.regionId) {
      fetchDistricts(formData.regionId);
    } else {
      setDistricts([]);
      setFormData((prev) => ({ ...prev, districtId: "" }));
    }
  }, [formData.regionId]);

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

  const fetchSubcategories = async (mainCategoryId) => {
    setIsLoadingSubcategories(true);
    try {
      const response = await api.get(`/category?parentId=${mainCategoryId}`);
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

  const fetchCategoryDetails = async (categoryId) => {
    setIsLoadingProperties(true);
    try {
      const response = await api.get(`/category/${categoryId}`);
      if (response.data.success) {
        const categoryData = response.data.content;
        setCategoryProperties(categoryData.properties || []);

        const initialProperties = (categoryData.properties || []).map((prop) => ({
          propertyId: prop.id,
          type: prop.type,
          value: {
            key: prop.name,
            value: "",
          },
        }));

        setFormData((prev) => ({
          ...prev,
          properties: initialProperties,
        }));
      }
    } catch (error) {
      console.error("Error fetching category details:", error);
      toast.error("Kategoriya xususiyatlarini yuklashda xatolik yuz berdi");
    } finally {
      setIsLoadingProperties(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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

  const onImageDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      for (const file of acceptedFiles) {
        const uploadId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
        setUploadingImages((prev) => [...prev, { id: uploadId, name: file.name, progress: 0 }]);

        try {
          const previewUrl = URL.createObjectURL(file);
          setImageFiles((prev) => [...prev, { file, previewUrl, id: uploadId }]);

          if (imageFiles.length === 0) {
            setFormData((prev) => ({ ...prev, imageIndex: 0 }));
          }

          setUploadingImages((prev) =>
            prev.map((img) => (img.id === uploadId ? { ...img, progress: 100 } : img))
          );

          setTimeout(() => {
            setUploadingImages((prev) => prev.filter((img) => img.id !== uploadId));
          }, 1000);
        } catch (error) {
          console.error("Error processing image:", error);
          setUploadingImages((prev) =>
            prev.map((img) => (img.id === uploadId ? { ...img, error: true } : img))
          );

          setTimeout(() => {
            setUploadingImages((prev) => prev.filter((img) => img.id !== uploadId));
          }, 3000);
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    },
    [imageFiles.length]
  );

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
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

  const setAsMainImage = (index) => {
    setFormData((prev) => ({ ...prev, imageIndex: index }));
  };

  const imageDropzone = useDropzone({
    onDrop: onImageDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 10,
  });

  // Step validation
  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!formData.title.trim()) {
          toast.error("Sarlavha kiritilishi shart");
          return false;
        }
        if (!formData.description.trim()) {
          toast.error("Tavsif kiritilishi shart");
          return false;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
          toast.error("To'g'ri narx kiritilishi shart");
          return false;
        }
        return true;
      case 1:
        if (!formData.categoryId) {
          toast.error("Kategoriya tanlanishi shart");
          return false;
        }
        return true;
      case 2:
        return true; // Properties are optional
      case 3:
        if (!formData.regionId) {
          toast.error("Viloyat tanlanishi shart");
          return false;
        }
        if (!formData.districtId) {
          toast.error("Tuman tanlanishi shart");
          return false;
        }
        return true;
      case 4:
        if (imageFiles.length === 0) {
          toast.error("Kamida bitta rasm yuklash shart");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2 && categoryProperties.length === 0) {
        // Skip properties step if no properties
        setDirection(1);
        setCurrentStep(3);
      } else if (currentStep < steps.length - 1) {
        setDirection(1);
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      if (currentStep === 3 && categoryProperties.length === 0) {
        // Skip properties step if no properties
        setDirection(-1);
        setCurrentStep(1);
      } else {
        setDirection(-1);
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append("title", formData.title);
      submitFormData.append("description", formData.description);
      submitFormData.append("price", formData.price);
      submitFormData.append("categoryId", formData.categoryId);
      submitFormData.append("paymentType", formData.paymentType);
      submitFormData.append("currencyType", formData.currencyType);
      submitFormData.append("negotiable", formData.negotiable);
      submitFormData.append("regionId", formData.regionId);
      submitFormData.append("districtId", formData.districtId);
      submitFormData.append("imageIndex", formData.imageIndex.toString());

      if (formData.properties && formData.properties.length > 0) {
        submitFormData.append("properties", JSON.stringify(formData.properties));
      }

      imageFiles.forEach((imgFile) => {
        submitFormData.append("files", imgFile.file);
      });

      const response = await api.post("/products", submitFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success("E'lon muvaffaqiyatli qo'shildi");
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
        setMainCategoryId("");
        setSubcategoryId("");
        setCurrentStep(0);
      } else {
        toast.error(response.data?.message || "E'lonni qo'shishda xatolik yuz berdi");
      }
    } catch (error) {
      console.error("E'lonni qo'shishda xatolik:", error);
      toast.error(error.response?.data?.message || "E'lonni qo'shishda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    const slideVariants = {
      initial: (direction) => ({
        x: direction > 0 ? 50 : -50,
        opacity: 0,
      }),
      animate: {
        x: 0,
        opacity: 1,
        transition: {
          duration: 0.3,
          ease: "easeOut",
        },
      },
      exit: (direction) => ({
        x: direction > 0 ? -50 : 50,
        opacity: 0,
        transition: {
          duration: 0.2,
          ease: "easeIn",
        },
      }),
    };

    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
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

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Tavsif <span className="text-red-500">*</span>
              </label>
              <StyledTextarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mahsulot haqida batafsil ma'lumot"
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="px-4 py-2 border border-l-0 border-gray-200 rounded-r-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="UZS">UZS</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="paymentType" className="block text-sm font-semibold text-gray-700 mb-2">
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

            <div className="pt-2">
              <StyledCheckbox
                id="negotiable"
                name="negotiable"
                checked={formData.negotiable}
                onChange={handleChange}
                label="Narx kelishiladi"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label htmlFor="mainCategoryId" className="block text-sm font-semibold text-gray-700 mb-2">
                Asosiy kategoriya <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <StyledSelect
                  id="mainCategoryId"
                  name="mainCategoryId"
                  value={mainCategoryId}
                  onChange={(e) => {
                    const selectedMainCategoryId = e.target.value;
                    setMainCategoryId(selectedMainCategoryId);
                    setSubcategoryId("");
                    setSubcategories([]);
                    setFormData((prev) => ({ ...prev, categoryId: selectedMainCategoryId }));
                    if (selectedMainCategoryId) {
                      fetchSubcategories(selectedMainCategoryId);
                      fetchCategoryDetails(selectedMainCategoryId);
                    }
                  }}
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
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <LoadingSpinner />
                  </div>
                )}
              </div>
            </div>

            {subcategories.length > 0 && (
              <div>
                <label htmlFor="subcategoryId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subkategoriya
                </label>
                <div className="relative">
                  <StyledSelect
                    id="subcategoryId"
                    name="subcategoryId"
                    value={subcategoryId}
                    onChange={(e) => {
                      const selectedSubcategoryId = e.target.value;
                      setSubcategoryId(selectedSubcategoryId);
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: selectedSubcategoryId || mainCategoryId,
                      }));
                      if (selectedSubcategoryId) {
                        fetchCategoryDetails(selectedSubcategoryId);
                      } else if (mainCategoryId) {
                        fetchCategoryDetails(mainCategoryId);
                      }
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
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                      <LoadingSpinner />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        if (categoryProperties.length === 0) {
          return (
            <div className="text-center py-12 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <span className="text-3xl">⚙️</span>
              </div>
              <p className="text-gray-600">Bu kategoriya uchun xususiyatlar mavjud emas</p>
            </div>
          );
        }

        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoryProperties.map((property) => (
                <div key={property.id}>
                  <label htmlFor={`property-${property.id}`} className="block text-sm font-semibold text-gray-700 mb-2">
                    {property.name}
                  </label>

                  {property.type === "STRING" && !property.options && (
                    <StyledInput
                      id={`property-${property.id}`}
                      value={formData.properties.find((p) => p.propertyId === property.id)?.value.value || ""}
                      onChange={(e) => handlePropertyChange(property.id, e.target.value)}
                      placeholder={`${property.name} kiriting`}
                    />
                  )}

                  {(property.type === "SELECT" || (property.type === "STRING" && property.options)) && (
                    <StyledSelect
                      id={`property-${property.id}`}
                      value={formData.properties.find((p) => p.propertyId === property.id)?.value?.value || ""}
                      onChange={(e) => handlePropertyChange(property.id, e.target.value)}
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
                      value={formData.properties.find((p) => p.propertyId === property.id)?.value.value || ""}
                      onChange={(e) => handlePropertyChange(property.id, e.target.value)}
                    />
                  )}

                  {property.type === "BOOLEAN" && (
                    <div className="pt-2">
                      <StyledCheckbox
                        id={`property-${property.id}`}
                        checked={formData.properties.find((p) => p.propertyId === property.id)?.value.value === "true"}
                        onChange={(e) => handlePropertyChange(property.id, e.target.checked ? "true" : "false")}
                        label={property.name}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="regionId" className="block text-sm font-semibold text-gray-700 mb-2">
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
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                      <LoadingSpinner />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="districtId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Tuman <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <StyledSelect
                    id="districtId"
                    name="districtId"
                    value={formData.districtId}
                    onChange={handleChange}
                    required
                    disabled={!formData.regionId || districts.length === 0 || isLoadingDistricts}
                  >
                    <option value="">Tumanni tanlang</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </StyledSelect>
                  {isLoadingDistricts && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                      <LoadingSpinner />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                Batafsil manzil (ixtiyoriy)
              </label>
              <StyledInput
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ko'cha, uy raqami..."
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Rasmlar <span className="text-red-500">*</span>
              </label>

              <div
                {...imageDropzone.getRootProps()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  imageDropzone.isDragActive
                    ? "border-emerald-400 bg-emerald-50 scale-[1.02]"
                    : "border-gray-300 hover:border-emerald-400 hover:bg-gray-50"
                }`}
              >
                <input {...imageDropzone.getInputProps()} />
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-base font-medium text-gray-700 mb-1">
                    Rasmlarni yuklash uchun bosing yoki shu yerga tashlang
                  </p>
                  <p className="text-sm text-gray-500">PNG, JPG, WEBP (max: 5MB har biri)</p>
                </div>
              </div>

              {imageFiles.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      Yuklangan rasmlar ({imageFiles.length})
                    </p>
                    <p className="text-xs text-gray-500">
                      Asosiy rasm: {formData.imageIndex + 1}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {imageFiles.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <div
                          className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                            formData.imageIndex === index
                              ? "ring-4 ring-emerald-500 shadow-lg scale-105"
                              : "ring-2 ring-gray-200 hover:ring-emerald-300"
                          }`}
                        >
                          <img
                            src={image.previewUrl}
                            alt={`Product ${index + 1}`}
                            className="h-32 w-full object-cover"
                          />
                          {formData.imageIndex === index && (
                            <div className="absolute top-2 left-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Asosiy
                            </div>
                          )}
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent rounded-2xl flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="flex gap-2">
                            {formData.imageIndex !== index && (
                              <button
                                type="button"
                                onClick={() => setAsMainImage(index)}
                                className="bg-white/90 backdrop-blur-sm text-gray-700 rounded-full p-2 shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
                                title="Asosiy rasm"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="bg-red-500/90 backdrop-blur-sm text-white rounded-full p-2 shadow-lg hover:bg-red-600 hover:scale-110 transition-all duration-200"
                              title="O'chirish"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadingImages.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadingImages.map((img) => (
                    <div key={img.id} className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 truncate">{img.name}</span>
                        <span className="text-xs text-gray-500">{img.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            img.error ? "bg-red-500" : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                          }`}
                          style={{ width: `${img.progress}%` }}
                        ></div>
                      </div>
                      {img.error && <p className="text-xs text-red-500 mt-1">Yuklashda xatolik yuz berdi</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Yangi e'lon qo'shish</h1>
          <p className="text-gray-600 text-sm sm:text-base">Ma'lumotlarni to'ldiring va e'loningizni joylashtiring</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl transition-all duration-300 ${
                    index < currentStep
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md"
                      : index === currentStep
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg ring-4 ring-emerald-100"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {index < currentStep ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : step.icon}
                </div>
                <p
                  className={`text-xs sm:text-sm mt-2 text-center transition-all duration-300 ${
                    index <= currentStep ? "text-gray-900 font-semibold" : "text-gray-400"
                  }`}
                >
                  <span className="hidden sm:inline">{step.title}</span>
                </p>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block absolute h-1 transition-all duration-500 ${
                      index < currentStep ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                    style={{
                      width: "calc(100% / 5 - 48px)",
                      left: `calc((100% / 5) * ${index + 1} - (100% / 10))`,
                      top: "24px",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="sm:hidden">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 mb-6 min-h-[400px]">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{steps[currentStep].title}</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"></div>
            </div>
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 sm:gap-4">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 sm:flex-none px-6 py-3.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Orqaga</span>
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <span>Keyingisi</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner />
                    <span>Yuklanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>E'lonni joylashtirish</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AddItemContainer;