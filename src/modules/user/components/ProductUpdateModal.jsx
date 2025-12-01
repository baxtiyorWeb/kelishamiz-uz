import React, { useEffect, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useDropzone } from "react-dropzone";
import api from "../../../config/auth/api";

// =====================================================================
// === 1. Utility komponentlar ===
// =====================================================================

/**
 * Oddiy, stil berilgan input komponenti
 */
const StyledInput = ({
  type = "text",
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
    name={name}
    value={value}
    onChange={onChange}
    className={`w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
      disabled ? "bg-gray-50 text-gray-500" : "bg-white"
    } ${className}`}
    placeholder={placeholder}
    required={required}
    min={min}
    disabled={disabled}
  />
);

// =====================================================================
// === 2. Asosiy Modal Komponenti ===
// =====================================================================

const ProductUpdateModal = ({ isOpen, onClose, productId }) => {
  const queryClient = useQueryClient();

  // --- Rasmlarni boshqarish uchun holatlar ---
  const [currentImages, setCurrentImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // --- Umumiy mahsulot ma'lumotlari holati ---
  const [productData, setProductData] = useState(null);

  // 1. ESC tugmasi orqali modalni yopish
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // 2. Mahsulotni yuklab olish
  const { data: initialProduct, isLoading: isProductLoading } = useQuery({
    queryKey: ["product_id", productId],
    queryFn: async () => {
      const response = await api.get(`/products/by-id/${productId}`);
      return response?.data?.content;
    },
    enabled: !!productId && isOpen,
    staleTime: 5 * 60 * 1000,
  });

  // 3. initialProduct yuklanganda holatlarni o'rnatish
  useEffect(() => {
    if (initialProduct) {
      setProductData(initialProduct);

      const sortedImages = initialProduct.images
        ? [...initialProduct.images].sort((a, b) => a.order - b.order)
        : [];
      setCurrentImages(sortedImages);
      setImageFiles([]);

      // Asosiy rasm indeksini to'g'ri o'rnatish
      let initialMainIndex = initialProduct.imageIndex;
      if (initialMainIndex === -1 && sortedImages.length > 0) {
        initialMainIndex = 0;
      } else if (initialMainIndex >= sortedImages.length) {
        initialMainIndex = Math.max(0, sortedImages.length - 1);
      }
      setMainImageIndex(initialMainIndex);
    }
  }, [initialProduct]);

  // 4. Qo'shimcha ma'lumotlarni yuklash (Category, Regions, Districts)
  const { data: category } = useQuery({
    queryKey: ["category_id", productData?.categoryId],
    queryFn: async () =>
      (await api.get(`/category/${productData?.categoryId}`))?.data?.content,
    enabled: !!productData?.categoryId,
  });
  const { data: properties } = useQuery({
    queryKey: ["property_id", productData?.categoryId],
    queryFn: async () =>
      (await api.get(`/category/${productData?.categoryId}/properties`))?.data
        ?.content,
    enabled: !!productData?.categoryId,
  });

  console.log(properties);
  


  const { data: region } = useQuery({
    queryKey: ["regions"],
    queryFn: async () => (await api.get(`/location/regions`))?.data?.content,
    enabled: !!productId,
  });
  const { data: district } = useQuery({
    queryKey: ["district", productData?.regionId],
    queryFn: async () =>
      (await api.get(`/location/districts/${productData?.regionId}`))?.data
        ?.content,
    enabled: !!productData?.regionId,
  });

  // 5. Input o'zgarishlarini boshqarish
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValue =
      name === "price" && e.target.type === "number" ? Number(value) : value;
    setProductData((prevData) => ({
      ...prevData,
      [name]: newValue,
      ...(name === "regionId" && { districtId: null }),
    }));
  };

  // 6. Xususiyat (Property) o'zgarishlarini boshqarish
  const handlePropertyChange = (propertyId, value) => {
    setProductData((prevData) => {
      const existingValues = prevData.propertyValues || [];
      const stringValue = String(value);

      const newPropertyValues = existingValues.some(
        (pv) => pv.propertyId === propertyId
      )
        ? existingValues.map((pv) =>
            pv.propertyId === propertyId ? { ...pv, value: stringValue } : pv
          )
        : [...existingValues, { propertyId: propertyId, value: stringValue }];

      return {
        ...prevData,
        propertyValues: newPropertyValues,
      };
    });
  };

  // Barcha rasmlarni birlashtirish (Mavjud + Yangi fayllar)
  const allImages = useMemo(() => {
    const newFilesMapped = imageFiles.map((f) => ({
      id: f.id,
      url: f.previewUrl,
      isNew: true, // Yangi fayl
      file: f.file,
    }));

    // Mavjud rasmlarni va yangi rasmlarni ketma-ket birlashtiramiz
    return [...currentImages, ...newFilesMapped];
  }, [currentImages, imageFiles]);

  // 7. Rasm tashlash/tanlash funksiyasi
  const onImageDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const spaceLeft = 10 - allImages.length;
      const filesToProcess = acceptedFiles.slice(0, spaceLeft);

      const newFiles = filesToProcess.map((file) => {
        const uploadId =
          Date.now().toString() + Math.random().toString(36).substring(2, 9);
        return {
          file,
          previewUrl: URL.createObjectURL(file),
          id: uploadId,
        };
      });

      setImageFiles((prev) => [...prev, ...newFiles]);
      setUploadingImages((prev) => [
        ...prev,
        ...newFiles.map((f) => ({
          id: f.id,
          name: f.file.name,
          progress: 100,
        })),
      ]);

      setTimeout(() => {
        setUploadingImages((prev) =>
          prev.filter((img) => !newFiles.some((f) => f.id === img.id))
        );
      }, 500);
    },
    [allImages.length]
  );

  const imageDropzone = useDropzone({
    onDrop: onImageDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 10 - allImages.length,
    disabled: allImages.length >= 10,
  });

  const removeImage = (imageToRemove) => {
    // Rasm fayllarini tozalash
    if (imageToRemove.isNew) {
      setImageFiles((prev) => prev.filter((f) => f.id !== imageToRemove.id));
      URL.revokeObjectURL(imageToRemove.url);
    } else {
      setCurrentImages((prev) =>
        prev.filter((img) => img.id !== imageToRemove.id)
      );
    }

    // Asosiy rasm indeksini yangilash (mantiqni soddalashtiramiz)
    setMainImageIndex((prevIndex) => {
      const targetIndex = allImages.findIndex(
        (img) => img.id === imageToRemove.id
      );

      // Agar o'chirilgan rasm joriy asosiy rasm bo'lsa
      if (targetIndex === prevIndex) {
        // Keyingi rasmga o'tish yoki 0 ga o'rnatish
        return allImages.length > 1
          ? Math.min(prevIndex, allImages.length - 2)
          : -1;
      }
      // Agar o'chirilgan rasm asosiy rasmdan oldin bo'lsa, indeksni bittaga kamaytirish
      if (targetIndex < prevIndex) {
        return Math.max(0, prevIndex - 1);
      }
      return prevIndex;
    });
  };

  const setAsMainImage = (index) => {
    setMainImageIndex(index);
  };

  // 8. Mahsulotni yangilash mutatsiyasi (Multipart/Form-Data)
  const { mutate: updateProduct, isLoading: isUpdating } = useMutation({
    mutationFn: async (payload) => {
      const formData = new FormData();

      // JSON/oddiy ma'lumotlarni string sifatida qo'shish
      Object.entries(payload).forEach(([key, value]) => {
        if (["propertyValues", "images"].includes(key)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      // Yangi rasm fayllarini 'files' nomi bilan qo'shish
      imageFiles.forEach((fileObj) => {
        formData.append("files", fileObj.file, fileObj.file.name);
      });

      const response = await api.patch(`/products/${productId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      alert("Mahsulot muvaffaqiyatli yangilandi!");
      queryClient.invalidateQueries(["product_id", productId]);
      queryClient.invalidateQueries("products_list");
      onClose();
    },
    onError: (error) => {
      console.error("Yangilashda xato:", error);
      alert(
        "Mahsulotni yangilashda xato yuz berdi. Xato: " +
          (error.response?.data?.message || error.message)
      );
    },
  });

  const handleSave = () => {
    if (!productData) return;

    // Serverga yuboriladigan mavjud (isNew emas) rasmlar ro'yxatini tayyorlash
    const imagesPayload = allImages
      .filter((img) => !img.isNew) // Faqat serverdan kelgan (yoki yangi yuklanib, saqlangan) rasmlarni qoldiramiz
      .map((img, index) => ({
        id: img.id,
        url: img.url,
        order: index,
      }));

    // Payloadni tayyorlash
    const payload = {
      title: productData.title,
      price: String(productData.price),
      regionId: String(productData.regionId),
      districtId: String(productData.districtId),
      imageIndex: String(mainImageIndex),
      propertyValues: productData.propertyValues.map((pv) => ({
        propertyId: pv.propertyId,
        value: pv.value,
      })),
      images: imagesPayload,
    };

    updateProduct(payload);
  };

  // --- 9. Modalning yuklanish holati ---
  if (!isOpen) return null;
  if (isProductLoading || !productData) {
    return createPortal(
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
        <div className="text-white text-xl p-5 bg-gray-700 rounded-lg">
          Yuklanmoqda...
        </div>
      </div>,
      document.body
    );
  }

  
  const ModalContent = (
    <div className="space-y-6 overflow-y-auto h-full pr-2">
      <div>
        <label className="block text-sm font-medium mb-2">Sarlavha</label>
        <StyledInput
          name="title"
          value={productData.title || ""}
          onChange={handleInputChange}
          placeholder="Mahsulot sarlavhasi"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Narx</label>
        <StyledInput
          type="number"
          name="price"
          value={productData.price || ""}
          onChange={handleInputChange}
          placeholder="200000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Kategoriya</label>
        <div className="w-full px-4 py-3.5 border border-gray-200 bg-gray-100 rounded-2xl text-gray-600">
          {category?.name || "Yuklanmoqda..."}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Viloyat</label>
          <select
            name="regionId"
            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl"
            value={productData.regionId || ""}
            onChange={handleInputChange}
          >
            <option value="">Tanlang</option>
            {region?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tuman</label>
          <select
            name="districtId"
            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl"
            value={productData.districtId || ""}
            onChange={handleInputChange}
            disabled={!productData.regionId}
          >
            <option value="">Tanlang</option>
            {district?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {properties?.properties?.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-3">
            Qo‘shimcha xususiyatlar
          </label>
          <div className="space-y-4">
            {properties?.properties?.map((prop) => {
              const valueObj = productData.propertyValues?.find(
                (pv) => pv.propertyId === prop.id
              );
              const currentValue = valueObj?.value || "";

              return (
                <div key={prop.id}>
                  <label className="block text-sm mb-1">{prop.name}</label>
                  {prop.type === "NUMBER" && (
                    <StyledInput
                      type="number"
                      placeholder={`${prop.name} (son)`}
                      value={currentValue}
                      onChange={(e) =>
                        handlePropertyChange(prop.id, e.target.value)
                      }
                    />
                  )}
                  {prop.type === "STRING" && (
                    <StyledInput
                      placeholder={`${prop.name} (matn)`}
                      value={currentValue}
                      onChange={(e) =>
                        handlePropertyChange(prop.id, e.target.value)
                      }
                    />
                  )}
                  {prop.type === "BOOLEAN" && (
                    <select
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl"
                      value={currentValue === "true" ? "true" : "false"}
                      onChange={(e) =>
                        handlePropertyChange(prop.id, e.target.value)
                      }
                    >
                      <option value="true">Ha</option>
                      <option value="false">Yo‘q</option>
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          Rasmlar (Maks. 10 ta)
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3">
          {allImages.map((img, index) => (
            <div
              key={img.id}
              className={`relative w-full h-16 rounded-xl overflow-hidden border-2 cursor-pointer ${
                index === mainImageIndex
                  ? "border-purple-500 ring-2 ring-purple-300"
                  : "border-gray-200"
              }`}
            >
              <img
                src={img.url}
                className="w-full h-full object-cover"
                alt="Mahsulot rasmi"
                onClick={() => setAsMainImage(index)}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(img);
                }}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-1 text-xs leading-none z-10"
                title="O'chirish"
              >
                &times;
              </button>
              {index === mainImageIndex && (
                <span className="absolute bottom-0 left-0 bg-purple-500 text-white text-[10px] px-1 rounded-tr-lg">
                  Asosiy
                </span>
              )}
            </div>
          ))}

          {allImages.length < 10 && (
            <div
              {...imageDropzone.getRootProps()}
              className={`w-full h-16 rounded-xl border-2 border-dashed flex items-center justify-center text-gray-400 text-xs text-center cursor-pointer hover:border-purple-400 transition-colors ${
                imageDropzone.isDragActive
                  ? "border-purple-500 bg-purple-50"
                  : ""
              }`}
            >
              <input {...imageDropzone.getInputProps()} />
              {allImages.length === 0 ? "Rasm qo'shish" : "+ Rasm"}
            </div>
          )}
        </div>
        {uploadingImages.map((img) => (
          <div key={img.id} className="text-xs text-gray-500 mt-1">
            {img.name} yuklandi (Simulyatsiya)
          </div>
        ))}
      </div>

      <button
        className="w-full bg-purple-600 text-white py-3 rounded-xl text-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
        onClick={handleSave}
        disabled={isUpdating}
      >
        {isUpdating ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </div>
  );

  // --- 11. Modalni render qilish ---
  return createPortal(
    <div className="fixed inset-0 z-[999]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="
          hidden md:flex 
          fixed inset-0 
          items-center justify-center
        "
      >
        <div
          className="
            bg-white w-[80dvw] max-w-[90%] h-[80dvh] max-h-[90%] rounded-xl shadow-xl 
            p-6 animate-fadeIn
          "
        >
          {ModalContent}
        </div>
      </div>
      <div
        className="
          md:hidden
          fixed top-0 right-0 h-full
          w-[100%] max-w-[400px]
          bg-white shadow-xl p-5
          animate-slideRight
        "
      >
        {ModalContent}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
        @keyframes slideRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideRight {
          animation: slideRight 0.3s ease-out;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default ProductUpdateModal;
