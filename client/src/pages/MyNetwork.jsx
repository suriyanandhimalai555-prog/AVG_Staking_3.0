import React, { useState, useEffect } from "react";
import Tree from "react-d3-tree";
import Sidebar from "../components/user/UserSidebar";
import Topbar from "../components/user/UserTopbar";
import axios from "axios";
import toast from "react-hot-toast";

const MyNetwork = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [treeData, setTreeData] = useState(null);

  const API = `${import.meta.env.VITE_APP_BASE_URL}/api/users`;

  // ===== FORMAT TREE =====
  const formatTree = (node) => {
    if (!node) return null;

    return {
      name: node.name || "User",
      attributes: {
        userCode: node.user_code,
        wallet: `₹${Number(node.wallet || 0).toFixed(2)}`,
      },
      children: node.children?.map(formatTree) || [],
    };
  };

  // ===== FETCH =====
  const fetchNetwork = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/my-network`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTreeData(formatTree(res.data));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load network");
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, []);

  return (
    <div className="flex bg-slate-100 rounded-lg min-h-screen">
      {/* <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} /> */}

      <div className="flex-1 flex flex-col min-w-0">
        {/* <Topbar isOpen={isOpen} setIsOpen={setIsOpen} /> */}

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 bg-slate-100">
          
          {/* HEADER BANNER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xs">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                My Network
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Visual interactive tree representation of your downline referrals and network lineage
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 shadow-xs self-start sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-[#0437cc] animate-pulse" />
              Lineage Live
            </div>
          </div>

          {/* TREE CONTAINER */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden h-[600px] relative">
            {treeData ? (
              <Tree
                data={treeData}
                orientation="vertical"
                pathFunc="step"
                zoomable
                draggable
                collapsible
                separation={{ siblings: 1.5, nonSiblings: 2 }}
                nodeSize={{ x: 220, y: 140 }}
                translate={{ x: window.innerWidth > 768 ? 350 : 180, y: 120 }}
                renderCustomNodeElement={({ nodeDatum }) => (
                  <g>
                    <foreignObject x="-90" y="-45" width="180" height="110">
                      <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-lg bg-[#0437cc]/10 text-[#0437cc] flex items-center justify-center font-bold text-xs">
                            {nodeDatum.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {nodeDatum.name}
                            </h4>
                            <p className="text-[10px] font-semibold text-[#f77704]">
                              {nodeDatum.attributes?.userCode}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                          <span>Deposit:</span>
                          <strong className="text-slate-800">{nodeDatum.attributes?.wallet}</strong>
                        </div>
                      </div>
                    </foreignObject>
                  </g>
                )}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0437cc] border-t-transparent" />
                  <span className="text-xs font-bold text-slate-600 tracking-wide">
                    Loading network tree...
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyNetwork;