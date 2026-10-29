import React, { useState, useEffect } from "react";
import Sidebar from "../components/user/UserSidebar";
import Topbar from "../components/user/UserTopbar";
import axios from "axios";
import { FaInfo, FaTrophy } from "react-icons/fa";

const UserDirectReferralReward = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tierData, setTierData] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserRewardsData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/api/users/my-reward-progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTierData(res.data.tiers || []);
      } catch (err) {
        console.error("Error fetching user tour rewards:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRewardsData();
  }, [token]);

  return (
    <div className="userRewardLayout">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="main">
        <Topbar isOpen={isOpen} setIsOpen={setIsOpen} />

        <div className="userRewardPage">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                Level-wise Tour Rewards
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Track your milestone progress and unlock exclusive global tours level by level.
              </p>
            </div>

            {/* Policy Notice Box */}
            <div className="flex items-start md:items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-lg max-w-md">
              <div className="p-1.5 bg-amber-500/20 rounded-md text-amber-400 mt-0.5 md:mt-0 flex items-center justify-center shrink-0">
                <FaInfo className="text-xs" />
              </div>
              <h2 className="text-xs leading-relaxed text-amber-200/90 font-medium">
                Each tour reward tier corresponds to active business volume achieved at that specific referral level.
              </h2>
            </div>
          </div>

          {/* BODY */}
          {loading ? (
            <div className="rewardEmpty">Loading...</div>
          ) : tierData.length === 0 ? (
            <div className="rewardEmpty">No tour reward tiers available</div>
          ) : (
            tierData.map((tier, index) => {
              const progressPercent = Math.min(
                100,
                (Number(tier.currentVolume || 0) / Number(tier.target_volume)) * 100
              );

              return (
                <div className="rewardCard" key={tier.id || index}>
                  {/* TOP */}
                  <div className="rewardCardTop">
                    <div className="rewardTitleBlock">
                      <FaTrophy className="rewardIcon" />
                      <div>
                        <h3>Level {tier.level}: {tier.tour_name}</h3>
                        <p>Required Volume: ${Number(tier.target_volume).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className={`rewardStatus ${tier.isAchieved ? "success" : "pending"}`}>
                      {tier.isAchieved ? "Completed" : "In Progress"}
                    </div>
                  </div>

                  {/* TABLE */}
                  <div className="rewardTableWrap">
                    <table className="rewardTable">
                      <thead>
                        <tr>
                          <th>Level</th>
                          <th>Target Volume</th>
                          <th>Proposed Tour</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Level {tier.level}</td>
                          <td>${Number(tier.target_volume).toLocaleString()}</td>
                          <td>{tier.tour_name}</td>
                          <td>
                            <span className={`statusBadge ${tier.isAchieved ? "success" : "pending"}`}>
                              {tier.isAchieved ? "Unlocked ✅" : "Locked 🔒"}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* PROGRESS */}
                  <div className="progressBox">
                    <div className="progressHead">
                      <span>Level {tier.level} Progress</span>
                      <span>
                        ${Number(tier.currentVolume || 0).toLocaleString()} / ${Number(tier.target_volume).toLocaleString()}
                      </span>
                    </div>

                    <div className="progressBar">
                      <div
                        className="progressFill"
                        style={{
                          width: `${tier.isAchieved ? 100 : progressPercent}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDirectReferralReward;