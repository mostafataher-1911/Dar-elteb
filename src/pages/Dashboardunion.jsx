import React, { useState, useEffect } from "react";
import Navbar from "../layout/Navbar";
import CustomInputicon from "../component/CustomInputicon";
import CustomButton from "../component/CustomButton";
import Loading from "../component/Loading";
import toast from "react-hot-toast";
import {
  BuildingLibraryIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function Dashboardunion() {
  const [unions, setUnions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUnion, setEditUnion] = useState(null);
  const [form, setForm] = useState({ name: "", discount: "", image: "", imageBase64: "" });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const API_BASE = "/api/Union"; // استخدم proxy

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/GetAll`);
      const data = await res.json();
      if (data.success && data.resource) setUnions(data.resource);
      else toast.error("فشل في جلب البيانات");
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertToBase64(file);
      const imageURL = URL.createObjectURL(file);
      setForm({ ...form, image: imageURL, imageBase64: base64 });
      toast.success("تم رفع الصورة بنجاح ✅");
    }
  };

  const removeImage = () => {
    setForm({ ...form, image: "", imageBase64: "" });
    toast("تم حذف الصورة 🚫", { icon: "🗑️" });
  };

  const openModal = (union = null) => {
    if (union) {
      setEditUnion(union);
      setForm({
        name: union.name,
        discount: union.disCount,
        image: `https://apilab.runasp.net${union.imageUrl}`,
        imageBase64: "", // فارغ يعني لم يتغير
      });
    } else {
      setEditUnion(null);
      setForm({ name: "", discount: "", image: "", imageBase64: "" });
    }
    setShowModal(true);
  };

const addUnion = async () => {
  if (!form.name || !form.discount) {
    toast.error("من فضلك أدخل اسم النقابة ونسبة الخصم");
    return;
  }

  if (!form.imageBase64) {
    toast.error("من فضلك اختر صورة للنقابة 📸");
    return;
  }

  // ✅ تحقق من الاسم إذا كان موجود بالفعل
  const nameExists = unions.some(
    (u) => u.name.trim().toLowerCase() === form.name.trim().toLowerCase()
  );
  if (nameExists) {
    toast.error(`❌ النقابة "${form.name}" موجودة بالفعل`);
    setShowModal(false); // اغلاق المودال تلقائيًا
    return; // إيقاف عملية الإضافة
  }

  const payload = {
    name: form.name,
    imageBase64: form.imageBase64,
    disCount: Number(form.discount),
    orderRank: 0,
  };

  try {
    const res = await fetch(`${API_BASE}/Add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("✅ تمت الإضافة بنجاح");
      setShowModal(false);
      setForm({ name: "", discount: "", image: "", imageBase64: "" });
      fetchData();
    } else toast.error("❌ فشل في الإضافة");
  } catch {
    toast.error("تعذر الاتصال بالسيرفر");
  }
};


  const updateUnion = async () => {
    if (!form.name || !form.discount) {
      toast.error("من فضلك أدخل اسم النقابة ونسبة الخصم");
      return;
    }

    let imageToSend = null;

    if (form.imageBase64 && typeof form.imageBase64 === "string") {
      // صورة جديدة
      imageToSend = form.imageBase64.includes(",")
        ? form.imageBase64.split(",")[1]
        : form.imageBase64;
    } else if (editUnion.imageUrl) {
      // لو ما غيرش الصورة، نحوّل الصورة القديمة من URL لـ Base64
      const convertUrlToBase64 = async (url) => {
        const res = await fetch(url);
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result.split(",")[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      };

      try {
        imageToSend = await convertUrlToBase64(`https://apilab.runasp.net${editUnion.imageUrl}`);
      } catch (err) {
        console.error("🚨 خطأ في تحويل الصورة القديمة لـ Base64:", err);
        toast.error("تعذر معالجة الصورة القديمة");
        return;
      }
    }

    const payload = {
      id: editUnion.id,
      name: form.name,
      disCount: Number(form.discount),
      orderRank: 0,
      imageBase64: imageToSend,
    };

    console.log("📤 إرسال بيانات التعديل:", payload);

    try {
      const res = await fetch(`${API_BASE}/Update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("📩 رد السيرفر:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        toast.error("❌ الرد من السيرفر ليس بصيغة JSON");
        return;
      }

      if (res.ok && data.success) {
        toast.success("✅ تم تعديل النقابة بنجاح");
        setShowModal(false);
        setForm({ name: "", discount: "", image: "", imageBase64: "" });
        fetchData();
      } else {
        toast.error("❌ فشل في التعديل: " + (data.message || ""));
      }
    } catch (err) {
      console.error("🚨 خطأ أثناء التعديل:", err);
      toast.error("تعذر الاتصال بالسيرفر أو حدث خطأ بالشبكة");
    }
  };

  const deleteUnion = async (id) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      const res = await fetch(`${API_BASE}/Delete?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("🗑️ تم حذف النقابة بنجاح");
        setUnions((prev) => prev.filter((u) => u.id !== id));
      } else toast.error(data.message || "حدث خطأ أثناء الحذف");
    } catch {
      toast.error("تعذر الاتصال بالسيرفر");
    }
  };

  const totalPages = Math.ceil(unions.length / itemsPerPage);
  const paginatedUnions = unions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="p-6 h-screen">
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="flex justify-end items-center mb-6">
              <button
                className="flex justify-center items-center gap-2 w-70 p-2 bg-[#005FA1] text-white rounded-lg shadow-md hover:bg-[#00457a]"
                onClick={() => openModal()}
              >
                <PlusCircleIcon className="w-6 h-6" />
                إضافة نقابة جديدة
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-center shadow-md rounded-lg">
                <thead className="bg-[#005FA1] text-white">
                  <tr>
                    <th>#</th>
                    <th>الصورة</th>
                    <th>اسم النقابة</th>
                    <th>نسبة الخصم</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUnions.length > 0 ? (
                    paginatedUnions.map((item, index) => (
                      <tr key={item.id}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>
                          {item.imageUrl ? (
                            <img
                              src={`https://apilab.runasp.net${item.imageUrl}`}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-full mx-auto"
                            />
                          ) : (
                            <span className="text-gray-400">لا توجد صورة</span>
                          )}
                        </td>
                        <td>{item.name}</td>
                        <td>{item.disCount} %</td>
                        <td className="flex justify-center gap-3">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => openModal(item)}
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => deleteUnion(item.id)}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-gray-500">
                        لا توجد نقابات مضافة بعد
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6 items-center gap-2">
              {/* Previous button */}
              <button
                className="btn bg-[#005FA1] text-white"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                الصفحة السابقة
              </button>

              

              {/* Next button */}
              <button
                className="btn bg-[#005FA1] text-white"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                الصفحة التالية
              </button>
            </div>

            <p className="text-center mt-2 text-gray-600">
              صفحة {currentPage} من {totalPages}
            </p>
          </>
        )}
      </div>

      {showModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] relative">
            <h1 className="text-2xl font-bold text-[#005FA1] mb-4 text-right">
              {editUnion ? "تعديل النقابة" : "إضافة نقابة جديدة"}
            </h1>

            <div className="mb-4">
              <CustomInputicon
                icon={<BuildingLibraryIcon />}
                placeholder="اسم النقابة"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <p className="text-[#005FA1] text-right pb-2">: نسبة الخصم</p>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  className="w-full bg-gray-200 rounded-lg py-2 pr-14 pl-3 outline-none text-right"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
                  %
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[#005FA1] text-right">اختار صورة النقابة</p>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
              {form.image && (
                <div className="relative mt-3 w-fit mx-auto">
                  <img
                    src={form.image}
                    alt="preview"
                    className="w-20 h-20 object-cover rounded-full"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-3 py-2 bg-gray-300 rounded-lg"
                onClick={() => setShowModal(false)}
              >
                إلغاء
              </button>

              {editUnion ? (
                <button
                  onClick={updateUnion}
                  className="px-4 py-2 bg-[#005FA1] text-white rounded-lg hover:bg-[#00457a]"
                >
                  حفظ التعديل
                </button>
              ) : (
                <button
                  onClick={addUnion}
                  className="px-4 py-2 bg-[#005FA1] text-white rounded-lg hover:bg-[#00457a]"
                >
                  حفظ
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboardunion;

