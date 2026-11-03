import React from 'react';

const Buttons = ({ 
    text = "NEXT", 
    variant = "primary", 
    colorTheme = "blue",
    href,
    onClick,
    className = "" 
}) => {

    if (variant === 'outline') {
        // Responsive sizing: Smaller height and padding on mobile, scaling up on sm screens. Added whitespace-nowrap.
        const baseOutlineStyles = "group inline-flex items-center justify-center px-4 sm:px-[24px] h-[40px] sm:h-[44px] rounded-none border-2 font-bold text-sm sm:text-[16px] transition-all duration-300 -skew-x-[15deg] focus:outline-none w-full sm:w-auto";
        
        // Dynamic colors based on the theme prop
        const colorStyles = colorTheme === 'blue' 
            ? "border-[#0437cc] text-[#0437cc] hover:bg-[#0437cc] hover:text-white"
            : "border-[#f77704] text-[#f77704] hover:bg-[#f77704] hover:text-white";
        
        const combinedOutlineClasses = `${baseOutlineStyles} ${colorStyles} ${className}`;

        // Counter-skew the text so it remains upright and legible
        const Content = <span className="skew-x-[15deg] tracking-wide whitespace-nowrap">{text}</span>;

        if (href) {
            return (
                <a href={href} className={combinedOutlineClasses} onClick={onClick}>
                    {Content}
                </a>
            );
        }
        return (
            <button className={combinedOutlineClasses} onClick={onClick}>
                {Content}
            </button>
        );
    }

    // Responsive shadows, paddings, and heights. Default w-full on mobile, auto width on desktop.
    const primaryClasses = `group flex items-center justify-center px-4 sm:px-[24px] h-[40px] sm:h-[44px] text-sm sm:text-[16px] font-bold text-white bg-[#f77704] transition-all duration-700 shadow-[3px_3px_0_#0437cc] sm:shadow-[4px_4px_0_#0437cc] -skew-x-[15deg] border-none cursor-pointer focus:outline-none hover:shadow-[4px_4px_0_#a6e71c] sm:hover:shadow-[6px_6px_0_#a6e71c] w-full sm:w-auto ${className}`;

    const PrimaryContent = (
        <>
            <style>
                {`
          @keyframes color_anim {
            0% { fill: white; }
            50% { fill: #a6e71c; } /* Highlight Lime */
            100% { fill: white; }
          }
          .animate-color-1 { animation: color_anim 1s infinite 0.6s; }
          .animate-color-2 { animation: color_anim 1s infinite 0.4s; }
          .animate-color-3 { animation: color_anim 1s infinite 0.2s; }
        `}
            </style>

            {/* whitespace-nowrap prevents text from breaking into two lines on narrow mobile screens */}
            <span className="skew-x-[15deg] tracking-wide whitespace-nowrap">{text}</span>

            {/* Responsive SVG container: scales down on mobile to prevent pushing text out */}
            <span className="w-[16px] sm:w-[20px] ml-1.5 sm:ml-[6px] relative transition-all duration-500 mr-0 group-hover:mr-[10px] sm:group-hover:mr-[20px] skew-x-[15deg] flex shrink-0">
                <svg
                    width="100%"
                    height="auto"
                    viewBox="0 0 66 43"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto"
                >
                    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <path
                            className="transition-all duration-400 -translate-x-[60%] group-hover:translate-x-0 group-hover:animate-color-1"
                            d="M40.1543933,3.89485454 L43.9763149,0.139296592 C44.1708311,-0.0518420739 44.4826329,-0.0518571125 44.6771675,0.139262789 L65.6916134,20.7848311 C66.0855801,21.1718824 66.0911863,21.8050225 65.704135,22.1989893 L44.677098,42.8607841 C44.4825957,43.0519059 44.1708242,43.0519358 43.9762853,42.8608513 L40.1545186,39.1069479 L56.9937789,21.8567812 L40.1545208,4.60825197 Z"
                            fill="#FFFFFF"
                        ></path>
                        <path
                            className="transition-all duration-500 -translate-x-[30%] group-hover:translate-x-0 group-hover:animate-color-2"
                            d="M20.1543933,3.89485454 L23.9763149,0.139296592 C24.1708311,-0.0518420739 24.4826329,-0.0518571125 24.6771675,0.139262789 L45.6916134,20.7848311 C46.0855801,21.1718824 46.0911863,21.8050225 45.704135,22.1989893 L24.677098,42.8607841 C24.4825957,43.0519059 24.1708242,43.0519358 23.9762853,42.8608513 L20.1545186,39.1069479 L36.9937789,21.8567812 L20.1545208,4.60825197 Z"
                            fill="#FFFFFF"
                        ></path>
                        <path
                            className="group-hover:animate-color-3"
                            d="M0.154393339,3.89485454 L3.97631488,0.139296592 C4.17083111,-0.0518420739 4.48263286,-0.0518571125 4.67716753,0.139262789 L25.6916134,20.7848311 C26.0855801,21.1718824 26.0911863,21.8050225 25.704135,22.1989893 L4.67709797,42.8607841 C4.48259567,43.0519059 4.17082418,43.0519358 3.97628526,42.8608513 L0.154518591,39.1069479 L16.9937789,21.8567812 L0.15452076,4.60825197 Z"
                            fill="#FFFFFF"
                        ></path>
                    </g>
                </svg>
            </span>
        </>
    );

    if (href) {
        return (
            <a href={href} className={primaryClasses} onClick={onClick}>
                {PrimaryContent}
            </a>
        );
    }

    return (
        <button className={primaryClasses} onClick={onClick}>
            {PrimaryContent}
        </button>
    );
};

export default Buttons;