"use client";

import React, { useEffect, useState } from "react";
import Scan4CallContact from "./component/AskingNumber";
import Calling from "./component/Calling";
import { Suspense } from "react";

export default function Page() {
  const [startCalling, setStartCalling] = useState({
    start: false,
    callerId: 0,
  });

  const [terminalOpen, setTerminalOpen] = useState(false); // will become true if devtools/terminal detected
  const [desktopMode, setDesktopMode] = useState(false); // true if opened on desktop

  // useEffect(() => {
  //   // Function to detect desktop / large screen
  //   const checkDesktop = () => {
  //     const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  //     const smallScreen = window.innerWidth <= 768;

  //     // If not mobile or screen is large, consider desktop mode
  //     const isDesktop = !isMobile || !smallScreen;
  //     setDesktopMode(isDesktop);
  //     return isDesktop;
  //   };

  //   // Initial check
  //   checkDesktop();

  //   // Run check on resize
  //   window.addEventListener("resize", checkDesktop);

  //   // Devtools/terminal detection
  //   // Also detect by keyboard events (F12 / Ctrl+Shift+I/C/J)
  //   const blockKeys = (e: KeyboardEvent) => {
  //     if (
  //       e.key === "F12" ||
  //       (e.ctrlKey && e.shiftKey && ["I", "C", "J"].includes(e.key))
  //     ) {
  //       // Detected developer tools shortcut
  //       setTerminalOpen(true);
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

  //   // Additional devtools detection based on window size changes
  //   const devtools = () => {
  //     const widthThreshold = window.outerWidth - window.innerWidth > 160;
  //     const heightThreshold = window.outerHeight - window.innerHeight > 160;
  //     if (widthThreshold || heightThreshold) {
  //       setTerminalOpen(true);
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

  // // If inspect/devtools enabled or desktop mode, refresh the page forcibly
  // useEffect(() => {
  //   if (desktopMode || terminalOpen) {
  //     // Use a slight timeout to avoid infinite refresh loop (in case re-render + state issues)
  //     setTimeout(() => {
  //       window.location.reload();
  //     }, 200);
  //   }
  // }, [desktopMode, terminalOpen]);

  // // Do not render UI if refresh condition met
  // if (desktopMode || terminalOpen) {
  //   return null;
  // }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen overflow-hidden p-0 m-0">
        {startCalling.start ? (
          <Calling callerId={startCalling.callerId} />
        ) : (
          <Scan4CallContact setStartCalling={setStartCalling} skiAPi={false} />
        )}
      </div>
    </Suspense>
  );
}
