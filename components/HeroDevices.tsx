const LAPTOP = { left: 12.34, top: 6.47, width: 75.2, height: 81.4 };
const PHONE = { left: 5.71, top: 2.39, width: 88.57, height: 95.14 };

export default function HeroDevices() {
  return (
    <div className="relative mx-auto w-full max-w-[760px]">
      {/* Laptop */}
      <div className="relative w-[80%]">
        <div
          className="absolute overflow-hidden bg-white"
          style={{ left: `${LAPTOP.left}%`, top: `${LAPTOP.top}%`, width: `${LAPTOP.width}%`, height: `${LAPTOP.height}%`, zIndex: 1 }}
        >
          <img src="/screenshots/reports.png" alt="ExpoLead OS reports on a laptop" className="h-full w-full" style={{ objectFit: "contain" }} />
        </div>
        <img src="/mockups/laptop-t.png" alt="" className="relative block w-full" style={{ zIndex: 2 }} />
      </div>

      {/* Phone — right side, static */}
      <div className="absolute bottom-[-9%] right-[-1%] z-[3] w-[22%]">
        <div
          className="absolute overflow-hidden bg-white"
          style={{ left: `${PHONE.left}%`, top: `${PHONE.top}%`, width: `${PHONE.width}%`, height: `${PHONE.height}%`, zIndex: 1, borderRadius: "9%" }}
        >
          <img src="/screenshots/mobile-report.jpeg" alt="ExpoLead OS on a phone" className="h-full w-full" style={{ objectFit: "cover", objectPosition: "top" }} />
        </div>
        <img src="/mockups/phone-t.png" alt="" className="relative block w-full" style={{ zIndex: 2 }} />
      </div>
    </div>
  );
}
