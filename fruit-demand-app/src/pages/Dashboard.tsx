import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
type Fruit = {
  id: number;
  name: string;
  price: number;
  owner_id: number;
};

type InsightType = "demand" | "price" | "inventory";

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
  const [optimalPrices, setOptimalPrices] = useState<Record<string, number> | null>(null);
  const [demandData, setDemandData] = useState<Record<string, number> | null>(null);
  const [inventoryData, setInventoryData] = useState<Record<string, { units_buy: number; cash_on_hand: number; status: string }> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentInsightType, setCurrentInsightType] = useState<InsightType | null>(null);

  // Image titles mapping
  const imageTitles = {
    demand: "Demand Over Time",
    price: "Optimal Prices by Product", 
    inventory: "Inventory: Units Buy"
  };

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

  const handleInsightClick = (fruit: Fruit, insightType: InsightType) => {
    setSelectedFruit(fruit);
    setCurrentInsightType(insightType);
    
    if (insightType === "demand" || insightType === "price") {
      // For demand and price, fetch data immediately without modal
      fetchInsightData(fruit, insightType, "0"); // Pass 0 as default cash for these types
    } else if (insightType === "inventory") {
      // For inventory, show modal to get cash input
      setShowModal(true);
    }
  };

  const fetchInsightData = async (fruit: Fruit, insightType: InsightType, cashOnHand: string) => {
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
          name: fruit.name,
          cash_on_hand: cashOnHand,
        }),
      });

      const data = await res.json();
      
      // Set the appropriate image based on insight type
      const imageMap = {
        demand: data.graphs.demand_over_time,
        price: data.graphs.optimal_prices,
        inventory: data.graphs.inventory_units_buy
      };
      
      setInsightImages([imageMap[insightType]]);
      
      // Set the appropriate data based on insight type
      if (insightType === "price" && data.result?.optimal_price) {
        setOptimalPrices(data.result.optimal_price);
      } else if (insightType === "demand" && data.result?.demand) {
        setDemandData(data.result.demand);
      } else if (insightType === "inventory" && data.result?.inventory) {
        setInventoryData(data.result.inventory);
      }
      
      setShowModal(true);
      
    } catch (error) {
      console.error("Failed to fetch insights", error);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInventorySubmit = () => {
    if (selectedFruit && currentInsightType === "inventory") {
      fetchInsightData(selectedFruit, currentInsightType, cashInput);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setInsightImages([]);
    setOptimalPrices(null);
    setDemandData(null);
    setInventoryData(null);
    setCashInput("");
    setCurrentInsightType(null);
    setSelectedFruit(null);
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
                  
                  {/* Three separate buttons */}
                  <div className="flex flex-col space-y-2 mt-4">
                    <button
                      onClick={() => handleInsightClick(fruit, "demand")}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-full font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition shadow-lg disabled:opacity-60"
                    >
                      {isLoading && currentInsightType === "demand" ? "Loading..." : "Get Demand"}
                    </button>
                    
                    <button
                      onClick={() => handleInsightClick(fruit, "price")}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-green-500 to-teal-500 px-4 py-2 rounded-full font-semibold text-white hover:from-green-600 hover:to-teal-600 transition shadow-lg disabled:opacity-60"
                    >
                      {isLoading && currentInsightType === "price" ? "Loading..." : "Get Price"}
                    </button>
                    
                    <button
                      onClick={() => handleInsightClick(fruit, "inventory")}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-pink-500 to-orange-500 px-4 py-2 rounded-full font-semibold text-white hover:from-pink-600 hover:to-orange-600 transition shadow-lg disabled:opacity-60"
                    >
                      {isLoading && currentInsightType === "inventory" ? "Loading..." : "Get Inventory"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
            
            {showModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="w-full max-w-3xl bg-[#1f2937] text-white rounded-xl p-6 shadow-2xl relative">
                  {/* Close icon */}
                  <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-2xl bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent hover:text-red-400 transition-colors duration-200"
                    aria-label="Close"
                  >
                    &times;
                  </button>

                  <h2 className="text-2xl font-bold mb-6 text-center">
                    {currentInsightType && imageTitles[currentInsightType]} for {selectedFruit?.name}
                  </h2>

                  {/* Show image if we have insight data */}
                  {insightImages.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Image Column */}
                      <div className="flex flex-col items-center">
                        <img
                          src={`data:image/png;base64,${insightImages[0]}`}
                          alt={`${currentInsightType} insight`}
                          className="w-full max-w-md rounded-lg shadow-md"
                        />
                      </div>
                      
                      {/* Table Column */}
                      <div className="flex flex-col">
                        {/* Show optimal prices table for price type */}
                        {currentInsightType === "price" && optimalPrices && (
                          <div className="w-full">
                            <h3 className="text-lg font-semibold mb-3 text-center">Optimal Prices</h3>
                            <div className="bg-gray-800 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                              <table className="w-full">
                                <thead className="bg-gray-700 sticky top-0">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold">Product</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold">Price (Rs.)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(optimalPrices).map(([product, price], index) => (
                                    <tr key={index} className={index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"}>
                                      <td className="px-3 py-2 text-xs">{product}</td>
                                      <td className="px-3 py-2 text-xs text-right font-mono">
                                        {price.toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Show demand table for demand type */}
                        {currentInsightType === "demand" && demandData && (
                          <div className="w-full">
                            <h3 className="text-lg font-semibold mb-3 text-center">Demand Forecast</h3>
                            <div className="bg-gray-800 rounded-lg overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-gray-700">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold">Period</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold">Demand</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(demandData).map(([period, demand], index) => (
                                    <tr key={index} className={index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"}>
                                      <td className="px-3 py-2 text-xs">Period {period}</td>
                                      <td className="px-3 py-2 text-xs text-right font-mono">
                                        {demand.toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Show inventory table for inventory type */}
                        {currentInsightType === "inventory" && inventoryData && (
                          <div className="w-full">
                            <h3 className="text-lg font-semibold mb-3 text-center">Inventory Recommendations</h3>
                            <div className="bg-gray-800 rounded-lg overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-gray-700">
                                  <tr>
                                    <th className="px-2 py-2 text-left text-xs font-semibold">Period</th>
                                    <th className="px-2 py-2 text-right text-xs font-semibold">Units</th>
                                    <th className="px-2 py-2 text-right text-xs font-semibold">Cash (Rs.)</th>
                                    <th className="px-2 py-2 text-center text-xs font-semibold">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(inventoryData).map(([period, data], index) => (
                                    <tr key={index} className={index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"}>
                                      <td className="px-2 py-2 text-xs">Period {period}</td>
                                      <td className="px-2 py-2 text-xs text-right font-mono">
                                        {data.units_buy}
                                      </td>
                                      <td className="px-2 py-2 text-xs text-right font-mono">
                                        {data.cash_on_hand.toFixed(2)}
                                      </td>
                                      <td className="px-2 py-2 text-xs text-center">
                                        <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                                          data.status === "Necessary" 
                                            ? "bg-green-600 text-green-100" 
                                            : "bg-red-600 text-red-100"
                                        }`}>
                                          {data.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Show cash input form for inventory type */
                    currentInsightType === "inventory" && (
                      <>
                        <input
                          type="number"
                          placeholder="Enter hand on cash amount"
                          value={cashInput}
                          onChange={(e) => setCashInput(e.target.value)}
                          className="w-full bg-gray-800 text-white placeholder-white/60 border border-white/20 p-2 rounded mb-6 focus:outline-none"
                        />

                        <div className="flex justify-center mb-6">
                          <button
                            onClick={handleInventorySubmit}
                            disabled={isLoading || !cashInput}
                            className={`bg-gradient-to-r from-emerald-400 to-green-500 text-white px-8 py-2 rounded-lg font-semibold shadow-lg transition-all duration-300 hover:from-emerald-500 hover:to-green-600 disabled:opacity-60 disabled:cursor-not-allowed`}
                          >
                            {isLoading ? "Loading..." : "Submit"}
                          </button>
                        </div>
                      </>
                    )
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