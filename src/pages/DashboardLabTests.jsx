import React, { useState, useEffect } from "react";
import Navbar from "../layout/Navbar";
import CustomInputicon from "../component/CustomInputicon";
import CustomButton from "../component/CustomButton";
import Loading from "../component/Loading";
import CustomSelect from "../component/CustomSelect";
import { Toaster, toast } from "react-hot-toast";
import {
  PencilSquareIcon,
  PlusCircleIcon,
  TrashIcon,
  TagIcon,
  BeakerIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function DashboardLabTests() {
  const [filterType, setFilterType] = useState("");
  const [tests, setTests] = useState([]);
  const [types, setTypes] = useState([]);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editTest, setEditTest] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    price: "",
    type: "",
    image: "",
    categoryId: "",
  });

  const [newType, setNewType] = useState("");

  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const catRes = await fetch("https://apilab.runasp.net/api/Category/GetAll");
      const catData = await catRes.json();
      if (catData.success) setTypes(catData.resource);

      const labRes = await fetch("https://apilab.runasp.net/api/MedicalLabs/GetAll");
      const labData = await labRes.json();
      if (labData.success) setTests(labData.resource);
    } catch (err) {
      toast.error("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, image: reader.result.split(",")[1] });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setForm({ ...form, image: "" });
  };

  const openTestModal = (test = null) => {
    if (test) {
      setEditTest(test);
      setForm({
        name: test.name,
        price: test.price,
        type: types.find((t) => t.id === test.categoryId)?.name || "",
        categoryId: test.categoryId,
        image: "", // خلي image فاضي للـ base64
      });
    } else {
      setEditTest(null);
      setForm({ name: "", price: "", type: "", image: "", categoryId: "" });
    }
    setShowTestModal(true);
  };

  const openTypeModal = () => {
    setNewType("");
    setShowTypeModal(true);
  };

const saveTest = async () => {
  if (!form.name || !form.price || !form.type) {
    toast.error("من فضلك ادخل اسم التحليل والسعر والنوع");
    return;
  }

  const selectedType = types.find((t) => t.name === form.type);
  if (!selectedType) {
    toast.error("النوع غير موجود");
    return;
  }

  // ✅ فقط نرسل Base64 إذا المستخدم رفع صورة جديدة
  const payload = {
    name: form.name,
    price: Number(form.price),
    categoryId: selectedType.id,
    orderRank: 0,
    ...(form.image ? { imageBase64: form.image } : {}), // إذا الصورة موجودة
  };

  try {
    const url = editTest
      ? "https://apilab.runasp.net/api/MedicalLabs/Update"
      : "https://apilab.runasp.net/api/MedicalLabs/Add";

    const method = editTest ? "PUT" : "POST";

    const bodyData = editTest ? { ...payload, id: editTest.id } : payload;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    const data = await res.json();
    if (data.success) {
      toast.success(editTest ? "تم تعديل التحليل بنجاح" : "تمت إضافة التحليل بنجاح");
      fetchData();
      setShowTestModal(false);
    } else {
      toast.error(data.message || "حدث خطأ أثناء الحفظ");
    }
  } catch (err) {
    console.error(err);
    toast.error("خطأ في الاتصال بالخادم");
  }
};


  const deleteTest = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا التحليل؟")) return;

    try {
      const res = await fetch(
        `https://apilab.runasp.net/api/MedicalLabs/Delete?id=${id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("تم حذف التحليل بنجاح");
        setTests((prev) => prev.filter((t) => t.id !== id));
      } else toast.error(data.message || "تعذر حذف التحليل");
    } catch {
      toast.error("فشل الاتصال بالخادم");
    }
  };

  const addType = async () => {
    if (!newType.trim()) {
      toast.error("من فضلك أدخل اسم النوع");
      return;
    }

    try {
      const res = await fetch("https://apilab.runasp.net/api/Category/Add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newType, colorHexa: "#005FA1" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تمت إضافة النوع بنجاح");
        setTypes((prev) => [...prev, data.resource]);
        setNewType("");
      } else toast.error(data.message || "حدث خطأ أثناء الإضافة");
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const deleteType = async (type) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا النوع؟")) return;

    try {
      const res = await fetch(
        `https://apilab.runasp.net/api/Category/Delete?id=${type.id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("تم حذف النوع بنجاح");
        setTypes((prev) => prev.filter((t) => t.id !== type.id));
      } else toast.error(data.message || "تعذر حذف النوع");
    } catch {
      toast.error("فشل الاتصال بالخادم");
    }
  };

  const filteredTests = filterType
    ? tests.filter((t) => String(t.categoryId) === String(filterType))
    : tests;

  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedTests = filteredTests.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <Toaster position="top-center" />
      <div className="p-6 h-screen">
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <button
                className="flex justify-center items-center gap-2 p-2 bg-[#005FA1] text-white rounded-lg shadow-md hover:bg-[#00457a]"
                onClick={() => openTestModal()}
              >
                <PlusCircleIcon className="w-6 h-6" />
                إضافة تحليل جديد
              </button>

              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(1);
                }}
                className=" text-[#005FA1] border-2 border-[#005FA1] rounded-lg py-2 px-3 outline-none focus:outline-none"
              >
                <option value="">جميع انواع التحاليل</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <button
                className="flex justify-center items-center gap-2 p-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-800"
                onClick={openTypeModal}
              >
                <TagIcon className="w-6 h-6" />
                إدارة أنواع التحاليل
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-center shadow-md rounded-lg">
                <thead className="bg-[#005FA1] text-white">
                  <tr>
                    <th>#</th>
                    <th>الصورة</th>
                    <th>اسم التحليل</th>
                    <th>النوع</th>
                    <th>السعر</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTests.length > 0 ? (
                    paginatedTests.map((item, index) => (
                      <tr key={item.id}>
                        <td>{startIndex + index + 1}</td>
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
                        <td>
                          {types.find((t) => t.id === item.categoryId)?.name || "-"}
                        </td>
                        <td>{item.price} ج.م</td>
                        <td className="flex justify-center gap-3">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => openTestModal(item)}
                          >
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => deleteTest(item.id)}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-gray-500">
                        لا توجد تحاليل مضافة بعد
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredTests.length > 0 && (
              <>
                <div className="flex justify-center mt-6">
                  <div className="join">
                    <button
                      className="join-item btn bg-[#005FA1] text-white"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      الصفحة السابقة
                    </button>
                    <button
                      className="join-item btn bg-[#005FA1] text-white"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      الصفحة التالية
                    </button>
                  </div>
                </div>

                <p className="text-center mt-2 text-gray-600">
                  صفحة {page} من {totalPages}
                </p>
              </>
            )}
          </>
        )}
      </div>

      {/* ✅ مودال التحليل */}
      {showTestModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] relative">
            <h1 className="text-2xl font-bold text-[#005FA1] mb-4 text-right">
              {editTest ? "تعديل التحليل" : "إضافة تحليل جديد"}
            </h1>

            <div className="mb-4">
              <CustomInputicon
                icon={<BeakerIcon />}
                placeholder="اسم التحليل"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-gray-200 rounded-lg py-2 pr-14 pl-3 outline-none text-right"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
                  ج.م
                </span>
              </div>
            </div>

            {/* اختيار النوع */}
           <CustomSelect
  icon={<BeakerIcon className="w-6 h-6 text-[#005FA1]" />}
  value={form.type}
  onChange={(val) => {
    const selected = types.find((t) => t.name === val);
    setForm({
      ...form,
      type: val,
      categoryId: selected ? selected.id : "",
    });
  }}
  defaultValue="اختر النوع"
  options={types.map((t) => t.name)}
/>


            {/* رفع صورة */}
           <div className="mb-4">
  <p className="text-[#005FA1] text-right">اختار صوره التحليل</p>
  <input
    type="file"
    accept="image/*"
    onChange={handleImageChange}
    className="w-full mb-2"
  />

  {/* عرض الصورة مع زر X إذا موجودة */}
  {(form.image || (editTest && editTest.imageUrl)) && (
    <div className="relative w-32 h-32 mx-auto">
      <img
        src={form.image ? `data:image/*;base64,${form.image}` : `https://apilab.runasp.net${editTest.imageUrl}`}
        alt="preview"
        className="w-full h-full object-cover rounded-lg"
      />
      <button
        type="button"
        onClick={() => setForm({ ...form, image: "" })}
        className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 hover:bg-red-800"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  )}
</div>


            {/* الأزرار */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-3 py-2 bg-gray-300 rounded-lg"
                onClick={() => setShowTestModal(false)}
              >
                إلغاء
              </button>
              <CustomButton text="حفظ" onClick={saveTest} />
            </div>
          </div>
        </div>
      )}

      {/* ✅ مودال الأنواع */}
      {showTypeModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] relative">
            <h1 className="text-2xl font-bold text-green-700 mb-4 text-right">
              أنواع التحاليل
            </h1>

            {/* إضافة نوع جديد */}
            <div className="flex flex-row-reverse gap-2 mb-4">
              <input
                type="text"
                placeholder="نوع جديد"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="flex-1 bg-gray-200 rounded-lg py-2 px-3 outline-none text-right"
              />
              <button
                className="text-white bg-[#005FA1] px-3 py-2 rounded-lg"
                onClick={addType}
              >
                إضافة
              </button>
            </div>

            {/* قائمة الأنواع */}
            <ul className="max-h-60 overflow-y-auto">
              {types.map((t, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center p-2 border-b"
                >
                  <span>{t.name}</span>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => deleteType(t)}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>

            {/* الأزرار */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-3 py-2 bg-gray-300 rounded-lg"
                onClick={() => setShowTypeModal(false)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardLabTests;
