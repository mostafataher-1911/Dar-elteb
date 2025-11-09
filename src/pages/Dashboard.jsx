import React, { useEffect, useState } from "react";
import Navbar from "../layout/Navbar";
import Loading from "../component/Loading";
import CustomInputicon from "../component/CustomInputicon";
import GenderSelector from "../component/GenderSelector";
import CustomButton from "../component/CustomButton";
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  PencilSquareIcon,
  PhoneIcon,
  PlusCircleIcon,
  TrashIcon,
  UserIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import CustomSelect from "../component/CustomSelect";
import toast, { Toaster } from "react-hot-toast";

function Dashboard() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterUnion, setFilterUnion] = useState("");
  const [unions, setUnions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    coins: "",
    union: "",
  });

  const [labsData, setLabsData] = useState([]);
  const [showCoinsModal, setShowCoinsModal] = useState(false);
  const [coinsForm, setCoinsForm] = useState({ phone: "", selectedLabs: [] });

  const itemsPerPage = 7;
  const CLIENT_API = "https://apilab.runasp.net/api/Client";
  const UNION_API = "https://apilab.runasp.net/api/Union";

  // تحميل النقابات
  const fetchUnions = async () => {
    try {
      const res = await fetch(`${UNION_API}/GetAll`);
      const result = await res.json();
      if (result.success && result.resource) {
        setUnions(result.resource);
      }
    } catch (err) {
      console.error("Error fetching unions:", err);
    }
  };

  // تحميل العملاء
  const fetchClients = async (unionId = "") => {
    setLoading(true);
    try {
      let url = unionId
        ? `${CLIENT_API}/GetByUnionId?id=${unionId}`
        : `${CLIENT_API}/GetAll`;

      const res = await fetch(url);
      const result = await res.json();
      if (result.success && result.resource) {
        const clients = result.resource.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          gender: "ذكر",
          coins: c.bonus,
          union: c.address || "غير محدد",
        }));
        setData(clients);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("حدث خطأ أثناء تحميل البيانات ❌");
    }
    setLoading(false);
  };

  // تحميل التحاليل (لل coins)
  useEffect(() => {
    fetch("https://apilab.runasp.net/api/MedicalLabs/GetAll")
      .then((res) => res.json())
      .then((data) => {
        if (data.resource) {
          const labsWithPrice = data.resource.map((lab) => ({
            id: lab.id,
            name: lab.name,
            price: lab.price,
          }));
          setLabsData(labsWithPrice);
        }
      })
      .catch((err) => console.error("Error fetching labs:", err));
  }, []);

  useEffect(() => {
    fetchUnions();
    fetchClients();
  }, []);

  // فلترة البحث
  const filteredData = data.filter((item) =>
    item.phone.toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const openModal = (user = null) => {
    if (user) {
      setEditUser(user);
      setForm({
        name: user.name,
        phone: user.phone,
        gender: user.gender,
        coins: user.coins,
        union: user.union,
      });
    } else {
      setEditUser(null);
      setForm({ name: "", phone: "", gender: "", coins: "", union: "" });
    }
    setShowModal(true);
  };

  const saveUser = async () => {
    if (!form.name || !form.phone) {
      toast.error("من فضلك ادخل الاسم ورقم المحمول");
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      toast.error("رقم المحمول يجب أن يحتوي على 10 أرقام فقط");
      return;
    }
    const phoneExists = data.some(
      (item) =>
        item.phone === form.phone && (!editUser || item.id !== editUser.id)
    );
    if (phoneExists) {
      toast.error("هذا الرقم مسجل بالفعل ❌");
      return;
    }

    const payload = {
      name: form.name,
      phone: form.phone,
      address: form.union,
      bonus: Number(form.coins) || 0,
      id: editUser?.id || undefined,
    };

    try {
      let res;
      if (editUser) {
        res = await fetch(`${CLIENT_API}/Update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${CLIENT_API}/Add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const result = await res.json();
      if (result.success) {
        toast.success("تم الحفظ بنجاح ✅");
        fetchClients();
        setShowModal(false);
      } else {
        toast.error("حدث خطأ أثناء الحفظ ❌");
      }
    } catch (err) {
      console.error("Error saving user:", err);
      toast.error("حدث خطأ في الاتصال بالسيرفر ❌");
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      try {
        const res = await fetch(`${CLIENT_API}/Delete?id=${id}`, {
          method: "DELETE",
        });
        const result = await res.json();
        if (result.success) {
          toast.success("تم الحذف بنجاح ✅");
          fetchClients();
        } else {
          toast.error("تعذر حذف المستخدم ❌");
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        toast.error("حدث خطأ في الاتصال بالسيرفر ❌");
      }
    }
  };

  // فتح مودال إضافة كوينز
  const openCoinsModal = () => {
    setCoinsForm({ phone: "", selectedLabs: [] });
    setShowCoinsModal(true);
  };

  // إضافة كوينز للمستخدم
const addCoinsToUser = async () => {
  const user = data.find((u) => u.phone === coinsForm.phone);
  if (!user) {
    toast.error("رقم المحمول غير موجود ❌");
    return;
  }

  let totalCoins = 0;
  coinsForm.selectedLabs.forEach((lab) => {
    const foundLab = labsData.find((l) => l.name === lab.name);
    if (foundLab) {
      totalCoins += (foundLab.price * (lab.discount || 0)) / 100;
    }
  });

  // تحديث البيانات محليًا
  const updatedData = data.map((u) =>
    u.phone === user.phone ? { ...u, coins: u.coins + totalCoins } : u
  );
  setData(updatedData);

  // تجهيز البيانات حسب API
  const payload = {
    phone: user.phone,
    coins: user.coins + totalCoins, // القيمة الجديدة بعد الإضافة
  };

  console.log("📤 إرسال بيانات التحديث:", payload);

  try {
    const res = await fetch(`https://apilab.runasp.net/api/Client/UpdateCoins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const result = await res.json();
    console.log("📥 نتيجة التحديث:", result);

    if (result.success || res.status === 200) {
      toast.success(`تم إضافة ${totalCoins} كوينز للمستخدم ✅`);
      setShowCoinsModal(false);
      fetchClients(filterUnion);
    } else {
      toast.error("حدث خطأ أثناء إضافة الكوينز ❌");
    }
  } catch (err) {
    console.error("Error updating coins:", err);
    toast.error("حدث خطأ في الاتصال بالسيرفر ❌");
  }
};

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <div className="p-4 sm:p-6 min-h-screen">
        {/* البحث والفلتر والأزرار - تصميم متجاوب بدون تغيير الشكل */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-6 gap-4">
          {/* الأزرار - تبقى كما هي */}
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <button
              className="flex justify-center items-center gap-2 w-full sm:w-auto p-2 bg-[#005FA1] text-white rounded-lg shadow-md hover:bg-[#00457a] text-sm sm:text-base"
              onClick={() => openModal()}
            >
              <PlusCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              إضافة مستخدم جديد
            </button>

            <button
              className="flex justify-center items-center gap-2 w-full sm:w-auto p-2 bg-yellow-400 text-black rounded-lg shadow-md hover:bg-yellow-500 text-sm sm:text-base"
              onClick={openCoinsModal}
            >
              <CurrencyDollarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              إضافة كوينز
            </button>
          </div>

          {/* البحث - يبقى كما هو */}
          <div className="w-full lg:flex-1 lg:max-w-md">
            <CustomInputicon
              type="number"
              placeholder="... ابحث برقم المحمول "
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* فلتر النقابة - يبقى كما هو */}
          <div className="w-full lg:w-auto">
            <select
              className="p-2 border-2 outline-0 border-[#005FA1] text-[#005FA1] rounded-lg shadow-sm w-full lg:w-48"
              value={filterUnion}
              onChange={(e) => {
                const id = e.target.value;
                setFilterUnion(id);
                setPage(1);
                fetchClients(id);
              }}
            >
              <option value="">كل النقابات</option>
              {unions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* الجدول - يبقى كما هو بدون تغيير */}
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="table table-zebra w-full text-center">
                <thead className="bg-[#005FA1] text-white">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">الاسم</th>
                    <th className="p-3">رقم المحمول</th>
                    <th className="p-3">النوع</th>
                    <th className="p-3">عدد الكوينز</th>
                    <th className="p-3">النقابة</th>
                    <th className="p-3">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-3">{startIndex + index + 1}</td>
                        <td className="p-3">{item.name}</td>
                        <td className="p-3">{item.phone}</td>
                        <td className="p-3">{item.gender}</td>
                        <td className="p-3">{item.coins}</td>
                        <td className="p-3">{item.union}</td>
                        <td className="p-3">
                          <div className="flex justify-center gap-3">
                            <button
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              onClick={() => openModal(item)}
                            >
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 transition-colors"
                              onClick={() => deleteUser(item.id)}
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-gray-500">
                        لا توجد نتائج مطابقة
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - يبقى كما هو */}
            {filteredData.length > 0 && (
              <>
                <div className="flex justify-center mt-6">
                  <div className="join">
                    <button
                      className="join-item btn bg-[#005FA1] text-white px-4 py-2"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      الصفحة السابقة
                    </button>
                    <button
                      className="join-item btn bg-[#005FA1] text-white px-4 py-2"
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

      {/* مودال إضافة مستخدم - يبقى كما هو */}
     {/* مودال إضافة مستخدم - تم تعديل عرض الـ Inputs */}
{showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-4">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <h1 className="text-2xl font-bold text-[#005FA1] mb-4 text-right">
        {editUser ? "تعديل الحساب" : "إضافة حساب جديد"}
      </h1>

      <div className="space-y-4">
        {/* اسم المستخدم */}
        <div className="w-full">
          <CustomInputicon
            icon={<UserIcon className="w-5 h-5" />}
            placeholder="اسم المستخدم"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full"
          />
        </div>

        {/* النوع */}
        <div className="w-full">
          <GenderSelector
            value={form.gender}
            onChange={(val) => setForm({ ...form, gender: val })}
            className="w-full"
          />
        </div>

        {/* رقم المحمول */}
        <div className="w-full">
          <CustomInputicon
            icon={<PhoneIcon className="w-5 h-5" />}
            type="text"
            placeholder="رقم المحمول"
            value={form.phone}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value) && value.length <= 10) {
                setForm({ ...form, phone: value });
              }
            }}
            className="w-full"
          />
        </div>

        {/* عدد الكوينز */}
        <div className="w-full">
          <CustomInputicon
            icon={<BanknotesIcon className="w-5 h-5" />}
            type="number"
            placeholder="عدد الكوينز"
            value={form.coins}
            onChange={(e) => setForm({ ...form, coins: e.target.value })}
            className="w-full"
          />
        </div>

        {/* اختيار النقابة */}
        <div className="w-full">
          <CustomSelect
            icon={<BuildingLibraryIcon className="w-5 h-5" />}
            value={form.union}
            onChange={(val) => setForm({ ...form, union: val })}
            defaultValue="اختر النقابة"
            options={unions.map((u) => u.name)}
            // className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
          onClick={() => setShowModal(false)}
        >
          إلغاء
        </button>
        <CustomButton text="حفظ" onClick={saveUser} />
      </div>
    </div>
  </div>
)}

      {/* مودال إضافة كوينز - يبقى كما هو */}
      {showCoinsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h1 className="text-2xl font-bold text-[#005FA1] mb-4 text-right">
              إضافة كوينز
            </h1>

            {/* رقم الهاتف */}
            <div className="mb-4">
              <CustomInputicon
                placeholder="رقم المحمول"
                value={coinsForm.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    setCoinsForm({ ...coinsForm, phone: value });
                  }
                }}
                maxLength={10}
              />
            </div>

            {/* البحث والتحاليل */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="ابحث عن التحليل..."
                  className="input input-bordered w-full border-[#005FA1] focus:outline-none focus:ring-0"
                  onChange={(e) =>
                    setCoinsForm({ ...coinsForm, searchLab: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {labsData
                  .filter((lab) =>
                    lab.name
                      .toLowerCase()
                      .includes((coinsForm.searchLab || "").toLowerCase())
                  )
                  .map((lab) => {
                    const isSelected = coinsForm.selectedLabs.some(
                      (l) => l.name === lab.name
                    );
                    const labDiscount = coinsForm.selectedLabs.find(
                      (l) => l.name === lab.name
                    )?.discount;

                    return (
                      <div
                        key={lab.id}
                        className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 ${
                          isSelected
                            ? "bg-[#005FA1]/20 border-[#005FA1]"
                            : "bg-white hover:bg-[#005FA1]/10 border-gray-200"
                        }`}
                      >
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            className="checkbox"
                            style={{
                              accentColor: "#005FA1",
                              outline: "none",
                              boxShadow: "none",
                            }}
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCoinsForm({
                                  ...coinsForm,
                                  selectedLabs: [
                                    ...coinsForm.selectedLabs,
                                    { name: lab.name, discount: 0 },
                                  ],
                                });
                              } else {
                                setCoinsForm({
                                  ...coinsForm,
                                  selectedLabs: coinsForm.selectedLabs.filter(
                                    (l) => l.name !== lab.name
                                  ),
                                });
                              }
                            }}
                          />
                          <span className="font-medium text-gray-800">{lab.name}</span>
                        </label>

                        <input
                          type="number"
                          placeholder="%"
                          value={labDiscount || ""}
                          disabled={!isSelected}
                          className="input input-bordered input-sm w-20 border-[#005FA1] focus:outline-none focus:ring-0"
                          onChange={(e) => {
                            const numValue = Number(e.target.value);
                            if (numValue >= 0 && numValue <= 100) {
                              const updated = coinsForm.selectedLabs.map((l) =>
                                l.name === lab.name ? { ...l, discount: numValue } : l
                              );
                              setCoinsForm({ ...coinsForm, selectedLabs: updated });
                            }
                          }}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* الأزرار */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
                onClick={() => setShowCoinsModal(false)}
              >
                إلغاء
              </button>
              <CustomButton text="إضافة" onClick={addCoinsToUser} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;