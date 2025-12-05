"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import api from "../../../config/auth/api";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Image as ImageIcon,
  MapPin,
  CameraIcon,
  Settings,
  Folder,
  DownloadCloud,
  PlusCircle,
} from "lucide-react";

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
    // IXCHAMLASHTIRILGAN STIL
    className={`
      w-full 
      px-3 py-2.5                       
      text-sm                          
      border border-gray-200 
      rounded-xl
      focus:outline-none 
      focus:ring-1 focus:ring-purple-500 focus:border-purple-500  
      transition-all duration-300 
      ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"} 
      ${className}
    `}
    placeholder={placeholder}
    required={required}
    min={min}
    disabled={disabled}
  />
);

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
      className={`w-full appearance-none px-4 py-2 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 pr-10 ${
        disabled ? "bg-gray-50 text-gray-500" : "bg-white"
      } ${className}`}
      required={required}
      disabled={disabled}
    >
      {children}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
      <svg
        className="fill-current h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
      >
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
      </svg>
    </div>
  </div>
);

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
    className={`w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none ${className}`}
    placeholder={placeholder}
    required={required}
  />
);

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
            ? "bg-gradient-to-br from-purple-500 to-purple-600 border-purple-500"
            : "bg-white border-gray-300 group-hover:border-purple-400"
        }`}
      >
        {checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
      </div>
    </div>
    <span className="ml-3 text-gray-700 select-none">{label}</span>
  </label>
);

const LoadingSpinner = ({ size = "small" }) => (
  <Loader2
    className={`animate-spin ${
      size === "small" ? "h-5 w-5" : "h-8 w-8"
    } text-purple-600`}
  />
);

const AddItemContainer = () => {
  const [currentStep, setCurrentStep] = useState(0);
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [uploadingImages, setUploadingImages] = useState([]);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [categoryProperties, setCategoryProperties] = useState([]);

  const steps = [
    { title: "Asosiy", icon: DownloadCloud },
    { title: "Kategoriya", icon: Folder },
    { title: "Xususiyat", icon: Settings },
    { title: "Joylashuv", icon: MapPin },
    { title: "Rasmlar", icon: CameraIcon },
  ];

  useEffect(() => {
    fetchCategories();
    fetchRegions();
  }, []);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await api.get("/category?parentId=null");
      if (response?.data?.success) setCategories(response.data.content);
    } catch (error) {
      toast.error("Kategoriyalarni yuklashda xatolik");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchRegions = async () => {
    setIsLoadingRegions(true);
    try {
      const response = await api.get("/location/regions");
      if (response.data.success) setRegions(response.data.content);
    } catch (error) {
      toast.error("Viloyatlarni yuklashda xatolik");
    } finally {
      setIsLoadingRegions(false);
    }
  };

  useEffect(() => {
    if (formData.regionId) fetchDistricts(formData.regionId);
    else {
      setDistricts([]);
      setFormData((prev) => ({ ...prev, districtId: "" }));
    }
  }, [formData.regionId]);

  const fetchDistricts = async (regionId) => {
    setIsLoadingDistricts(true);
    try {
      const response = await api.get(`/location/districts/${regionId}`);
      if (response.data.success) setDistricts(response.data.content);
    } catch (error) {
      toast.error("Tumanlarni yuklashda xatolik");
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  const fetchSubcategories = async (mainCategoryId) => {
    setIsLoadingSubcategories(true);
    try {
      const response = await api.get(`/category?parentId=${mainCategoryId}`);
      if (response.data.success) setSubcategories(response.data.content);
    } catch (error) {
      toast.error("Subkategoriyalarni yuklashda xatolik");
    } finally {
      setIsLoadingSubcategories(false);
    }
  };

  const fetchCategoryDetails = async (categoryId) => {
    setIsLoadingProperties(true);
    try {
      const response = await api.get(`/category/${categoryId}`);
      if (response.data.success) {
        const props = response.data.content.properties || [];
        setCategoryProperties(props);

        const initial = props.map((p) => ({
          propertyId: p.id,
          type: p.type,
          value: p.type === "BOOLEAN" ? "false" : "",
        }));

        setFormData((prev) => ({ ...prev, properties: initial }));
      }
    } catch (error) {
      toast.error("Xususiyatlarni yuklashda xatolik");
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
      properties: prev.properties.map((p) =>
        p.propertyId === propertyId ? { ...p, value } : p
      ),
    }));
  };

  const onImageDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    for (const file of acceptedFiles) {
      const uploadId = Date.now() + Math.random();
      setUploadingImages((prev) => [
        ...prev,
        { id: uploadId, name: file.name, progress: 0 },
      ]);

      try {
        const previewUrl = URL.createObjectURL(file);
        setImageFiles((prev) => [...prev, { file, previewUrl, id: uploadId }]);

        setUploadingImages((prev) =>
          prev.map((img) =>
            img.id === uploadId ? { ...img, progress: 100 } : img
          )
        );

        setTimeout(() => {
          setUploadingImages((prev) =>
            prev.filter((img) => img.id !== uploadId)
          );
        }, 1000);
      } catch (error) {
        setUploadingImages((prev) =>
          prev.map((img) =>
            img.id === uploadId ? { ...img, error: true } : img
          )
        );
      }
      await new Promise((r) => setTimeout(r, 500));
    }
  }, []);

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      imageIndex:
        prev.imageIndex >= index && prev.imageIndex > 0
          ? prev.imageIndex - 1
          : prev.imageIndex,
    }));
  };

  const setAsMainImage = (index) => {
    setFormData((prev) => ({ ...prev, imageIndex: index }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onImageDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 10,
  });

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
        if (categoryProperties.length > 0) {
          const allFilled = categoryProperties.every((prop) => {
            const userValue =
              formData.properties.find((p) => p.propertyId === prop.id)
                ?.value ?? "";
            if (prop.type === "BOOLEAN") return true;
            return userValue.toString().trim() !== "";
          });
          if (!allFilled) {
            toast.error("Barcha xususiyatlarni to'ldiring");
            return false;
          }
        }
        return true;

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
    if (!validateStep(currentStep)) return;

    if (currentStep === 2 && categoryProperties.length === 0) {
      setCurrentStep(3);
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep === 3 && categoryProperties.length === 0) {
      setCurrentStep(1);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
      if (formData.properties.length > 0) {
        submitFormData.append(
          "properties",
          JSON.stringify(formData.properties)
        );
      }
      imageFiles.forEach((img) => submitFormData.append("files", img.file));

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
        setCategoryProperties([]);
        setSubcategories([]);
        setDistricts([]);
        setCurrentStep(0);
      } else {
        toast.error(response.data?.message || "Xatolik yuz berdi");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "E'lon qo'shishda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    // Styling uchun ishlatiladigan asosiy rang
    const PRIMARY_COLOR = "#A64AC9";

    // Iconlar (masalan, lucide-react'dan)
    const { Check, X, ImageIcon } = {
      Check: (props) => (
        <svg {...props}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ),
      X: (props) => (
        <svg {...props}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      ),
      ImageIcon: (props) => (
        <svg {...props}>
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      ),
    };

    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Sarlavha <span className="text-red-500">*</span>
              </label>
              <StyledInput
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Mahsulot nomini kiriting"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tavsif <span className="text-red-500">*</span>
              </label>
              <StyledTextarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2} // rows 5 o'rniga 4
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Narx <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <StyledInput
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="rounded-r-none"
                    min="0"
                    required
                  />
                  <select
                    name="currencyType"
                    value={formData.currencyType}
                    onChange={handleChange}
                    className="px-3 py-2 border border-l-0 border-gray-200 rounded-r-xl bg-gray-50 text-sm" // padding va border kichiklashtirildi
                  >
                    <option value="UZS">UZS</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  To'lov turi
                </label>
                <StyledSelect
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleChange}
                >
                  <option value="Pullik">Pullik</option>
                  <option value="Bepul">Bepul</option>
                </StyledSelect>
              </div>
            </div>
            <div>
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Asosiy kategoriya <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <StyledSelect
                  value={mainCategoryId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setMainCategoryId(id);
                    setSubcategoryId("");
                    setSubcategories([]);
                    setFormData((prev) => ({ ...prev, categoryId: id }));
                    if (id) {
                      fetchSubcategories(id);
                      fetchCategoryDetails(id);
                    }
                  }}
                  disabled={isLoadingCategories}
                >
                  <option value="">Tanlang</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </StyledSelect>
                {isLoadingCategories && (
                  // Loading spinner ixchamlashtirildi (right-12 o'rniga right-3)
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <LoadingSpinner className="w-5 h-5 text-purple-600" />
                  </div>
                )}
              </div>
            </div>
            {subcategories.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Subkategoriya
                </label>
                <StyledSelect
                  value={subcategoryId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSubcategoryId(id);
                    const finalId = id || mainCategoryId;
                    setFormData((prev) => ({ ...prev, categoryId: finalId }));
                    fetchCategoryDetails(finalId);
                  }}
                  disabled={isLoadingSubcategories}
                >
                  <option value="">Tanlang</option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </StyledSelect>
              </div>
            )}
          </div>
        );

      // --- 3-BOSQICH: Kategoriya Xususiyatlari (Dynamic Properties) ---
      case 2:
        if (categoryProperties.length === 0) {
          return (
            <div className="text-center py-10">
              <p className="text-base text-gray-600">
                Bu kategoriya uchun qo'shimcha xususiyatlar mavjud emas
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoryProperties.map((prop) => {
                const userVal =
                  formData.properties.find((p) => p.propertyId === prop.id)
                    ?.value ?? "";
                return (
                  <div key={prop.id}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      {prop.name}
                    </label>

                    {prop.type === "STRING" && !prop.options && (
                      <StyledInput
                        value={userVal}
                        onChange={(e) =>
                          handlePropertyChange(prop.id, e.target.value)
                        }
                        placeholder={prop.name}
                      />
                    )}

                    {prop.type === "NUMBER" || prop.type === "INT" && (
                      <StyledInput
                        type="number"
                        value={userVal}
                        onChange={(e) =>
                          handlePropertyChange(prop.id, e.target.value)
                        }
                      />
                    )}

                    {(prop.type === "SELECT" || prop.options) && (
                      <StyledSelect
                        value={userVal}
                        onChange={(e) =>
                          handlePropertyChange(prop.id, e.target.value)
                        }
                      >
                        <option value="">Tanlang</option>
                        {prop.options?.map((o, i) => (
                          <option key={i} value={o}>
                            {o}
                          </option>
                        ))}
                      </StyledSelect>
                    )}

                    {prop.type === "DATE" && (
                      <StyledInput
                        type="date"
                        value={userVal}
                        onChange={(e) =>
                          handlePropertyChange(prop.id, e.target.value)
                        }
                      />
                    )}

                    {prop.type === "BOOLEAN" && (
                      <div className="pt-1">
                        <StyledCheckbox
                          id={`bool-${prop.id}`}
                          checked={userVal === "true"}
                          onChange={(e) =>
                            handlePropertyChange(
                              prop.id,
                              e.target.checked ? "true" : "false"
                            )
                          }
                          label={prop.name}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      // --- 4-BOSQICH: Manzil ma'lumotlari ---
      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Viloyat <span className="text-red-500">*</span>
                </label>
                <StyledSelect
                  name="regionId"
                  value={formData.regionId}
                  onChange={handleChange}
                  disabled={isLoadingRegions}
                >
                  <option value="">Tanlang</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </StyledSelect>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tuman <span className="text-red-500">*</span>
                </label>
                <StyledSelect
                  name="districtId"
                  value={formData.districtId}
                  onChange={handleChange}
                  disabled={!formData.regionId || isLoadingDistricts}
                >
                  <option value="">Tanlang</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </StyledSelect>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Batafsil manzil (ixtiyoriy)
              </label>
              <StyledInput
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ko'cha, uy raqami..."
              />
            </div>
          </div>
        );

      // --- 5-BOSQICH: Rasmlar (Images) ---
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rasmlar <span className="text-red-500">*</span>
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  // rounded-3xl -> rounded-2xl, p-8 -> p-6
                  isDragActive
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-300 hover:border-emerald-400"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center mb-3">
                    <ImageIcon
                      className="w-6 h-6"
                      style={{ color: PRIMARY_COLOR }}
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-0.5">
                    Rasmlarni yuklash uchun bosing yoki shu yerga tashlang
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP (max: 5MB)
                  </p>
                </div>
              </div>

              {imageFiles.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between mb-2">
                    <p className="text-xs font-medium">
                      Yuklangan rasmlar ({imageFiles.length})
                    </p>
                    <p className="text-xs text-gray-500">
                      Asosiy: {formData.imageIndex + 1}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {imageFiles.map((img, i) => (
                      <div key={img.id} className="relative group">
                        <div
                          className={`relative rounded-xl overflow-hidden transition-all ${
                            // rounded-2xl -> rounded-xl
                            formData.imageIndex === i
                              ? `ring-3 ring-[${PRIMARY_COLOR}] shadow-md` // ring-4 -> ring-3
                              : "ring-1 ring-gray-200" // ring-2 -> ring-1
                          }`}
                        >
                          <img
                            src={img.previewUrl}
                            alt=""
                            className="h-24 w-full object-cover" // h-32 -> h-24
                          />
                          {formData.imageIndex === i && (
                            <div className="absolute top-1.5 left-1.5 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" /> Asosiy
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                          <div className="flex gap-1.5">
                            {formData.imageIndex !== i && (
                              <button
                                type="button"
                                onClick={() => setAsMainImage(i)}
                                className="bg-white/90 p-1.5 rounded-full" // p-2 -> p-1.5
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="bg-red-500/90 p-1.5 rounded-full text-white" // p-2 -> p-1.5
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
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const PRIMARY_COLOR = "#A64AC9";
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-full">
        <div className="flex flex-row items-center justify-between flex-wrap mb-6">
          {steps.map((step, i) => {
            const isCompleted = i < currentStep;
            const isActive = i === currentStep;
            const StepIcon = step.icon;
            const PRIMARY_COLOR = "#A64AC9";

            return (
              <div
                key={i}
                className="flex flex-col items-center justify-center relative sm:mb-0 w-[60px]"
              >
                {i > 0 && (
                  <div
                    className="absolute left-0 top-5 h-0.5 hidden sm:block"
                    style={{
                      width: "100%",
                      backgroundColor: isCompleted ? PRIMARY_COLOR : "#E5E7EB",
                    }}
                  />
                )}

                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                    isCompleted || isActive
                      ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  } ${isActive ? "ring-3 ring-purple-100 shadow-sm" : ""}`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>

                {/* Title */}
                <p
                  className={`text-[10px] mt-1 text-center truncate ${
                    isCompleted || isActive
                      ? "text-gray-900 font-semibold"
                      : "text-gray-500 font-medium"
                  }`}
                >
                  {i + 1}. {step.title}
                </p>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl shadow-sm px-4 py-2  min-h-[400px]">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {steps[currentStep].title}
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mt-2"></div>
            </div>
            {renderStepContent()}
          </div>

          <div className=" gap-4 grid grid-cols-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2  mt-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Orqaga
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 px-6 mt-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-purple-700 flex items-center justify-center gap-2"
              >
                Keyingisi
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 mt-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-2xl text-sm hover:from-purple-600 hover:to-purple-700 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner /> Yuklanmoqda...
                  </>
                ) : (
                  <>E&apos;lonni joylashtirish</>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemContainer;
