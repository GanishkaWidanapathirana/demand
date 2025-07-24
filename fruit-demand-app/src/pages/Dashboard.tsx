import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
type Fruit = {
  id: number;
  name: string;
  price: number;
  owner_id: number;
};
export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("auth") || "{}");
  const [activeTab, setActiveTab] = useState("add");
  const [fruitName, setFruitName] = useState("");
  const [price, setPrice] = useState("");
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [selectedFruit, setSelectedFruit] = useState<Fruit | null>(null);
  const [cashInput, setCashInput] = useState("");
  const [insightImages, setInsightImages] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Optional: titles for the 3 graphs
  const imageTitles = [
    "Inventory: Units Buy",
    "Demand Over Time",
    "Optimal Prices by Product"
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

 const handleAddFruit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("authToken"); // or use your exact key
    console.log(token)

    const res = await fetch("http://localhost:8000/foods", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": `${token}`, // 👈 pass token here
      },
      body: JSON.stringify({ name: fruitName, price }),
    });

    if (!res.ok) {
      throw new Error("Failed to add fruit");
    }

    setFruitName("");
    setPrice("");
    alert("Fruit added!");
  } catch (err) {
    console.error(err);
    alert("Error adding fruit");
  }
};


  const fetchFruits = async () => {
    try {
      const token = localStorage.getItem("authToken"); // or use your exact key
      const res = await fetch("http://localhost:8000/foods",{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "token": `${token}`, // 👈 pass token here
      }});
      if (!res.ok) {
        throw new Error("Failed to fetch fruits");
      }
      const data = await res.json();
      console.log(data)
      setFruits(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === "view") {
      fetchFruits();
    }
  }, [activeTab]);

  return (
  <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 text-white">
    {/* Navbar */}
    <nav className="flex justify-between items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 shadow-lg">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
        Welcome, {user?.firstName}
      </h1>
      <button
        onClick={handleLogout}
        className="bg-gradient-to-r from-pink-500 to-orange-500 px-5 py-2 rounded-full font-semibold hover:from-pink-600 hover:to-orange-600 transition"
      >
        Logout
      </button>
    </nav>

    {/* Tabs */}
    <div className="flex justify-center mt-10 space-x-6">
      <button
        onClick={() => setActiveTab("add")}
        className={`px-6 py-3 rounded-full font-semibold text-lg transition duration-300 ${
          activeTab === "add"
            ? "bg-gradient-to-r from-emerald-400 to-blue-500 shadow-lg text-white"
            : "bg-gradient-to-r from-emerald-300 to-blue-300 text-white opacity-80 hover:opacity-100"
        }`}
      >
        Add Fruits
      </button>
      <button
        onClick={() => setActiveTab("view")}
        className={`px-6 py-3 rounded-full font-semibold text-lg transition duration-300 ${
          activeTab === "view"
            ? "bg-gradient-to-r from-emerald-400 to-blue-500 shadow-lg text-white"
            : "bg-gradient-to-r from-emerald-300 to-blue-300 text-white opacity-80 hover:opacity-100"
        }`}
      >
        View Fruits
      </button>
    </div>

    {/* Tab Content */}
    <div className="p-8 max-w-4xl mx-auto">
      {activeTab === "add" && (
        <form
          onSubmit={handleAddFruit}
          className="bg-white/10 rounded-lg p-8 space-y-6 backdrop-blur-md shadow-lg"
        >
          <input
            type="text"
            value={fruitName}
            onChange={(e) => setFruitName(e.target.value)}
            placeholder="Fruit Name"
            className="w-full p-3 rounded-md bg-white/20 border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            required
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price (Rs.)"
            className="w-full p-3 rounded-md bg-white/20 border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full text-white font-semibold hover:from-emerald-400 hover:to-blue-500 transition shadow-lg"
          >
            Add Fruit
          </button>
        </form>
      )}

      {activeTab === "view" && (
        <div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {fruits.length === 0 ? (
              <p className="text-center text-white/70 col-span-full">
                No fruits found.
              </p>
            ) : (
              fruits.map((fruit, index) => (
                <div
                  key={index}
                  className="bg-white/10 rounded-lg p-6 flex flex-col justify-between backdrop-blur-md shadow-lg"
                >
                  <div>
                    <h3 className="mx-auto text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-2">
                      {fruit.name}
                    </h3>
                    <p className="mx-auto text-white/80 mb-4">
                      Price: Rs. {fruit.price}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFruit(fruit);
                      setShowModal(true);
                    }}
                    className="mx-auto mt-4 bg-gradient-to-r from-pink-500 to-orange-500 px-5 py-2 rounded-full font-semibold text-white hover:from-pink-600 hover:to-orange-600 transition shadow-lg"
                  >
                    Get Insights
                  </button>
                </div>
              ))
            )}
          </div>
            {showModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="w-full max-w-3xl bg-[#1f2937] text-white rounded-xl p-6 shadow-2xl relative">
                  {/* Close icon */}
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setInsightImages([]);
                      setCashInput("");
                    }}
                    className="absolute top-4 right-4 text-2xl bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent hover:text-red-400 transition-colors duration-200"
                    aria-label="Close"
                  >
                    &times;
                  </button>

                  <h2 className="text-2xl font-bold mb-6 text-center">
                    Insights for {selectedFruit?.name}
                  </h2>

                  {insightImages.length === 3 ? (
                    <div className="flex flex-col items-center space-y-4">
                      <h3 className="text-lg font-semibold mb-2 text-center">
                        {imageTitles[currentImageIndex]}
                      </h3>

                      <img
                        src={`data:image/png;base64,${insightImages[currentImageIndex]}`}
                        alt={`Insight ${currentImageIndex + 1}`}
                        className="w-full rounded-lg shadow-md"
                      />

                      {/* Image Navigation Controls */}
                      <div className="flex items-center justify-center space-x-4 mt-4">
                        <button
                          onClick={() => setCurrentImageIndex((prev) => Math.max(0, prev - 1))}
                          disabled={currentImageIndex === 0}
                          className="bg-gradient-to-r from-emerald-400 to-green-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-all duration-300 hover:from-emerald-500 hover:to-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Prev
                        </button>

                        <span className="text-sm font-medium text-white px-2">
                          {currentImageIndex + 1} / {insightImages.length}
                        </span>

                        <button
                          onClick={() =>
                            setCurrentImageIndex((prev) => Math.min(insightImages.length - 1, prev + 1))
                          }
                          disabled={currentImageIndex === insightImages.length - 1}
                          className="bg-gradient-to-r from-emerald-400 to-green-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-all duration-300 hover:from-emerald-500 hover:to-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Input and Submit remain the same */}
                      <input
                        type="number"
                        placeholder="Enter hand on cash amount"
                        value={cashInput}
                        onChange={(e) => setCashInput(e.target.value)}
                        className="w-full bg-gray-800 text-white placeholder-white/60 border border-white/20 p-2 rounded mb-6 focus:outline-none"
                      />

                      <div className="flex justify-center mb-6">
                        <button
                          onClick={async () => {
                            setIsLoading(true);
                            const token = localStorage.getItem("authToken");
                            try {
                              const res = await fetch("http://localhost:8000/foods/prediction", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  token: `${token}`,
                                },
                                body: JSON.stringify({
                                  name: selectedFruit?.name,
                                  cash_on_hand: cashInput,
                                }),
                              });

                              const data = await res.json();
                              setInsightImages([
                                data.graphs.inventory_units_buy,
                                data.graphs.demand_over_time,
                                data.graphs.optimal_prices,
                              ]);
                              setCurrentImageIndex(0); // reset to first image
                            } catch (error) {
                              console.error("Failed to fetch insights", error);
                              alert("Something went wrong");
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          disabled={isLoading}
                          className={`bg-gradient-to-r from-emerald-400 to-green-500 text-white px-8 py-2 rounded-lg font-semibold shadow-lg transition-all duration-300 hover:from-emerald-500 hover:to-green-600 disabled:opacity-60 disabled:cursor-wait`}
                        >
                          {isLoading ? "Loading..." : "Submit"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  </div>
);
}
