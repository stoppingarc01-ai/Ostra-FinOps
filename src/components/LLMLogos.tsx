import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

// 1. OpenAI SVG Logo
export const OpenAILogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
    aria-label="OpenAI"
  >
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829l2.02-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.402-.686zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.6069 1.4997-2.602-1.4997z" />
  </svg>
);

// 2. Anthropic Claude Geometric Star
export const AnthropicLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
    aria-label="Anthropic Claude"
  >
    <path d="M13.824 3.429h2.956L24 20.571h-3.084l-1.92-4.571H9.98l-1.92 4.571H4.976L11.896 3.43h1.928zm1.908 9.771l-2.736-6.514-2.736 6.514h5.472zM3.088 15.6l1.28-3.047L0 12.553z" />
  </svg>
);

// 3. Google Gemini 4-Point Gradient Star
export const GeminiLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => {
  const gradId = React.useId();
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-label="Google Gemini"
    >
      <defs>
        <linearGradient id={`${gradId}-gem`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="35%" stopColor="#9B72CB" />
          <stop offset="70%" stopColor="#D96570" />
          <stop offset="100%" stopColor="#FFA439" />
        </linearGradient>
      </defs>
      <path
        d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
        fill={`url(#${gradId}-gem)`}
      />
    </svg>
  );
};

// 4. Meta Llama Infinity Loop
export const MetaLlamaLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => {
  const gradId = React.useId();
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-label="Meta Llama"
    >
      <defs>
        <linearGradient id={`${gradId}-meta`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0866FF" />
          <stop offset="100%" stopColor="#00B2FF" />
        </linearGradient>
      </defs>
      <path
        d="M6.86 5C3.62 5 1 7.6 1 10.82c0 4.09 3.54 7.6 7.64 7.6 2.45 0 4.41-1.28 5.36-2.58.95 1.3 2.91 2.58 5.36 2.58 4.1 0 7.64-3.51 7.64-7.6C27 7.6 24.38 5 21.14 5c-2.73 0-4.84 1.63-5.74 3.32-.9-1.69-3.01-3.32-5.74-3.32h-2.8zm0 2.4h.02c1.9 0 3.56 1.44 4.15 3.37l.08.28c.36 1.32 1.38 2.35 2.89 2.35s2.53-1.03 2.89-2.35l.08-.28c.59-1.93 2.25-3.37 4.15-3.37 2.18 0 3.96 1.76 3.96 3.95 0 3.01-2.48 5.34-5.24 5.34-2.07 0-3.69-1.39-4.25-3.18a4.93 4.93 0 0 0-1.63-2.32c-.37-.28-.77-.42-1.18-.42-.41 0-.81.14-1.18.42-.51.39-1.04 1.15-1.63 2.32-.56 1.79-2.18 3.18-4.25 3.18-2.76 0-5.24-2.33-5.24-5.34 0-2.19 1.78-3.95 3.96-3.95z"
        transform="scale(0.88) translate(1.5, 2)"
        fill={`url(#${gradId}-meta)`}
      />
    </svg>
  );
};

// 5. Mistral AI Layered Geometric Pixels
export const MistralLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    className={className}
    aria-label="Mistral AI"
  >
    <rect x="2" y="2" width="5" height="5" fill="#FA520F" />
    <rect x="17" y="2" width="5" height="5" fill="#FA520F" />
    <rect x="2" y="7" width="5" height="5" fill="#FA520F" />
    <rect x="7" y="7" width="5" height="5" fill="#FA7A1E" />
    <rect x="12" y="7" width="5" height="5" fill="#FA7A1E" />
    <rect x="17" y="7" width="5" height="5" fill="#FA520F" />
    <rect x="2" y="12" width="5" height="5" fill="#FA520F" />
    <rect x="7" y="12" width="5" height="5" fill="#FA7A1E" />
    <rect x="12" y="12" width="5" height="5" fill="#FDB022" />
    <rect x="17" y="12" width="5" height="5" fill="#FA520F" />
    <rect x="2" y="17" width="5" height="5" fill="#FA520F" />
    <rect x="17" y="17" width="5" height="5" fill="#FA520F" />
  </svg>
);

// 6. DeepSeek Marine Fin / Whale Silhouette
export const DeepSeekLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    className={className}
    aria-label="DeepSeek"
  >
    <path
      d="M20.5 6C19.3 5 17.5 5 16.5 6C15.8 6.8 15.5 7.8 15.5 9C14 7.8 12 7.2 10 7.8C6.5 8.5 4 11.5 4 15C4 17.8 6 20 8.8 20C12 20 15 18 16.5 15.5C17.5 14 18 12 18 10.5C19 11.2 20.5 11.2 21.5 10.2C22.5 9.2 22.5 7.5 20.5 6Z"
      fill="#1E56F0"
    />
    <path
      d="M18.5 6.5C19.5 5 21.5 4.5 23 5.2C23.5 5.5 23.2 6.2 22.5 6.8C21 7.8 19.5 7.5 18.5 6.5Z"
      fill="#60A5FA"
    />
    <circle cx="8.5" cy="13" r="1.2" fill="#FFFFFF" />
  </svg>
);

// 7. Cohere Coral Geometric Mark
export const CohereLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    className={className}
    aria-label="Cohere"
  >
    <path
      d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12"
      stroke="#39594D"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    <path
      d="M17 7C19.761 9.761 19.761 14.239 17 17C14.239 19.761 9.761 19.761 7 17"
      stroke="#FF7B54"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
  </svg>
);

// 8. Grok / xAI Slashing Ring Mark
export const GrokLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    className={className}
    aria-label="xAI Grok"
  >
    {/* Dynamic slashing blade */}
    <path
      d="M3.2 20.8L9.2 14.8M14.8 9.2L20.8 3.2M2.5 21.5L7 17M17 7L21.5 2.5"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    {/* Grok ring with slash gap */}
    <path
      d="M8.2 15.8C6.2 13.8 6.2 10.2 8.2 8.2C10.2 6.2 13.8 6.2 15.8 8.2C17.8 10.2 17.8 13.8 15.8 15.8C13.8 17.8 10.2 17.8 8.2 15.8Z"
      stroke="currentColor"
      strokeWidth="2.4"
      fill="none"
    />
  </svg>
);

// 9. Kimi / Moonshot AI Mark (Bold K with Cyan Dot)
export const KimiLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
    aria-label="Kimi"
  >
    {/* Bold K vertical bar */}
    <path d="M4 3.5H8V20.5H4V3.5Z" />
    {/* Upper diagonal arm */}
    <path d="M8 13.2L14.2 4.5H18.8L11.5 14L8 13.2Z" />
    {/* Lower diagonal arm */}
    <path d="M10.8 12.8L18.8 20.5H13.6L7.8 14.2L10.8 12.8Z" />
    {/* Bright Cyan Dot at top-right */}
    <circle cx="19.5" cy="5" r="2.2" fill="#0686FF" />
  </svg>
);

// 10. Qwen / Alibaba Cloud (Isometric Interlocking Prism Hexagon)
export const QwenLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    className={className}
    aria-label="Qwen"
  >
    <path
      d="M12 2.5L18.5 6.25V13.75L15.5 12V8L12 6L8.5 8V12L5.5 13.75V6.25L12 2.5Z"
      fill="#8B5CF6"
    />
    <path
      d="M18.5 13.75L12 17.5L5.5 13.75L8.5 12L12 14L15.5 12L18.5 13.75Z"
      fill="#7C3AED"
    />
    <path
      d="M12 17.5V21.5L5.5 17.75V13.75L8.5 15.5V17.5L12 17.5Z"
      fill="#6D28D9"
    />
    <path
      d="M12 21.5L18.5 17.75V13.75L15.5 15.5V17.5L12 17.5V21.5Z"
      fill="#7C3AED"
    />
    <polygon points="12,8.5 14.5,12.8 9.5,12.8" fill="#4C1D95" opacity="0.4" />
  </svg>
);

// 11. GLM / Zhipu AI (Hexagonal G Monogram)
export const GLMLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
    aria-label="GLM"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2.5L19.5 6.8V11H16V8.8L12 6.5L8 8.8V15.2L12 17.5L16 15.2V13H12V10.2H19.5V17.2L12 21.5L4.5 17.2V6.8L12 2.5Z"
    />
  </svg>
);

// 12. NVIDIA Logo (Official Green Spiral Eye)
export const NvidiaLogo: React.FC<LogoProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="#76B900"
    width={size}
    height={size}
    className={className}
    aria-label="NVIDIA"
  >
    <path d="M8.938 6.578c-.07.008-.14.02-.207.037-2.316.59-3.79 2.766-3.418 5.051.353 2.164 2.293 3.754 4.545 3.717 1.545-.025 2.924-.889 3.633-2.275.463-.906.533-1.928.197-2.879l2.428-1.076c.484 1.488.381 3.125-.348 4.549-1.127 2.197-3.328 3.59-5.777 3.65-3.564.088-6.666-2.433-7.227-5.882C2.18 7.892 4.542 4.416 8.232 3.473c1.996-.51 4.094-.148 5.797.994l-1.848 1.94c-1.02-.68-2.18-.87-3.243-.829zm3.504 5.297c-.012.399-.18.783-.482 1.053-.518.463-1.295.465-1.814.004-.52-.46-.6-1.229-.188-1.78.41-.55 1.18-.724 1.785-.404.43.228.69.658.699 1.127zm4.72-4.57c-2.072-1.637-4.73-2.16-7.309-1.5-4.887 1.25-8.03 5.867-7.295 10.438.74 4.594 4.86 7.97 9.584 7.854 3.256-.08 6.183-1.943 7.68-4.865.986-1.928 1.258-4.135.77-6.239l-2.455.773c.338 1.54.14 3.15-.59 4.574-1.11 2.166-3.278 3.553-5.69 3.613-3.498.086-6.55-2.414-7.102-5.813-.578-3.563 1.764-7.067 5.378-7.992 1.916-.49 3.916-.1 5.457 1.054l1.562-1.895zm2.932-2.135C17.472 3.01 13.904 2.217 10.3 3.14 4.024 4.745-.022 10.669.918 16.535c.954 5.955 6.273 10.334 12.378 10.183 4.195-.104 7.965-2.502 9.89-6.265 1.272-2.484 1.62-5.328.99-8.04l-2.58.56c.47 2.052.203 4.2-.764 6.084-1.464 2.862-4.328 4.693-7.518 4.772-4.636.115-8.68-3.21-9.404-7.732-.767-4.728 2.34-9.378 7.135-10.603 2.723-.695 5.47-.095 7.615 1.59l2.434-1.914z" />
  </svg>
);



