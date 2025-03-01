"use client";
import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
  markTheme?: "light" | "dark";
};

export type LogoProps = {
  variant?: "mark" | "type" | "full";
  className?: string;
  divClassName?: string;
  markClassName?: string;
  typeClassName?: string;
  markTheme?: "light" | "dark";
};

export const LogoMarkSquare = (props: LogoMarkProps) => {
  return (
    <svg
      width="300"
      height="300"
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full", props?.className)}
    >
      <g clipPath="url(#clip0_113_71)">
        <path
          d="M264 0H36C16.1177 0 0 16.1177 0 36V264C0 283.882 16.1177 300 36 300H264C283.882 300 300 283.882 300 264V36C300 16.1177 283.882 0 264 0Z"
          fill="#5955F4"
        />
        <mask
          id="mask0_113_71"
          style={{ maskType: "luminance" }}
          maskUnits="userSpaceOnUse"
          x="36"
          y="91"
          width="215"
          height="131"
        >
          <path d="M36 91.27H251V221.011H36V91.27Z" fill="white" />
        </mask>
        <g mask="url(#mask0_113_71)">
          <g opacity="0.57">
            <path
              d="M251 155.984C251 120.243 221.941 91.27 186.094 91.27H100.906C65.0594 91.27 36 120.243 36 155.984V220.698H186.094C221.941 220.698 251 191.725 251 155.984Z"
              fill="#EEF1FF"
            />
            <path
              d="M100.906 115.54H186.094C208.498 115.54 226.66 133.648 226.66 155.986C226.66 178.323 208.498 196.432 186.094 196.432H100.906C78.5023 196.432 60.3399 178.323 60.3399 155.986C60.3399 133.648 78.5023 115.54 100.906 115.54Z"
              fill="#A3AFFE"
            />
            <path
              d="M186.094 176.205C174.892 176.205 165.811 167.151 165.811 155.982C165.811 144.813 174.892 135.759 186.094 135.759C197.296 135.759 206.377 144.813 206.377 155.982C206.377 167.151 197.296 176.205 186.094 176.205Z"
              fill="black"
            />
            <path
              d="M194.208 151.937C191.967 151.937 190.151 150.127 190.151 147.893C190.151 145.659 191.967 143.848 194.208 143.848C196.448 143.848 198.264 145.659 198.264 147.893C198.264 150.127 196.448 151.937 194.208 151.937Z"
              fill="#EEF1FF"
            />
            <path
              d="M96.8486 176.205C85.6471 176.205 76.5663 167.151 76.5663 155.982C76.5663 144.813 85.6471 135.759 96.8486 135.759C108.051 135.759 117.132 144.813 117.132 155.982C117.132 167.151 108.051 176.205 96.8486 176.205Z"
              fill="black"
            />
            <path
              d="M104.962 151.937C102.722 151.937 100.906 150.127 100.906 147.893C100.906 145.659 102.722 143.848 104.962 143.848C107.203 143.848 109.019 145.659 109.019 147.893C109.019 150.127 107.203 151.937 104.962 151.937Z"
              fill="#EEF1FF"
            />
          </g>
        </g>
        <mask
          id="mask1_113_71"
          style={{ maskType: "luminance" }}
          maskUnits="userSpaceOnUse"
          x="49"
          y="78"
          width="216"
          height="130"
        >
          <path d="M49.2699 78H264.27V207.741H49.2699V78Z" fill="white" />
        </mask>
        <g mask="url(#mask1_113_71)">
          <path
            d="M264.27 142.714C264.27 106.973 235.211 78 199.364 78H114.176C78.3293 78 49.2699 106.973 49.2699 142.714V207.428H199.364C235.211 207.428 264.27 178.455 264.27 142.714Z"
            fill="#EEF1FF"
          />
          <path
            d="M114.176 102.269H199.364C221.768 102.269 239.93 120.378 239.93 142.716C239.93 165.053 221.768 183.162 199.364 183.162H114.176C91.7722 183.162 73.6098 165.053 73.6098 142.716C73.6098 120.378 91.7722 102.269 114.176 102.269Z"
            fill="#A3AFFE"
          />
          <path
            d="M199.364 162.935C188.162 162.935 179.081 153.881 179.081 142.712C179.081 131.543 188.162 122.489 199.364 122.489C210.566 122.489 219.647 131.543 219.647 142.712C219.647 153.881 210.566 162.935 199.364 162.935Z"
            fill="black"
          />
          <path
            d="M207.478 138.668C205.237 138.668 203.421 136.858 203.421 134.624C203.421 132.39 205.237 130.579 207.478 130.579C209.718 130.579 211.534 132.39 211.534 134.624C211.534 136.858 209.718 138.668 207.478 138.668Z"
            fill="#EEF1FF"
          />
          <path
            d="M110.118 162.935C98.917 162.935 89.8362 153.881 89.8362 142.712C89.8362 131.543 98.917 122.489 110.118 122.489C121.321 122.489 130.402 131.543 130.402 142.712C130.402 153.881 121.321 162.935 110.118 162.935Z"
            fill="black"
          />
          <path
            d="M118.232 138.668C115.992 138.668 114.176 136.858 114.176 134.624C114.176 132.39 115.992 130.579 118.232 130.579C120.473 130.579 122.289 132.39 122.289 134.624C122.289 136.858 120.473 138.668 118.232 138.668Z"
            fill="#EEF1FF"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_113_71">
          <rect width="300" height="300" rx="60" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const LogoMark = (props: LogoMarkProps) => {
  return (
    <svg
      width="388"
      height="243"
      viewBox="0 0 388 243"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full", props?.className)}
    >
      <mask
        id="mask0_131_425"
        style={{ maskType: "luminance" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="21"
        width="367"
        height="222"
      >
        <path
          d="M3.05176e-05 21.3066H366.933V242.731H3.05176e-05V21.3066Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_131_425)">
        <g opacity="0.57">
          <path
            d="M366.933 131.752C366.933 70.7539 317.339 21.3066 256.16 21.3066H110.773C49.5947 21.3066 0 70.7539 0 131.752V242.197H256.16C317.339 242.197 366.933 192.75 366.933 131.752Z"
            fill="#5955F4"
            className="dark:fill-[#EEF1FF]"
          />
          <path
            d="M110.773 62.7241H256.16C294.397 62.7241 325.393 93.6285 325.393 131.752C325.393 169.874 294.397 200.78 256.16 200.78H110.773C72.5371 200.78 41.5399 169.874 41.5399 131.752C41.5399 93.6285 72.5371 62.7241 110.773 62.7241Z"
            fill="#A3AFFE"
          />
          <path
            d="M256.16 166.266C237.042 166.266 221.544 150.813 221.544 131.752C221.544 112.69 237.042 97.2378 256.16 97.2378C275.279 97.2378 290.777 112.69 290.777 131.752C290.777 150.813 275.279 166.266 256.16 166.266Z"
            fill="black"
          />
          <path
            d="M270.008 124.848C266.184 124.848 263.084 121.759 263.084 117.946C263.084 114.134 266.184 111.043 270.008 111.043C273.831 111.043 276.931 114.134 276.931 117.946C276.931 121.759 273.831 124.848 270.008 124.848Z"
            fill="#5955F4"
            className="dark:fill-[#C6CEFF]"
          />
          <path
            d="M103.848 166.266C84.7309 166.266 69.233 150.813 69.233 131.752C69.233 112.69 84.7309 97.2378 103.848 97.2378C122.967 97.2378 138.465 112.69 138.465 131.752C138.465 150.813 122.967 166.266 103.848 166.266Z"
            fill="black"
          />
          <path
            d="M117.695 124.848C113.872 124.848 110.773 121.759 110.773 117.946C110.773 114.134 113.872 111.043 117.695 111.043C121.52 111.043 124.619 114.134 124.619 117.946C124.619 121.759 121.52 124.848 117.695 124.848Z"
            fill="#5955F4"
            className="dark:fill-[#C6CEFF]"
          />
        </g>
      </g>
      <mask
        id="mask1_131_425"
        style={{ maskType: "luminance" }}
        maskUnits="userSpaceOnUse"
        x="20"
        y="0"
        width="368"
        height="223"
      >
        <path d="M20.48 0.82666H387.413V222.251H20.48V0.82666Z" fill="white" />
      </mask>
      <g mask="url(#mask1_131_425)">
        <path
          d="M387.413 111.272C387.413 50.2739 337.819 0.82666 276.64 0.82666H131.253C70.0747 0.82666 20.48 50.2739 20.48 111.272V221.717H276.64C337.819 221.717 387.413 172.27 387.413 111.272Z"
          fill="#5955F4"
          className="dark:fill-[#C6CEFF]"
        />
        <path
          d="M131.253 42.2441H276.64C314.877 42.2441 345.873 73.1485 345.873 111.272C345.873 149.394 314.877 180.3 276.64 180.3H131.253C93.0171 180.3 62.0199 149.394 62.0199 111.272C62.0199 73.1485 93.0171 42.2441 131.253 42.2441Z"
          fill="#A3AFFE"
        />
        <path
          d="M276.64 145.786C257.522 145.786 242.024 130.334 242.024 111.272C242.024 92.21 257.522 76.7578 276.64 76.7578C295.758 76.7578 311.257 92.21 311.257 111.272C311.257 130.334 295.758 145.786 276.64 145.786Z"
          fill="black"
        />
        <path
          d="M290.488 104.368C286.664 104.368 283.564 101.279 283.564 97.4665C283.564 93.6538 286.664 90.563 290.488 90.563C294.311 90.563 297.411 93.6538 297.411 97.4665C297.411 101.279 294.311 104.368 290.488 104.368Z"
          fill="white"
        />
        <path
          d="M124.327 145.786C105.211 145.786 89.713 130.334 89.713 111.272C89.713 92.21 105.211 76.7578 124.327 76.7578C143.447 76.7578 158.945 92.21 158.945 111.272C158.945 130.334 143.447 145.786 124.327 145.786Z"
          fill="black"
        />
        <path
          d="M138.175 104.368C134.352 104.368 131.253 101.279 131.253 97.4665C131.253 93.6538 134.352 90.563 138.175 90.563C142 90.563 145.099 93.6538 145.099 97.4665C145.099 101.279 142 104.368 138.175 104.368Z"
          fill="white"
        />
      </g>
    </svg>
  );
};

export const Logo = (props: LogoProps) => {
  const { variant = "mark" } = props;
  return (
    <span
      className={cn(
        "flex items-center justify-center gap-x-0.5 lg:gap-x-2",
        props?.className,
        props?.markTheme === "light" && "text-white"
      )}
    >
      {variant === "mark" && (
        <LogoMark
          markTheme={props?.markTheme}
          className={cn("w-fit h-6", props?.markClassName)}
        />
      )}
      {variant === "type" && (
        <p
          className={cn(
            "text-3xl font-semibold tracking-tight font-display leading-[1rem]",
            props?.typeClassName,
            props?.markTheme === "light" && "text-white"
          )}
        >
          rivvi
        </p>
      )}
      {variant === "full" && (
        <>
          <p
            className={cn(
              "text-3xl font-medium tracking-tight font-display leading-[1rem]",
              props?.typeClassName,
              props?.markTheme === "light" && "text-white"
            )}
          >
            rivvi
          </p>
          <LogoMark
            markTheme={props?.markTheme}
            className={cn("h-6 w-fit", props?.markClassName)}
          />
        </>
      )}
    </span>
  );
};
