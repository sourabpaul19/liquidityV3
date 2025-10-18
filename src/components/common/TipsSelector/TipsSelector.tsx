"use client";
import React, { useState } from "react";
import styles from "./TipsSelector.module.scss";

const TipsSelector: React.FC = () => {
  const [tips, setTips] = useState(["18%", "20%", "25%", "Other"]);
  const [activeTip, setActiveTip] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [customTip, setCustomTip] = useState<string>("");

  const handleTipClick = (tip: string) => {
    if (tip === "Other") {
      setShowModal(true);
      setActiveTip(null);
    } else {
      setActiveTip(tip);
      setShowModal(false);
    }
  };

  const handleCustomSubmit = () => {
    if (customTip.trim() !== "") {
      const newTip = customTip; // ✅ Just number, no %
      const updatedTips = tips.map((t) => (t === "Other" ? newTip : t));
      setTips(updatedTips);
      setActiveTip(newTip);
      setShowModal(false);
      setCustomTip("");
    }
  };

  return (
    <>
      {/* Tips Section */}
      <div className={`${styles.tipsArea}`}>
        <h4 className="text-lg font-semibold mb-3">Tips</h4>
        <div className={`${styles.tipsBlock} flex gap-3`}>
          {tips.map((tip) => (
            <button
              key={tip}
              onClick={() => handleTipClick(tip)}
              className={`${styles.tipsItem} ${
                activeTip === tip ? "bg-primary text-white" : ""
              }`}
            >
              {tip}
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div
            className={`${styles.topModal} bg-white rounded-lg shadow-lg p-4 w-80`}
          >
            <h4 className="text-lg text-center font-semibold mb-3">
              Enter Your Tip
            </h4>
            <p className="text-center text-sm text-gray-600 mb-2">
              Bartenders work hard to get you quality orders on time
            </p>

            <input
              type="number"
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value)}
              placeholder="Enter Tip Amount"
              className={`${styles.textbox} mb-4 rounded-md`}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                Continue
              </button>
              <button
                onClick={handleCustomSubmit}
                className="px-4 py-2 rounded-md bg-primary text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TipsSelector;
