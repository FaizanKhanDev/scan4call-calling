"use client";

import React, { useEffect, useState } from "react";
import Scan4CallContact from "./component/AskingNumber";
import Calling from "./component/Calling";

export default function Page() {
  const [startCalling, setStartCalling] = useState(true)
  // useEffect(() => {
  //   // Function to detect desktop / large screen
  //   const checkDesktop = () => {
  //     const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  //     const smallScreen = window.innerWidth <= 768;

  //     if (!isMobile || !smallScreen) {
  //       // Force refresh
  //       window.location.reload();
  //     }
  //   };

  //   // Run check on load
  //   // checkDesktop();

  //   // Run check on resize
  //   window.addEventListener("resize", checkDesktop);

  //   // Block right-click + F12 + Ctrl+Shift+I + Ctrl+Shift+C + Ctrl+Shift+J
  //   const blockKeys = (e: KeyboardEvent) => {
  //     if (
  //       e.key === "F12" ||
  //       (e.ctrlKey && e.shiftKey && ["I", "C", "J"].includes(e.key))
  //     ) {
  //       e.preventDefault();
  //       e.stopPropagation();
  //     }
  //   };
  //   window.addEventListener("keydown", blockKeys);

  //   // Block right click
  //   const blockContext = (e: MouseEvent) => {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     return false;
  //   };
  //   window.addEventListener("contextmenu", blockContext);

  //   // Optional: detect devtools (works on most browsers)
  //   const devtools = () => {
  //     const widthThreshold = window.outerWidth - window.innerWidth > 160;
  //     const heightThreshold = window.outerHeight - window.innerHeight > 160;
  //     if (widthThreshold || heightThreshold) {
  //       window.location.reload();
  //     }
  //   };
  //   const devtoolsInterval = setInterval(devtools, 1000);

  //   return () => {
  //     window.removeEventListener("resize", checkDesktop);
  //     window.removeEventListener("keydown", blockKeys);
  //     window.removeEventListener("contextmenu", blockContext);
  //     clearInterval(devtoolsInterval);
  //   };
  // }, []);

  return (
    <div className="min-h-screen bg-[#07132C] overflow-hidden p-0 m-0">
      {/* { */}
      {/* startCalling ? ( */}
      <Calling />
      {/* ) : ( */}
      <Scan4CallContact setStartCalling={setStartCalling} />
      {/* ) */}
      {/* } */}
    </div>
  );
}
