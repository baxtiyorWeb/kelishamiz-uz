"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  X,
  Save,
  Trash2,
  UploadCloud,
  MapPin,
  Tag,
  Package,
  GripVertical,
  Star,
  ChevronDown,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import api from "../../../config/auth/api";

// Validation Schema
const validationSchema = yup.object().shape({
  title: yup.string().required("Sarlavha majburiy"),
  description: yup.string().required("Tavsif majburiy"),
  price: yup
    .number()
    .typeError("Narx raqam bo'lishi kerak")
    .required("Narx majburiy")
    .positive("Narx musbat bo'lishi kerak"),
  currencyType: yup.string().required("Valyuta majburiy"),
  categoryId: yup.number().required("Kategoriya majburiy"),
  regionId: yup.number().required("Viloyat majburiy"),
  districtId: yup.number().required("Tuman majburiy"),
  paymentType: yup.string().required("To'lov turi majburiy"),
  negotiable: yup.boolean(),
});

const SectionBox = ({ title, children, icon: Icon }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
    <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-3">
      <Icon size={24} className="text-purple-600" />
      {title}
    </h3>
    {children}
  </div>
);

const ControlledInput = ({ control, name, label, ...rest }) => {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>

      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <input {...field} {...rest} className="form-control" />
        )}
      />
    </div>
  );
};
const ControlledSelect = ({
  control,
  name,
  label,
  options = [],
  activeSelect,
  setActiveSelect,
}) => {
  const isOpen = activeSelect === name;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const selected = options.find((o) => o.value == field.value);

        return (
          <div
            className="mb-4 relative"
            onClick={(e) => e.stopPropagation()} // window clickdan himoya
          >
            <label className="block text-sm font-medium mb-1">{label}</label>

            {/* Select Button */}
            <button
              type="button"
              onClick={() => setActiveSelect(isOpen ? null : name)}
              className="w-full flex justify-between items-center px-4 py-2 border rounded-lg bg-white shadow-sm hover:border-purple-500 transition"
            >
              <span className="text-gray-700">
                {selected ? selected.label : "Tanlang..."}
              </span>
              <ChevronDown
                size={18}
                className={`${isOpen ? "rotate-180" : ""} transition`}
              />
            </button>

            {/* Dropdown */}
            {isOpen && (
              <ul className="absolute z-20 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                {options.map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => {
                      field.onChange(opt.value);
                      setActiveSelect(null); // tanlangandan keyin yopish
                    }}
                    className={`px-4 py-2 cursor-pointer hover:bg-purple-50 ${
                      field.value == opt.value
                        ? "bg-purple-100 font-medium"
                        : ""
                    }`}
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }}
    />
  );
};

// Sortable Image Item
const SortableImage = ({ image, index, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group aspect-square rounded-xl overflow-hidden border-2 ${
        index === 0
          ? "border-purple-500 ring-4 ring-purple-200"
          : "border-gray-200"
      } ${isDragging ? "z-50 shadow-2xl" : "shadow-md"}`}
    >
      <img
        src={image.previewUrl || image.url}
        alt=""
        className="w-full h-full object-cover"
      />

      {/* Asosiy rasm belgilovi */}
      {index === 0 && (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
          <Star size={14} fill="white" />
          Asosiy
        </div>
      )}

      {/* Yangi yuklangan */}
      {image.isNew && (
        <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
          Yangi
        </div>
      )}

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-move flex items-center justify-center"
      >
        <GripVertical size={36} className="text-white drop-shadow-lg" />
      </div>

      {/* O'chirish tugmasi */}
      <button
        type="button"
        onClick={() => onRemove(image.id)}
        className="absolute bottom-3 right-3 p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

// Image Upload Zone
const ImageUploadDropzone = ({ images, setImages, max = 10 }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);

      if (images.length >= max) return;

      const files = Array.from(e.dataTransfer.files)
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, max - images.length);

      const newImages = files.map((file) => ({
        id: `new-${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        isNew: true,
      }));

      setImages((prev) => [...prev, ...newImages]);
    },
    [images.length, max, setImages]
  );

  const handleChange = (e) => {
    if (!e.target.files || images.length >= max) return;

    const files = Array.from(e.target.files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, max - images.length);

    const newImages = files.map((file) => ({
      id: `new-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      isNew: true,
    }));

    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">
          {images.length} / {max} ta rasm
        </span>
        {images.length > 0 && (
          <span className="text-xs text-purple-600 font-medium">
            Birinchi rasm – asosiy rasm
          </span>
        )}
      </div>

      {/* Dropzone */}
      <label
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragOver(true)}
        onDragLeave={() => setIsDragOver(false)}
        className={`block border-3 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? "border-purple-500 bg-purple-50 scale-105 shadow-2xl"
            : images.length >= max
            ? "border-gray-300 bg-gray-50 opacity-60 cursor-not-allowed"
            : "border-purple-300 bg-purple-50/50 hover:border-purple-500 hover:bg-purple-100"
        }`}
      >
        <UploadCloud
          size={56}
          className={`mx-auto mb-4 transition-colors ${
            isDragOver ? "text-purple-600" : "text-purple-500"
          }`}
        />
        <p className="text-lg font-bold text-gray-800">Rasm yuklang</p>
        <p className="text-sm text-gray-600 mt-1">
          Suratni bosing yoki bu yerga tashlang
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          disabled={images.length >= max}
          className="hidden"
        />
      </label>

      {/* Rasmlar ro'yxati */}
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-5">
              {images.map((image, index) => (
                <SortableImage
                  key={image.id}
                  image={image}
                  index={index}
                  onRemove={removeImage}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

// Asosiy komponent
const ProductUpdateModal = ({
  isOpen,
  onClose,
  productData,
  productId,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [dynamicProps, setDynamicProps] = useState([]);
  const [images, setImages] = useState([]);
  const [activeSelect, setActiveSelect] = useState(null);

  const closeAllSelects = () => setActiveSelect(null);

  // click outside → yopish
  useEffect(() => {
    const handleClick = () => closeAllSelects();
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const selectedRegionId = useWatch({ control, name: "regionId" });
  const selectedCategoryId = useWatch({ control, name: "categoryId" });

  // Ma'lumotlarni yuklash
  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, regRes] = await Promise.all([
          api.get("/category"),
          api.get("/location/regions"),
        ]);
        setCategories(catRes.data.content || []);
        setRegions(regRes.data.content || []);
      } catch (err) {
        console.error("Ma'lumot yuklashda xato", err);
      }
    };
    load();
  }, []);

  // Tumanlar
  useEffect(() => {
    if (selectedRegionId) {
      api.get(`/location/districts/${selectedRegionId}`).then((res) => {
        setDistricts(res.data.content || []);
      });
    } else {
      setDistricts([]);
      setValue("districtId", "");
    }
  }, [selectedRegionId, setValue]);

  // Dinamik xususiyatlar
  useEffect(() => {
    if (selectedCategoryId) {
      api.get(`/category/${selectedCategoryId}/properties`).then((res) => {
        setDynamicProps(res.data.content?.properties || []);
      });
    } else {
      setDynamicProps([]);
    }
  }, [selectedCategoryId]);

  // productData o'zgarganda to'ldirish
  useEffect(() => {
    if (!productData) {
      reset({});
      setImages([]);
      return;
    }

    const propsObj = {};
    productData.propertyValues?.forEach((pv) => {
      propsObj[`prop_${pv.propertyId}`] = pv.value?.value || pv.value;
    });

    reset({
      title: productData.title || "",
      description: productData.description || "",
      price: productData.price || "",
      currencyType: productData.currencyType || "UZS",
      categoryId: productData.category?.id || "",
      regionId: productData.region?.id || "",
      districtId: productData.district?.id || "",
      paymentType: productData.paymentType || "card",
      negotiable: productData.negotiable || false,
      ...propsObj,
    });

    const existingImages = (productData.images || [])
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((img) => ({
        id: img.id,
        url: img.url,
        isNew: false,
      }));

    setImages(existingImages);
  }, [productData, reset]);

  const onSubmit = async (data) => {
    if (!productId) return;

    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && !key.startsWith("prop_")) {
          formData.append(key, value);
        }
      });

      const properties = dynamicProps
        .map((prop) => {
          const value = data[`prop_${prop.id}`];
          if (value === undefined || value === "" || value === null)
            return null;
          return {
            propertyId: prop.id,
            type: prop.type,
            value: { key: prop.name, value: String(value) },
          };
        })
        .filter(Boolean);

      if (properties.length > 0) {
        formData.append("properties", JSON.stringify(properties));
      }

      const imagesData = images.map((img, index) => ({
        id: img.id || null,
        url: img.url || "",
        order: index,
      }));
      formData.append("images", JSON.stringify(imagesData));

      images.forEach((img) => {
        if (img.isNew && img.file) {
          formData.append("files", img.file);
        }
      });

      formData.append("imageIndex", "0");

      await api.patch(`/products/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("E'lon muvaffaqiyatli yangilandi!");
      onSave?.();
      onClose();
    } catch (err) {
      alert("Xato: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !productData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center z-10 rounded-t-3xl">
          <h2 className="text-3xl font-bold flex items-center gap-4 text-gray-800">
            <Package className="text-purple-600" size={36} />
            E'lonni tahrirlash
          </h2>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-full transition"
          >
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Chap taraf */}
            <div className="lg:col-span-2 space-y-8">
              <SectionBox title="Asosiy ma'lumotlar" icon={Package}>
                <div className="space-y-5">
                  <ControlledInput
                    control={control}
                    name="title"
                    label="Sarlavha *"
                    error={errors.title}
                  />
                  <Controller
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Tavsif *
                        </label>
                        <textarea
                          {...field}
                          rows={6}
                          className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition"
                          placeholder="Mahsulot haqida batafsil yozing..."
                        />
                        {errors.description && (
                          <p className="text-red-500 text-xs">
                            {errors.description.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  <div className="grid sm:grid-cols-2 gap-5">
                    <ControlledInput
                      control={control}
                      name="price"
                      label="Narx *"
                      type="number"
                      error={errors.price}
                    />
                    <ControlledSelect
                      control={control}
                      name="currencyType"
                      label="Valyuta"
                      error={errors.currencyType}
                      options={[
                        { value: "UZS", label: "UZS" },
                        { value: "USD", label: "USD" },
                      ]}
                      placeholder="Valyuta"
                      activeSelect={activeSelect}
                      setActiveSelect={setActiveSelect}
                    />
                  </div>
                </div>
              </SectionBox>

              <SectionBox title="Joylashuv va kategoriya" icon={MapPin}>
                <div className="grid sm:grid-cols-2 gap-5">
                  <ControlledSelect
                    control={control}
                    name="categoryId"
                    label="Kategoriya *"
                    error={errors.categoryId}
                    options={categories.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    placeholder="Kategoriyani tanlang"
                    activeSelect={activeSelect}
                    setActiveSelect={setActiveSelect}
                  />
                  <ControlledSelect
                    control={control}
                    name="regionId"
                    label="Viloyat *"
                    error={errors.regionId}
                    options={regions.map((r) => ({
                      value: r.id,
                      label: r.name,
                    }))}
                    placeholder="Viloyatni tanlang"
                    activeSelect={activeSelect}
                    setActiveSelect={setActiveSelect}
                  />
                  <ControlledSelect
                    control={control}
                    name="districtId"
                    label="Tuman *"
                    error={errors.districtId}
                    options={districts.map((d) => ({
                      value: d.id,
                      label: d.name,
                    }))}
                    placeholder="Tumanni tanlang"
                    disabled={!selectedRegionId}
                    activeSelect={activeSelect}
                    setActiveSelect={setActiveSelect}
                  />
                  <ControlledSelect
                    control={control}
                    name="paymentType"
                    label="To'lov turi"
                    error={errors.paymentType}
                    options={[
                      { value: "card", label: "Karta" },
                      { value: "cash", label: "Naqd" },
                    ]}
                    placeholder="Tanlang"
                    activeSelect={activeSelect}
                    setActiveSelect={setActiveSelect}
                  />
                </div>
                <div className="mt-6">
                  <Controller
                    control={control}
                    name="negotiable"
                    render={({ field }) => (
                      <label className="flex items-center gap-3 cursor-pointer text-lg">
                        <input
                          type="checkbox"
                          {...field}
                          checked={field.value}
                          className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="font-medium">Kelishuv narxi</span>
                      </label>
                    )}
                  />
                </div>
              </SectionBox>

              {dynamicProps.length > 0 && (
                <SectionBox title="Qo'shimcha xususiyatlar" icon={Tag}>
                  <DynamicProperties
                    properties={dynamicProps}
                    control={control}
                  />
                </SectionBox>
              )}
            </div>

            {/* O'ng taraf – Rasmlar */}
            <div className="lg:col-span-1">
              <SectionBox title="Rasmlar (10 tagacha)" icon={UploadCloud}>
                <ImageUploadDropzone
                  images={images}
                  setImages={setImages}
                  max={10}
                />
              </SectionBox>
            </div>
          </div>

          {/* Tugmalar */}
          <div className="flex justify-end gap-5 pt-8 border-t border-gray-200 sticky bottom-0 bg-white py-6 -mx-8 px-8">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-3 disabled:opacity-70 shadow-lg"
            >
              {loading ? (
                "Saqlanmoqda..."
              ) : (
                <>
                  <Save size={22} />
                  Saqlash
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductUpdateModal;
