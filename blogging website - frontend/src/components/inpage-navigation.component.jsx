import { useState } from "react";

const InPageNavigation = ({ routes, defaultActiveIndex = 0, children }) => {
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);

  return (
    <>
      {/* Tab bar */}
      <div className="relative mb-8 bg-white border-b border-grey flex overflow-x-auto">
        {routes.map((route, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`p-4 px-5 capitalize whitespace-nowrap ${
              activeIndex === i
                ? "text-black border-b-2 border-black font-medium"
                : "text-dark-grey"
            }`}
          >
            {route}
          </button>
        ))}
      </div>

      {/* Active panel */}
      {Array.isArray(children)
        ? children[activeIndex]
        : activeIndex === 0
        ? children
        : null}
    </>
  );
};

export default InPageNavigation;